import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';

import {
  Snowflake,
  DiscordClient,
  Guild,
  Channel,
  ChannelKind,
  ExportRequest,
  ChannelExporter,
  PartitionLimit,
  MessageFilter,
  parseExportFormat,
  DiscordChatExporterError,
  ChannelEmptyError,
  type ProgressCallback,
} from '@discord-chat-exporter/core';

const program = new Command();

/**
 * Create a progress callback for console output
 */
function createProgressCallback(channelName: string): ProgressCallback {
  let lastPercent = -1;
  return (progress: number) => {
    const percent = Math.floor(progress);
    if (percent !== lastPercent && percent % 10 === 0) {
      process.stderr.write(`\r  [${channelName}] ${percent}%`);
      lastPercent = percent;
    }
  };
}

/**
 * Clear the current line
 */
function clearLine(): void {
  process.stderr.write('\r\x1b[K');
}

/**
 * Parse a date boundary argument (accepts snowflake ID or date string)
 */
function parseDateBoundary(value: string, optionName: string): Snowflake {
  const snowflake = Snowflake.tryParse(value);
  if (snowflake) {
    return snowflake;
  }

  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return Snowflake.fromDate(date);
  }

  console.error(`Invalid ${optionName} value: ${value}`);
  process.exit(1);
}

program
  .name('discord-chat-exporter')
  .description('Export Discord chat history to various formats')
  .version('0.1.0');

// Export command
program
  .command('export')
  .description('Export Discord channel(s) to a file')
  .requiredOption('-t, --token <token>', 'Discord authentication token')
  .requiredOption('-c, --channel <ids...>', 'Channel ID(s) to export')
  .option('-o, --output <path>', 'Output file path or directory', process.cwd())
  .option(
    '-f, --format <format>',
    'Export format (json, html-dark, html-light, csv, txt)',
    'html-dark'
  )
  .option('--after <date>', 'Only include messages after this date or message ID')
  .option('--before <date>', 'Only include messages before this date or message ID')
  .option('--filter <expression>', 'Message filter expression')
  .option('--partition <limit>', 'Split output by message count or file size')
  .option('--media', 'Download media attachments', false)
  .option('--reuse-media', 'Reuse previously downloaded media', false)
  .option('--media-dir <path>', 'Directory to download media to')
  .option('--no-markdown', 'Disable markdown processing')
  .option('--utc', 'Normalize timestamps to UTC', false)
  .option('--locale <locale>', 'Locale for date/number formatting')
  .option('--parallel <count>', 'Number of channels to export in parallel', '1')
  .action(async (options) => {
    try {
      const discord = new DiscordClient(options.token);
      const exporter = new ChannelExporter(discord);

      // Parse format
      const format = parseExportFormat(options.format);
      if (!format) {
        console.error(`Invalid export format: ${options.format}`);
        console.error('Valid formats: json, html-dark, html-light, csv, txt');
        process.exit(1);
      }

      // Parse date boundaries
      const after = options.after ? parseDateBoundary(options.after, '--after') : null;
      const before = options.before ? parseDateBoundary(options.before, '--before') : null;

      // Parse filter
      let messageFilter = MessageFilter.Null;
      if (options.filter) {
        try {
          messageFilter = MessageFilter.parse(options.filter);
        } catch (error) {
          console.error(`Invalid filter expression: ${(error as Error).message}`);
          process.exit(1);
        }
      }

      // Parse partition limit
      let partitionLimit = PartitionLimit.parse(options.partition ?? null);

      // Validate media options
      if (options.reuseMedia && !options.media) {
        console.error('Option --reuse-media cannot be used without --media.');
        process.exit(1);
      }

      if (options.mediaDir && !options.media) {
        console.error('Option --media-dir cannot be used without --media.');
        process.exit(1);
      }

      // Resolve channels
      console.log('Resolving channel(s)...');
      const channels: Channel[] = [];
      const channelsByGuild = new Map<string, Channel[]>();

      for (const channelIdStr of options.channel) {
        const channelId = Snowflake.parse(channelIdStr);
        const channel = await discord.getChannel(channelId);

        // Unwrap categories
        if (channel.isCategory) {
          let guildChannels = channelsByGuild.get(channel.guildId.toString());
          if (!guildChannels) {
            guildChannels = [];
            for await (const ch of discord.getGuildChannels(channel.guildId)) {
              guildChannels.push(ch);
            }
            channelsByGuild.set(channel.guildId.toString(), guildChannels);
          }

          for (const guildChannel of guildChannels) {
            if (guildChannel.parent?.id.equals(channel.id)) {
              channels.push(guildChannel);
            }
          }
        } else {
          channels.push(channel);
        }
      }

      if (channels.length === 0) {
        console.error('No channels to export.');
        process.exit(1);
      }

      // Validate output path for multiple channels
      const outputPath = path.resolve(options.output);
      if (
        channels.length > 1 &&
        !outputPath.includes('%') &&
        !fs.existsSync(outputPath) &&
        !outputPath.endsWith(path.sep)
      ) {
        console.error(
          'Attempted to export multiple channels, but the output path is neither a directory nor a template.'
        );
        console.error(
          'If the provided output path is meant to be treated as a directory, make sure it ends with a slash.'
        );
        process.exit(1);
      }

      // Export channels
      console.log(`Exporting ${channels.length} channel(s)...`);

      const errors = new Map<Channel, string>();
      const warnings = new Map<Channel, string>();
      let successCount = 0;

      const parallelLimit = Math.max(1, parseInt(options.parallel, 10) || 1);

      // Process channels with parallel limit
      const processChannel = async (channel: Channel) => {
        try {
          const guild = await discord.getGuild(channel.guildId);

          const request = new ExportRequest({
            guild,
            channel,
            outputPath,
            assetsDirPath: options.mediaDir,
            format,
            after,
            before,
            partitionLimit,
            messageFilter,
            shouldFormatMarkdown: options.markdown !== false,
            shouldDownloadAssets: options.media,
            shouldReuseAssets: options.reuseMedia,
            locale: options.locale,
            isUtcNormalizationEnabled: options.utc,
          });

          await exporter.exportChannel(
            request,
            createProgressCallback(channel.name)
          );
          clearLine();
          console.log(`  Exported: ${channel.getHierarchicalName()}`);
          successCount++;
        } catch (error) {
          clearLine();
          if (error instanceof ChannelEmptyError) {
            warnings.set(channel, error.message);
            console.log(`  Warning: ${channel.getHierarchicalName()} - ${error.message}`);
            successCount++; // Empty file was still created
          } else if (error instanceof DiscordChatExporterError && !error.isFatal) {
            errors.set(channel, error.message);
            console.error(`  Error: ${channel.getHierarchicalName()} - ${error.message}`);
          } else {
            throw error;
          }
        }
      };

      // Process channels with parallelism
      if (parallelLimit === 1) {
        for (const channel of channels) {
          await processChannel(channel);
        }
      } else {
        const queue = [...channels];
        const workers: Promise<void>[] = [];

        for (let i = 0; i < parallelLimit && queue.length > 0; i++) {
          const runWorker = async () => {
            while (queue.length > 0) {
              const channel = queue.shift()!;
              await processChannel(channel);
            }
          };
          workers.push(runWorker());
        }

        await Promise.all(workers);
      }

      // Print summary
      console.log();
      console.log(`Successfully exported ${successCount} channel(s).`);

      if (errors.size > 0) {
        console.log();
        console.error('Failed to export the following channel(s):');
        for (const [channel, message] of errors) {
          console.error(`  ${channel.getHierarchicalName()}: ${message}`);
        }
      }

      // Fail only if ALL channels failed
      if (errors.size >= channels.length) {
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// List guilds command
program
  .command('guilds')
  .description('List available guilds')
  .requiredOption('-t, --token <token>', 'Discord authentication token')
  .action(async (options) => {
    try {
      const discord = new DiscordClient(options.token);

      console.log('Fetching guilds...');
      const guilds: Guild[] = [];

      for await (const guild of discord.getUserGuilds()) {
        guilds.push(guild);
      }

      if (guilds.length === 0) {
        console.log('No guilds found.');
        return;
      }

      console.log(`Found ${guilds.length} guild(s):`);
      console.log();

      for (const guild of guilds) {
        console.log(`  ${guild.id} | ${guild.name}`);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// List channels command
program
  .command('channels')
  .description('List available channels in a guild')
  .requiredOption('-t, --token <token>', 'Discord authentication token')
  .requiredOption('-g, --guild <id>', 'Guild ID')
  .option('--threads', 'Include threads', false)
  .action(async (options) => {
    try {
      const discord = new DiscordClient(options.token);
      const guildId = Snowflake.parse(options.guild);

      console.log('Fetching channels...');
      const channels: Channel[] = [];

      for await (const channel of discord.getGuildChannels(guildId)) {
        channels.push(channel);
      }

      // Fetch threads if requested
      if (options.threads) {
        console.log('Fetching threads...');
        for await (const thread of discord.getGuildThreads(guildId, true)) {
          channels.push(thread);
        }
      }

      if (channels.length === 0) {
        console.log('No channels found.');
        return;
      }

      // Sort by position
      channels.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      console.log(`Found ${channels.length} channel(s):`);
      console.log();

      for (const channel of channels) {
        const typeLabel = getChannelTypeLabel(channel.kind);
        const prefix = channel.isThread ? '  ' : '';
        console.log(`${prefix}  ${channel.id} | ${typeLabel} | ${channel.getHierarchicalName()}`);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// List DMs command
program
  .command('dms')
  .description('List direct message channels')
  .requiredOption('-t, --token <token>', 'Discord authentication token')
  .action(async (options) => {
    try {
      const discord = new DiscordClient(options.token);

      console.log('Fetching DM channels...');
      const channels: Channel[] = [];

      for await (const channel of discord.getDirectMessageChannels()) {
        channels.push(channel);
      }

      if (channels.length === 0) {
        console.log('No DM channels found.');
        return;
      }

      console.log(`Found ${channels.length} DM channel(s):`);
      console.log();

      for (const channel of channels) {
        const typeLabel = channel.kind === ChannelKind.DirectGroupTextChat ? 'Group' : 'DM';
        console.log(`  ${channel.id} | ${typeLabel} | ${channel.name}`);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Export guild command
program
  .command('exportguild')
  .description('Export all channels in a guild')
  .requiredOption('-t, --token <token>', 'Discord authentication token')
  .requiredOption('-g, --guild <id>', 'Guild ID')
  .option('-o, --output <path>', 'Output directory', process.cwd())
  .option(
    '-f, --format <format>',
    'Export format (json, html-dark, html-light, csv, txt)',
    'html-dark'
  )
  .option('--after <date>', 'Only include messages after this date or message ID')
  .option('--before <date>', 'Only include messages before this date or message ID')
  .option('--filter <expression>', 'Message filter expression')
  .option('--partition <limit>', 'Split output by message count or file size')
  .option('--media', 'Download media attachments', false)
  .option('--reuse-media', 'Reuse previously downloaded media', false)
  .option('--media-dir <path>', 'Directory to download media to')
  .option('--no-markdown', 'Disable markdown processing')
  .option('--utc', 'Normalize timestamps to UTC', false)
  .option('--locale <locale>', 'Locale for date/number formatting')
  .option('--threads', 'Include threads', false)
  .option('--parallel <count>', 'Number of channels to export in parallel', '1')
  .action(async (options) => {
    try {
      const discord = new DiscordClient(options.token);
      const guildId = Snowflake.parse(options.guild);

      // Fetch all channels
      console.log('Fetching channels...');
      const channels: Channel[] = [];

      for await (const channel of discord.getGuildChannels(guildId)) {
        // Skip categories and forums
        if (!channel.isCategory && channel.kind !== ChannelKind.GuildForum) {
          channels.push(channel);
        }
      }

      if (options.threads) {
        console.log('Fetching threads...');
        for await (const thread of discord.getGuildThreads(guildId, true)) {
          channels.push(thread);
        }
      }

      console.log(`Found ${channels.length} channel(s).`);

      // Construct channel IDs and call the export command
      const exportOptions = {
        ...options,
        channel: channels.map((c) => c.id.toString()),
      };

      // Re-invoke the export action
      const exportCommand = program.commands.find((cmd) => cmd.name() === 'export');
      if (exportCommand) {
        // Set required options
        exportOptions.token = options.token;
        await (exportCommand as any)._actionHandler(exportOptions);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

/**
 * Get a human-readable label for a channel type
 */
function getChannelTypeLabel(kind: ChannelKind): string {
  switch (kind) {
    case ChannelKind.GuildTextChat:
      return 'Text';
    case ChannelKind.DirectTextChat:
      return 'DM';
    case ChannelKind.GuildVoiceChat:
      return 'Voice';
    case ChannelKind.DirectGroupTextChat:
      return 'Group';
    case ChannelKind.GuildCategory:
      return 'Category';
    case ChannelKind.GuildNews:
      return 'Announcement';
    case ChannelKind.GuildNewsThread:
      return 'News Thread';
    case ChannelKind.GuildPublicThread:
      return 'Thread';
    case ChannelKind.GuildPrivateThread:
      return 'Private Thread';
    case ChannelKind.GuildStageVoice:
      return 'Stage';
    case ChannelKind.GuildDirectory:
      return 'Directory';
    case ChannelKind.GuildForum:
      return 'Forum';
    default:
      return 'Unknown';
  }
}

program.parse();
