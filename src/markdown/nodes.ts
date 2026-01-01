import { Snowflake } from '../discord/snowflake.js';
import { Emoji } from '../discord/data/emoji.js';
import { FormattingKind } from './formatting-kind.js';
import { MentionKind } from './mention-kind.js';

/**
 * Base type for all markdown nodes
 */
export type MarkdownNode =
  | TextNode
  | FormattingNode
  | HeadingNode
  | ListNode
  | ListItemNode
  | InlineCodeBlockNode
  | MultiLineCodeBlockNode
  | LinkNode
  | EmojiNode
  | MentionNode
  | TimestampNode;

/**
 * Interface for nodes that contain child nodes
 */
export interface ContainerNode {
  readonly children: readonly MarkdownNode[];
}

/**
 * Check if a node is a container node
 */
export function isContainerNode(node: MarkdownNode): node is MarkdownNode & ContainerNode {
  return 'children' in node;
}

/**
 * Plain text node
 */
export class TextNode {
  readonly type = 'text' as const;

  constructor(readonly text: string) {}
}

/**
 * Formatting node (bold, italic, underline, etc.)
 */
export class FormattingNode implements ContainerNode {
  readonly type = 'formatting' as const;

  constructor(
    readonly kind: FormattingKind,
    readonly children: readonly MarkdownNode[]
  ) {}
}

/**
 * Heading node (h1, h2, h3)
 */
export class HeadingNode implements ContainerNode {
  readonly type = 'heading' as const;

  constructor(
    readonly level: number,
    readonly children: readonly MarkdownNode[]
  ) {}
}

/**
 * List node containing list items
 */
export class ListNode {
  readonly type = 'list' as const;

  constructor(readonly items: readonly ListItemNode[]) {}
}

/**
 * List item node
 */
export class ListItemNode implements ContainerNode {
  readonly type = 'listItem' as const;

  constructor(readonly children: readonly MarkdownNode[]) {}
}

/**
 * Inline code block (single backticks)
 */
export class InlineCodeBlockNode {
  readonly type = 'inlineCodeBlock' as const;

  constructor(readonly code: string) {}
}

/**
 * Multi-line code block (triple backticks)
 */
export class MultiLineCodeBlockNode {
  readonly type = 'multiLineCodeBlock' as const;

  constructor(
    readonly language: string,
    readonly code: string
  ) {}
}

/**
 * Link node (URLs and masked links)
 */
export class LinkNode implements ContainerNode {
  readonly type = 'link' as const;

  constructor(
    readonly url: string,
    readonly children: readonly MarkdownNode[] = []
  ) {}
}

/**
 * Emoji node (standard and custom)
 */
export class EmojiNode {
  readonly type = 'emoji' as const;
  private readonly _emoji: Emoji;

  constructor(
    readonly id: Snowflake | null,
    readonly name: string,
    readonly isAnimated: boolean = false
  ) {
    this._emoji = new Emoji(id, name, isAnimated);
  }

  /**
   * Create a standard emoji node
   */
  static standard(name: string): EmojiNode {
    return new EmojiNode(null, name, false);
  }

  /**
   * Check if this is a custom emoji
   */
  get isCustomEmoji(): boolean {
    return this._emoji.isCustom;
  }

  /**
   * Get the emoji code (name for standard, custom format for custom)
   */
  get code(): string {
    return this._emoji.code;
  }

  /**
   * Get the image URL for this emoji
   */
  get imageUrl(): string {
    return this._emoji.imageUrl;
  }
}

/**
 * Mention node (@user, #channel, @role, @everyone, @here)
 */
export class MentionNode {
  readonly type = 'mention' as const;

  constructor(
    readonly targetId: Snowflake | null,
    readonly kind: MentionKind
  ) {}
}

/**
 * Timestamp node (<t:12345:R>)
 */
export class TimestampNode {
  readonly type = 'timestamp' as const;

  constructor(
    readonly instant: Date | null,
    readonly format: string | null
  ) {}

  /**
   * Invalid timestamp singleton
   */
  static readonly Invalid = new TimestampNode(null, null);
}
