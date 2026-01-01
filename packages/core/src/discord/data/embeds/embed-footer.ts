import { nullIfWhitespace } from '../../../utils/extensions.js';

/**
 * Represents an embed footer
 */
export class EmbedFooter {
  readonly text: string;
  readonly iconUrl: string | null;
  readonly iconProxyUrl: string | null;

  constructor(
    text: string,
    iconUrl: string | null,
    iconProxyUrl: string | null
  ) {
    this.text = text;
    this.iconUrl = iconUrl;
    this.iconProxyUrl = iconProxyUrl;
  }

  static parse(json: Record<string, unknown>): EmbedFooter {
    const text = json['text'] as string;
    const iconUrl = nullIfWhitespace(json['icon_url'] as string | undefined);
    const iconProxyUrl = nullIfWhitespace(json['proxy_icon_url'] as string | undefined);

    return new EmbedFooter(text, iconUrl, iconProxyUrl);
  }
}
