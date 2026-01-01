import { DiscordClient, ProgressCallback } from '../discord/discord-client.js';
import { ChannelKind } from '../discord/data/enums.js';
import {
  DiscordChatExporterError,
  ChannelEmptyError,
  UnsupportedChannelError,
} from '../exceptions/index.js';
import { ExportRequest } from './export-request.js';
import { ExportContext } from './export-context.js';
import { MessageExporter } from './message-exporter.js';

/**
 * Exports messages from a Discord channel
 */
export class ChannelExporter {
  constructor(private readonly discord: DiscordClient) {}

  /**
   * Export all messages from a channel to a file
   * @param request Export configuration
   * @param progress Optional progress callback (0-100)
   */
  async exportChannel(request: ExportRequest, progress?: ProgressCallback): Promise<void> {
    // Forum channels don't have messages, they are just a list of threads
    if (request.channel.kind === ChannelKind.GuildForum) {
      throw new UnsupportedChannelError(
        `Channel '${request.channel.name}' of guild '${request.guild.name}' ` +
          `is a forum and cannot be exported directly. ` +
          `You need to pull its threads and export them individually.`
      );
    }

    // Build context and populate cache
    const context = new ExportContext(this.discord, request);
    await context.populateChannelsAndRoles();

    // Create the message exporter
    const messageExporter = new MessageExporter(context);

    try {
      // Check if the channel is empty
      if (request.channel.isEmpty) {
        throw new ChannelEmptyError(
          `Channel '${request.channel.name}' of guild '${request.guild.name}' ` +
            `does not contain any messages; an empty file will be created.`
        );
      }

      // Check if the 'before' and 'after' boundaries are valid
      if (
        (request.before !== null &&
          !request.channel.mayHaveMessagesBefore(request.before)) ||
        (request.after !== null &&
          !request.channel.mayHaveMessagesAfter(request.after))
      ) {
        throw new ChannelEmptyError(
          `Channel '${request.channel.name}' of guild '${request.guild.name}' ` +
            `does not contain any messages within the specified period; ` +
            `an empty file will be created.`
        );
      }

      // Export messages
      for await (const message of this.discord.getMessages(
        request.channel.id,
        request.after ?? undefined,
        request.before ?? undefined,
        progress
      )) {
        try {
          // Resolve members for referenced users
          for (const user of message.getReferencedUsers()) {
            await context.populateMemberFromUser(user);
          }

          // Apply filter and export matching messages
          if (request.messageFilter.isMatch(message)) {
            await messageExporter.exportMessage(message);
          }
        } catch (error) {
          // Provide more context to the exception
          if (error instanceof DiscordChatExporterError) {
            throw new DiscordChatExporterError(
              `Failed to export message #${message.id} ` +
                `in channel '${request.channel.name}' (#${request.channel.id}) ` +
                `of guild '${request.guild.name}' (#${request.guild.id}): ` +
                error.message,
              error.isFatal,
              error
            );
          }
          throw error;
        }
      }
    } finally {
      // Always finalize the exporter to ensure files are written
      await messageExporter.dispose();
    }
  }
}
