import { MessageWriter } from './message-writer.js';
import { PlainTextMessageWriter } from './plain-text-message-writer.js';
import { CsvMessageWriter } from './csv-message-writer.js';
import { JsonMessageWriter } from './json-message-writer.js';
import { HtmlMessageWriter } from './html-message-writer.js';
import { ExportContext } from '../export-context.js';
import { ExportFormat } from '../export-format.js';

/**
 * Factory for creating message writers based on export format
 */
export class MessageWriterFactory {
  /**
   * Create a message writer for the given format
   */
  static create(filePath: string, context: ExportContext): MessageWriter {
    switch (context.request.format) {
      case ExportFormat.PlainText:
        return new PlainTextMessageWriter(filePath, context);
      case ExportFormat.Csv:
        return new CsvMessageWriter(filePath, context);
      case ExportFormat.Json:
        return new JsonMessageWriter(filePath, context);
      case ExportFormat.HtmlDark:
      case ExportFormat.HtmlLight:
        return new HtmlMessageWriter(filePath, context);
      default:
        throw new Error(`Unsupported export format: ${context.request.format}`);
    }
  }
}
