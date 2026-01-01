# Codebase Summary

## Project Statistics

| Metric | Value |
|--------|-------|
| **Packages** | 2 (monorepo) |
| **Source Files** | ~75 TypeScript files |
| **Test Files** | 6 test files |
| **Lines of Code** | ~8,500 LOC (estimated) |
| **Runtime Dependencies** | 3 (undici, commander, cli-progress) |

## Monorepo Structure

```
discord-chat-exporter/
├── packages/
│   ├── core/                         # @discord-chat-exporter/core (SDK)
│   │   ├── src/
│   │   │   ├── index.ts              # SDK entry point
│   │   │   ├── discord/              # Discord API module
│   │   │   │   ├── discord-client.ts # API client (~730 lines)
│   │   │   │   ├── snowflake.ts      # ID handling (~120 lines)
│   │   │   │   ├── token-kind.ts     # Auth token types
│   │   │   │   ├── rate-limit-preference.ts
│   │   │   │   └── data/             # Data models (~25 files)
│   │   │   │       ├── enums.ts
│   │   │   │       ├── user.ts, guild.ts, channel.ts
│   │   │   │       ├── message.ts, member.ts, role.ts
│   │   │   │       ├── attachment.ts, reaction.ts, sticker.ts
│   │   │   │       └── embeds/       # Embed components
│   │   │   │
│   │   │   ├── exporting/            # Export system
│   │   │   │   ├── channel-exporter.ts
│   │   │   │   ├── message-exporter.ts
│   │   │   │   ├── export-context.ts
│   │   │   │   ├── export-request.ts
│   │   │   │   ├── filtering/        # Message filters
│   │   │   │   ├── partitioning/     # Output splitting
│   │   │   │   └── writers/          # Format writers
│   │   │   │       ├── json-message-writer.ts
│   │   │   │       ├── html-message-writer.ts
│   │   │   │       ├── csv-message-writer.ts
│   │   │   │       └── plain-text-message-writer.ts
│   │   │   │
│   │   │   ├── markdown/             # Markdown parsing
│   │   │   │   ├── nodes.ts
│   │   │   │   ├── emoji-index.ts
│   │   │   │   └── parsing/
│   │   │   │       ├── markdown-parser.ts
│   │   │   │       └── markdown-visitor.ts
│   │   │   │
│   │   │   ├── utils/                # Utilities
│   │   │   │   ├── file-size.ts
│   │   │   │   ├── color.ts
│   │   │   │   └── http.ts
│   │   │   │
│   │   │   └── exceptions/           # Custom errors
│   │   │       ├── discord-chat-exporter-error.ts
│   │   │       └── channel-empty-error.ts
│   │   │
│   │   ├── tests/                    # Unit tests
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   │
│   └── cli/                          # @discord-chat-exporter/cli
│       ├── src/
│       │   └── cli.ts                # CLI implementation (~500 lines)
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
│
├── docs/                             # Documentation
├── plans/                            # Planning documents
├── pnpm-workspace.yaml               # Workspace definition
├── tsconfig.base.json                # Shared TypeScript config
├── package.json                      # Root package (scripts)
├── README.md
├── EXAMPLES.md
├── PERFORMANCE.md
└── LICENSE
```

## Package Overview

### @discord-chat-exporter/core

**Purpose:** TypeScript SDK for exporting Discord chat history

| Aspect | Details |
|--------|---------|
| **npm** | https://www.npmjs.com/package/@discord-chat-exporter/core |
| **Entry** | `dist/index.js` (ESM) / `dist/index.cjs` (CJS) |
| **Types** | `dist/index.d.ts` |
| **Dependencies** | undici |
| **Size** | ~257 KB (packed) |

**Public Exports:**
- `DiscordClient` - API client class
- `ChannelExporter` - Export orchestrator
- `Snowflake` - Discord ID wrapper
- `ExportRequest`, `ExportFormat` - Export configuration
- `MessageFilter`, `PartitionLimit` - Export options
- 25+ data model classes (User, Guild, Channel, Message, etc.)

### @discord-chat-exporter/cli

**Purpose:** Command-line interface for Discord chat export

| Aspect | Details |
|--------|---------|
| **npm** | https://www.npmjs.com/package/@discord-chat-exporter/cli |
| **Binary** | `discord-chat-exporter` |
| **Dependencies** | @discord-chat-exporter/core, commander, cli-progress |
| **Size** | ~8 KB (packed) |

**Commands:**
- `export` - Export channel(s) to file
- `exportguild` - Export all channels in a guild
- `guilds` - List available guilds
- `channels` - List channels in a guild
- `dms` - List direct message channels

## Module Breakdown

### 1. Discord Module (`packages/core/src/discord/`)

**Purpose:** Discord API client and data models

| File | Responsibility |
|------|----------------|
| `discord-client.ts` | API communication, pagination, rate limiting |
| `snowflake.ts` | 64-bit Discord ID handling with BigInt |
| `data/*.ts` | Immutable data classes for Discord entities |

### 2. Exporting Module (`packages/core/src/exporting/`)

**Purpose:** Export orchestration and format writing

| File | Responsibility |
|------|----------------|
| `channel-exporter.ts` | Main export orchestration, batch processing |
| `message-exporter.ts` | File writing with partitioning |
| `export-context.ts` | State management and caching |
| `writers/*.ts` | Format-specific implementations |

### 3. Markdown Module (`packages/core/src/markdown/`)

**Purpose:** Discord markdown parsing and rendering

| File | Responsibility |
|------|----------------|
| `markdown-parser.ts` | Text to AST conversion |
| `markdown-visitor.ts` | AST traversal base class |
| `nodes.ts` | AST node definitions |

### 4. CLI Module (`packages/cli/src/`)

**Purpose:** Command-line interface

| File | Responsibility |
|------|----------------|
| `cli.ts` | Commander.js-based CLI with 5 commands |

## Data Flow

```
CLI (@discord-chat-exporter/cli)
    │
    ▼
┌───────────────────────────────────────────────────────┐
│          @discord-chat-exporter/core                   │
│                                                        │
│  ExportRequest ──► ChannelExporter ──► DiscordClient  │
│                          │                             │
│                          ▼                             │
│                   ExportContext (caching)              │
│                          │                             │
│                          ▼                             │
│                   MessageExporter                      │
│                          │                             │
│                          ▼                             │
│                   MessageWriter (JSON/HTML/CSV/TXT)    │
└───────────────────────────────────────────────────────┘
    │
    ▼
Output File(s)
```

## Dependency Graph

```
@discord-chat-exporter/cli
    │
    ├── @discord-chat-exporter/core (workspace:*)
    │       └── undici@^6.21.0
    │
    ├── commander@^12.1.0
    └── cli-progress@^3.12.0
```

## Test Coverage

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
| `pnpm-workspace.yaml` | Monorepo workspace definition |
| `tsconfig.base.json` | Shared TypeScript strict config |
| `packages/*/package.json` | Package-specific dependencies |
| `packages/*/tsconfig.json` | Package TypeScript config |
| `packages/*/tsup.config.ts` | Package build config |
| `packages/core/vitest.config.ts` | Test runner config |

## Build Outputs

| Package | Format | Output |
|---------|--------|--------|
| core | ESM | `dist/index.js` (172 KB) |
| core | CJS | `dist/index.cjs` (175 KB) |
| core | Types | `dist/index.d.ts` (55 KB) |
| cli | ESM | `dist/cli.js` (13 KB) |

---

*Last Updated: 2026-01-01*
