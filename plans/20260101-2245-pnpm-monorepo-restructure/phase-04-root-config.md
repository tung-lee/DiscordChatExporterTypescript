# Phase 4: Update Root Config and Cleanup

## Context
Update root package.json for monorepo, move shared devDependencies to root

## Tasks

- [ ] Update root `package.json` with workspace scripts
- [ ] Remove old `src/` directory (after migration verified)
- [ ] Remove old `tests/` directory (after migration verified)
- [ ] Update `.gitignore` for workspace structure
- [ ] Remove old `tsconfig.json` (replaced by tsconfig.base.json)
- [ ] Remove old `tsup.config.ts` (now in packages)
- [ ] Remove old `vitest.config.ts` (now in packages/core)

## Root package.json

```json
{
  "name": "@discord-chat-exporter/monorepo",
  "version": "0.1.0",
  "private": true,
  "description": "Discord Chat Exporter - TypeScript monorepo",
  "type": "module",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "build": "pnpm -r run build",
    "dev": "pnpm -r --parallel run dev",
    "test": "pnpm -r run test",
    "test:run": "pnpm -r run test:run",
    "typecheck": "pnpm -r run typecheck",
    "lint": "eslint packages/*/src --ext .ts",
    "format": "prettier --write \"packages/*/src/**/*.ts\"",
    "clean": "pnpm -r exec rm -rf dist && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "eslint": "^9.16.0",
    "prettier": "^3.4.2",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

## Updated .gitignore

Add:
```
# Workspace
packages/*/dist
packages/*/node_modules

# pnpm
.pnpm-store/
```

## Files to Remove

| File | Reason |
|------|--------|
| `src/` | Moved to packages/core/src |
| `tests/` | Moved to packages/core/tests |
| `dist/` | Each package has its own dist |
| `tsconfig.json` | Replaced by tsconfig.base.json |
| `tsup.config.ts` | Now in each package |
| `vitest.config.ts` | Now in packages/core |
| `package-lock.json` | Replaced by pnpm-lock.yaml |

## Verification

```bash
# Root should have:
ls -la
# pnpm-workspace.yaml
# tsconfig.base.json
# package.json
# packages/
# docs/
# plans/
# README.md
# EXAMPLES.md
# PERFORMANCE.md
```
