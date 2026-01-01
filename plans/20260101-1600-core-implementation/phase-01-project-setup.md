# Phase 1: Project Setup & Core Types

## Context
- Reference: `source_ref/DiscordChatExporter.Core/`
- Dependencies: None (first phase)

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~15 |

## Requirements
- TypeScript 5.x with strict mode
- ESM module format, CJS compatibility
- Node.js 20+ runtime
- Dual-purpose: CLI + Library

## Implementation Steps

### 1. Initialize Project Structure
```
src/
├── index.ts              # Library entry
├── cli.ts                # CLI entry
├── discord/
├── markdown/
├── exporting/
└── utils/
```

### 2. Configure Build Tools
- [ ] package.json with exports field
- [ ] tsconfig.json (strict, ES2022, NodeNext)
- [ ] tsup.config.ts (ESM/CJS dual)
- [ ] vitest.config.ts
- [ ] .eslintrc.js + .prettierrc

### 3. Implement Snowflake
File: `src/discord/snowflake.ts`
- [ ] Use BigInt for 64-bit precision
- [ ] Discord epoch: 1420070400000n
- [ ] toDate(): Extract timestamp
- [ ] fromDate(): Create from Date
- [ ] parse(): From string
- [ ] Comparison operators (<, >)

### 4. Implement Utility Types
- [ ] `src/utils/file-size.ts` - Byte formatting
- [ ] `src/utils/color.ts` - Color with hex conversion
- [ ] `src/utils/extensions.ts` - Pipe, nullIfDefault, etc.

### 5. Implement Exceptions
- [ ] `src/exceptions/discord-chat-exporter-error.ts`
- [ ] `src/exceptions/channel-empty-error.ts`

## Todo List
- [ ] npm init and install dependencies
- [ ] Create tsconfig.json
- [ ] Create tsup.config.ts
- [ ] Create vitest.config.ts
- [ ] Implement Snowflake class
- [ ] Implement FileSize class
- [ ] Implement Color class
- [ ] Implement utility functions
- [ ] Implement exception classes
- [ ] Write unit tests for Snowflake

## Success Criteria
- [ ] `npm run build` produces ESM and CJS outputs
- [ ] `npm test` passes all Snowflake tests
- [ ] TypeScript compiles with zero errors
- [ ] Snowflake handles max Discord ID without precision loss

## Risk Assessment
- Low risk phase, standard TypeScript project setup
