import { Snowflake } from '../snowflake.js';
import { User } from './user.js';
import { ImageCdn } from './common/image-cdn.js';
import { nullIfWhitespace } from '../../utils/extensions.js';

/**
 * Represents a Discord guild member
 * @see https://discord.com/developers/docs/resources/guild#guild-member-object
 */
export class Member {
  readonly user: User;
  readonly nick: string | null;
  readonly roleIds: readonly Snowflake[];
  readonly avatarUrl: string;
  readonly guildId: Snowflake;

  constructor(
    user: User,
    nick: string | null,
    roleIds: readonly Snowflake[],
    avatarUrl: string,
    guildId: Snowflake
  ) {
    this.user = user;
    this.nick = nick;
    this.roleIds = roleIds;
    this.avatarUrl = avatarUrl;
    this.guildId = guildId;
  }

  /**
   * Display name (nick if set, otherwise user display name)
   */
  get displayName(): string {
    return this.nick ?? this.user.displayName;
  }

  /**
   * Parse a Member from Discord API JSON
   */
  static parse(json: Record<string, unknown>, guildId: Snowflake): Member {
    const user = User.parse(json['user'] as Record<string, unknown>);
    const nick = nullIfWhitespace(json['nick'] as string | undefined);

    const roleIdsJson = json['roles'] as string[] | undefined;
    const roleIds = roleIdsJson?.map((id) => Snowflake.parse(id)) ?? [];

    const avatarHash = nullIfWhitespace(json['avatar'] as string | undefined);
    const avatarUrl = avatarHash
      ? ImageCdn.getMemberAvatarUrl(guildId, user.id, avatarHash)
      : user.avatarUrl;

    return new Member(user, nick, roleIds, avatarUrl, guildId);
  }

  /**
   * Create a fallback member from a user (when member info is not available)
   */
  static createFallback(user: User): Member {
    return new Member(user, null, [], user.avatarUrl, Snowflake.Zero);
  }
}
