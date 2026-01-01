# Phase 3: Migrate CLI Package

## Context
Move CLI code to `packages/cli/` and update imports to use `@discord-chat-exporter/core`

## Tasks

- [ ] Move `src/cli.ts` to `packages/cli/src/cli.ts`
- [ ] Update all imports in cli.ts to use `@discord-chat-exporter/core`
- [ ] Create `packages/cli/package.json`
- [ ] Create `packages/cli/tsconfig.json`
- [ ] Create `packages/cli/tsup.config.ts`

## Import Changes in cli.ts

```typescript
// Before (relative imports)
import { Snowflake } from './discord/snowflake.js';
import { DiscordClient } from './discord/discord-client.js';
import { ChannelExporter } from './exporting/channel-exporter.js';
// ... etc

// After (package imports)
import {
  Snowflake,
  DiscordClient,
  ChannelExporter,
  ExportRequest,
  ExportFormat,
  MessageFilter,
  PartitionLimit,
  Channel,
  ChannelKind,
  parseExportFormat,
  DiscordChatExporterError,
  ChannelEmptyError,
} from '@discord-chat-exporter/core';
```

## packages/cli/package.json

```json
{
  "name": "@discord-chat-exporter/cli",
  "version": "0.1.0",
  "description": "CLI for exporting Discord chat history",
  "type": "module",
  "bin": {
    "discord-chat-exporter": "./dist/cli.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@discord-chat-exporter/core": "workspace:*",
    "commander": "^12.1.0",
    "cli-progress": "^3.12.0"
  },
  "devDependencies": {
    "@types/cli-progress": "^3.11.6"
  },
  "engines": { "node": ">=20.0.0" },
  "license": "MIT"
}
```

## packages/cli/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
  "references": [{ "path": "../core" }]
}
```

## packages/cli/tsup.config.ts

```typescript
import { defineConfig } from 'tsup';
import { chmod, readFile, writeFile } from 'fs/promises';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  target: 'node20',
  banner: { js: '#!/usr/bin/env node' },
  onSuccess: async () => {
    await chmod('./dist/cli.js', 0o755);
  },
});
```

## Key Import Mapping

| Old Import | New Import |
|------------|------------|
| `./discord/snowflake.js` | `@discord-chat-exporter/core` |
| `./discord/discord-client.js` | `@discord-chat-exporter/core` |
| `./exporting/channel-exporter.js` | `@discord-chat-exporter/core` |
| `./exporting/export-request.js` | `@discord-chat-exporter/core` |
| `./exporting/export-format.js` | `@discord-chat-exporter/core` |
| `./exporting/filtering/message-filter.js` | `@discord-chat-exporter/core` |
| `./exporting/partitioning/partition-limit.js` | `@discord-chat-exporter/core` |
| `./discord/data/channel.js` | `@discord-chat-exporter/core` |
| `./exceptions/index.js` | `@discord-chat-exporter/core` |
