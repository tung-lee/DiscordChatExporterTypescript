import { Snowflake } from '../snowflake.js';
import { nullIfWhitespace } from '../../utils/extensions.js';

/**
 * Represents a reference to another message (for replies, forwards, etc.)
 */
export class MessageReference {
  readonly messageId: Snowflake | null;
  readonly channelId: Snowflake | null;
  readonly guildId: Snowflake | null;

  constructor(
    messageId: Snowflake | null,
    channelId: Snowflake | null,
    guildId: Snowflake | null
  ) {
    this.messageId = messageId;
    this.channelId = channelId;
    this.guildId = guildId;
  }

  /**
   * Parse a MessageReference from Discord API JSON
   */
  static parse(json: Record<string, unknown>): MessageReference {
    const messageIdStr = nullIfWhitespace(json['message_id'] as string | undefined);
    const channelIdStr = nullIfWhitespace(json['channel_id'] as string | undefined);
    const guildIdStr = nullIfWhitespace(json['guild_id'] as string | undefined);

    return new MessageReference(
      messageIdStr ? Snowflake.parse(messageIdStr) : null,
      channelIdStr ? Snowflake.parse(channelIdStr) : null,
      guildIdStr ? Snowflake.parse(guildIdStr) : null
    );
  }
}
