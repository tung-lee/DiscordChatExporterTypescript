import { Emoji } from './emoji.js';

/**
 * Represents a message reaction
 */
export class Reaction {
  readonly emoji: Emoji;
  readonly count: number;

  constructor(emoji: Emoji, count: number) {
    this.emoji = emoji;
    this.count = count;
  }

  /**
   * Parse a Reaction from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Reaction {
    const emoji = Emoji.parse(json['emoji'] as Record<string, unknown>);
    const count = json['count'] as number;

    return new Reaction(emoji, count);
  }
}
