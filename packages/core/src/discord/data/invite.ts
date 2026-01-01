import { Guild } from './guild.js';
import { Channel } from './channel.js';

/**
 * Represents a Discord invite
 * @see https://discord.com/developers/docs/resources/invite#invite-object
 */
export class Invite {
  readonly code: string;
  readonly guild: Guild | null;
  readonly channel: Channel | null;

  constructor(code: string, guild: Guild | null, channel: Channel | null) {
    this.code = code;
    this.guild = guild;
    this.channel = channel;
  }

  /**
   * Parse an Invite from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Invite {
    const code = json['code'] as string;

    const guildJson = json['guild'] as Record<string, unknown> | undefined;
    const guild = guildJson ? Guild.parse(guildJson) : null;

    const channelJson = json['channel'] as Record<string, unknown> | undefined;
    const channel = channelJson ? Channel.parse(channelJson) : null;

    return new Invite(code, guild, channel);
  }
}
