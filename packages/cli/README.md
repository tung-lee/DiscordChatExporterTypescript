# @discord-chat-exporter/cli

Command-line interface for exporting Discord chat history to various formats.

[![npm](https://img.shields.io/npm/v/@discord-chat-exporter/cli)](https://www.npmjs.com/package/@discord-chat-exporter/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -g @discord-chat-exporter/cli
```

Or run directly with npx:

```bash
npx @discord-chat-exporter/cli --help
```

## Requirements

- Node.js >= 20.0.0
- Discord authentication token (user or bot)

## Quick Start

```bash
# Export a single channel
discord-chat-exporter export -t "YOUR_TOKEN" -c "CHANNEL_ID"

# Export entire guild
discord-chat-exporter exportguild -t "YOUR_TOKEN" -g "GUILD_ID"

# List your guilds
discord-chat-exporter guilds -t "YOUR_TOKEN"
```

## Commands

### export

Export one or more channels to a file.

```bash
discord-chat-exporter export [options]
```

**Required:**
- `-t, --token <token>` - Discord authentication token
- `-c, --channel <ids...>` - Channel ID(s) to export

**Options:**
- `-o, --output <path>` - Output file path or directory (default: current directory)
- `-f, --format <format>` - Export format (default: `html-dark`)
- `--after <date>` - Only include messages after this date or message ID
- `--before <date>` - Only include messages before this date or message ID
- `--filter <expression>` - Message filter expression
- `--partition <limit>` - Split output by message count or file size
- `--media` - Download media attachments
- `--reuse-media` - Reuse previously downloaded media
- `--media-dir <path>` - Directory to download media to
- `--no-markdown` - Disable markdown processing
- `--utc` - Normalize timestamps to UTC
- `--locale <locale>` - Locale for date/number formatting
- `--parallel <count>` - Number of channels to export in parallel (default: 1)

**Examples:**

```bash
# Export to JSON
discord-chat-exporter export -t TOKEN -c 123456789 -f json -o ./export.json

# Export with date range
discord-chat-exporter export -t TOKEN -c 123456789 \
  --after "2024-01-01" --before "2024-12-31"

# Export with filter and media download
discord-chat-exporter export -t TOKEN -c 123456789 \
  --filter "has:attachment" --media --media-dir ./media

# Export multiple channels in parallel
discord-chat-exporter export -t TOKEN -c 111 222 333 \
  -o ./exports/ --parallel 3
```

### exportguild

Export all channels in a guild.

```bash
discord-chat-exporter exportguild [options]
```

**Required:**
- `-t, --token <token>` - Discord authentication token
- `-g, --guild <id>` - Guild ID

**Options:**
Same as `export` command, plus:
- `--threads` - Include threads

**Examples:**

```bash
# Export entire guild with threads
discord-chat-exporter exportguild -t TOKEN -g 123456789 \
  --threads -o ./guild-export/

# Export guild in parallel
discord-chat-exporter exportguild -t TOKEN -g 123456789 \
  --parallel 5 -f json
```

### guilds

List available guilds.

```bash
discord-chat-exporter guilds -t <token>
```

**Output:**
```
Found 3 guild(s):
  123456789012345678 | My Server
  234567890123456789 | Another Server
  345678901234567890 | Third Server
```

### channels

List channels in a guild.

```bash
discord-chat-exporter channels -t <token> -g <guild_id> [--threads]
```

**Options:**
- `--threads` - Include threads

**Output:**
```
Found 10 channel(s):
  111111111111111111 | Text | general
  222222222222222222 | Voice | Voice Chat
  333333333333333333 | Category | Information
    444444444444444444 | Thread | Discussion Thread
```

### dms

List direct message channels.

```bash
discord-chat-exporter dms -t <token>
```

**Output:**
```
Found 5 DM channel(s):
  111111111111111111 | DM | User#1234
  222222222222222222 | Group | Group Chat Name
```

## Export Formats

| Format | Value | Description |
|--------|-------|-------------|
| HTML Dark | `html-dark` | Styled HTML with dark theme (default) |
| HTML Light | `html-light` | Styled HTML with light theme |
| JSON | `json` | Structured JSON for data processing |
| CSV | `csv` | Tabular format for spreadsheets |
| Plain Text | `txt` | Simple text format |

## Filter Expressions

Filter messages during export using expressions:

```bash
# Messages from a specific user
--filter "from:username"
--filter "from:123456789012345678"  # By user ID

# Messages with specific content
--filter "has:attachment"
--filter "has:embed"
--filter "has:image"
--filter "has:video"
--filter "has:link"
--filter "has:mention"
--filter "has:sticker"

# Messages containing text
--filter "contains:hello"

# Pinned messages
--filter "is:pinned"

# Combine filters
--filter "from:username and has:image"
--filter "has:attachment or has:embed"
--filter "(from:user1 or from:user2) and has:image"

# Exclude messages
--filter "-has:embed"
--filter "from:username -has:link"
```

## Partition Limits

Split large exports into multiple files:

```bash
# By message count
--partition 1000     # 1000 messages per file
--partition 5000     # 5000 messages per file

# By file size
--partition 10mb     # 10 megabytes per file
--partition 500kb    # 500 kilobytes per file
--partition 1gb      # 1 gigabyte per file
```

Output files are named with part numbers: `export [part 1].html`, `export [part 2].html`, etc.

## Output Path Templates

When exporting multiple channels, use template placeholders:

| Placeholder | Description |
|-------------|-------------|
| `%g` | Guild ID |
| `%G` | Guild name |
| `%c` | Channel ID |
| `%C` | Channel name |
| `%t` | Channel type |
| `%p` | Channel category ID |
| `%P` | Channel category name |
| `%a` | After date |
| `%b` | Before date |
| `%d` | Export date |
| `%%` | Literal % |

**Example:**
```bash
discord-chat-exporter exportguild -t TOKEN -g GUILD \
  -o "./exports/%G/%C.html"
```

## Authentication

### User Token

1. Open Discord in browser
2. Press `F12` for Developer Tools
3. Go to Console tab
4. Paste and run:
   ```javascript
   (webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
   ```

### Bot Token

1. Create application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Go to Bot settings
3. Enable "Message Content Intent"
4. Copy the token
5. Use with `Bot` prefix:
   ```bash
   discord-chat-exporter export -t "Bot YOUR_BOT_TOKEN" -c CHANNEL_ID
   ```

## Troubleshooting

### Authentication Errors
- Verify your token is correct and not expired
- For bot tokens, include the `Bot` prefix
- Regenerate token if compromised

### Rate Limit Errors
- Reduce `--parallel` count
- Wait a few minutes before retrying
- Bot tokens generally have higher rate limits

### Missing Messages
- For bot tokens, ensure "Message Content Intent" is enabled
- Check that you have permission to read the channel
- Deleted messages cannot be recovered

### Empty Export
- Verify the channel contains messages in the specified date range
- Check if your filter expression is too restrictive

## Related Packages

- [@discord-chat-exporter/core](https://www.npmjs.com/package/@discord-chat-exporter/core) - SDK for programmatic usage

## License

MIT
