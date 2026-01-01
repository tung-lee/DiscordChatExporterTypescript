import { MessageWriter } from './message-writer.js';
import { PlainTextMarkdownVisitor } from './plain-text-markdown-visitor.js';
import { ExportContext } from '../export-context.js';
import { Message } from '../../discord/data/message.js';
import { Attachment } from '../../discord/data/attachment.js';
import { Reaction } from '../../discord/data/reaction.js';

/**
 * Message writer for CSV format
 */
export class CsvMessageWriter extends MessageWriter {
  constructor(filePath: string, context: ExportContext) {
    super(filePath, context);
  }

  /**
   * Encode a value for CSV (escape quotes and wrap in quotes)
   */
  private static csvEncode(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private async formatMarkdown(markdown: string): Promise<string> {
    if (this.context.request.shouldFormatMarkdown) {
      return PlainTextMarkdownVisitor.format(this.context, markdown);
    }
    return markdown;
  }

  async writePreamble(): Promise<void> {
    // UTF-8 BOM for Excel compatibility
    this.write('\ufeff');
    this.writeLine('AuthorID,Author,Date,Content,Attachments,Reactions');
  }

  private async writeAttachments(attachments: readonly Attachment[]): Promise<string> {
    const parts: string[] = [];

    for (const attachment of attachments) {
      const url = await this.context.resolveAssetUrl(attachment.url);
      parts.push(url);
    }

    return parts.join(',');
  }

  private writeReactions(reactions: readonly Reaction[]): string {
    const parts: string[] = [];

    for (const reaction of reactions) {
      parts.push(`${reaction.emoji.name} (${reaction.count})`);
    }

    return parts.join(',');
  }

  async writeMessage(message: Message): Promise<void> {
    await super.writeMessage(message);

    // Author ID
    this.write(CsvMessageWriter.csvEncode(message.author.id.toString()));
    this.write(',');

    // Author name
    this.write(CsvMessageWriter.csvEncode(message.author.fullName));
    this.write(',');

    // Message timestamp (ISO format)
    this.write(CsvMessageWriter.csvEncode(message.timestamp.toISOString()));
    this.write(',');

    // Message content
    if (message.isSystemNotification) {
      this.write(CsvMessageWriter.csvEncode(message.getFallbackContent()));
    } else {
      const content = await this.formatMarkdown(message.content);
      this.write(CsvMessageWriter.csvEncode(content));
    }
    this.write(',');

    // Attachments
    const attachments = await this.writeAttachments(message.attachments);
    this.write(CsvMessageWriter.csvEncode(attachments));
    this.write(',');

    // Reactions
    const reactions = this.writeReactions(message.reactions);
    this.write(CsvMessageWriter.csvEncode(reactions));

    // Finish row
    this.writeLine();
  }
}
