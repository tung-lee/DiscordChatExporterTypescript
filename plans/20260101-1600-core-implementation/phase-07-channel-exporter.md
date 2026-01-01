# Phase 7: Channel Exporter & CLI

## Context
- Reference: `source_ref/DiscordChatExporter.Core/Exporting/ChannelExporter.cs`
- Reference: `source_ref/DiscordChatExporter.Cli/`
- Dependencies: Phase 1-6

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~8 |

## Key Insights
- ChannelExporter orchestrates full export flow
- CLI provides multiple commands for different export modes
- Progress reporting crucial for UX

## Requirements
- Progress reporting during export
- Error handling with context
- CLI with all export options

## Implementation Steps

### 1. Implement ChannelExporter
File: `src/exporting/channel-exporter.ts`
```typescript
class ChannelExporter {
  constructor(discord: DiscordClient) {}

  async exportChannel(
    request: ExportRequest,
    progress?: (percent: number) => void
  ): Promise<void>
}
```

Flow:
1. Validate channel type (reject forums)
2. Build ExportContext
3. Populate channels and roles
4. Initialize MessageExporter
5. Check for empty channel
6. Check before/after boundaries
7. Iterate messages with progress
8. For each message:
   - Populate referenced users' members
   - Apply message filter
   - Export if matches

### 2. Implement Library Entry Point
File: `src/index.ts`
```typescript
// Core types
export { Snowflake } from './discord/snowflake'
export * from './discord/data'

// Client
export { DiscordClient } from './discord/discord-client'
export { RateLimitPreference } from './discord/rate-limit-preference'

// Exporting
export { ChannelExporter } from './exporting/channel-exporter'
export { ExportRequest } from './exporting/export-request'
export { ExportFormat } from './exporting/export-format'
export { MessageFilter } from './exporting/filtering/message-filter'
export { PartitionLimit } from './exporting/partitioning/partition-limit'

// Errors
export * from './exceptions'
```

### 3. Implement CLI
File: `src/cli.ts`
Using commander:

```bash
# Export specific channels
dce export -t TOKEN -c CHANNEL_ID [OPTIONS]

# Export all channels in guild
dce exportguild -t TOKEN -g GUILD_ID [OPTIONS]

# Export DMs
dce exportdm -t TOKEN [OPTIONS]

# Get guilds list
dce guilds -t TOKEN

# Get channels list
dce channels -t TOKEN -g GUILD_ID
```

Options:
- `-t, --token <token>` - Discord token
- `-c, --channel <id>` - Channel ID(s)
- `-g, --guild <id>` - Guild ID
- `-o, --output <path>` - Output path
- `-f, --format <format>` - Export format
- `--after <date>` - After date
- `--before <date>` - Before date
- `--filter <expr>` - Message filter
- `--partition <limit>` - Partition limit
- `--media` - Download media
- `--reuse-media` - Reuse existing media
- `--locale <locale>` - Date locale
- `--utc` - Normalize to UTC
- `--threads <mode>` - Thread inclusion

### 4. Implement Progress Display
- [ ] Use cli-progress or ora
- [ ] Show: channel name, percentage, messages/sec
- [ ] Handle multiple channels

### 5. Implement Error Handling
File: `src/cli.ts`
- [ ] Catch DiscordChatExporterError
- [ ] Display helpful error messages
- [ ] Non-zero exit codes on failure

### 6. Implement Logging
- [ ] Optional verbose mode
- [ ] Log rate limiting delays
- [ ] Log asset download failures

## Todo List
- [ ] Implement ChannelExporter
- [ ] Create clean public API exports
- [ ] Implement CLI with commander
- [ ] Implement export command
- [ ] Implement exportguild command
- [ ] Implement exportdm command
- [ ] Implement guilds/channels commands
- [ ] Add progress display
- [ ] Add error handling
- [ ] Add --help documentation

## Success Criteria
- [ ] Full channel export works end-to-end
- [ ] CLI provides helpful output
- [ ] Progress shows during long exports
- [ ] Errors include context

## Risk Assessment
- Medium complexity
- Need to handle all edge cases
