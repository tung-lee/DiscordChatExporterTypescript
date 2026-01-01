# Phase 4: Markdown Parser

## Context
- Reference: `source_ref/DiscordChatExporter.Core/Markdown/`
- Dependencies: Phase 1, Phase 2 (for Snowflake, Emoji)

## Overview
| Property | Value |
|----------|-------|
| Priority | High |
| Status | Pending |
| Estimated Files | ~20 |

## Key Insights
- Discord does NOT use recursive-descent parsing
- Uses regex matchers in priority order
- First match wins, then continues with remainder
- Max recursion depth: 32

## Requirements
- Match Discord's parsing behavior exactly
- Handle all formatting, mentions, emoji, timestamps
- Visitor pattern for rendering

## Implementation Steps

### 1. Implement AST Nodes
Directory: `src/markdown/`
- [ ] `markdown-node.ts` - base type
- [ ] `container-node.ts` - IContainerNode interface
- [ ] `text-node.ts`
- [ ] `formatting-node.ts` - FormattingKind enum
- [ ] `heading-node.ts` - level 1-3
- [ ] `list-node.ts` + `list-item-node.ts`
- [ ] `inline-code-block-node.ts`
- [ ] `multi-line-code-block-node.ts`
- [ ] `link-node.ts` - url, children
- [ ] `emoji-node.ts` - id?, name, isAnimated
- [ ] `mention-node.ts` - targetId, MentionKind
- [ ] `timestamp-node.ts` - instant, format

### 2. Implement Matcher System
Directory: `src/markdown/parsing/`
- [ ] `string-segment.ts` - source, start, length
- [ ] `parsed-match.ts` - segment, value
- [ ] `matcher.ts` - IMatcher interface
- [ ] `string-matcher.ts` - exact string match
- [ ] `regex-matcher.ts` - regex with captures
- [ ] `aggregate-matcher.ts` - ordered list

### 3. Implement FormattingKind Enum
```typescript
enum FormattingKind {
  Bold, Italic, Underline,
  Strikethrough, Spoiler, Quote
}
```

### 4. Implement MentionKind Enum
```typescript
enum MentionKind {
  User, Channel, Role, Everyone, Here
}
```

### 5. Implement Markdown Matchers
File: `src/markdown/parsing/markdown-parser.ts`

Formatting:
- [ ] Bold: `\*\*(.+?)\*\*(?!\*)`
- [ ] Italic: `\*(?!\s)(.+?)(?<!\s|\*)\*(?!\*)`
- [ ] ItalicBold: `\*(\*\*.+?\*\*)\*(?!\*)`
- [ ] ItalicAlt: `_(.+?)_(?!\w)`
- [ ] Underline: `__(.+?)__(?!_)`
- [ ] ItalicUnderline: `_(__.+?__)_(?!_)`
- [ ] Strikethrough: `~~(.+?)~~`
- [ ] Spoiler: `\|\|(.+?)\|\|`

Quotes:
- [ ] SingleLineQuote: `^>\s(.+\n?)`
- [ ] RepeatedSingleLineQuote: `(?:^>\s(.*\n?)){2,}`
- [ ] MultiLineQuote: `^>>>\s(.+)`

Structure:
- [ ] Heading: `^(\#{1,3})\s(.+)\n`
- [ ] List: `^(\s*)(?:[\-\*]\s(.+(?:\n\s\1.*)*)?\n?)+`

Code:
- [ ] InlineCode: `` `{1,2})([^`]+)\1 ``
- [ ] MultiLineCode: ` ```(?:(\w*)\n)?(.+?)``` `

Mentions:
- [ ] Everyone: `@everyone`
- [ ] Here: `@here`
- [ ] User: `<@!?(\d+)>`
- [ ] Channel: `<\#!?(\d+)>`
- [ ] Role: `<@&(\d+)>`

Emoji:
- [ ] Standard: Unicode patterns
- [ ] CodedStandard: `:(\w+):`
- [ ] Custom: `<(a)?:(.+?):(\d+?)>`

Links:
- [ ] Auto: `(https?://\S*[^\.,:;""'\s])`
- [ ] Hidden: `<(https?://\S*[^\.,:;""'\s])>`
- [ ] Masked: `\[(.+?)\]\((.+?)\)`

Misc:
- [ ] Timestamp: `<t:(-?\d+)(?::(\w))?>`
- [ ] Shrug escape: `\_(ツ)_/`
- [ ] Escaped characters

### 6. Implement MarkdownParser
File: `src/markdown/parsing/markdown-parser.ts`
- [ ] parse(markdown): IReadOnlyList<MarkdownNode>
- [ ] parseMinimal(markdown): Mentions, custom emoji, timestamps only
- [ ] extractLinks(markdown)
- [ ] extractEmojis(markdown)
- [ ] Recursion depth limit (32)

### 7. Implement MarkdownVisitor
File: `src/markdown/parsing/markdown-visitor.ts`
- [ ] Abstract async visitor methods
- [ ] Default implementations that visit children
- [ ] visit(nodes) entry point

## Todo List
- [ ] Create all node types
- [ ] Implement StringSegment
- [ ] Implement matcher classes
- [ ] Implement all regex matchers
- [ ] Implement AggregateMatcher with priority order
- [ ] Implement MarkdownParser
- [ ] Implement MarkdownVisitor base
- [ ] Write comprehensive parser tests

## Success Criteria
- [ ] Parser produces identical output to C# for test cases
- [ ] Handles nested formatting correctly
- [ ] Shrug kaomoji escapes properly
- [ ] Invalid timestamps produce "Invalid Date"

## Risk Assessment
- High complexity, many regex patterns
- Edge cases with nested/overlapping formatting
- Need extensive test cases from C# implementation
