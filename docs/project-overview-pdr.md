# Project Overview & Product Development Requirements (PDR)

## Project Identity

| Attribute | Value |
|-----------|-------|
| **Name** | Discord Chat Exporter Core |
| **Type** | TypeScript Library + CLI Tool |
| **Version** | 0.1.0 |
| **License** | MIT |
| **Node.js** | >= 20.0.0 |

## Executive Summary

Discord Chat Exporter Core is a high-performance TypeScript library and CLI tool for exporting Discord channel messages to multiple formats. It provides both programmatic API access for developers and a command-line interface for end users.

## Product Vision

### Problem Statement

Discord lacks native functionality to export chat history in portable formats. Users need to:
- Archive conversations for personal records
- Migrate channel data for backup purposes
- Analyze chat history for moderation or research
- Preserve community knowledge in accessible formats

### Solution

A dual-purpose tool that:
1. **CLI Tool**: Enables users to export channels via command line
2. **Library**: Provides programmatic API for integration into other applications

## Core Features

### Export Capabilities

| Feature | Status | Description |
|---------|--------|-------------|
| **Multi-Format Export** | Complete | JSON, HTML (Dark/Light), CSV, Plain Text |
| **Date Range Filtering** | Complete | Export messages within specific time periods |
| **Message Filtering** | Complete | Filter by author, content, attachments, reactions |
| **Media Download** | Complete | Download and archive attachments locally |
| **Partition Support** | Complete | Split large exports by message count or file size |
| **Thread Support** | Complete | Export threads and archived threads |
| **Parallel Export** | Complete | Export multiple channels concurrently |

### Data Model Coverage

| Discord Entity | Support Level |
|----------------|---------------|
| Messages | Full |
| Attachments | Full |
| Embeds | Full |
| Reactions | Full |
| Stickers | Full |
| Users/Members | Full |
| Roles | Full |
| Channels | Full |
| Guilds | Full |
| Threads | Full |
| Invites | Partial |
| Interactions | Full |

### Export Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| **HTML Dark** | .html | Human reading (dark theme) |
| **HTML Light** | .html | Human reading (light theme) |
| **JSON** | .json | Data processing, archival |
| **CSV** | .csv | Spreadsheet analysis |
| **Plain Text** | .txt | Simple text archives |

## Technical Requirements

### Runtime Requirements

- Node.js >= 20.0.0
- ESM module support
- Network access to Discord API

### Dependencies

| Category | Package | Purpose |
|----------|---------|---------|
| HTTP | undici | Discord API communication |
| CLI | commander | Command-line parsing |
| Progress | cli-progress | Export progress display |

### Authentication

| Token Type | Support | Notes |
|------------|---------|-------|
| User Token | Full | For personal account exports |
| Bot Token | Full | Requires Message Content Intent |

## User Personas

### 1. Server Administrator

**Goals:**
- Backup channel history regularly
- Export for moderation review
- Archive inactive channels

**Usage:**
```bash
discord-chat-exporter exportguild -t TOKEN -g GUILD_ID --threads
```

### 2. Developer/Integrator

**Goals:**
- Integrate export into applications
- Automate backup workflows
- Process chat data programmatically

**Usage:**
```typescript
import { DiscordClient, ChannelExporter } from 'discord-chat-exporter-core';

const client = new DiscordClient(token);
const exporter = new ChannelExporter(client);
await exporter.exportChannel(request);
```

### 3. Researcher/Analyst

**Goals:**
- Extract data for analysis
- Filter specific message types
- Export in machine-readable format

**Usage:**
```bash
discord-chat-exporter export -t TOKEN -c CHANNEL_ID -f json --filter "has:attachment"
```

### 4. Individual User

**Goals:**
- Archive personal DM conversations
- Save memorable server chats
- Create portable chat backups

**Usage:**
```bash
discord-chat-exporter dms -t TOKEN
discord-chat-exporter export -t TOKEN -c DM_CHANNEL_ID
```

## Non-Functional Requirements

### Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Throughput | 300+ msg/sec | Batch processing enabled |
| Memory | < 200MB peak | For 50K message exports |
| API Efficiency | 98% call reduction | Through batch deduplication |

### Reliability

- Automatic retry with exponential backoff
- Rate limit detection and respect
- Graceful handling of deleted entities
- Partial export on non-fatal errors

### Security

- Token never stored persistently
- No telemetry or data collection
- Local-only processing
- HTTPS for all API communication

## API Design Principles

### Library API

1. **Async-First**: All I/O operations return Promises
2. **Generator-Based**: Large collections use async iterators
3. **Immutable Models**: Data classes are read-only
4. **Type-Safe**: Full TypeScript definitions

### CLI Design

1. **Subcommand Structure**: `export`, `exportguild`, `guilds`, `channels`, `dms`
2. **Consistent Options**: Same options across related commands
3. **Progress Feedback**: Real-time progress for long operations
4. **Error Messages**: Clear, actionable error descriptions

## Quality Attributes

### Maintainability

- Clean module boundaries
- Comprehensive JSDoc comments
- Separation of concerns
- Design patterns (Strategy, Factory, Visitor)

### Testability

- Unit tests for utilities
- Integration tests for exporters
- Mock-friendly architecture
- Vitest framework

### Extensibility

- Pluggable message filters
- Format writer abstraction
- Custom markdown visitors
- Partition strategies

## Constraints & Limitations

### Discord API Constraints

- Rate limits (50 requests/second typical)
- Message history access permissions
- Bot Message Content Intent requirement
- No access to deleted messages

### Technical Constraints

- 64-bit Snowflake IDs require BigInt
- Large exports may hit memory limits
- Media downloads add significant time
- HTML exports are largest in size

## Roadmap Considerations

### Potential Enhancements

1. **Incremental Export**: Only export new messages since last export
2. **Stream-Based Writing**: Reduce memory for very large exports
3. **Database Backend**: SQLite for persistent caching
4. **Worker Threads**: Parallel message formatting
5. **WebAssembly**: High-performance markdown parsing

### Integration Opportunities

1. **Discord.js Integration**: Use existing bot connections
2. **Cloud Storage**: Direct upload to S3/GCS/Azure
3. **Web Interface**: Browser-based export UI
4. **Scheduled Exports**: Cron-based automation

## Success Metrics

| Metric | Target |
|--------|--------|
| Export Completion Rate | > 99% |
| User Error Rate | < 5% |
| Average Export Speed | > 200 msg/sec |
| Memory Efficiency | < 5MB per 1K messages |

## Documentation Requirements

| Document | Purpose |
|----------|---------|
| README.md | Quick start, installation, basic usage |
| EXAMPLES.md | Comprehensive usage examples |
| PERFORMANCE.md | Optimization guide |
| API Reference | Library documentation |
| CLI Reference | Command documentation |

---

*Last Updated: 2026-01-01*
*Version: 0.1.0*
