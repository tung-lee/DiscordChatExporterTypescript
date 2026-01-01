# pnpm Monorepo Restructure Plan

## Overview

Restructure the project from a single package to a pnpm workspace monorepo with two scoped packages:
- `@discord-chat-exporter/core` - SDK library
- `@discord-chat-exporter/cli` - CLI tool

## Current Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | Pending | [Create workspace structure](./phase-01-workspace-structure.md) |
| Phase 2 | Pending | [Migrate core package](./phase-02-migrate-core.md) |
| Phase 3 | Pending | [Migrate CLI package](./phase-03-migrate-cli.md) |
| Phase 4 | Pending | [Update root config and cleanup](./phase-04-root-config.md) |
| Phase 5 | Pending | [Build, test, verify](./phase-05-verify.md) |

## Target Structure

```
discord-chat-exporter/
├── packages/
│   ├── core/                    # @discord-chat-exporter/core
│   │   ├── src/
│   │   │   ├── discord/
│   │   │   ├── exporting/
│   │   │   ├── markdown/
│   │   │   ├── utils/
│   │   │   ├── exceptions/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   └── cli/                     # @discord-chat-exporter/cli
│       ├── src/
│       │   └── cli.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
├── pnpm-workspace.yaml
├── package.json (root)
├── tsconfig.base.json
└── docs/
```

## Key Decisions

1. **Package scope**: `@discord-chat-exporter/`
2. **Workspace tool**: pnpm workspaces (no turborepo)
3. **Build tool**: tsup (keep existing)
4. **TypeScript**: Project references for build order

## Success Criteria

- [ ] `pnpm install` works without errors
- [ ] `pnpm build` builds both packages in correct order
- [ ] `pnpm test` runs tests successfully
- [ ] CLI binary works: `node packages/cli/dist/cli.js --help`
- [ ] SDK imports work: `import { DiscordClient } from '@discord-chat-exporter/core'`

---

*Created: 2026-01-01*
