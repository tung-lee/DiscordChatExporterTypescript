import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { ImageCdn } from './common/image-cdn.js';
import { nullIfWhitespace } from '../../utils/extensions.js';

/**
 * Represents a Discord guild (server)
 * @see https://discord.com/developers/docs/resources/guild#guild-object
 */
export class Guild implements HasId {
  readonly id: Snowflake;
  readonly name: string;
  readonly iconUrl: string;

  constructor(id: Snowflake, name: string, iconUrl: string) {
    this.id = id;
    this.name = name;
    this.iconUrl = iconUrl;
  }

  /**
   * Whether this is the special "Direct Messages" pseudo-guild
   */
  get isDirect(): boolean {
    return this.id.equals(Snowflake.Zero);
  }

  /**
   * Special pseudo-guild for direct messages
   */
  static readonly DirectMessages = new Guild(
    Snowflake.Zero,
    'Direct Messages',
    ImageCdn.getFallbackUserAvatarUrl(0)
  );

  /**
   * Parse a Guild from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Guild {
    const id = Snowflake.parse(json['id'] as string);
    const name = json['name'] as string;

    const iconHash = nullIfWhitespace(json['icon'] as string | undefined);
    const iconUrl = iconHash
      ? ImageCdn.getGuildIconUrl(id, iconHash)
      : ImageCdn.getFallbackUserAvatarUrl(0);

    return new Guild(id, name, iconUrl);
  }
}
