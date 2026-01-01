import { Snowflake } from '../../discord/snowflake.js';
import { FormattingKind } from '../formatting-kind.js';
import { MentionKind } from '../mention-kind.js';
import {
  MarkdownNode,
  TextNode,
  FormattingNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  InlineCodeBlockNode,
  MultiLineCodeBlockNode,
  LinkNode,
  EmojiNode,
  MentionNode,
  TimestampNode,
  isContainerNode,
} from '../nodes.js';
import { StringSegment } from './string-segment.js';
import { Matcher, matchAll } from './matcher.js';
import { StringMatcher } from './string-matcher.js';
import { RegexMatcher } from './regex-matcher.js';
import { AggregateMatcher } from './aggregate-matcher.js';
import { emojiIndex } from '../emoji-index.js';

/**
 * Parsing context to track recursion depth
 */
interface MarkdownContext {
  depth: number;
}

const MAX_DEPTH = 32;

// Helper function to parse children
function parseChildren(
  context: MarkdownContext,
  segment: StringSegment,
  matcher?: Matcher<MarkdownContext, MarkdownNode>
): MarkdownNode[] {
  if (context.depth >= MAX_DEPTH) {
    return [new TextNode(segment.toString())];
  }

  const newContext: MarkdownContext = { depth: context.depth + 1 };
  const usedMatcher = matcher ?? nodeMatcher;

  return [
    ...matchAll(usedMatcher, newContext, segment, (_, s) => new TextNode(s.toString())),
  ].map((r) => r.value);
}

// Helper to create a regex matcher that parses children
function formattingMatcher(
  regex: RegExp,
  kind: FormattingKind,
  groupIndex: number = 1
): Matcher<MarkdownContext, MarkdownNode> {
  return new RegexMatcher<MarkdownContext, MarkdownNode>(
    regex,
    (context, segment, match) => {
      const group = match.groups[groupIndex];
      if (!group) return null;
      const childSegment = segment.relocate(group.index, group.length);
      return new FormattingNode(kind, parseChildren(context, childSegment));
    }
  );
}

/* Formatting Matchers */

const boldMatcher = formattingMatcher(
  /\*\*(.+?)\*\*(?!\*)/s,
  FormattingKind.Bold
);

const italicMatcher = formattingMatcher(
  /\*(?!\s)(.+?)(?<!\s|\*)\*(?!\*)/s,
  FormattingKind.Italic
);

const italicBoldMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /\*(\*\*.+?\*\*)\*(?!\*)/s,
  (context, segment, match) => {
    const group = match.groups[1];
    if (!group) return null;
    const childSegment = segment.relocate(group.index, group.length);
    return new FormattingNode(
      FormattingKind.Italic,
      parseChildren(context, childSegment, boldMatcher)
    );
  }
);

const italicAltMatcher = formattingMatcher(
  /_(.+?)_(?!\w)/s,
  FormattingKind.Italic
);

const underlineMatcher = formattingMatcher(
  /__(.+?)__(?!_)/s,
  FormattingKind.Underline
);

const italicUnderlineMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /_(__.+?__)_(?!_)/s,
  (context, segment, match) => {
    const group = match.groups[1];
    if (!group) return null;
    const childSegment = segment.relocate(group.index, group.length);
    return new FormattingNode(
      FormattingKind.Italic,
      parseChildren(context, childSegment, underlineMatcher)
    );
  }
);

const strikethroughMatcher = formattingMatcher(
  /~~(.+?)~~/s,
  FormattingKind.Strikethrough
);

const spoilerMatcher = formattingMatcher(
  /\|\|(.+?)\|\|/s,
  FormattingKind.Spoiler
);

const singleLineQuoteMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /^>\s(.+\n?)/m,
  (context, segment, match) => {
    const group = match.groups[1];
    if (!group) return null;
    const childSegment = segment.relocate(group.index, group.length);
    return new FormattingNode(FormattingKind.Quote, parseChildren(context, childSegment));
  }
);

const repeatedSingleLineQuoteMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /(?:^>\s(.*\n?)){2,}/m,
  (context, segment, match) => {
    const group = match.groups[1];
    if (!group) return null;
    // For repeated quotes, we need to handle multiple captures
    // Parse the entire matched content
    const content = segment.toString().replace(/^>\s?/gm, '');
    const childSegment = new StringSegment(content, 0, content.length);
    return new FormattingNode(FormattingKind.Quote, parseChildren(context, childSegment));
  }
);

const multiLineQuoteMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /^>>>\s(.+)/ms,
  (context, segment, match) => {
    const group = match.groups[1];
    if (!group) return null;
    const childSegment = segment.relocate(group.index, group.length);
    return new FormattingNode(FormattingKind.Quote, parseChildren(context, childSegment));
  }
);

/* Structure Matchers */

const headingMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /^(#{1,3})\s(.+)\n/m,
  (context, segment, match) => {
    const levelGroup = match.groups[1];
    const contentGroup = match.groups[2];
    if (!levelGroup || !contentGroup) return null;
    const level = levelGroup.value.length;
    const childSegment = segment.relocate(contentGroup.index, contentGroup.length);
    return new HeadingNode(level, parseChildren(context, childSegment));
  }
);

const listMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /^(\s*)(?:[-*]\s(.+(?:\n\s\1.*)*)?\n?)+/m,
  (context, segment, _match) => {
    // Parse list items from the matched content
    const content = segment.toString();
    const itemMatches = content.matchAll(/[-*]\s(.+?)(?=\n[-*]\s|\n\n|$)/gs);
    const items: ListItemNode[] = [];

    for (const itemMatch of itemMatches) {
      if (itemMatch[1]) {
        const itemContent = itemMatch[1];
        const itemSegment = new StringSegment(itemContent, 0, itemContent.length);
        items.push(new ListItemNode(parseChildren(context, itemSegment)));
      }
    }

    return items.length > 0 ? new ListNode(items) : null;
  }
);

/* Code Block Matchers */

const inlineCodeBlockMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /(`{1,2})([^`]+)\1/s,
  (_, __, match) => {
    const codeGroup = match.groups[2];
    if (!codeGroup) return null;
    return new InlineCodeBlockNode(codeGroup.value);
  }
);

const multiLineCodeBlockMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /```(?:(\w*)\n)?(.+?)```/s,
  (_, __, match) => {
    const langGroup = match.groups[1];
    const codeGroup = match.groups[2];
    if (!codeGroup) return null;
    const language = langGroup?.value ?? '';
    const code = codeGroup.value.replace(/^\n+|\n+$/g, '');
    return new MultiLineCodeBlockNode(language, code);
  }
);

/* Mention Matchers */

const everyoneMentionMatcher = new StringMatcher<MarkdownContext, MarkdownNode>(
  '@everyone',
  () => new MentionNode(null, MentionKind.Everyone)
);

const hereMentionMatcher = new StringMatcher<MarkdownContext, MarkdownNode>(
  '@here',
  () => new MentionNode(null, MentionKind.Here)
);

const userMentionMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /<@!?(\d+)>/,
  (_, __, match) => {
    const idGroup = match.groups[1];
    if (!idGroup) return null;
    const id = Snowflake.tryParse(idGroup.value);
    return new MentionNode(id, MentionKind.User);
  }
);

const channelMentionMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /<#!?(\d+)>/,
  (_, __, match) => {
    const idGroup = match.groups[1];
    if (!idGroup) return null;
    const id = Snowflake.tryParse(idGroup.value);
    return new MentionNode(id, MentionKind.Channel);
  }
);

const roleMentionMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /<@&(\d+)>/,
  (_, __, match) => {
    const idGroup = match.groups[1];
    if (!idGroup) return null;
    const id = Snowflake.tryParse(idGroup.value);
    return new MentionNode(id, MentionKind.Role);
  }
);

/* Emoji Matchers */

const standardEmojiMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  new RegExp(
    '(' +
      // Country flag emoji
      '(?:\\uD83C[\\uDDE6-\\uDDFF]){2}|' +
      // Digit emoji
      '\\d\\p{Me}|' +
      // Surrogate pair
      '\\p{Cs}{2}|' +
      // Miscellaneous characters
      '[' +
      '\\u2600-\\u2604' +
      '\\u260E\\u2611' +
      '\\u2614-\\u2615' +
      '\\u2618\\u261D\\u2620' +
      '\\u2622-\\u2623' +
      '\\u2626\\u262A' +
      '\\u262E-\\u262F' +
      '\\u2638-\\u263A' +
      '\\u2640\\u2642' +
      '\\u2648-\\u2653' +
      '\\u265F-\\u2660' +
      '\\u2663' +
      '\\u2665-\\u2666' +
      '\\u2668\\u267B' +
      '\\u267E-\\u267F' +
      '\\u2692-\\u2697' +
      '\\u2699' +
      '\\u269B-\\u269C' +
      '\\u26A0-\\u26A1' +
      '\\u26A7' +
      '\\u26AA-\\u26AB' +
      '\\u26B0-\\u26B1' +
      '\\u26BD-\\u26BE' +
      '\\u26C4-\\u26C5' +
      '\\u26C8' +
      '\\u26CE-\\u26CF' +
      '\\u26D1' +
      '\\u26D3-\\u26D4' +
      '\\u26E9-\\u26EA' +
      '\\u26F0-\\u26F5' +
      '\\u26F7-\\u26FA' +
      '\\u26FD' +
      ']' +
      ')',
    'u'
  ),
  (_, __, match) => {
    const emojiGroup = match.groups[1];
    if (!emojiGroup) return null;
    return EmojiNode.standard(emojiGroup.value);
  }
);

const codedStandardEmojiMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /:([\w_]+):/,
  (_, __, match) => {
    const nameGroup = match.groups[1];
    if (!nameGroup) return null;
    const emoji = emojiIndex.getByName(nameGroup.value);
    if (!emoji) return null;
    return EmojiNode.standard(emoji);
  }
);

const customEmojiMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /<(a)?:(.+?):(\d+?)>/,
  (_, __, match) => {
    const animatedGroup = match.groups[1];
    const nameGroup = match.groups[2];
    const idGroup = match.groups[3];
    if (!nameGroup || !idGroup) return null;
    const id = Snowflake.tryParse(idGroup.value);
    if (!id) return null;
    return new EmojiNode(
      id,
      nameGroup.value,
      animatedGroup?.value !== undefined && animatedGroup.value !== ''
    );
  }
);

/* Link Matchers */

const autoLinkMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /(https?:\/\/\S*[^.,;:"'\s])/,
  (_, __, match) => {
    const urlGroup = match.groups[1];
    if (!urlGroup) return null;
    return new LinkNode(urlGroup.value);
  }
);

const hiddenLinkMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /<(https?:\/\/\S*[^.,;:"'\s])>/,
  (_, __, match) => {
    const urlGroup = match.groups[1];
    if (!urlGroup) return null;
    return new LinkNode(urlGroup.value);
  }
);

const maskedLinkMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /\[(.+?)\]\((.+?)\)/,
  (context, segment, match) => {
    const titleGroup = match.groups[1];
    const urlGroup = match.groups[2];
    if (!titleGroup || !urlGroup) return null;
    const titleSegment = segment.relocate(titleGroup.index, titleGroup.length);
    return new LinkNode(urlGroup.value, parseChildren(context, titleSegment));
  }
);

/* Text/Escape Matchers */

const shrugMatcher = new StringMatcher<MarkdownContext, MarkdownNode>(
  '¯\\_(ツ)_/¯',
  (segment) => new TextNode(segment.toString())
);

const ignoredEmojiMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /([\u26A7\u2640\u2642\u2695\u267E\u00A9\u00AE\u2122])/,
  (_, __, match) => {
    const charGroup = match.groups[1];
    if (!charGroup) return null;
    return new TextNode(charGroup.value);
  }
);

const escapedSymbolMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /\\(\p{So}|\p{Cs}{2})/u,
  (_, __, match) => {
    const charGroup = match.groups[1];
    if (!charGroup) return null;
    return new TextNode(charGroup.value);
  }
);

const escapedCharacterMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /\\([^a-zA-Z0-9\s])/,
  (_, __, match) => {
    const charGroup = match.groups[1];
    if (!charGroup) return null;
    return new TextNode(charGroup.value);
  }
);

/* Misc Matchers */

const timestampMatcher = new RegexMatcher<MarkdownContext, MarkdownNode>(
  /<t:(-?\d+)(?::(\w))?>/,
  (_, __, match) => {
    const timestampGroup = match.groups[1];
    const formatGroup = match.groups[2];
    if (!timestampGroup) return null;

    try {
      const seconds = parseInt(timestampGroup.value, 10);
      const instant = new Date(seconds * 1000);

      // Check for invalid date
      if (isNaN(instant.getTime())) {
        return TimestampNode.Invalid;
      }

      const formatStr = formatGroup?.value;
      let format: string | null = null;

      switch (formatStr) {
        case 't':
        case 'T':
        case 'd':
        case 'D':
        case 'f':
        case 'F':
          format = formatStr;
          break;
        case 'r':
        case 'R':
          // Relative format - ignore
          format = null;
          break;
        case undefined:
        case '':
          format = null;
          break;
        default:
          // Unknown format - invalid
          return TimestampNode.Invalid;
      }

      return new TimestampNode(instant, format);
    } catch {
      return TimestampNode.Invalid;
    }
  }
);

/* Aggregate Matchers */

// Full matcher with all patterns (ordered from most specific to least)
const nodeMatcher = new AggregateMatcher<MarkdownContext, MarkdownNode>(
  // Escaped text
  shrugMatcher,
  ignoredEmojiMatcher,
  escapedSymbolMatcher,
  escapedCharacterMatcher,
  // Formatting
  italicBoldMatcher,
  italicUnderlineMatcher,
  boldMatcher,
  italicMatcher,
  underlineMatcher,
  italicAltMatcher,
  strikethroughMatcher,
  spoilerMatcher,
  multiLineQuoteMatcher,
  repeatedSingleLineQuoteMatcher,
  singleLineQuoteMatcher,
  headingMatcher,
  listMatcher,
  // Code blocks
  multiLineCodeBlockMatcher,
  inlineCodeBlockMatcher,
  // Mentions
  everyoneMentionMatcher,
  hereMentionMatcher,
  userMentionMatcher,
  channelMentionMatcher,
  roleMentionMatcher,
  // Links
  maskedLinkMatcher,
  autoLinkMatcher,
  hiddenLinkMatcher,
  // Emoji
  standardEmojiMatcher,
  customEmojiMatcher,
  codedStandardEmojiMatcher,
  // Misc
  timestampMatcher
);

// Minimal matcher for non-multimedia formats
const minimalNodeMatcher = new AggregateMatcher<MarkdownContext, MarkdownNode>(
  // Mentions
  everyoneMentionMatcher,
  hereMentionMatcher,
  userMentionMatcher,
  channelMentionMatcher,
  roleMentionMatcher,
  // Emoji
  customEmojiMatcher,
  // Misc
  timestampMatcher
);

/**
 * Parse markdown into AST nodes
 */
export function parse(markdown: string): MarkdownNode[] {
  const context: MarkdownContext = { depth: 0 };
  const segment = StringSegment.from(markdown);
  return parseChildren(context, segment);
}

/**
 * Parse markdown with minimal matching (mentions, custom emoji, timestamps only)
 */
export function parseMinimal(markdown: string): MarkdownNode[] {
  const context: MarkdownContext = { depth: 0 };
  const segment = StringSegment.from(markdown);

  return [
    ...matchAll(minimalNodeMatcher, context, segment, (_, s) => new TextNode(s.toString())),
  ].map((r) => r.value);
}

/**
 * Extract nodes of a specific type from parsed markdown
 */
function extractNodes<T extends MarkdownNode>(
  nodes: MarkdownNode[],
  predicate: (node: MarkdownNode) => node is T
): T[] {
  const result: T[] = [];

  function extract(nodeList: readonly MarkdownNode[]): void {
    for (const node of nodeList) {
      if (predicate(node)) {
        result.push(node);
      }
      if (isContainerNode(node)) {
        extract(node.children);
      }
    }
  }

  extract(nodes);
  return result;
}

/**
 * Extract all links from markdown
 */
export function extractLinks(markdown: string): LinkNode[] {
  const nodes = parse(markdown);
  return extractNodes(nodes, (n): n is LinkNode => n instanceof LinkNode);
}

/**
 * Extract all emoji from markdown
 */
export function extractEmojis(markdown: string): EmojiNode[] {
  const nodes = parse(markdown);
  return extractNodes(nodes, (n): n is EmojiNode => n instanceof EmojiNode);
}
