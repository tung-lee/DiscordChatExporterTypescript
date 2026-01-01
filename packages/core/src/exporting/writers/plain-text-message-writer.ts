import { MessageWriter } from './message-writer.js';
import { PlainTextMarkdownVisitor } from './plain-text-markdown-visitor.js';
import { ExportContext } from '../export-context.js';
import { Message } from '../../discord/data/message.js';
import { Attachment } from '../../discord/data/attachment.js';
import { Embed } from '../../discord/data/embeds/embed.js';
import { Sticker } from '../../discord/data/sticker.js';
import { Reaction } from '../../discord/data/reaction.js';

/**
 * Message writer for plain text format
 */
export class PlainTextMessageWriter extends MessageWriter {
  constructor(filePath: string, context: ExportContext) {
    super(filePath, context);
  }

  private async formatMarkdown(markdown: string): Promise<string> {
    if (this.context.request.shouldFormatMarkdown) {
      return PlainTextMarkdownVisitor.format(this.context, markdown);
    }
    return markdown;
  }

  private writeMessageHeader(message: Message): void {
    // Timestamp & author
    this.write(`[${this.context.formatDate(message.timestamp)}]`);
    this.write(` ${message.author.fullName}`);

    // Whether the message is pinned
    if (message.isPinned) {
      this.write(' (pinned)');
    }

    this.writeLine();
  }

  private async writeAttachments(attachments: readonly Attachment[]): Promise<void> {
    if (attachments.length === 0) {
      return;
    }

    this.writeLine('{Attachments}');

    for (const attachment of attachments) {
      const url = await this.context.resolveAssetUrl(attachment.url);
      this.writeLine(url);
    }

    this.writeLine();
  }

  private async writeEmbeds(embeds: readonly Embed[]): Promise<void> {
    for (const embed of embeds) {
      this.writeLine('{Embed}');

      if (embed.author?.name?.trim()) {
        this.writeLine(embed.author.name);
      }

      if (embed.url?.trim()) {
        this.writeLine(embed.url);
      }

      if (embed.title?.trim()) {
        this.writeLine(await this.formatMarkdown(embed.title));
      }

      if (embed.description?.trim()) {
        this.writeLine(await this.formatMarkdown(embed.description));
      }

      for (const field of embed.fields) {
        if (field.name?.trim()) {
          this.writeLine(await this.formatMarkdown(field.name));
        }

        if (field.value?.trim()) {
          this.writeLine(await this.formatMarkdown(field.value));
        }
      }

      if (embed.thumbnail?.url?.trim()) {
        const url = await this.context.resolveAssetUrl(
          embed.thumbnail.proxyUrl ?? embed.thumbnail.url
        );
        this.writeLine(url);
      }

      for (const image of embed.images) {
        if (image.url?.trim()) {
          const url = await this.context.resolveAssetUrl(image.proxyUrl ?? image.url);
          this.writeLine(url);
        }
      }

      if (embed.footer?.text?.trim()) {
        this.writeLine(embed.footer.text);
      }

      this.writeLine();
    }
  }

  private async writeStickers(stickers: readonly Sticker[]): Promise<void> {
    if (stickers.length === 0) {
      return;
    }

    this.writeLine('{Stickers}');

    for (const sticker of stickers) {
      const url = await this.context.resolveAssetUrl(sticker.sourceUrl);
      this.writeLine(url);
    }

    this.writeLine();
  }

  private writeReactions(reactions: readonly Reaction[]): void {
    if (reactions.length === 0) {
      return;
    }

    this.writeLine('{Reactions}');

    let first = true;
    for (const reaction of reactions) {
      if (!first) {
        this.write(' ');
      }
      first = false;

      this.write(reaction.emoji.name);

      if (reaction.count > 1) {
        this.write(` (${reaction.count})`);
      }
    }

    this.writeLine();
  }

  async writePreamble(): Promise<void> {
    this.writeLine('='.repeat(62));
    this.writeLine(`Guild: ${this.context.request.guild.name}`);
    this.writeLine(`Channel: ${this.context.request.channel.getHierarchicalName()}`);

    if (this.context.request.channel.topic?.trim()) {
      this.writeLine(`Topic: ${this.context.request.channel.topic}`);
    }

    if (this.context.request.after) {
      this.writeLine(
        `After: ${this.context.formatDate(this.context.request.after.toDate())}`
      );
    }

    if (this.context.request.before) {
      this.writeLine(
        `Before: ${this.context.formatDate(this.context.request.before.toDate())}`
      );
    }

    this.writeLine('='.repeat(62));
    this.writeLine();
  }

  async writeMessage(message: Message): Promise<void> {
    await super.writeMessage(message);

    // Header
    this.writeMessageHeader(message);

    // Content
    if (message.isSystemNotification) {
      this.writeLine(message.getFallbackContent());
    } else {
      this.writeLine(await this.formatMarkdown(message.content));
    }

    this.writeLine();

    // Attachments, embeds, reactions, etc.
    await this.writeAttachments(message.attachments);
    await this.writeEmbeds(message.embeds);
    await this.writeStickers(message.stickers);
    this.writeReactions(message.reactions);

    this.writeLine();
  }

  async writePostamble(): Promise<void> {
    this.writeLine('='.repeat(62));
    this.writeLine(`Exported ${this.messagesWritten.toLocaleString()} message(s)`);
    this.writeLine('='.repeat(62));
  }
}
