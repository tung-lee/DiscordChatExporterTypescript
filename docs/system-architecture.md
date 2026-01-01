# System Architecture

## Architecture Overview

Discord Chat Exporter follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Layer                                │
│                        (cli.ts)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Export Layer                                │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │ChannelExporter│  │MessageExporter│  │  ExportContext    │   │
│  └───────────────┘  └───────────────┘  └───────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │               Message Writers                          │     │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────┐ │     │
│  │  │  JSON  │ │  HTML  │ │  CSV   │ │   PlainText    │ │     │
│  │  └────────┘ └────────┘ └────────┘ └────────────────┘ │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Discord Layer                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    DiscordClient                           │ │
│  │  • API Communication    • Rate Limiting                   │ │
│  │  • Pagination          • Retry Logic                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │                   Data Models                          │     │
│  │  Message, User, Channel, Guild, Role, Embed, etc.     │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Supporting Layers                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐    │
│  │  Markdown  │  │   Utils    │  │      Exceptions        │    │
│  │  Parser    │  │            │  │                        │    │
│  └────────────┘  └────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### CLI Layer (`src/cli.ts`)

Entry point for command-line usage:
- Parses command-line arguments using Commander
- Validates user input (tokens, channel IDs, formats)
- Orchestrates export operations
- Displays progress and handles errors

### Export Layer (`src/exporting/`)

#### ChannelExporter
Main orchestrator for export operations:
- Coordinates message fetching and writing
- Manages batch processing for performance
- Handles parallel member population
- Applies message filters

#### MessageExporter
Manages file output:
- Creates and manages output files
- Handles partition splitting (by count or size)
- Delegates to format-specific writers

#### ExportContext
Shared state and caching layer:
- Caches members, channels, roles
- Computes and caches user colors
- Resolves asset URLs for downloads
- Formats dates according to locale

#### Message Writers
Format-specific output generators:
- `JsonMessageWriter` - Structured JSON output
- `HtmlMessageWriter` - Styled HTML with CSS
- `CsvMessageWriter` - Tabular CSV format
- `PlainTextMessageWriter` - Simple text output

### Discord Layer (`src/discord/`)

#### DiscordClient
HTTP client for Discord API:
- Handles authentication (user/bot tokens)
- Implements rate limiting with backoff
- Provides async generators for pagination
- Manages retry logic for transient failures

#### Data Models (`src/discord/data/`)
Immutable representations of Discord entities:
- All properties are `readonly`
- Static `parse()` methods for JSON deserialization
- Consistent null handling with `tryParse()`
- Self-contained with no external dependencies

### Supporting Layers

#### Markdown Module (`src/markdown/`)
Discord-flavored markdown parser:
- Converts text to AST nodes
- Handles Discord-specific syntax (mentions, emoji)
- Visitor pattern for format conversion

#### Utils Module (`src/utils/`)
Cross-cutting utilities:
- `FileSize` - Byte size handling
- `Color` - RGB color manipulation
- HTTP client configuration
- URL building helpers

#### Exceptions Module (`src/exceptions/`)
Domain-specific error types:
- `DiscordChatExporterError` - Base with fatal flag
- `ChannelEmptyError` - Non-fatal, empty channel
- `UnsupportedChannelError` - Fatal, wrong channel type

## Data Flow

### Export Request Flow

```
1. CLI parses arguments
       │
       ▼
2. ExportRequest created with options
       │
       ▼
3. ChannelExporter.exportChannel() called
       │
       ▼
4. ExportContext initialized with caching
       │
       ▼
5. Channels and roles pre-populated
       │
       ▼
6. Messages fetched via async generator
       │
       ▼
7. Messages batched (50 per batch)
       │
       ▼
8. Users deduplicated and members populated (10 parallel)
       │
       ▼
9. MessageWriter writes formatted output
       │
       ▼
10. File partitioned if limits exceeded
```

### Message Processing Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Discord   │ ──► │   Message   │ ──► │   Filter    │
│     API     │     │   Model     │     │   Check     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Output    │ ◄── │  Markdown   │ ◄── │   Member    │
│    File     │     │  Rendering  │     │ Resolution  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Design Patterns

### Factory Pattern
Used for creating format-specific writers:

```typescript
class MessageWriterFactory {
  static create(filePath: string, context: ExportContext): MessageWriter {
    switch (context.request.format) {
      case ExportFormat.Json:
        return new JsonMessageWriter(filePath, context);
      case ExportFormat.HtmlDark:
      case ExportFormat.HtmlLight:
        return new HtmlMessageWriter(filePath, context);
      // ...
    }
  }
}
```

### Strategy Pattern
Message filtering uses composable strategies:

```typescript
abstract class MessageFilter {
  abstract isMatch(message: Message): boolean;

  and(other: MessageFilter): MessageFilter;
  or(other: MessageFilter): MessageFilter;
  negate(): MessageFilter;
}

// Concrete strategies
class ContainsMessageFilter extends MessageFilter { }
class FromMessageFilter extends MessageFilter { }
class HasMessageFilter extends MessageFilter { }
```

### Visitor Pattern
Markdown rendering uses visitor pattern:

```typescript
abstract class MarkdownVisitor {
  async visit(node: MarkdownNode): Promise<void> {
    if (node instanceof TextNode) {
      await this.visitText(node);
    } else if (node instanceof FormattingNode) {
      await this.visitFormatting(node);
    }
    // ...
  }
}

class HtmlMarkdownVisitor extends MarkdownVisitor {
  protected async visitFormatting(node: FormattingNode): Promise<void> {
    // Convert to HTML tags
  }
}
```

### Async Generator Pattern
Pagination uses memory-efficient generators:

```typescript
async *getMessages(channelId: Snowflake): AsyncGenerator<Message> {
  let cursor = Snowflake.Zero;

  while (true) {
    const batch = await this.fetchBatch(channelId, cursor);
    if (batch.length === 0) return;

    for (const message of batch) {
      yield message;
      cursor = message.id;
    }
  }
}
```

## Caching Architecture

### Multi-Level Cache Structure

```
┌────────────────────────────────────────────────────────┐
│                    ExportContext                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Level 1: Entity Caches (populated once)          │  │
│  │  • membersById: Map<string, Member | null>       │  │
│  │  • channelsById: Map<string, Channel>            │  │
│  │  • rolesById: Map<string, Role>                  │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│                          ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Level 2: Computed Caches (lazy-loaded)           │  │
│  │  • userRolesCache: Map<string, Role[]>           │  │
│  │  • userColorCache: Map<string, Color | null>     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Cache Performance Characteristics

| Cache | Hit Rate | Access Pattern |
|-------|----------|----------------|
| membersById | ~90% | Deduplicated across batches |
| userRolesCache | ~95% | Per-user, repeated access |
| userColorCache | ~99% | Per-user, every message |

## Error Handling Strategy

### Exception Hierarchy

```
Error
└── DiscordChatExporterError
    │   └── isFatal: boolean
    │   └── cause?: Error
    │
    ├── ChannelEmptyError (non-fatal)
    │       → Log warning, continue export
    │
    └── UnsupportedChannelError (fatal)
            → Stop export, report error
```

### Error Recovery Flow

```
┌───────────────┐
│  API Request  │
└───────┬───────┘
        │
        ▼
   ┌────────────┐     Yes     ┌─────────────┐
   │ Rate Limit?├────────────►│   Backoff   │
   └────┬───────┘             └──────┬──────┘
        │ No                         │
        ▼                            │
   ┌────────────┐     Yes     ┌──────┴──────┐
   │  5xx Error?├────────────►│    Retry    │
   └────┬───────┘             └─────────────┘
        │ No                     (max 5x)
        ▼
   ┌────────────┐     Yes     ┌─────────────┐
   │ Fatal Error├────────────►│  Throw/Stop │
   └────┬───────┘             └─────────────┘
        │ No
        ▼
   ┌────────────┐
   │  Continue  │
   └────────────┘
```

## Scalability Considerations

### Memory Management
- Async generators prevent loading all messages into memory
- Batch processing limits concurrent message handling
- Caches use string keys to avoid object reference overhead

### API Efficiency
- Batch user deduplication reduces API calls by ~98%
- Parallel member population (10 concurrent) balances speed and rate limits
- Pre-population of channels and roles eliminates per-message lookups

### I/O Optimization
- Streaming file writes for large exports
- Partition support for splitting very large exports
- Asset downloads with retry and fallback

## Security Model

### Token Handling
- Tokens passed via CLI arguments or environment
- Never persisted to disk
- Cleared from memory after client initialization

### API Communication
- HTTPS only
- No external telemetry
- All processing is local

### Input Validation
- Snowflake IDs validated for format
- File paths sanitized
- User input escaped in output formats

---

*Last Updated: 2026-01-01*
