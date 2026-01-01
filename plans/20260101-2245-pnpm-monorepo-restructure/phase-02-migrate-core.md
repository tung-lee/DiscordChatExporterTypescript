# Phase 2: Migrate Core Package

## Context
Move all SDK code to `packages/core/`

## Tasks

- [ ] Move `src/discord/` to `packages/core/src/discord/`
- [ ] Move `src/exporting/` to `packages/core/src/exporting/`
- [ ] Move `src/markdown/` to `packages/core/src/markdown/`
- [ ] Move `src/utils/` to `packages/core/src/utils/`
- [ ] Move `src/exceptions/` to `packages/core/src/exceptions/`
- [ ] Move `src/index.ts` to `packages/core/src/index.ts`
- [ ] Move `tests/` to `packages/core/tests/`
- [ ] Create `packages/core/package.json`
- [ ] Create `packages/core/tsconfig.json`
- [ ] Create `packages/core/tsup.config.ts`
- [ ] Create `packages/core/vitest.config.ts`

## packages/core/package.json

```json
{
  "name": "@discord-chat-exporter/core",
  "version": "0.1.0",
  "description": "TypeScript SDK for exporting Discord chat history",
  "type": "module",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "undici": "^6.21.0"
  },
  "engines": { "node": ">=20.0.0" },
  "license": "MIT"
}
```

## packages/core/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## packages/core/tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
});
```

## Files to Move

| From | To |
|------|-----|
| `src/discord/` | `packages/core/src/discord/` |
| `src/exporting/` | `packages/core/src/exporting/` |
| `src/markdown/` | `packages/core/src/markdown/` |
| `src/utils/` | `packages/core/src/utils/` |
| `src/exceptions/` | `packages/core/src/exceptions/` |
| `src/index.ts` | `packages/core/src/index.ts` |
| `tests/` | `packages/core/tests/` |
