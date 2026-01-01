import { DiscordChatExporterError } from './discord-chat-exporter-error.js';

/**
 * Error thrown when a channel is empty or has no messages in the specified range
 */
export class ChannelEmptyError extends DiscordChatExporterError {
  constructor(message: string) {
    super(message, false);
    this.name = 'ChannelEmptyError';
  }
}
