import { nullIfWhitespace } from '../../../utils/extensions.js';
import { Color } from '../../../utils/color.js';
import { EmbedKind } from '../enums.js';
import { EmbedAuthor } from './embed-author.js';
import { EmbedField } from './embed-field.js';
import { EmbedFooter } from './embed-footer.js';
import { EmbedImage } from './embed-image.js';
import { EmbedVideo } from './embed-video.js';

/**
 * Represents a Discord embed
 * @see https://discord.com/developers/docs/resources/channel#embed-object
 */
export class Embed {
  readonly title: string | null;
  readonly kind: EmbedKind | null;
  readonly url: string | null;
  readonly timestamp: Date | null;
  readonly color: Color | null;
  readonly author: EmbedAuthor | null;
  readonly description: string | null;
  readonly fields: readonly EmbedField[];
  readonly thumbnail: EmbedImage | null;
  readonly image: EmbedImage | null;
  readonly images: readonly EmbedImage[];
  readonly video: EmbedVideo | null;
  readonly footer: EmbedFooter | null;

  constructor(
    title: string | null,
    kind: EmbedKind | null,
    url: string | null,
    timestamp: Date | null,
    color: Color | null,
    author: EmbedAuthor | null,
    description: string | null,
    fields: readonly EmbedField[],
    thumbnail: EmbedImage | null,
    image: EmbedImage | null,
    images: readonly EmbedImage[],
    video: EmbedVideo | null,
    footer: EmbedFooter | null
  ) {
    this.title = title;
    this.kind = kind;
    this.url = url;
    this.timestamp = timestamp;
    this.color = color;
    this.author = author;
    this.description = description;
    this.fields = fields;
    this.thumbnail = thumbnail;
    this.image = image;
    this.images = images;
    this.video = video;
    this.footer = footer;
  }

  /**
   * Create a copy with different images array
   */
  withImages(images: readonly EmbedImage[]): Embed {
    return new Embed(
      this.title,
      this.kind,
      this.url,
      this.timestamp,
      this.color,
      this.author,
      this.description,
      this.fields,
      this.thumbnail,
      this.image,
      images,
      this.video,
      this.footer
    );
  }

  static parse(json: Record<string, unknown>): Embed {
    const title = nullIfWhitespace(json['title'] as string | undefined);
    const kindStr = nullIfWhitespace(json['type'] as string | undefined);
    const kind = kindStr as EmbedKind | null;
    const url = nullIfWhitespace(json['url'] as string | undefined);

    const timestampStr = nullIfWhitespace(json['timestamp'] as string | undefined);
    const timestamp = timestampStr ? new Date(timestampStr) : null;

    const colorValue = json['color'] as number | undefined;
    const color = colorValue !== undefined ? Color.fromInt(colorValue) : null;

    const authorJson = json['author'] as Record<string, unknown> | undefined;
    const author = authorJson ? EmbedAuthor.parse(authorJson) : null;

    const description = nullIfWhitespace(json['description'] as string | undefined);

    const fieldsJson = json['fields'] as Record<string, unknown>[] | undefined;
    const fields = fieldsJson?.map(EmbedField.parse) ?? [];

    const thumbnailJson = json['thumbnail'] as Record<string, unknown> | undefined;
    const thumbnail = thumbnailJson ? EmbedImage.parse(thumbnailJson) : null;

    const imageJson = json['image'] as Record<string, unknown> | undefined;
    const image = imageJson ? EmbedImage.parse(imageJson) : null;

    // Initialize images array with the main image if present
    const images = image ? [image] : [];

    const videoJson = json['video'] as Record<string, unknown> | undefined;
    const video = videoJson ? EmbedVideo.parse(videoJson) : null;

    const footerJson = json['footer'] as Record<string, unknown> | undefined;
    const footer = footerJson ? EmbedFooter.parse(footerJson) : null;

    return new Embed(
      title,
      kind,
      url,
      timestamp,
      color,
      author,
      description,
      fields,
      thumbnail,
      image,
      images,
      video,
      footer
    );
  }
}
