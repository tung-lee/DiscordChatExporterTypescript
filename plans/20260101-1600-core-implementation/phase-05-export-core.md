# Phase 5: Export System Core

## Context
- Reference: `source_ref/DiscordChatExporter.Core/Exporting/`
- Dependencies: Phase 1-4

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~15 |

## Key Insights
- ExportRequest holds all configuration
- ExportContext caches members/channels/roles
- Partitioning by file size or message count
- Filter expressions parsed with grammar

## Requirements
- Support all export formats
- Asset downloading with caching
- Message filtering DSL
- Output partitioning

## Implementation Steps

### 1. Implement ExportFormat
File: `src/exporting/export-format.ts`
```typescript
enum ExportFormat {
  PlainText, HtmlDark, HtmlLight, Csv, Json
}
// getFileExtension(), getDisplayName()
```

### 2. Implement PartitionLimit
Directory: `src/exporting/partitioning/`
- [ ] `partition-limit.ts` - abstract base
- [ ] `null-partition-limit.ts` - never reached
- [ ] `file-size-partition-limit.ts` - bytes threshold
- [ ] `message-count-partition-limit.ts` - count threshold
- [ ] Static parse() method: "10mb", "1000"

### 3. Implement MessageFilter
Directory: `src/exporting/filtering/`
- [ ] `message-filter.ts` - abstract base
- [ ] `null-message-filter.ts` - always matches
- [ ] `contains-message-filter.ts` - text search
- [ ] `from-message-filter.ts` - author match
- [ ] `mentions-message-filter.ts` - mentioned user
- [ ] `has-message-filter.ts` - has:link, has:embed, etc.
- [ ] `reaction-message-filter.ts` - reaction match
- [ ] `negated-message-filter.ts` - NOT operator
- [ ] `binary-expression-message-filter.ts` - AND/OR

### 4. Implement FilterGrammar
File: `src/exporting/filtering/parsing/filter-grammar.ts`
- [ ] Parse: `from:user has:image -mentions:other`
- [ ] Support quoted strings
- [ ] Support parentheses
- [ ] Support boolean operators (|, &)

### 5. Implement ExportRequest
File: `src/exporting/export-request.ts`
```typescript
class ExportRequest {
  guild: Guild
  channel: Channel
  outputFilePath: string
  outputDirPath: string
  assetsDirPath: string
  format: ExportFormat
  after?: Snowflake
  before?: Snowflake
  partitionLimit: PartitionLimit
  messageFilter: MessageFilter
  shouldFormatMarkdown: boolean
  shouldDownloadAssets: boolean
  shouldReuseAssets: boolean
  locale?: string
  isUtcNormalizationEnabled: boolean
}
```
- [ ] Path formatting: %g, %G, %c, %C, %t, %T, etc.
- [ ] Default output file name generation

### 6. Implement ExportAssetDownloader
File: `src/exporting/export-asset-downloader.ts`
- [ ] Download with SHA256-based naming
- [ ] URL normalization for Discord CDN
- [ ] Reuse existing files if enabled
- [ ] Concurrent download handling

### 7. Implement ExportContext
File: `src/exporting/export-context.ts`
```typescript
class ExportContext {
  discord: DiscordClient
  request: ExportRequest

  // Caches
  membersById: Map<Snowflake, Member | null>
  channelsById: Map<Snowflake, Channel>
  rolesById: Map<Snowflake, Role>

  // Methods
  populateChannelsAndRoles(): Promise<void>
  populateMember(id or user): Promise<void>
  tryGetMember(id): Member | null
  tryGetChannel(id): Channel | null
  tryGetRole(id): Role | null
  getUserRoles(id): Role[]
  tryGetUserColor(id): Color | null
  resolveAssetUrl(url): Promise<string>
  normalizeDate(date): DateTimeOffset
  formatDate(date, format): string
}
```

### 8. Implement MessageWriter Base
File: `src/exporting/message-writer.ts`
```typescript
abstract class MessageWriter {
  protected stream: WriteStream
  protected context: ExportContext
  messagesWritten: number
  bytesWritten: number

  abstract writePreamble(): Promise<void>
  abstract writeMessage(message: Message): Promise<void>
  abstract writePostamble(): Promise<void>
  dispose(): Promise<void>
}
```

## Todo List
- [ ] Implement ExportFormat enum
- [ ] Implement partition limit classes
- [ ] Implement message filter classes
- [ ] Implement filter grammar parser
- [ ] Implement ExportRequest
- [ ] Implement ExportAssetDownloader
- [ ] Implement ExportContext
- [ ] Implement MessageWriter base
- [ ] Write filter parsing tests

## Success Criteria
- [ ] Filter expressions parse correctly
- [ ] Partition limits trigger at thresholds
- [ ] Asset downloads are cached
- [ ] Path placeholders expand correctly

## Risk Assessment
- Medium complexity
- Filter grammar needs careful implementation
