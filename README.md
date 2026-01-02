# Discord Chat Exporter

A high-performance TypeScript library and CLI tool for exporting Discord chat history to various formats.

[![npm](https://img.shields.io/npm/v/@discord-chat-exporter/core)](https://www.npmjs.com/package/@discord-chat-exporter/core)
[![npm](https://img.shields.io/npm/v/@discord-chat-exporter/cli)](https://www.npmjs.com/package/@discord-chat-exporter/cli)

## Features

- **Multiple Export Formats** - HTML (Dark/Light), JSON, Plain Text, CSV
- **Performance Optimized** - Batch processing, parallel requests, multi-level caching
- **Flexible Filtering** - Filter by date range, content, author, or custom expressions
- **Asset Management** - Download and archive media files with reuse support
- **Advanced Features** - Partition large exports, export entire guilds, thread support

## Packages

This is a monorepo containing two packages:

| Package | Description | npm |
|---------|-------------|-----|
| [@discord-chat-exporter/core](./packages/core) | SDK library for programmatic usage | [![npm](https://img.shields.io/npm/v/@discord-chat-exporter/core)](https://www.npmjs.com/package/@discord-chat-exporter/core) |
| [@discord-chat-exporter/cli](./packages/cli) | Command-line interface | [![npm](https://img.shields.io/npm/v/@discord-chat-exporter/cli)](https://www.npmjs.com/package/@discord-chat-exporter/cli) |

## Installation

### CLI Tool

```bash
npm install -g @discord-chat-exporter/cli
```

Or use directly with npx:

```bash
npx @discord-chat-exporter/cli --help
```

### SDK Library

```bash
npm install @discord-chat-exporter/core
```

## Quick Start

### CLI Usage

```bash
# Export a single channel
discord-chat-exporter export -t "YOUR_TOKEN" -c "CHANNEL_ID" -o ./exports

# Export entire guild with threads
discord-chat-exporter exportguild -t "YOUR_TOKEN" -g "GUILD_ID" -o ./exports --threads

# Export with filters and media
discord-chat-exporter export -t "YOUR_TOKEN" -c "CHANNEL_ID" \
  --after "2024-01-01" --filter "has:attachment" --media
```

### Library Usage

```typescript
import {
  DiscordClient,
  ChannelExporter,
  ExportRequest,
  ExportFormat,
} from '@discord-chat-exporter/core';

const client = new DiscordClient('YOUR_TOKEN');
const exporter = new ChannelExporter(client);

const channel = await client.getChannel(channelId);
const guild = await client.getGuild(channel.guildId);

const request = new ExportRequest({
  guild,
  channel,
  outputPath: './export.html',
  format: ExportFormat.HtmlDark,
});

await exporter.exportChannel(request, (progress) => {
  console.log(`Progress: ${progress.toFixed(1)}%`);
});
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `export` | Export one or more channels |
| `exportguild` | Export all channels in a guild |
| `guilds` | List accessible guilds |
| `channels` | List channels in a guild |
| `dms` | List direct message channels |

### Common Options

| Option | Description |
|--------|-------------|
| `-t, --token` | Discord authentication token (required) |
| `-o, --output` | Output path (default: current directory) |
| `-f, --format` | Format: `json`, `html-dark`, `html-light`, `csv`, `txt` |
| `--after` | Messages after this date/ID |
| `--before` | Messages before this date/ID |
| `--filter` | Message filter expression |
| `--partition` | Split by count (`1000`) or size (`10mb`) |
| `--media` | Download media attachments |
| `--parallel` | Parallel channel exports |

## Filter Expressions

```bash
--filter "from:USER_ID"              # Messages from user
--filter "contains:hello"            # Messages containing text
--filter "has:attachment"            # Messages with files
--filter "has:embed"                 # Messages with embeds
--filter "is:pinned"                 # Pinned messages
--filter "from:USER_ID and has:image" # Combined filters
```

## Getting Your Discord Token

### User Token

1. Open Discord in browser
2. Press `F12` for Developer Tools
3. Go to Console tab
4. Paste: `(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()`

### Bot Token

1. Create app at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable "Message Content Intent" in Bot settings
3. Use with prefix: `discord-chat-exporter export -t "Bot YOUR_BOT_TOKEN" ...`

## Documentation

| Document | Description |
|----------|-------------|
| [EXAMPLES.md](./EXAMPLES.md) | Comprehensive usage examples |
| [PERFORMANCE.md](./PERFORMANCE.md) | Performance optimization guide |
| [docs/project-overview-pdr.md](./docs/project-overview-pdr.md) | Product development requirements |
| [docs/codebase-summary.md](./docs/codebase-summary.md) | Codebase structure summary |
| [docs/system-architecture.md](./docs/system-architecture.md) | System architecture overview |

## Project Structure

```
discord-chat-exporter/
├── packages/
│   ├── core/                    # @discord-chat-exporter/core (SDK)
│   │   ├── src/
│   │   │   ├── index.ts         # SDK entry point
│   │   │   ├── discord/         # Discord API client & data models
│   │   │   ├── exporting/       # Export logic & format writers
│   │   │   ├── markdown/        # Markdown parsing
│   │   │   ├── utils/           # Utility functions
│   │   │   └── exceptions/      # Custom error types
│   │   └── tests/               # Unit tests
│   │
│   └── cli/                     # @discord-chat-exporter/cli
│       └── src/
│           └── cli.ts           # CLI implementation
│
├── docs/                        # Documentation
├── pnpm-workspace.yaml          # Workspace definition
└── tsconfig.base.json           # Shared TypeScript config
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Performance

| Channel Size | Export Time | Throughput |
|--------------|-------------|------------|
| 1,000 msgs | ~6 sec | ~166 msg/s |
| 10,000 msgs | ~30 sec | ~333 msg/s |
| 50,000 msgs | ~3 min | ~277 msg/s |

See [PERFORMANCE.md](./PERFORMANCE.md) for optimization details.

## Troubleshooting

### Authentication Errors
- Verify token is correct and not expired
- For bot tokens, use `Bot` prefix
- Regenerate token if compromised

### Rate Limit Errors
- Reduce `--parallel` count
- Wait before retrying
- Bot tokens have higher limits

### Missing Messages
- Enable "Message Content Intent" for bots
- Check channel permissions
- Deleted messages cannot be recovered

## License

MIT License - see [LICENSE](LICENSE) file.

## Acknowledgments

This project is a TypeScript port of [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter), the original C# application created by [Tyrrrz](https://github.com/Tyrrrz). The original project provides a comprehensive solution for exporting Discord chat history and served as the architectural foundation and feature reference for this TypeScript implementation.

All credit for the core concepts, export format designs, and feature set goes to the original project.

---

*Last Updated: 2026-01-01*
