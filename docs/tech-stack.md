# Tech Stack

## Runtime & Language

| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| **Runtime** | Node.js | >= 20.0.0 | LTS, native ESM, async iterators |
| **Language** | TypeScript | ^5.7.2 | Type safety, strict mode, better DX |
| **Module** | ESM-first, CJS compat | -- | Modern standard + backward compat |
| **Package Manager** | pnpm | >= 8.0.0 | Workspace support, fast installs |

## Core Dependencies

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **HTTP Client** | `undici` | ^6.21.0 | Native Node.js, fast, retry support |
| **CLI Framework** | `commander` | ^12.1.0 | Mature, TypeScript support |
| **Progress** | `cli-progress` | ^3.12.0 | Progress bars for CLI |
| **Markdown Parser** | Custom | -- | Discord-specific markdown syntax |

## Build & Dev

| Tool | Version | Purpose |
|------|---------|---------|
| `tsup` | ^8.3.5 | Build (ESM/CJS dual output for core, ESM-only for CLI) |
| `vitest` | ^2.1.8 | Testing framework (6 test files) |
| `eslint` | ^9.16.0 | Code quality and linting |
| `prettier` | ^3.4.2 | Code formatting |
| `typescript` | ^5.7.2 | Type checking with strict mode |

## Project Structure

This is a pnpm monorepo with two packages:

```
discord-chat-exporter/
├── packages/
│   ├── core/                        # @discord-chat-exporter/core (SDK)
│   │   ├── src/
│   │   │   ├── index.ts             # SDK entry point & public exports
│   │   │   ├── discord/             # Discord API module
│   │   │   │   ├── discord-client.ts# API client (~730 lines)
│   │   │   │   ├── snowflake.ts     # Snowflake ID handling
│   │   │   │   └── data/            # 25+ data model files
│   │   │   ├── exporting/           # Export system
│   │   │   │   ├── channel-exporter.ts
│   │   │   │   ├── message-exporter.ts
│   │   │   │   ├── export-context.ts
│   │   │   │   ├── writers/         # Format writers (JSON, HTML, CSV, TXT)
│   │   │   │   ├── filtering/       # Message filters
│   │   │   │   └── partitioning/    # File partitioning
│   │   │   ├── markdown/            # Discord markdown parser
│   │   │   ├── utils/               # Utilities
│   │   │   └── exceptions/          # Custom error types
│   │   ├── tests/                   # Unit tests (6 test files)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── vitest.config.ts
│   │
│   └── cli/                         # @discord-chat-exporter/cli
│       ├── src/
│       │   └── cli.ts               # CLI implementation (8 commands)
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
│
├── docs/                            # Documentation
├── plans/                           # Planning documents
├── pnpm-workspace.yaml              # Workspace definition
├── tsconfig.base.json               # Shared TypeScript config
├── package.json                     # Root package (scripts)
├── README.md
├── EXAMPLES.md
├── PERFORMANCE.md
└── LICENSE
```

## Architecture Decisions

### 1. Snowflake as BigInt
Discord Snowflakes are 64-bit IDs. Using `bigint` ensures precision.

### 2. Async Generators for Pagination
API endpoints returning lists use async generators for memory efficiency.

### 3. Monorepo with Two Packages
- **@discord-chat-exporter/core**: SDK library for programmatic usage (ESM + CJS)
- **@discord-chat-exporter/cli**: Command-line interface (`npx @discord-chat-exporter/cli` or global install)

### 4. Export Format Writers
Strategy pattern for different output formats (JSON, HTML, CSV, TXT).

### 5. Rate Limiting Strategy
- Respect `X-RateLimit-*` headers
- Configurable: respect all vs hard limits only
- Exponential backoff with jitter

---

*Last Updated: 2026-03-03*
*Version: 0.2.0*
