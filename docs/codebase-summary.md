# Codebase Summary

## Project Statistics

| Metric | Value |
|--------|-------|
| **Source Files** | ~75 TypeScript files |
| **Test Files** | 6 test files |
| **Lines of Code** | ~8,000 LOC (estimated) |
| **Dependencies** | 3 runtime, 7 dev |

## Directory Structure

```
discord-chat-exporter-core/
├── src/                          # Source code
│   ├── index.ts                  # Library entry point
│   ├── cli.ts                    # CLI entry point (~500 lines)
│   │
│   ├── discord/                  # Discord API module
│   │   ├── discord-client.ts     # API client (~730 lines)
│   │   ├── snowflake.ts          # ID handling (~120 lines)
│   │   ├── token-kind.ts         # Auth token types
│   │   ├── rate-limit-preference.ts
│   │   ├── index.ts              # Module exports
│   │   └── data/                 # Data models (~25 files)
│   │       ├── enums.ts          # Discord enums
│   │       ├── user.ts           # User model
│   │       ├── guild.ts          # Guild model
│   │       ├── channel.ts        # Channel model (~200 lines)
│   │       ├── message.ts        # Message model (~330 lines)
│   │       ├── member.ts         # Member model
│   │       ├── role.ts           # Role model
│   │       ├── attachment.ts     # Attachment model
│   │       ├── reaction.ts       # Reaction model
│   │       ├── sticker.ts        # Sticker model
│   │       ├── emoji.ts          # Emoji model
│   │       ├── invite.ts         # Invite model
│   │       ├── application.ts    # Bot application
│   │       ├── interaction.ts    # Slash command interaction
│   │       ├── message-reference.ts
│   │       ├── embeds/           # Embed components
│   │       │   ├── embed.ts
│   │       │   ├── embed-author.ts
│   │       │   ├── embed-field.ts
│   │       │   ├── embed-footer.ts
│   │       │   ├── embed-image.ts
│   │       │   └── embed-video.ts
│   │       └── common/
│   │           ├── has-id.ts     # ID interface
│   │           └── image-cdn.ts  # CDN URL builders
│   │
│   ├── exporting/                # Export system
│   │   ├── export-format.ts      # Format enum
│   │   ├── export-request.ts     # Export config (~200 lines)
│   │   ├── export-context.ts     # Export state/cache (~250 lines)
│   │   ├── export-asset-downloader.ts
│   │   ├── message-exporter.ts   # Message writing
│   │   ├── channel-exporter.ts   # Main orchestrator (~150 lines)
│   │   ├── index.ts              # Module exports
│   │   ├── partitioning/
│   │   │   ├── partition-limit.ts
│   │   │   └── index.ts
│   │   ├── filtering/
│   │   │   ├── message-filter.ts (~200 lines)
│   │   │   ├── filter-grammar.ts (~150 lines)
│   │   │   └── index.ts
│   │   └── writers/              # Format-specific writers
│   │       ├── message-writer.ts           # Base class
│   │       ├── message-writer-factory.ts   # Factory
│   │       ├── plain-text-message-writer.ts
│   │       ├── csv-message-writer.ts
│   │       ├── json-message-writer.ts
│   │       ├── html-message-writer.ts (~800 lines)
│   │       ├── plain-text-markdown-visitor.ts
│   │       ├── html-markdown-visitor.ts (~400 lines)
│   │       ├── html/
│   │       │   └── styles.ts     # CSS styles
│   │       └── index.ts
│   │
│   ├── markdown/                 # Markdown parsing
│   │   ├── formatting-kind.ts    # Format types enum
│   │   ├── mention-kind.ts       # Mention types enum
│   │   ├── nodes.ts              # AST node classes (~200 lines)
│   │   ├── emoji-index.ts        # Emoji name mappings
│   │   ├── index.ts              # Module exports
│   │   └── parsing/
│   │       ├── markdown-parser.ts    (~500 lines)
│   │       ├── markdown-visitor.ts
│   │       ├── matcher.ts
│   │       ├── string-matcher.ts
│   │       ├── regex-matcher.ts
│   │       ├── aggregate-matcher.ts
│   │       ├── string-segment.ts
│   │       ├── parsed-match.ts
│   │       └── index.ts
│   │
│   ├── utils/                    # Utilities
│   │   ├── file-size.ts          # FileSize class
│   │   ├── color.ts              # Color class
│   │   ├── extensions.ts         # Helper functions
│   │   ├── url.ts                # URL utilities
│   │   ├── http.ts               # HTTP client config
│   │   └── index.ts
│   │
│   └── exceptions/               # Custom errors
│       ├── discord-chat-exporter-error.ts
│       ├── channel-empty-error.ts
│       ├── unsupported-channel-error.ts
│       └── index.ts
│
├── tests/                        # Unit tests
│   ├── discord/
│   │   └── snowflake.test.ts
│   ├── utils/
│   │   ├── file-size.test.ts
│   │   └── color.test.ts
│   └── exporting/
│       ├── export-format.test.ts
│       ├── partition-limit.test.ts
│       └── message-filter.test.ts
│
├── dist/                         # Build output
├── docs/                         # Documentation
├── plans/                        # Planning documents
├── source_ref/                   # Reference materials
│
├── package.json                  # Project manifest
├── tsconfig.json                 # TypeScript config
├── tsup.config.ts                # Build config
├── vitest.config.ts              # Test config
├── README.md                     # Main documentation
├── EXAMPLES.md                   # Usage examples
├── PERFORMANCE.md                # Performance guide
└── LICENSE                       # MIT license
```

## Module Breakdown

### 1. Discord Module (`src/discord/`)

**Purpose:** Discord API client and data models

**Key Components:**

| File | Responsibility |
|------|----------------|
| `discord-client.ts` | API communication, pagination, rate limiting |
| `snowflake.ts` | 64-bit Discord ID handling with BigInt |
| `data/*.ts` | Immutable data classes for Discord entities |

**Public Exports:**
- `DiscordClient` - API client class
- `Snowflake` - ID wrapper class
- `TokenKind` - User/Bot enum
- `RateLimitPreference` - Rate limit config
- 25+ data model classes

### 2. Exporting Module (`src/exporting/`)

**Purpose:** Export orchestration and format writing

**Key Components:**

| File | Responsibility |
|------|----------------|
| `channel-exporter.ts` | Main export orchestration |
| `message-exporter.ts` | File writing with partitioning |
| `export-context.ts` | State management and caching |
| `export-request.ts` | Configuration container |
| `writers/*.ts` | Format-specific implementations |

**Public Exports:**
- `ChannelExporter` - Main exporter class
- `ExportRequest` - Configuration class
- `ExportFormat` - Format enum
- `MessageFilter` - Filter abstraction
- `PartitionLimit` - Partition strategy

### 3. Markdown Module (`src/markdown/`)

**Purpose:** Discord markdown parsing and rendering

**Key Components:**

| File | Responsibility |
|------|----------------|
| `markdown-parser.ts` | Text to AST conversion |
| `markdown-visitor.ts` | AST traversal base class |
| `nodes.ts` | AST node definitions |
| `matcher.ts` | Pattern matching framework |

**Public Exports:**
- `parse()` / `parseMinimal()` - Parser functions
- `MarkdownNode` types - AST nodes
- `MarkdownVisitor` - Base visitor class
- `FormattingKind` / `MentionKind` - Enums

### 4. Utils Module (`src/utils/`)

**Purpose:** Cross-cutting utility functions

**Key Components:**

| File | Responsibility |
|------|----------------|
| `file-size.ts` | Byte size formatting/parsing |
| `color.ts` | RGB color handling |
| `http.ts` | HTTP client with retry |
| `url.ts` | URL building utilities |
| `extensions.ts` | General helpers |

**Public Exports:**
- `FileSize` - Size wrapper class
- `Color` - Color wrapper class
- Various utility functions

### 5. Exceptions Module (`src/exceptions/`)

**Purpose:** Domain-specific error types

**Exception Hierarchy:**
```
Error
└── DiscordChatExporterError (isFatal: boolean)
    ├── ChannelEmptyError (non-fatal)
    └── UnsupportedChannelError (fatal)
```

## Key Files by Importance

### Critical Files (Core Logic)

1. **`src/discord/discord-client.ts`** - API communication
2. **`src/exporting/channel-exporter.ts`** - Export orchestration
3. **`src/discord/data/message.ts`** - Message data model
4. **`src/markdown/parsing/markdown-parser.ts`** - Markdown parsing
5. **`src/cli.ts`** - CLI interface

### High-Value Files (Format Output)

1. **`src/exporting/writers/html-message-writer.ts`** - HTML export
2. **`src/exporting/writers/json-message-writer.ts`** - JSON export
3. **`src/exporting/writers/html-markdown-visitor.ts`** - HTML markdown

### Supporting Files

1. **`src/exporting/export-context.ts`** - Caching layer
2. **`src/exporting/filtering/message-filter.ts`** - Filtering
3. **`src/exporting/partitioning/partition-limit.ts`** - Partitioning

## Data Flow Summary

```
CLI Input
    │
    ▼
┌───────────────────┐
│   ExportRequest   │  Configuration
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  ChannelExporter  │  Orchestration
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   DiscordClient   │  API Communication
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   ExportContext   │  Caching & State
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  MessageExporter  │  File Management
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  MessageWriter    │  Format-Specific
└─────────┬─────────┘
          │
          ▼
    Output File(s)
```

## Dependency Graph (Internal)

```
cli.ts ─────────────────────────────────────────────┐
    │                                               │
    ├──► discord/discord-client.ts                  │
    │        │                                      │
    │        └──► discord/data/* (all models)      │
    │                 │                             │
    │                 └──► utils/http.ts            │
    │                                               │
    ├──► exporting/channel-exporter.ts              │
    │        │                                      │
    │        ├──► exporting/message-exporter.ts     │
    │        │        │                             │
    │        │        └──► exporting/writers/*      │
    │        │                  │                   │
    │        │                  └──► markdown/*     │
    │        │                                      │
    │        ├──► exporting/export-context.ts       │
    │        │                                      │
    │        └──► exporting/filtering/*             │
    │                                               │
    └──► utils/* ◄──────────────────────────────────┘
```

## Test Coverage Areas

| Module | Test Focus |
|--------|-----------|
| `discord/snowflake` | Parsing, date extraction, comparison |
| `utils/file-size` | Parsing, formatting, conversions |
| `utils/color` | RGB/Hex/Int conversions |
| `exporting/export-format` | Format parsing |
| `exporting/partition-limit` | Limit parsing and checking |
| `exporting/message-filter` | Filter expression parsing |

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, metadata |
| `tsconfig.json` | TypeScript strict mode config |
| `tsup.config.ts` | Dual ESM/CJS build |
| `vitest.config.ts` | Test runner config |

---

*Last Updated: 2026-01-01*
