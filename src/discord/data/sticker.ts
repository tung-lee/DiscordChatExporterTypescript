import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { StickerFormat } from './enums.js';
import { ImageCdn } from './common/image-cdn.js';

/**
 * Represents a Discord sticker
 * @see https://discord.com/developers/docs/resources/sticker#sticker-object
 */
export class Sticker implements HasId {
  readonly id: Snowflake;
  readonly name: string;
  readonly format: StickerFormat;

  constructor(id: Snowflake, name: string, format: StickerFormat) {
    this.id = id;
    this.name = name;
    this.format = format;
  }

  /**
   * Get the source URL for this sticker
   */
  get sourceUrl(): string {
    switch (this.format) {
      case StickerFormat.Png:
      case StickerFormat.Apng:
        return ImageCdn.getStickerUrl(this.id, 'png');
      case StickerFormat.Gif:
        return ImageCdn.getStickerUrl(this.id, 'gif');
      case StickerFormat.Lottie:
        return ImageCdn.getStickerUrl(this.id, 'json');
    }
  }

  /**
   * Parse a Sticker from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Sticker {
    const id = Snowflake.parse(json['id'] as string);
    const name = json['name'] as string;
    const format = json['format_type'] as StickerFormat;

    return new Sticker(id, name, format);
  }
}
