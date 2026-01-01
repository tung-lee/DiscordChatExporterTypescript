# Phase 1: Create Workspace Structure

## Context
- Current: Single package with all code in `src/`
- Target: pnpm workspace with `packages/core` and `packages/cli`

## Tasks

- [ ] Create `pnpm-workspace.yaml`
- [ ] Create `tsconfig.base.json` (shared TS config)
- [ ] Create `packages/core/` directory structure
- [ ] Create `packages/cli/` directory structure
- [ ] Update root `package.json` for monorepo

## Implementation

### 1. pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

### 2. tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 3. Directory Structure

```bash
mkdir -p packages/core/src
mkdir -p packages/cli/src
```

## Files to Create

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Workspace definition |
| `tsconfig.base.json` | Shared TypeScript config |
| `packages/core/` | Core SDK package directory |
| `packages/cli/` | CLI package directory |

## Verification

```bash
ls packages/
# Should show: core/ cli/
```
