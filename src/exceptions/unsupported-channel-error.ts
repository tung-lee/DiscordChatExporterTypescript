import { DiscordChatExporterError } from './discord-chat-exporter-error.js';

/**
 * Error thrown when attempting to export an unsupported channel type
 */
export class UnsupportedChannelError extends DiscordChatExporterError {
  constructor(message: string) {
    super(message, true);
    this.name = 'UnsupportedChannelError';
  }
}
