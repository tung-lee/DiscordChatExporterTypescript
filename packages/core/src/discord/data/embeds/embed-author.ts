import { nullIfWhitespace } from '../../../utils/extensions.js';

/**
 * Represents an embed author
 */
export class EmbedAuthor {
  readonly name: string;
  readonly url: string | null;
  readonly iconUrl: string | null;
  readonly iconProxyUrl: string | null;

  constructor(
    name: string,
    url: string | null,
    iconUrl: string | null,
    iconProxyUrl: string | null
  ) {
    this.name = name;
    this.url = url;
    this.iconUrl = iconUrl;
    this.iconProxyUrl = iconProxyUrl;
  }

  static parse(json: Record<string, unknown>): EmbedAuthor {
    const name = json['name'] as string;
    const url = nullIfWhitespace(json['url'] as string | undefined);
    const iconUrl = nullIfWhitespace(json['icon_url'] as string | undefined);
    const iconProxyUrl = nullIfWhitespace(json['proxy_icon_url'] as string | undefined);

    return new EmbedAuthor(name, url, iconUrl, iconProxyUrl);
  }
}
