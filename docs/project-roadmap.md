# Project Roadmap

## Project Origin

This project is a **TypeScript port** of the original [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) by [Tyrrrz](https://github.com/Tyrrrz). The roadmap tracks progress toward feature parity with the C# implementation while leveraging TypeScript-native optimizations.

## Completed Milestones

### v0.1.0 - Initial Release

**Date:** 2025 (initial)

The first public release established the core architecture and feature set:

- Monorepo structure with `@discord-chat-exporter/core` (SDK) and `@discord-chat-exporter/cli` packages
- Discord API client with authentication, rate limiting, retry logic, and pagination
- 5 export formats: HTML Dark, HTML Light, JSON, CSV, Plain Text
- 25+ data models (User, Guild, Channel, Message, Embed, Reaction, Sticker, etc.)
- Message filtering system with composable expressions
- Partition support (by message count or file size)
- Discord markdown parser with emoji index
- Performance optimizations: batch processing (50/batch), parallel member fetching (10 concurrent), user deduplication (~98% API call reduction)
- Async generators for memory-efficient pagination
- Stream-based file writing
- CLI commands: `export`, `exportguild`, `guilds`, `channels`, `dms`

### v0.1.3 - Bug Fixes & Attribution

**Date:** 2026-01

- Added attribution to original C# DiscordChatExporter project
- Fixed npm publishing workflow (environment access for NPM_TOKEN secret)
- Version bump and release pipeline improvements

### v0.2.0 - v2.47 Sync Foundation

**Date:** 2026-03

Synced package metadata and descriptions with C# DiscordChatExporter v2.47. Added new CLI commands and features:

- New CLI commands: `exportdm`, `exportall`, `guide`
- `DISCORD_TOKEN` environment variable support (alternative to `--token` flag)
- Thread inclusion support (`--include-threads` with none/active/all modes)
- Reverse message order export (`--reverse` flag)
- UTC timestamp normalization (`--utc` flag)
- Locale-aware date/number formatting (`--locale` flag)
- Media reuse support (`--reuse-media` flag)
- Voice channel inclusion toggle (`--include-vc` flag)
- Parallel channel export with worker queue
- Category channel unwrapping (exporting a category exports its children)

## Current Work: v2.47 Feature Sync

The following 8-phase plan brings the TypeScript port to full parity with C# DiscordChatExporter v2.47. Detailed plans for each phase are in `plans/20260302-sync-v247/`.

### Phase 1: Data Models & Enums (Critical - Pending)

New and updated data types needed for v2.47 features:

- `MessageReferenceKind` enum (Default, Forward)
- `MessageSnapshot` data model for forwarded messages
- `ChannelConnection` for linked channels
- Embed projection updates (author, footer, field structures)

### Phase 2: Discord Client (Critical - Pending)

API client enhancements:

- `getMessagesInReverse()` for newest-first ordering
- `tryGetFirstMessage()` for optimized channel inspection
- Thread deduplication to avoid re-fetching
- Improved thread resolution across guild channels

### Phase 3: Export Engine (Critical - Pending)

Core export pipeline improvements:

- Reverse message ordering support in export pipeline
- UTC normalization fix for date boundaries
- Asset hash upgrade (5 to 16 characters) for better uniqueness

### Phase 4: Format Writers (High - Pending)

Output format enhancements matching C# v2.47:

- Forwarded message rendering in HTML and JSON
- Updated gg sans font family in HTML exports
- SVG icons replacing older icon formats
- Bot badge and verified badge rendering
- Audio player element for voice message attachments
- Spoiler support in HTML exports

### Phase 5: Markdown & Emoji (High - Pending)

Markdown parser and emoji index updates:

- Expand emoji index toward C# parity (~4,400 entries from C#'s 8,800+ lines)
- Parser fixes for edge cases
- `LinkNode` default behavior updates

### Phase 6: Filtering System (Medium - Pending)

Message filter enhancements:

- Embed content search in filter expressions
- Display name checks for `from:` filters
- Single-quote support in filter expressions
- Word-boundary matching improvements

### Phase 7: CLI Commands (High - Pending)

CLI refinements and new options:

- Additional options for existing commands
- Improved error messages and validation
- Progress reporting enhancements

### Phase 8: Utilities & Fixes (Medium - Pending)

Cross-cutting utility improvements:

- `encodeFilePath` for URL-safe file paths
- `escapeFileName` for filesystem-safe names
- Color utility enhancements
- Miscellaneous bug fixes

## Future Goals

These items are under consideration for post-v2.47 development:

| Goal | Description | Priority |
|------|-------------|----------|
| Incremental Export | Only export new messages since last export | Medium |
| Streaming JSON | Migrate from buffered to streaming for large JSON exports | Medium |
| Database Backend | SQLite for persistent caching across runs | Low |
| Worker Threads | Parallel message formatting for CPU-bound operations | Low |
| Discord.js Integration | Use existing bot connections for exports | Low |
| Cloud Storage | Direct upload to S3, GCS, or Azure Blob Storage | Low |
| Web Interface | Browser-based export UI | Low |
| Scheduled Exports | Cron-based automation support | Low |

## Key Design Decisions

These decisions apply across all versions and guide future development:

- **No GUI port** -- The TypeScript port remains Core + CLI only (no desktop GUI)
- **Keep TS improvements** -- Batch processing, caching, extra filter aliases, and other TypeScript-native optimizations are preserved even when not present in the C# version
- **Razor to inline HTML** -- HTML export uses inline template strings rather than a template engine
- **No CancellationToken equivalent** -- JavaScript lacks a direct equivalent; cooperative cancellation may be explored later

---

*Last Updated: 2026-03-03*
*Version: 0.2.0*
