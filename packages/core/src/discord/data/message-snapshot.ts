import { Attachment } from './attachment.js';
import { Embed } from './embeds/embed.js';
import { Sticker } from './sticker.js';

/**
 * Represents a forwarded message snapshot
 * @see https://docs.discord.com/developers/resources/message#message-snapshot-object
 */
export class MessageSnapshot {
  readonly timestamp: Date;
  readonly editedTimestamp: Date | null;
  readonly content: string;
  readonly attachments: readonly Attachment[];
  readonly embeds: readonly Embed[];
  readonly stickers: readonly Sticker[];

  constructor(
    timestamp: Date,
    editedTimestamp: Date | null,
    content: string,
    attachments: readonly Attachment[],
    embeds: readonly Embed[],
    stickers: readonly Sticker[]
  ) {
    this.timestamp = timestamp;
    this.editedTimestamp = editedTimestamp;
    this.content = content;
    this.attachments = attachments;
    this.embeds = embeds;
    this.stickers = stickers;
  }

  static parse(json: Record<string, unknown>): MessageSnapshot {
    const timestampStr = json['timestamp'] as string | undefined;
    const timestamp = timestampStr ? new Date(timestampStr) : new Date(0);

    const editedTimestampStr = json['edited_timestamp'] as string | null | undefined;
    const editedTimestamp = editedTimestampStr ? new Date(editedTimestampStr) : null;

    const content = (json['content'] as string | undefined) ?? '';

    const attachmentsJson = json['attachments'] as Record<string, unknown>[] | undefined;
    const attachments = attachmentsJson?.map(Attachment.parse) ?? [];

    const embedsJson = json['embeds'] as Record<string, unknown>[] | undefined;
    const embeds = embedsJson?.map(Embed.parse) ?? [];

    const stickersJson = json['sticker_items'] as Record<string, unknown>[] | undefined;
    const stickers = stickersJson?.map(Sticker.parse) ?? [];

    return new MessageSnapshot(
      timestamp,
      editedTimestamp,
      content,
      attachments,
      embeds,
      stickers
    );
  }
}
