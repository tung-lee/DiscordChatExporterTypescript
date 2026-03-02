import { Snowflake } from '../snowflake.js';
import { MessageReferenceKind } from './enums.js';
import { nullIfWhitespace } from '../../utils/extensions.js';

/**
 * Represents a reference to another message (for replies, forwards, etc.)
 * @see https://discord.com/developers/docs/resources/channel#message-object-message-reference-structure
 */
export class MessageReference {
  readonly kind: MessageReferenceKind;
  readonly messageId: Snowflake | null;
  readonly channelId: Snowflake | null;
  readonly guildId: Snowflake | null;

  constructor(
    kind: MessageReferenceKind,
    messageId: Snowflake | null,
    channelId: Snowflake | null,
    guildId: Snowflake | null
  ) {
    this.kind = kind;
    this.messageId = messageId;
    this.channelId = channelId;
    this.guildId = guildId;
  }

  /**
   * Parse a MessageReference from Discord API JSON
   */
  static parse(json: Record<string, unknown>): MessageReference {
    const kindValue = json['type'] as number | undefined;
    const kind =
      kindValue !== undefined && kindValue !== null
        ? (kindValue as MessageReferenceKind)
        : MessageReferenceKind.Default;

    const messageIdStr = nullIfWhitespace(json['message_id'] as string | undefined);
    const channelIdStr = nullIfWhitespace(json['channel_id'] as string | undefined);
    const guildIdStr = nullIfWhitespace(json['guild_id'] as string | undefined);

    return new MessageReference(
      kind,
      messageIdStr ? Snowflake.parse(messageIdStr) : null,
      channelIdStr ? Snowflake.parse(channelIdStr) : null,
      guildIdStr ? Snowflake.parse(guildIdStr) : null
    );
  }
}
