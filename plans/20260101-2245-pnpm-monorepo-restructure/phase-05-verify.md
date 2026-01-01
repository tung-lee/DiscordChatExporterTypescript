# Phase 5: Build, Test, Verify

## Context
Verify the monorepo restructure works correctly

## Tasks

- [ ] Run `pnpm install` to install dependencies
- [ ] Run `pnpm build` to build both packages
- [ ] Run `pnpm test` to verify tests pass
- [ ] Run `pnpm typecheck` to verify no type errors
- [ ] Test CLI manually: `node packages/cli/dist/cli.js --help`
- [ ] Verify SDK exports work correctly

## Verification Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Build both packages (core first, then cli)
pnpm build

# 3. Check build output
ls packages/core/dist/
# index.js, index.cjs, index.d.ts

ls packages/cli/dist/
# cli.js

# 4. Run tests
pnpm test:run

# 5. Type check
pnpm typecheck

# 6. Test CLI
node packages/cli/dist/cli.js --help

# 7. Test SDK import
node -e "import('@discord-chat-exporter/core').then(m => console.log(Object.keys(m)))"
```

## Expected Outputs

### CLI --help
```
Usage: discord-chat-exporter [options] [command]

CLI for exporting Discord chat history

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  export [options]    Export channel(s) to file
  exportguild [options]  Export all channels in a guild
  guilds [options]    List available guilds
  channels [options]  List channels in a guild
  dms [options]       List direct message channels
  help [command]      display help for command
```

### SDK Exports
Should include: Snowflake, DiscordClient, ChannelExporter, ExportFormat, etc.

## Success Criteria

| Check | Status |
|-------|--------|
| `pnpm install` succeeds | [ ] |
| `pnpm build` succeeds | [ ] |
| `pnpm test:run` passes | [ ] |
| `pnpm typecheck` passes | [ ] |
| CLI --help works | [ ] |
| SDK imports work | [ ] |
