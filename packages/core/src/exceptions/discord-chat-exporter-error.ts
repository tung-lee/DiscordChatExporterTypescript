/**
 * Base error class for DiscordChatExporter errors
 */
export class DiscordChatExporterError extends Error {
  /**
   * Indicates if this error is fatal and cannot be recovered from
   */
  readonly isFatal: boolean;

  constructor(message: string, isFatal = false, cause?: Error) {
    super(message, { cause });
    this.name = 'DiscordChatExporterError';
    this.isFatal = isFatal;
  }
}
