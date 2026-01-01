# Phase 6: Format Writers

## Context
- Reference: `source_ref/DiscordChatExporter.Core/Exporting/*MessageWriter.cs`
- Dependencies: Phase 5

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~10 |

## Key Insights
- Each format has specific writer class
- HTML uses templates (need alternative approach)
- JSON uses streaming writer
- PlainText/CSV need markdown stripping

## Requirements
- Faithful reproduction of C# output
- Proper encoding for each format
- Efficient streaming output

## Implementation Steps

### 1. Implement PlainTextMarkdownVisitor
File: `src/exporting/plain-text-markdown-visitor.ts`
- [ ] Format mentions as @username
- [ ] Format custom emoji as :name:
- [ ] Format timestamps
- [ ] Strip other formatting

### 2. Implement PlainTextMessageWriter
File: `src/exporting/plain-text-message-writer.ts`
```
============================================================
Guild: GuildName (ID)
Channel: ChannelName / Topic

============================================================
[2024-01-01 12:00] Author (pinned)
Content here

{Attachment: file.png (123 KB)}

{Embed: Title}
Description

{Reactions: :emoji: (5)}

------------------------------------------------------------
[2024-01-01 12:01] Another Author
...
============================================================
Exported 100 message(s)
```

### 3. Implement CsvMessageWriter
File: `src/exporting/csv-message-writer.ts`
- [ ] Columns: AuthorID, Author, Date, Content, Attachments, Reactions
- [ ] Proper CSV escaping (quotes, newlines)
- [ ] UTF-8 BOM for Excel compatibility

### 4. Implement JsonMessageWriter
File: `src/exporting/json-message-writer.ts`
- [ ] Streaming JSON with Utf8JsonWriter equivalent
- [ ] JavaScriptEncoder.UnsafeRelaxedJsonEscaping equivalent
- [ ] Full message structure with nested objects
- [ ] Inline emoji extraction

Schema:
```json
{
  "guild": { "id", "name", "iconUrl" },
  "channel": { "id", "type", "categoryId", "category", "name", "topic" },
  "dateRange": { "after", "before" },
  "exportedAt": "...",
  "messages": [...],
  "messageCount": 100
}
```

### 5. Implement HtmlMarkdownVisitor
File: `src/exporting/html-markdown-visitor.ts`
- [ ] HTML entity encoding
- [ ] CSS class application
- [ ] Spoiler tags with interactivity
- [ ] Jumbo emoji detection (1-27 emoji only)
- [ ] Code block syntax highlighting hints

### 6. Implement HTML Templates
Directory: `src/exporting/html/`
- [ ] `preamble.ts` - HTML head, CSS, scripts
- [ ] `message-group.ts` - Message grouping logic
- [ ] `postamble.ts` - Footer
- [ ] `styles.ts` - CSS for dark/light themes
- [ ] Template literal approach (no Razor)

### 7. Implement HtmlMessageWriter
File: `src/exporting/html-message-writer.ts`
- [ ] Message grouping (same author, <7 min gap)
- [ ] System notification rendering
- [ ] Reply/interaction rendering
- [ ] Attachment/embed rendering
- [ ] Theme support (dark/light)
- [ ] HTML minification

### 8. Implement MessageExporter
File: `src/exporting/message-exporter.ts`
- [ ] Partition management
- [ ] File path generation for partitions
- [ ] Factory for format-specific writers
- [ ] messagesExported tracking

## Todo List
- [ ] Implement PlainTextMarkdownVisitor
- [ ] Implement PlainTextMessageWriter
- [ ] Implement CsvMessageWriter
- [ ] Implement JsonMessageWriter
- [ ] Implement HtmlMarkdownVisitor
- [ ] Create HTML template system
- [ ] Implement HtmlMessageWriter
- [ ] Implement MessageExporter
- [ ] Write snapshot tests for each format

## Success Criteria
- [ ] Each format produces valid output
- [ ] Output matches C# version structure
- [ ] HTML is valid and renders correctly
- [ ] JSON is valid and parseable

## Risk Assessment
- High complexity for HTML writer
- Need to handle all message types
- CSS must match Discord's styling
