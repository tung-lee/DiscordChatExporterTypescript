import { Message } from '../../discord/data/message.js';

/**
 * Base class for message filters
 */
export abstract class MessageFilter {
  /**
   * Null filter that matches everything
   */
  static get Null(): MessageFilter {
    return NullMessageFilter.Instance;
  }

  /**
   * Parse a filter from string expression
   * This method is added by filter-grammar.ts to avoid circular dependency
   */
  static parse: (input: string) => MessageFilter;

  /**
   * Check if a message passes the filter
   */
  abstract isMatch(message: Message): boolean;

  /**
   * Combine filters with AND
   */
  and(other: MessageFilter): MessageFilter {
    return new BinaryExpressionMessageFilter(this, other, 'and');
  }

  /**
   * Combine filters with OR
   */
  or(other: MessageFilter): MessageFilter {
    return new BinaryExpressionMessageFilter(this, other, 'or');
  }

  /**
   * Negate this filter
   */
  negate(): MessageFilter {
    return new NegatedMessageFilter(this);
  }
}

/**
 * Null filter that matches everything
 */
export class NullMessageFilter extends MessageFilter {
  static readonly Instance = new NullMessageFilter();

  private constructor() {
    super();
  }

  isMatch(_message: Message): boolean {
    return true;
  }
}

/**
 * Negated filter
 */
export class NegatedMessageFilter extends MessageFilter {
  constructor(readonly inner: MessageFilter) {
    super();
  }

  isMatch(message: Message): boolean {
    return !this.inner.isMatch(message);
  }
}

/**
 * Binary expression filter (AND/OR)
 */
export class BinaryExpressionMessageFilter extends MessageFilter {
  constructor(
    readonly first: MessageFilter,
    readonly second: MessageFilter,
    readonly kind: 'and' | 'or'
  ) {
    super();
  }

  isMatch(message: Message): boolean {
    if (this.kind === 'and') {
      return this.first.isMatch(message) && this.second.isMatch(message);
    } else {
      return this.first.isMatch(message) || this.second.isMatch(message);
    }
  }
}

/**
 * Filter by message content
 */
export class ContainsMessageFilter extends MessageFilter {
  private readonly normalizedText: string;

  constructor(text: string) {
    super();
    this.normalizedText = text.toLowerCase();
  }

  isMatch(message: Message): boolean {
    return message.content.toLowerCase().includes(this.normalizedText);
  }
}

/**
 * Filter by message author
 */
export class FromMessageFilter extends MessageFilter {
  private readonly normalizedValue: string;

  constructor(value: string) {
    super();
    this.normalizedValue = value.toLowerCase();
  }

  isMatch(message: Message): boolean {
    const author = message.author;
    return (
      author.id.toString() === this.normalizedValue ||
      author.name.toLowerCase() === this.normalizedValue ||
      author.fullName.toLowerCase() === this.normalizedValue
    );
  }
}

/**
 * Filter by mentioned user
 */
export class MentionsMessageFilter extends MessageFilter {
  private readonly normalizedValue: string;

  constructor(value: string) {
    super();
    this.normalizedValue = value.toLowerCase();
  }

  isMatch(message: Message): boolean {
    for (const user of message.mentionedUsers) {
      if (
        user.id.toString() === this.normalizedValue ||
        user.name.toLowerCase() === this.normalizedValue ||
        user.fullName.toLowerCase() === this.normalizedValue
      ) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Types of content that can be checked with "has:" filter
 */
export type HasFilterKind =
  | 'link'
  | 'embed'
  | 'file'
  | 'video'
  | 'image'
  | 'sound'
  | 'sticker'
  | 'invite'
  | 'mention'
  | 'pin';

/**
 * Filter by message having certain content types
 */
export class HasMessageFilter extends MessageFilter {
  constructor(readonly kind: HasFilterKind) {
    super();
  }

  isMatch(message: Message): boolean {
    switch (this.kind) {
      case 'link':
        return this.hasLink(message);
      case 'embed':
        return message.embeds.length > 0;
      case 'file':
        return message.attachments.length > 0;
      case 'video':
        return this.hasVideo(message);
      case 'image':
        return this.hasImage(message);
      case 'sound':
        return this.hasSound(message);
      case 'sticker':
        return message.stickers.length > 0;
      case 'invite':
        return this.hasInvite(message);
      case 'mention':
        return message.mentionedUsers.length > 0;
      case 'pin':
        return message.isPinned;
    }
  }

  private hasLink(message: Message): boolean {
    // Check for links in content
    const linkPattern = /https?:\/\/\S+/i;
    if (linkPattern.test(message.content)) {
      return true;
    }

    // Check embeds for links
    for (const embed of message.embeds) {
      if (embed.url) return true;
    }

    return false;
  }

  private hasVideo(message: Message): boolean {
    // Check attachments
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv'];
    for (const attachment of message.attachments) {
      const fileName = attachment.fileName.toLowerCase();
      if (videoExtensions.some((ext) => fileName.endsWith(ext))) {
        return true;
      }
    }

    // Check embeds
    for (const embed of message.embeds) {
      if (embed.video) return true;
    }

    return false;
  }

  private hasImage(message: Message): boolean {
    // Check attachments
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    for (const attachment of message.attachments) {
      const fileName = attachment.fileName.toLowerCase();
      if (imageExtensions.some((ext) => fileName.endsWith(ext))) {
        return true;
      }
    }

    // Check embeds
    for (const embed of message.embeds) {
      if (embed.image || embed.thumbnail) return true;
    }

    return false;
  }

  private hasSound(message: Message): boolean {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
    for (const attachment of message.attachments) {
      const fileName = attachment.fileName.toLowerCase();
      if (audioExtensions.some((ext) => fileName.endsWith(ext))) {
        return true;
      }
    }
    return false;
  }

  private hasInvite(message: Message): boolean {
    const invitePattern = /discord\.gg\/\w+|discord(?:app)?\.com\/invite\/\w+/i;
    return invitePattern.test(message.content);
  }
}

/**
 * Filter by reaction emoji
 */
export class ReactionMessageFilter extends MessageFilter {
  private readonly normalizedEmoji: string;

  constructor(emoji: string) {
    super();
    this.normalizedEmoji = emoji.toLowerCase();
  }

  isMatch(message: Message): boolean {
    for (const reaction of message.reactions) {
      if (
        reaction.emoji.code.toLowerCase() === this.normalizedEmoji ||
        reaction.emoji.name.toLowerCase() === this.normalizedEmoji
      ) {
        return true;
      }
    }
    return false;
  }
}
