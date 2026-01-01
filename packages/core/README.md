# @discord-chat-exporter/core

TypeScript SDK for exporting Discord chat history to various formats.

[![npm](https://img.shields.io/npm/v/@discord-chat-exporter/core)](https://www.npmjs.com/package/@discord-chat-exporter/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @discord-chat-exporter/core
```

Or with other package managers:

```bash
# pnpm
pnpm add @discord-chat-exporter/core

# yarn
yarn add @discord-chat-exporter/core
```

## Requirements

- Node.js >= 20.0.0
- Discord authentication token (user or bot)

## Quick Start

```typescript
import {
  DiscordClient,
  ChannelExporter,
  ExportRequest,
  ExportFormat,
  Snowflake,
} from '@discord-chat-exporter/core';

// Initialize the client
const client = new DiscordClient('YOUR_DISCORD_TOKEN');

// Get channel and guild info
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

// Export with progress callback
const exporter = new ChannelExporter(client);
await exporter.exportChannel(request, (progress) => {
  console.log(`Progress: ${progress.toFixed(1)}%`);
});
```

## Export Formats

| Format | Enum Value | Extension | Best For |
|--------|------------|-----------|----------|
| HTML Dark | `ExportFormat.HtmlDark` | .html | Human reading (dark theme) |
| HTML Light | `ExportFormat.HtmlLight` | .html | Human reading (light theme) |
| JSON | `ExportFormat.Json` | .json | Data processing, archival |
| CSV | `ExportFormat.Csv` | .csv | Spreadsheet analysis |
| Plain Text | `ExportFormat.PlainText` | .txt | Simple text archives |

## API Reference

### DiscordClient

HTTP client for Discord API with rate limiting and retry logic.

```typescript
const client = new DiscordClient(token);

// List guilds
for await (const guild of client.getUserGuilds()) {
  console.log(guild.name);
}

// List channels in a guild
for await (const channel of client.getGuildChannels(guildId)) {
  console.log(channel.name);
}

// Get direct message channels
for await (const dm of client.getDirectMessageChannels()) {
  console.log(dm.name);
}
```

### ExportRequest Options

```typescript
interface ExportRequestOptions {
  guild: Guild;                      // Required: Guild containing the channel
  channel: Channel;                  // Required: Channel to export
  outputPath: string;                // Required: Output file path or directory
  format: ExportFormat;              // Required: Export format

  // Optional filters
  after?: Snowflake | null;          // Only messages after this ID/date
  before?: Snowflake | null;         // Only messages before this ID/date
  messageFilter?: MessageFilter;      // Custom message filter

  // Optional features
  partitionLimit?: PartitionLimit;   // Split output by count or size
  shouldDownloadAssets?: boolean;    // Download media attachments
  shouldReuseAssets?: boolean;       // Reuse previously downloaded media
  assetsDirPath?: string;            // Directory for downloaded media

  // Formatting options
  shouldFormatMarkdown?: boolean;    // Enable markdown processing (default: true)
  locale?: string;                   // Locale for date/number formatting
  isUtcNormalizationEnabled?: boolean; // Normalize timestamps to UTC
}
```

### Message Filtering

```typescript
import { MessageFilter } from '@discord-chat-exporter/core';

// Parse filter expression
const filter = MessageFilter.parse('from:username has:attachment');

// Use in export request
const request = new ExportRequest({
  // ...
  messageFilter: filter,
});
```

**Filter syntax:**
- `from:username` - Messages from specific user
- `has:attachment` - Messages with attachments
- `has:embed` - Messages with embeds
- `has:image` - Messages with images
- `contains:text` - Messages containing text
- `is:pinned` - Pinned messages
- Combine with `and`, `or`, `-` (not)

### Partition Limits

```typescript
import { PartitionLimit } from '@discord-chat-exporter/core';

// Split by message count
const countLimit = PartitionLimit.parse('1000');

// Split by file size
const sizeLimit = PartitionLimit.parse('10mb');

const request = new ExportRequest({
  // ...
  partitionLimit: sizeLimit,
});
```

### Date Boundaries

```typescript
import { Snowflake } from '@discord-chat-exporter/core';

// From specific date
const after = Snowflake.fromDate(new Date('2024-01-01'));

// From message ID
const afterId = Snowflake.parse('123456789012345678');

const request = new ExportRequest({
  // ...
  after,
  before: Snowflake.fromDate(new Date('2024-12-31')),
});
```

## Exported Types

### Core Classes
- `DiscordClient` - API client
- `ChannelExporter` - Export orchestrator
- `ExportRequest` - Export configuration
- `Snowflake` - Discord ID wrapper

### Data Models
- `Guild`, `Channel`, `Message`, `User`, `Member`
- `Role`, `Embed`, `Attachment`, `Reaction`, `Sticker`

### Enums
- `ExportFormat` - Output formats
- `ChannelKind` - Channel types
- `MessageKind` - Message types

### Utilities
- `MessageFilter` - Filter expressions
- `PartitionLimit` - Output splitting
- `FileSize` - Byte size handling
- `Color` - RGB color manipulation

### Exceptions
- `DiscordChatExporterError` - Base error
- `ChannelEmptyError` - Empty channel (non-fatal)
- `UnsupportedChannelError` - Unsupported channel type (fatal)

## Authentication

### User Token

1. Open Discord in browser
2. Press `F12` for Developer Tools
3. Go to Console tab
4. Run: `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`

### Bot Token

1. Create application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable "Message Content Intent" in Bot settings
3. Use the token from Bot settings

## Related Packages

- [@discord-chat-exporter/cli](https://www.npmjs.com/package/@discord-chat-exporter/cli) - Command-line interface

## License

MIT
