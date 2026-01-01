import { MarkdownVisitor } from '../../markdown/parsing/markdown-visitor.js';
import { parse } from '../../markdown/parsing/markdown-parser.js';
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
} from '../../markdown/nodes.js';
import { FormattingKind } from '../../markdown/formatting-kind.js';
import { MentionKind } from '../../markdown/mention-kind.js';
import { ExportContext } from '../export-context.js';

/**
 * HTML encode special characters
 */
function htmlEncode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Markdown visitor that formats to HTML
 */
export class HtmlMarkdownVisitor extends MarkdownVisitor {
  private buffer = '';

  constructor(
    private readonly context: ExportContext,
    private readonly isJumbo: boolean = false
  ) {
    super();
  }

  protected async visitText(node: TextNode): Promise<void> {
    this.buffer += htmlEncode(node.text);
  }

  protected async visitFormatting(node: FormattingNode): Promise<void> {
    let openingTag: string;
    let closingTag: string;

    switch (node.kind) {
      case FormattingKind.Bold:
        openingTag = '<strong>';
        closingTag = '</strong>';
        break;
      case FormattingKind.Italic:
        openingTag = '<em>';
        closingTag = '</em>';
        break;
      case FormattingKind.Underline:
        openingTag = '<u>';
        closingTag = '</u>';
        break;
      case FormattingKind.Strikethrough:
        openingTag = '<s>';
        closingTag = '</s>';
        break;
      case FormattingKind.Spoiler:
        openingTag =
          '<span class="chatlog__markdown-spoiler chatlog__markdown-spoiler--hidden" onclick="showSpoiler(event, this)">';
        closingTag = '</span>';
        break;
      case FormattingKind.Quote:
        openingTag =
          '<div class="chatlog__markdown-quote"><div class="chatlog__markdown-quote-border"></div><div class="chatlog__markdown-quote-content">';
        closingTag = '</div></div>';
        break;
      default:
        throw new Error(`Unknown formatting kind: ${node.kind}`);
    }

    this.buffer += openingTag;
    await this.visitAll(node.children);
    this.buffer += closingTag;
  }

  protected async visitHeading(node: HeadingNode): Promise<void> {
    this.buffer += `<h${node.level}>`;
    await this.visitAll(node.children);
    this.buffer += `</h${node.level}>`;
  }

  protected async visitList(node: ListNode): Promise<void> {
    this.buffer += '<ul>';
    for (const item of node.items) {
      await this.visitListItem(item);
    }
    this.buffer += '</ul>';
  }

  protected async visitListItem(node: ListItemNode): Promise<void> {
    this.buffer += '<li>';
    await this.visitAll(node.children);
    this.buffer += '</li>';
  }

  protected async visitInlineCodeBlock(node: InlineCodeBlockNode): Promise<void> {
    this.buffer += `<code class="chatlog__markdown-pre chatlog__markdown-pre--inline">${htmlEncode(node.code)}</code>`;
  }

  protected async visitMultiLineCodeBlock(node: MultiLineCodeBlockNode): Promise<void> {
    const highlightClass = node.language?.trim()
      ? `language-${node.language}`
      : 'nohighlight';

    this.buffer += `<code class="chatlog__markdown-pre chatlog__markdown-pre--multiline ${highlightClass}">${htmlEncode(node.code)}</code>`;
  }

  protected async visitLink(node: LinkNode): Promise<void> {
    // Try to extract the message ID if the link points to a Discord message
    const match = node.url.match(/^https?:\/\/(?:discord|discordapp)\.com\/channels\/.*?\/(\d+)\/?$/);
    const linkedMessageId = match?.[1];

    if (linkedMessageId) {
      this.buffer += `<a href="${htmlEncode(node.url)}" onclick="scrollToMessage(event, '${linkedMessageId}')">`;
    } else {
      this.buffer += `<a href="${htmlEncode(node.url)}">`;
    }

    if (node.children.length > 0) {
      await this.visitAll(node.children);
    } else {
      this.buffer += htmlEncode(node.url);
    }

    this.buffer += '</a>';
  }

  protected async visitEmoji(node: EmojiNode): Promise<void> {
    const jumboClass = this.isJumbo ? 'chatlog__emoji--large' : '';
    const imageUrl = await this.context.resolveAssetUrl(node.imageUrl);

    this.buffer += `<img loading="lazy" class="chatlog__emoji ${jumboClass}" alt="${node.name}" title="${node.code}" src="${imageUrl}">`;
  }

  protected async visitMention(node: MentionNode): Promise<void> {
    switch (node.kind) {
      case MentionKind.Everyone:
        this.buffer += '<span class="chatlog__markdown-mention">@everyone</span>';
        break;

      case MentionKind.Here:
        this.buffer += '<span class="chatlog__markdown-mention">@here</span>';
        break;

      case MentionKind.User:
        if (node.targetId) {
          await this.context.populateMember(node.targetId);
          const member = this.context.tryGetMember(node.targetId);
          const fullName = member?.user.fullName ?? 'Unknown';
          const displayName = member?.displayName ?? member?.user.displayName ?? 'Unknown';

          this.buffer += `<span class="chatlog__markdown-mention" title="${htmlEncode(fullName)}">@${htmlEncode(displayName)}</span>`;
        } else {
          this.buffer += '<span class="chatlog__markdown-mention">@Unknown</span>';
        }
        break;

      case MentionKind.Channel:
        if (node.targetId) {
          const channel = this.context.tryGetChannel(node.targetId);
          const symbol = channel?.isVoice ? '🔊' : '#';
          const name = channel?.name ?? 'deleted-channel';

          this.buffer += `<span class="chatlog__markdown-mention">${symbol}${htmlEncode(name)}</span>`;
        } else {
          this.buffer += '<span class="chatlog__markdown-mention">#deleted-channel</span>';
        }
        break;

      case MentionKind.Role:
        if (node.targetId) {
          const role = this.context.tryGetRole(node.targetId);
          const name = role?.name ?? 'deleted-role';
          const color = role?.color;

          let style = '';
          if (color) {
            style = `color: rgb(${color.r}, ${color.g}, ${color.b}); background-color: rgba(${color.r}, ${color.g}, ${color.b}, 0.1);`;
          }

          this.buffer += `<span class="chatlog__markdown-mention" style="${style}">@${htmlEncode(name)}</span>`;
        } else {
          this.buffer += '<span class="chatlog__markdown-mention">@deleted-role</span>';
        }
        break;
    }
  }

  protected async visitTimestamp(node: TimestampNode): Promise<void> {
    const formatted = node.instant
      ? this.context.formatDate(node.instant, node.format ?? 'g')
      : 'Invalid date';

    const formattedLong = node.instant ? this.context.formatDate(node.instant, 'f') : '';

    this.buffer += `<span class="chatlog__markdown-timestamp" title="${htmlEncode(formattedLong)}">${htmlEncode(formatted)}</span>`;
  }

  /**
   * Get the formatted result
   */
  getResult(): string {
    return this.buffer;
  }

  /**
   * Check if the nodes are only emoji (for jumbo detection)
   */
  private static isJumboEligible(nodes: readonly MarkdownNode[]): boolean {
    return nodes.every(
      (n) =>
        n.type === 'emoji' ||
        (n.type === 'text' && (n as TextNode).text.trim() === '')
    );
  }

  /**
   * Format markdown to HTML
   */
  static async format(
    context: ExportContext,
    markdown: string,
    isJumboAllowed = true
  ): Promise<string> {
    const nodes = parse(markdown);
    const isJumbo = isJumboAllowed && HtmlMarkdownVisitor.isJumboEligible(nodes);

    const visitor = new HtmlMarkdownVisitor(context, isJumbo);
    await visitor.visitAll(nodes);
    return visitor.getResult();
  }
}
