import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { FileSize } from '../../utils/file-size.js';

/**
 * Represents a message attachment
 * @see https://discord.com/developers/docs/resources/channel#attachment-object
 */
export class Attachment implements HasId {
  readonly id: Snowflake;
  readonly url: string;
  readonly fileName: string;
  readonly fileSize: FileSize;
  readonly width: number | null;
  readonly height: number | null;

  constructor(
    id: Snowflake,
    url: string,
    fileName: string,
    fileSize: FileSize,
    width: number | null,
    height: number | null
  ) {
    this.id = id;
    this.url = url;
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.width = width;
    this.height = height;
  }

  /**
   * Get the file extension (lowercase, without dot)
   */
  get fileExtension(): string {
    const dotIndex = this.fileName.lastIndexOf('.');
    return dotIndex >= 0 ? this.fileName.slice(dotIndex + 1).toLowerCase() : '';
  }

  /**
   * Whether this attachment is an image
   */
  get isImage(): boolean {
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];
    return imageExts.includes(this.fileExtension);
  }

  /**
   * Whether this attachment is a video
   */
  get isVideo(): boolean {
    const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    return videoExts.includes(this.fileExtension);
  }

  /**
   * Whether this attachment is an audio file
   */
  get isAudio(): boolean {
    const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
    return audioExts.includes(this.fileExtension);
  }

  /**
   * Whether this attachment has a spoiler tag
   */
  get isSpoiler(): boolean {
    return this.fileName.startsWith('SPOILER_');
  }

  /**
   * Parse an Attachment from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Attachment {
    const id = Snowflake.parse(json['id'] as string);
    const url = json['url'] as string;
    const fileName = json['filename'] as string;
    const fileSize = new FileSize(json['size'] as number);
    const width = (json['width'] as number | undefined) ?? null;
    const height = (json['height'] as number | undefined) ?? null;

    return new Attachment(id, url, fileName, fileSize, width, height);
  }
}
