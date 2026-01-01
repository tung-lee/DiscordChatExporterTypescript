# DiscordChatExporter Core - TypeScript Implementation

Port of DiscordChatExporter.Core from C# to TypeScript

## Status: Planning

## Overview

TypeScript library + CLI for exporting Discord chat history. Supports JSON, HTML, CSV, and PlainText formats.

## Tech Stack
- Node.js 20+ | TypeScript 5.x | ESM/CJS dual
- HTTP: undici | Build: tsup | Test: Vitest
- CLI: commander

## Phases

| Phase | Name | Status | Link |
|-------|------|--------|------|
| 1 | Project Setup & Core Types | Pending | [phase-01-project-setup.md](./phase-01-project-setup.md) |
| 2 | Discord Data Models | Pending | [phase-02-data-models.md](./phase-02-data-models.md) |
| 3 | Discord API Client | Pending | [phase-03-api-client.md](./phase-03-api-client.md) |
| 4 | Markdown Parser | Pending | [phase-04-markdown-parser.md](./phase-04-markdown-parser.md) |
| 5 | Export System Core | Pending | [phase-05-export-core.md](./phase-05-export-core.md) |
| 6 | Format Writers | Pending | [phase-06-format-writers.md](./phase-06-format-writers.md) |
| 7 | Channel Exporter & CLI | Pending | [phase-07-channel-exporter.md](./phase-07-channel-exporter.md) |
| 8 | Testing & Documentation | Pending | [phase-08-testing.md](./phase-08-testing.md) |

## Dependencies

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 5 -> Phase 6 -> Phase 7
              |                      |
              v                      v
         Phase 4 -----------------> Phase 6
                                     ^
                                     |
                                 Phase 5
```

## Key Architecture Decisions

1. **BigInt for Snowflake** - JavaScript number loses precision for 64-bit IDs
2. **AsyncGenerator for pagination** - Memory efficient API iteration
3. **undici with retry interceptor** - Native Node.js HTTP with resilience
4. **Regex-based markdown parser** - Matches Discord's non-recursive approach
5. **Strategy pattern for writers** - Clean separation of export formats

## Critical Implementation Notes

- Discord uses non-standard markdown parsing (regex-based, not recursive descent)
- Rate limiting must respect both advisory and hard limits
- HTML templates need special handling (no RazorBlade in TS)
- Filter grammar needs custom parser (Superpower not available in TS)
