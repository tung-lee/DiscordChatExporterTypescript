# Discord Chat Exporter - Usage Examples

Complete examples for using Discord Chat Exporter as both a CLI tool and a library.

## Table of Contents

- [CLI Examples](#cli-examples)
- [Library Examples](#library-examples)
- [Advanced Use Cases](#advanced-use-cases)
- [Integration Examples](#integration-examples)

## CLI Examples

### Basic Export

Export a single channel to HTML:

```bash
discord-chat-exporter export \
  --token "YOUR_DISCORD_TOKEN" \
  --channel "123456789012345678" \
  --output ./exports
```

### Export with Custom Format

Export to JSON for data processing:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  -o ./exports/channel.json \
  -f json
```

Available formats:
- `html-dark` (default) - Dark theme HTML
- `html-light` - Light theme HTML
- `json` - JSON format
- `csv` - CSV spreadsheet
- `txt` - Plain text

### Export with Date Range

Export messages from a specific time period:

```bash
# Export messages from 2024
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  --after "2024-01-01" \
  --before "2024-12-31"

# Export messages after a specific message ID
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  --after "987654321098765432"
```

### Export Multiple Channels

Export several channels at once:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "111111111111111111" "222222222222222222" "333333333333333333" \
  -o ./exports
```

Export with parallelization for faster processing:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "111111111111111111" "222222222222222222" "333333333333333333" \
  -o ./exports \
  --parallel 3
```

### Export Entire Guild

Export all channels in a server:

```bash
discord-chat-exporter exportguild \
  -t "YOUR_TOKEN" \
  -g "123456789012345678" \
  -o ./guild-export \
  --threads \
  --parallel 5
```

### Export with Media Downloads

Download all attachments and embed them in the export:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  -o ./export.html \
  --media \
  --media-dir ./media
```

Reuse previously downloaded media:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  -o ./export.html \
  --media \
  --reuse-media \
  --media-dir ./media
```

### Export with Filters

Export messages from specific user:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  --filter "from:USER_ID"
```

Export messages containing specific text:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  --filter "contains:important"
```

Export only messages with attachments:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  --filter "has:attachment"
```

Combine multiple filters:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  --filter "from:USER_ID and has:attachment"
```

### Partition Large Exports

Split export into multiple files by message count:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  -o ./exports/channel.html \
  --partition 1000
```

Output files:
```
channel.html
channel [part 2].html
channel [part 3].html
```

Split by file size:

```bash
discord-chat-exporter export \
  -t "YOUR_TOKEN" \
  -c "123456789012345678" \
  -o ./exports/channel.html \
  --partition 50mb
```

### List Guilds and Channels

List all accessible guilds:

```bash
discord-chat-exporter guilds -t "YOUR_TOKEN"
```

List channels in a guild:

```bash
discord-chat-exporter channels -t "YOUR_TOKEN" -g "123456789012345678"
```

List channels including threads:

```bash
discord-chat-exporter channels \
  -t "YOUR_TOKEN" \
  -g "123456789012345678" \
  --threads
```

List direct messages:

```bash
discord-chat-exporter dms -t "YOUR_TOKEN"
```

---

## Library Examples

### Basic Export

```typescript
import {
  DiscordClient,
  ChannelExporter,
  ExportRequest,
  ExportFormat,
  Snowflake,
} from 'discord-chat-exporter-core';

async function exportChannel() {
  // Initialize client
  const client = new DiscordClient('YOUR_DISCORD_TOKEN');
  const exporter = new ChannelExporter(client);

  // Parse channel and guild IDs
  const channelId = Snowflake.parse('123456789012345678');
  const channel = await client.getChannel(channelId);
  const guild = await client.getGuild(channel.guildId);

  // Create export request
  const request = new ExportRequest({
    guild,
    channel,
    outputPath: './export.html',
    format: ExportFormat.HtmlDark,
  });

  // Export
  await exporter.exportChannel(request);
  console.log('Export complete!');
}

exportChannel().catch(console.error);
```

### Export with Progress Tracking

```typescript
import { DiscordClient, ChannelExporter, ExportRequest } from 'discord-chat-exporter-core';

async function exportWithProgress() {
  const client = new DiscordClient('YOUR_TOKEN');
  const exporter = new ChannelExporter(client);

  const channelId = Snowflake.parse('123456789012345678');
  const channel = await client.getChannel(channelId);
  const guild = await client.getGuild(channel.guildId);

  const request = new ExportRequest({
    guild,
    channel,
    outputPath: './export.html',
    format: ExportFormat.HtmlDark,
  });

  // Progress callback
  let lastUpdate = 0;
  await exporter.exportChannel(request, (progress) => {
    const percent = Math.floor(progress);
    if (percent !== lastUpdate && percent % 10 === 0) {
      console.log(`Progress: ${percent}%`);
      lastUpdate = percent;
    }
  });

  console.log('Export complete!');
}
```

### Export Multiple Channels

```typescript
async function exportMultipleChannels(channelIds: string[]) {
  const client = new DiscordClient('YOUR_TOKEN');
  const exporter = new ChannelExporter(client);

  for (const channelIdStr of channelIds) {
    try {
      const channelId = Snowflake.parse(channelIdStr);
      const channel = await client.getChannel(channelId);
      const guild = await client.getGuild(channel.guildId);

      const request = new ExportRequest({
        guild,
        channel,
        outputPath: `./exports/${channel.name}.html`,
        format: ExportFormat.HtmlDark,
      });

      console.log(`Exporting ${channel.name}...`);
      await exporter.exportChannel(request);
      console.log(`✓ Exported ${channel.name}`);
    } catch (error) {
      console.error(`✗ Failed to export ${channelIdStr}:`, error);
    }
  }
}

// Usage
exportMultipleChannels([
  '111111111111111111',
  '222222222222222222',
  '333333333333333333',
]);
```

### Export with Date Range

```typescript
import { Snowflake } from 'discord-chat-exporter-core';

async function exportDateRange() {
  const client = new DiscordClient('YOUR_TOKEN');
  const exporter = new ChannelExporter(client);

  const channelId = Snowflake.parse('123456789012345678');
  const channel = await client.getChannel(channelId);
  const guild = await client.getGuild(channel.guildId);

  // Create snowflakes from dates
  const after = Snowflake.fromDate(new Date('2024-01-01'));
  const before = Snowflake.fromDate(new Date('2024-12-31'));

  const request = new ExportRequest({
    guild,
    channel,
    outputPath: './export-2024.html',
    format: ExportFormat.HtmlDark,
    after,
    before,
  });

  await exporter.exportChannel(request);
}
```

### Export with Filters

```typescript
import { MessageFilter } from 'discord-chat-exporter-core';

async function exportFiltered() {
  const client = new DiscordClient('YOUR_TOKEN');
  const exporter = new ChannelExporter(client);

  const channelId = Snowflake.parse('123456789012345678');
  const channel = await client.getChannel(channelId);
  const guild = await client.getGuild(channel.guildId);

  // Parse filter expression
  const filter = MessageFilter.parse('from:987654321098765432 and has:attachment');

  const request = new ExportRequest({
    guild,
    channel,
    outputPath: './filtered-export.html',
    format: ExportFormat.HtmlDark,
    messageFilter: filter,
  });

  await exporter.exportChannel(request);
}
```

### Export with Media Downloads

```typescript
async function exportWithMedia() {
  const client = new DiscordClient('YOUR_TOKEN');
  const exporter = new ChannelExporter(client);

  const channelId = Snowflake.parse('123456789012345678');
  const channel = await client.getChannel(channelId);
  const guild = await client.getGuild(channel.guildId);

  const request = new ExportRequest({
    guild,
    channel,
    outputPath: './export.html',
    format: ExportFormat.HtmlDark,
    shouldDownloadAssets: true,
    assetsDirPath: './media',
    shouldReuseAssets: true, // Reuse previously downloaded files
  });

  await exporter.exportChannel(request);
}
```

### Iterate Through Messages

```typescript
async function processMessages() {
  const client = new DiscordClient('YOUR_TOKEN');
  const channelId = Snowflake.parse('123456789012345678');

  let messageCount = 0;
  const userMessages = new Map<string, number>();

  for await (const message of client.getMessages(channelId)) {
    messageCount++;

    // Count messages per user
    const userId = message.author.id.toString();
    userMessages.set(userId, (userMessages.get(userId) || 0) + 1);

    // Process message
    if (message.content.includes('important')) {
      console.log(`Important message from ${message.author.displayName}`);
    }
  }

  console.log(`Total messages: ${messageCount}`);
  console.log(`Unique users: ${userMessages.size}`);
}
```

### Export Entire Guild

```typescript
async function exportEntireGuild(guildId: string) {
  const client = new DiscordClient('YOUR_TOKEN');
  const exporter = new ChannelExporter(client);
  const guildSnowflake = Snowflake.parse(guildId);

  // Get guild info
  const guild = await client.getGuild(guildSnowflake);
  console.log(`Exporting guild: ${guild.name}`);

  // Get all channels
  const channels = [];
  for await (const channel of client.getGuildChannels(guildSnowflake)) {
    if (!channel.isCategory && !channel.isVoice) {
      channels.push(channel);
    }
  }

  console.log(`Found ${channels.length} channels`);

  // Export each channel
  for (const channel of channels) {
    try {
      console.log(`Exporting #${channel.name}...`);

      const request = new ExportRequest({
        guild,
        channel,
        outputPath: `./guild-export/${channel.name}.html`,
        format: ExportFormat.HtmlDark,
      });

      await exporter.exportChannel(request);
      console.log(`✓ ${channel.name}`);
    } catch (error) {
      console.error(`✗ ${channel.name}:`, error.message);
    }
  }
}
```

---

## Advanced Use Cases

### Custom Progress Bar

```typescript
import cliProgress from 'cli-progress';

async function exportWithProgressBar() {
  const client = new DiscordClient('YOUR_TOKEN');
  const exporter = new ChannelExporter(client);

  const channelId = Snowflake.parse('123456789012345678');
  const channel = await client.getChannel(channelId);
  const guild = await client.getGuild(channel.guildId);

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Exporting | {bar} | {percentage}% | {value}/{total} messages',
  }, cliProgress.Presets.shades_classic);

  progressBar.start(100, 0);

  const request = new ExportRequest({
    guild,
    channel,
    outputPath: './export.html',
    format: ExportFormat.HtmlDark,
  });

  await exporter.exportChannel(request, (progress) => {
    progressBar.update(Math.floor(progress));
  });

  progressBar.stop();
  console.log('Export complete!');
}
```

### Parallel Exports with Worker Threads

```typescript
import { Worker } from 'worker_threads';

async function exportInParallel(channelIds: string[]) {
  const workers = [];
  const MAX_WORKERS = 3;

  for (let i = 0; i < channelIds.length; i += MAX_WORKERS) {
    const batch = channelIds.slice(i, i + MAX_WORKERS);

    const workerPromises = batch.map(channelId => {
      return new Promise((resolve, reject) => {
        const worker = new Worker('./export-worker.js', {
          workerData: { channelId, token: 'YOUR_TOKEN' }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
        });
      });
    });

    await Promise.all(workerPromises);
  }
}
```

### Export to Database

```typescript
import { Database } from 'better-sqlite3';

async function exportToDatabase() {
  const client = new DiscordClient('YOUR_TOKEN');
  const channelId = Snowflake.parse('123456789012345678');

  // Setup database
  const db = new Database('messages.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT,
      author_id TEXT,
      author_name TEXT,
      content TEXT,
      timestamp TEXT,
      has_attachments BOOLEAN
    )
  `);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO messages
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Export messages to database
  for await (const message of client.getMessages(channelId)) {
    insert.run(
      message.id.toString(),
      channelId.toString(),
      message.author.id.toString(),
      message.author.displayName,
      message.content,
      message.timestamp.toISOString(),
      message.attachments.length > 0
    );
  }

  console.log('Export to database complete!');
}
```

### Export Statistics

```typescript
async function generateStatistics(channelId: string) {
  const client = new DiscordClient('YOUR_TOKEN');
  const id = Snowflake.parse(channelId);

  const stats = {
    totalMessages: 0,
    totalUsers: new Set<string>(),
    messagesByUser: new Map<string, number>(),
    messagesByHour: new Array(24).fill(0),
    messagesWithAttachments: 0,
    messagesWithEmbeds: 0,
    totalCharacters: 0,
  };

  for await (const message of client.getMessages(id)) {
    stats.totalMessages++;
    stats.totalUsers.add(message.author.id.toString());

    const userId = message.author.id.toString();
    stats.messagesByUser.set(userId, (stats.messagesByUser.get(userId) || 0) + 1);

    const hour = message.timestamp.getHours();
    stats.messagesByHour[hour]++;

    if (message.attachments.length > 0) stats.messagesWithAttachments++;
    if (message.embeds.length > 0) stats.messagesWithEmbeds++;

    stats.totalCharacters += message.content.length;
  }

  console.log('Channel Statistics:');
  console.log(`Total messages: ${stats.totalMessages}`);
  console.log(`Unique users: ${stats.totalUsers.size}`);
  console.log(`Avg message length: ${(stats.totalCharacters / stats.totalMessages).toFixed(1)} chars`);
  console.log(`Messages with attachments: ${stats.messagesWithAttachments}`);
  console.log(`Messages with embeds: ${stats.messagesWithEmbeds}`);

  // Most active hour
  const mostActiveHour = stats.messagesByHour.indexOf(Math.max(...stats.messagesByHour));
  console.log(`Most active hour: ${mostActiveHour}:00 (${stats.messagesByHour[mostActiveHour]} messages)`);
}
```

---

## Integration Examples

### Express.js API Endpoint

```typescript
import express from 'express';
import { DiscordClient, ChannelExporter, ExportRequest } from 'discord-chat-exporter-core';

const app = express();

app.post('/api/export', async (req, res) => {
  try {
    const { token, channelId, format } = req.body;

    const client = new DiscordClient(token);
    const exporter = new ChannelExporter(client);

    const channel = await client.getChannel(Snowflake.parse(channelId));
    const guild = await client.getGuild(channel.guildId);

    const request = new ExportRequest({
      guild,
      channel,
      outputPath: `/tmp/export-${channelId}.html`,
      format: format || ExportFormat.HtmlDark,
    });

    await exporter.exportChannel(request);

    res.download(`/tmp/export-${channelId}.html`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Scheduled Backup with Node-Cron

```typescript
import cron from 'node-cron';
import { DiscordClient, ChannelExporter, ExportRequest } from 'discord-chat-exporter-core';

// Backup channels every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting daily backup...');

  const client = new DiscordClient(process.env.DISCORD_TOKEN!);
  const exporter = new ChannelExporter(client);

  const channelIds = [
    '111111111111111111',
    '222222222222222222',
    '333333333333333333',
  ];

  for (const channelIdStr of channelIds) {
    try {
      const channelId = Snowflake.parse(channelIdStr);
      const channel = await client.getChannel(channelId);
      const guild = await client.getGuild(channel.guildId);

      const date = new Date().toISOString().split('T')[0];
      const request = new ExportRequest({
        guild,
        channel,
        outputPath: `./backups/${date}-${channel.name}.html`,
        format: ExportFormat.HtmlDark,
      });

      await exporter.exportChannel(request);
      console.log(`✓ Backed up #${channel.name}`);
    } catch (error) {
      console.error(`✗ Failed to backup ${channelIdStr}:`, error);
    }
  }

  console.log('Daily backup complete!');
});
```

### Discord Bot Integration

```typescript
import { Client, GatewayIntentBits } from 'discord.js';
import { DiscordClient as ExporterClient, ChannelExporter } from 'discord-chat-exporter-core';

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

bot.on('messageCreate', async (message) => {
  if (message.content === '!export') {
    try {
      const exporter = new ChannelExporter(
        new ExporterClient(process.env.DISCORD_BOT_TOKEN!)
      );

      const channel = await exporter.discord.getChannel(
        Snowflake.parse(message.channel.id)
      );
      const guild = await exporter.discord.getGuild(channel.guildId);

      await message.reply('Exporting channel...');

      const request = new ExportRequest({
        guild,
        channel,
        outputPath: `./exports/${channel.name}.html`,
        format: ExportFormat.HtmlDark,
      });

      await exporter.exportChannel(request);

      await message.reply({
        content: 'Export complete!',
        files: [`./exports/${channel.name}.html`],
      });
    } catch (error) {
      await message.reply(`Error: ${error.message}`);
    }
  }
});

bot.login(process.env.DISCORD_BOT_TOKEN);
```

---

## Best Practices

### Error Handling

```typescript
import { DiscordChatExporterError, ChannelEmptyError } from 'discord-chat-exporter-core';

async function exportWithErrorHandling() {
  try {
    // Your export code here
    await exporter.exportChannel(request);
  } catch (error) {
    if (error instanceof ChannelEmptyError) {
      console.log('Channel is empty, skipping...');
    } else if (error instanceof DiscordChatExporterError) {
      if (error.isFatal) {
        console.error('Fatal error:', error.message);
        process.exit(1);
      } else {
        console.warn('Non-fatal error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
```

### Rate Limit Handling

```typescript
import { RateLimitPreference } from 'discord-chat-exporter-core';

// Respect all rate limits (recommended)
const client = new DiscordClient(token, RateLimitPreference.RespectAll);

// Only respect global rate limits
const client2 = new DiscordClient(token, RateLimitPreference.RespectGlobal);

// Ignore rate limits (not recommended)
const client3 = new DiscordClient(token, RateLimitPreference.Ignore);
```

### Memory Management for Large Exports

```typescript
import { PartitionLimit } from 'discord-chat-exporter-core';

// Partition by message count (recommended for channels with 10K+ messages)
const request = new ExportRequest({
  // ... other options
  partitionLimit: PartitionLimit.parse('1000'),
});

// Partition by file size
const request2 = new ExportRequest({
  // ... other options
  partitionLimit: PartitionLimit.parse('50mb'),
});
```

---

For more examples and detailed API documentation, see the [README.md](README.md) and [PERFORMANCE.md](PERFORMANCE.md).
