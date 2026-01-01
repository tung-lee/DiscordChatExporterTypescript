import { nullIfWhitespace } from '../../../utils/extensions.js';

/**
 * Represents an embed video
 */
export class EmbedVideo {
  readonly url: string | null;
  readonly proxyUrl: string | null;
  readonly width: number | null;
  readonly height: number | null;

  constructor(
    url: string | null,
    proxyUrl: string | null,
    width: number | null,
    height: number | null
  ) {
    this.url = url;
    this.proxyUrl = proxyUrl;
    this.width = width;
    this.height = height;
  }

  static parse(json: Record<string, unknown>): EmbedVideo {
    const url = nullIfWhitespace(json['url'] as string | undefined);
    const proxyUrl = nullIfWhitespace(json['proxy_url'] as string | undefined);
    const width = (json['width'] as number | undefined) ?? null;
    const height = (json['height'] as number | undefined) ?? null;

    return new EmbedVideo(url, proxyUrl, width, height);
  }
}
