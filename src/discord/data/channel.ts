import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { ImageCdn } from './common/image-cdn.js';
import { ChannelKind } from './enums.js';
import { User } from './user.js';
import { Guild } from './guild.js';
import { nullIfWhitespace } from '../../utils/extensions.js';

/**
 * Represents a Discord channel
 * @see https://discord.com/developers/docs/resources/channel#channel-object
 */
export class Channel implements HasId {
  readonly id: Snowflake;
  readonly kind: ChannelKind;
  readonly guildId: Snowflake;
  readonly parent: Channel | null;
  readonly name: string;
  readonly position: number | null;
  readonly iconUrl: string | null;
  readonly topic: string | null;
  readonly isArchived: boolean;
  readonly lastMessageId: Snowflake | null;

  constructor(
    id: Snowflake,
    kind: ChannelKind,
    guildId: Snowflake,
    parent: Channel | null,
    name: string,
    position: number | null,
    iconUrl: string | null,
    topic: string | null,
    isArchived: boolean,
    lastMessageId: Snowflake | null
  ) {
    this.id = id;
    this.kind = kind;
    this.guildId = guildId;
    this.parent = parent;
    this.name = name;
    this.position = position;
    this.iconUrl = iconUrl;
    this.topic = topic;
    this.isArchived = isArchived;
    this.lastMessageId = lastMessageId;
  }

  /**
   * Whether this is a direct message channel
   */
  get isDirect(): boolean {
    return (
      this.kind === ChannelKind.DirectTextChat ||
      this.kind === ChannelKind.DirectGroupTextChat
    );
  }

  /**
   * Whether this is a guild (server) channel
   */
  get isGuild(): boolean {
    return !this.isDirect;
  }

  /**
   * Whether this is a category channel
   */
  get isCategory(): boolean {
    return this.kind === ChannelKind.GuildCategory;
  }

  /**
   * Whether this is a voice channel
   */
  get isVoice(): boolean {
    return (
      this.kind === ChannelKind.GuildVoiceChat ||
      this.kind === ChannelKind.GuildStageVoice
    );
  }

  /**
   * Whether this is a thread channel
   */
  get isThread(): boolean {
    return (
      this.kind === ChannelKind.GuildNewsThread ||
      this.kind === ChannelKind.GuildPublicThread ||
      this.kind === ChannelKind.GuildPrivateThread
    );
  }

  /**
   * Whether this channel has no messages
   */
  get isEmpty(): boolean {
    return this.lastMessageId === null;
  }

  /**
   * Get all parent channels in the hierarchy
   */
  getParents(): Channel[] {
    const parents: Channel[] = [];
    let current = this.parent;
    while (current !== null) {
      parents.push(current);
      current = current.parent;
    }
    return parents;
  }

  /**
   * Get the root parent channel (category)
   */
  getRootParent(): Channel | null {
    const parents = this.getParents();
    return parents.length > 0 ? parents[parents.length - 1]! : null;
  }

  /**
   * Get the hierarchical name (e.g., "Category / Channel")
   */
  getHierarchicalName(): string {
    const parts = this.getParents()
      .reverse()
      .map((c) => c.name);
    parts.push(this.name);
    return parts.join(' / ');
  }

  /**
   * Check if this channel may have messages after the given snowflake
   */
  mayHaveMessagesAfter(messageId: Snowflake): boolean {
    return !this.isEmpty && messageId.isLessThan(this.lastMessageId!);
  }

  /**
   * Check if this channel may have messages before the given snowflake
   */
  mayHaveMessagesBefore(messageId: Snowflake): boolean {
    return !this.isEmpty && messageId.isGreaterThan(this.id);
  }

  /**
   * Parse a Channel from Discord API JSON
   */
  static parse(
    json: Record<string, unknown>,
    parent: Channel | null = null,
    positionHint: number | null = null
  ): Channel {
    const id = Snowflake.parse(json['id'] as string);
    const kind = json['type'] as ChannelKind;

    const guildIdStr = nullIfWhitespace(json['guild_id'] as string | undefined);
    const guildId = guildIdStr
      ? Snowflake.parse(guildIdStr)
      : Guild.DirectMessages.id;

    // Determine name - guild channels have 'name', DMs have 'recipients'
    let name = nullIfWhitespace(json['name'] as string | undefined);
    if (!name) {
      const recipients = json['recipients'] as Record<string, unknown>[] | undefined;
      if (recipients) {
        const users = recipients.map(User.parse);
        users.sort((a, b) => a.id.compareTo(b.id));
        name = users.map((u) => u.displayName).join(', ');
      }
    }
    name = name || id.toString();

    const position =
      positionHint ?? (json['position'] as number | undefined) ?? null;

    // Icons can only be set for group DM channels
    const iconHash = nullIfWhitespace(json['icon'] as string | undefined);
    const iconUrl = iconHash ? ImageCdn.getChannelIconUrl(id, iconHash) : null;

    const topic = nullIfWhitespace(json['topic'] as string | undefined);

    const threadMetadata = json['thread_metadata'] as Record<string, unknown> | undefined;
    const isArchived = (threadMetadata?.['archived'] as boolean | undefined) ?? false;

    const lastMessageIdStr = nullIfWhitespace(json['last_message_id'] as string | undefined);
    const lastMessageId = lastMessageIdStr
      ? Snowflake.parse(lastMessageIdStr)
      : null;

    return new Channel(
      id,
      kind,
      guildId,
      parent,
      name,
      position,
      iconUrl,
      topic,
      isArchived,
      lastMessageId
    );
  }
}
