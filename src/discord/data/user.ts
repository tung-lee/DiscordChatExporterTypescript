import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { ImageCdn } from './common/image-cdn.js';
import { nullIfWhitespace } from '../../utils/extensions.js';

/**
 * Represents a Discord user
 * @see https://discord.com/developers/docs/resources/user#user-object
 */
export class User implements HasId {
  readonly id: Snowflake;
  readonly isBot: boolean;
  readonly discriminator: number | null;
  readonly name: string;
  readonly displayName: string;
  readonly avatarUrl: string;

  constructor(
    id: Snowflake,
    isBot: boolean,
    discriminator: number | null,
    name: string,
    displayName: string,
    avatarUrl: string
  ) {
    this.id = id;
    this.isBot = isBot;
    this.discriminator = discriminator;
    this.name = name;
    this.displayName = displayName;
    this.avatarUrl = avatarUrl;
  }

  /**
   * Formatted discriminator (e.g., "0001")
   */
  get discriminatorFormatted(): string {
    return this.discriminator !== null
      ? this.discriminator.toString().padStart(4, '0')
      : '0000';
  }

  /**
   * Full username (e.g., "User#1234" or just "User" for new system)
   */
  get fullName(): string {
    return this.discriminator !== null
      ? `${this.name}#${this.discriminatorFormatted}`
      : this.name;
  }

  /**
   * Parse a User from Discord API JSON
   */
  static parse(json: Record<string, unknown>): User {
    const id = Snowflake.parse(json['id'] as string);
    const isBot = (json['bot'] as boolean | undefined) ?? false;

    const discriminatorStr = nullIfWhitespace(json['discriminator'] as string | undefined);
    const discriminator = discriminatorStr
      ? parseInt(discriminatorStr, 10) || null
      : null;
    // Discord's new username system uses discriminator "0"
    const normalizedDiscriminator =
      discriminator === 0 ? null : discriminator;

    const name = json['username'] as string;
    const displayName =
      nullIfWhitespace(json['global_name'] as string | undefined) ?? name;

    // Calculate fallback avatar index
    const avatarIndex =
      normalizedDiscriminator !== null
        ? normalizedDiscriminator % 5
        : Number((id.value >> 22n) % 6n);

    const avatarHash = nullIfWhitespace(json['avatar'] as string | undefined);
    const avatarUrl = avatarHash
      ? ImageCdn.getUserAvatarUrl(id, avatarHash)
      : ImageCdn.getFallbackUserAvatarUrl(avatarIndex);

    return new User(
      id,
      isBot,
      normalizedDiscriminator,
      name,
      displayName,
      avatarUrl
    );
  }
}
