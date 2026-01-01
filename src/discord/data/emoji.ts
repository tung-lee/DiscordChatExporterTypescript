import { Snowflake } from '../snowflake.js';
import { ImageCdn } from './common/image-cdn.js';

/**
 * Represents a Discord emoji (standard or custom)
 */
export class Emoji {
  readonly id: Snowflake | null;
  readonly name: string;
  readonly isAnimated: boolean;

  constructor(id: Snowflake | null, name: string, isAnimated: boolean = false) {
    this.id = id;
    this.name = name;
    this.isAnimated = isAnimated;
  }

  /**
   * Whether this is a custom emoji
   */
  get isCustom(): boolean {
    return this.id !== null;
  }

  /**
   * Get the code representation (e.g., ":emoji:" or "<:emoji:123>")
   */
  get code(): string {
    if (this.id !== null) {
      const animated = this.isAnimated ? 'a' : '';
      return `<${animated}:${this.name}:${this.id}>`;
    }
    return this.name;
  }

  /**
   * Get the URL for this emoji's image
   */
  get imageUrl(): string {
    if (this.id !== null) {
      return ImageCdn.getCustomEmojiUrl(this.id, this.isAnimated);
    }
    return ImageCdn.getStandardEmojiUrl(this.name);
  }

  /**
   * Parse an Emoji from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Emoji {
    const idStr = json['id'] as string | null | undefined;
    const id = idStr ? Snowflake.parse(idStr) : null;
    const name = (json['name'] as string | null) ?? '';
    const isAnimated = (json['animated'] as boolean | undefined) ?? false;

    return new Emoji(id, name, isAnimated);
  }
}
