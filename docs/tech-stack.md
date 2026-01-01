# Tech Stack

## Runtime & Language

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Runtime** | Node.js 20+ | LTS, native ESM, async iterators |
| **Language** | TypeScript 5.x | Type safety, better DX |
| **Module** | ESM-first, CJS compat | Modern standard + backward compat |

## Core Dependencies

| Category | Package | Purpose |
|----------|---------|---------|
| **HTTP Client** | `undici` | Native Node.js, fast, retry support |
| **CLI Framework** | `commander` | Mature, TypeScript support |
| **Progress** | `cli-progress` | Progress bars for CLI |
| **Markdown Parser** | Custom | Discord-specific markdown syntax |

## Build & Dev

| Tool | Purpose |
|------|---------|
| `tsup` | Build (ESM/CJS dual output) |
| `vitest` | Testing framework |
| `eslint` + `prettier` | Code quality |
| `typescript` | Type checking |

## Project Structure

```
discord-chat-exporter-core/
├── src/
│   ├── index.ts              # Library entry point
│   ├── cli.ts                # CLI entry point
│   ├── discord/              # Discord API module
│   │   ├── client.ts         # API client
│   │   ├── snowflake.ts      # Snowflake ID handling
│   │   └── data/             # Data models
│   ├── exporting/            # Export system
│   │   ├── exporter.ts       # Channel exporter
│   │   ├── writers/          # Format writers
│   │   ├── filtering/        # Message filters
│   │   └── partitioning/     # File partitioning
│   ├── markdown/             # Markdown parser
│   └── utils/                # Utilities
├── tests/
├── dist/                     # Build output
├── docs/
├── plans/
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Architecture Decisions

### 1. Snowflake as BigInt
Discord Snowflakes are 64-bit IDs. Using `bigint` ensures precision.

### 2. Async Generators for Pagination
API endpoints returning lists use async generators for memory efficiency.

### 3. Dual Package (CLI + Library)
- **Library**: Import and use programmatically
- **CLI**: `npx discord-chat-exporter-core` or global install

### 4. Export Format Writers
Strategy pattern for different output formats (JSON, HTML, CSV, TXT).

### 5. Rate Limiting Strategy
- Respect `X-RateLimit-*` headers
- Configurable: respect all vs hard limits only
- Exponential backoff with jitter
