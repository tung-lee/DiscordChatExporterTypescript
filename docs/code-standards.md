# Code Standards & Conventions

## TypeScript Configuration

### Compiler Settings

The project uses strict TypeScript with enhanced type safety:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Key Compiler Flags Explained

| Flag | Purpose |
|------|---------|
| `strict: true` | Enable all strict type-checking options |
| `noUncheckedIndexedAccess` | Array access returns `T \| undefined` |
| `exactOptionalPropertyTypes` | Distinguish `undefined` from missing |
| `noImplicitReturns` | Ensure all paths return a value |

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Classes | kebab-case | `discord-client.ts` |
| Types/Interfaces | kebab-case | `message-filter.ts` |
| Enums | kebab-case | `export-format.ts` |
| Utilities | kebab-case | `file-size.ts` |
| Tests | `*.test.ts` | `snowflake.test.ts` |

### Code Elements

```typescript
// Classes: PascalCase
class DiscordClient {}
class ExportRequest {}

// Interfaces: PascalCase
interface HasId {}
interface ExportRequestOptions {}

// Enums: PascalCase with PascalCase members
enum ExportFormat {
  PlainText = 'PlainText',
  HtmlDark = 'HtmlDark',
}

// Constants: UPPER_SNAKE_CASE
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const MAX_RETRIES = 5;
const PAGINATION_LIMIT = 100;

// Functions: camelCase
function parseExportFormat(value: string) {}
async function getMessages() {}

// Variables: camelCase
const channelId = Snowflake.parse(id);
let messageCount = 0;

// Private members: no prefix (TypeScript access modifiers)
private readonly token: string;
private resolvedTokenKind: TokenKind | null = null;

// Type parameters: Single uppercase letter or descriptive
function tryGet<T>(obj: Record<string, unknown>, key: string): T | undefined
interface Matcher<TContext, TValue> {}
```

## Code Organization

### Module Structure

```typescript
// 1. Imports (grouped)
// External packages
import { Command } from 'commander';
import { request } from 'undici';

// Internal modules (relative)
import { Snowflake } from '../discord/snowflake.js';
import { Message } from '../discord/data/message.js';

// 2. Constants
const MAX_RETRIES = 5;

// 3. Types/Interfaces
interface Config {}

// 4. Classes
export class MyClass {}

// 5. Functions
export function myFunction() {}

// 6. Default exports (if any, at the end)
```

### Class Structure

```typescript
export class ExampleClass {
  // 1. Static properties
  static readonly Zero = new ExampleClass();

  // 2. Instance properties (readonly first)
  readonly id: Snowflake;
  private cache: Map<string, Value>;

  // 3. Constructor
  constructor(id: Snowflake) {
    this.id = id;
    this.cache = new Map();
  }

  // 4. Getters/Setters
  get name(): string {
    return this._name;
  }

  // 5. Public methods
  async process(): Promise<void> {}

  // 6. Private methods
  private validate(): boolean {}

  // 7. Static methods
  static parse(json: Record<string, unknown>): ExampleClass {}
  static tryParse(value: string): ExampleClass | null {}
}
```

## Patterns & Practices

### Immutable Data Models

All Discord data models are immutable:

```typescript
// Good: readonly properties
class User implements HasId {
  readonly id: Snowflake;
  readonly name: string;
  readonly isBot: boolean;

  constructor(id: Snowflake, name: string, isBot: boolean) {
    this.id = id;
    this.name = name;
    this.isBot = isBot;
  }
}

// Good: readonly arrays
readonly attachments: readonly Attachment[];
```

### Parse Pattern

Data models use a consistent `parse()` / `tryParse()` pattern:

```typescript
class Snowflake {
  // Throws on invalid input
  static parse(value: string): Snowflake {
    const result = Snowflake.tryParse(value);
    if (!result) {
      throw new Error(`Invalid snowflake: '${value}'`);
    }
    return result;
  }

  // Returns null on invalid input
  static tryParse(value: string | null | undefined): Snowflake | null {
    if (!value || !value.trim()) {
      return null;
    }
    // ... parsing logic
    return new Snowflake(parsed);
  }
}
```

### Async Generators for Pagination

Large collections use async generators for memory efficiency:

```typescript
async *getMessages(channelId: Snowflake): AsyncGenerator<Message> {
  let cursor = Snowflake.Zero;

  while (true) {
    const batch = await this.fetchMessageBatch(channelId, cursor);

    if (batch.length === 0) {
      return;
    }

    for (const message of batch) {
      yield message;
      cursor = message.id;
    }
  }
}

// Usage
for await (const message of client.getMessages(channelId)) {
  // Process message
}
```

### Factory Pattern

Format-specific writers use factory pattern:

```typescript
class MessageWriterFactory {
  static create(filePath: string, context: ExportContext): MessageWriter {
    switch (context.request.format) {
      case ExportFormat.Json:
        return new JsonMessageWriter(filePath, context);
      case ExportFormat.HtmlDark:
      case ExportFormat.HtmlLight:
        return new HtmlMessageWriter(filePath, context);
      case ExportFormat.Csv:
        return new CsvMessageWriter(filePath, context);
      case ExportFormat.PlainText:
        return new PlainTextMessageWriter(filePath, context);
      default:
        throw new Error(`Unsupported format: ${context.request.format}`);
    }
  }
}
```

### Strategy Pattern

Message filters use strategy pattern with composition:

```typescript
abstract class MessageFilter {
  abstract isMatch(message: Message): boolean;

  and(other: MessageFilter): MessageFilter {
    return new BinaryExpressionMessageFilter(this, other, 'and');
  }

  or(other: MessageFilter): MessageFilter {
    return new BinaryExpressionMessageFilter(this, other, 'or');
  }

  negate(): MessageFilter {
    return new NegatedMessageFilter(this);
  }
}

// Concrete implementations
class ContainsMessageFilter extends MessageFilter { }
class FromMessageFilter extends MessageFilter { }
class HasMessageFilter extends MessageFilter { }
```

### Visitor Pattern

Markdown processing uses visitor pattern:

```typescript
abstract class MarkdownVisitor {
  protected async visitText(node: TextNode): Promise<void> {}
  protected async visitFormatting(node: FormattingNode): Promise<void> {}
  protected async visitEmoji(node: EmojiNode): Promise<void> {}
  // ... other node types

  async visit(node: MarkdownNode): Promise<void> {
    if (node instanceof TextNode) {
      await this.visitText(node);
    } else if (node instanceof FormattingNode) {
      await this.visitFormatting(node);
    }
    // ... dispatch to appropriate method
  }
}

// Usage
class HtmlMarkdownVisitor extends MarkdownVisitor {
  protected async visitFormatting(node: FormattingNode): Promise<void> {
    // Convert to HTML tags
  }
}
```

## Error Handling

### Exception Hierarchy

```typescript
// Base exception with fatal flag
class DiscordChatExporterError extends Error {
  readonly isFatal: boolean;

  constructor(message: string, isFatal = false, cause?: Error) {
    super(message);
    this.name = 'DiscordChatExporterError';
    this.isFatal = isFatal;
    this.cause = cause;
  }
}

// Domain-specific exceptions
class ChannelEmptyError extends DiscordChatExporterError {
  constructor(message: string) {
    super(message, false); // Non-fatal
  }
}
```

### Error Handling Pattern

```typescript
try {
  await exporter.exportChannel(request);
} catch (error) {
  if (error instanceof ChannelEmptyError) {
    // Non-fatal, continue processing
    console.warn(error.message);
  } else if (error instanceof DiscordChatExporterError) {
    if (error.isFatal) {
      // Fatal, stop processing
      throw error;
    }
    // Non-fatal, log and continue
    console.error(error.message);
  } else {
    // Unexpected error, re-throw
    throw error;
  }
}
```

## Caching Strategy

### Multi-Level Caching

```typescript
class ExportContext {
  // Level 1: Entity caches (populated once per export)
  private readonly membersById = new Map<string, Member | null>();
  private readonly channelsById = new Map<string, Channel>();
  private readonly rolesById = new Map<string, Role>();

  // Level 2: Computed caches (lazy-loaded)
  private readonly userRolesCache = new Map<string, Role[]>();
  private readonly userColorCache = new Map<string, Color | null>();

  // Cache check before API call
  async populateMember(id: Snowflake): Promise<void> {
    const idStr = id.toString();
    if (this.membersById.has(idStr)) {
      return; // Cache hit
    }
    // Fetch and cache
    const member = await this.discord.tryGetGuildMember(guildId, id);
    this.membersById.set(idStr, member);
  }
}
```

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Get all users referenced in this message with caching
 *
 * Returns an array containing all users that are referenced by this message:
 * - Message author
 * - Users mentioned in the message content
 * - Author of the referenced/replied message (if any)
 * - User who triggered the interaction (if any)
 *
 * Results are cached after first call for performance optimization.
 *
 * @returns Array of unique User objects referenced in this message
 *
 * @example
 * ```typescript
 * const users = message.getReferencedUsers();
 * // users = [author, mentionedUser1, replyAuthor]
 * ```
 *
 * @performance
 * - First call: O(n) where n = number of mentioned users
 * - Subsequent calls: O(1) - returns cached array
 */
getReferencedUsers(): User[] {
  // ...
}
```

### File Headers

```typescript
/**
 * Discord API client for fetching data
 * @module discord/discord-client
 */
```

## Import/Export Conventions

### Named Exports (Preferred)

```typescript
// utils/index.ts
export { FileSize } from './file-size.js';
export { Color } from './color.js';
export * from './extensions.js';
```

### ESM Extensions

Always include `.js` extension in imports:

```typescript
// Correct
import { Snowflake } from './snowflake.js';

// Incorrect (will fail at runtime)
import { Snowflake } from './snowflake';
```

## Testing Standards

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { FileSize } from '../../src/utils/file-size.js';

describe('FileSize', () => {
  describe('parse', () => {
    it('should parse megabytes', () => {
      const size = FileSize.parse('10mb');
      expect(size.megabytes).toBe(10);
    });

    it('should throw on invalid input', () => {
      expect(() => FileSize.parse('invalid')).toThrow();
    });
  });

  describe('format', () => {
    it('should format to human-readable string', () => {
      const size = new FileSize(1500000);
      expect(size.format()).toBe('1.50 MB');
    });
  });
});
```

### Test Naming

- Describe: Component/function name
- It: "should [expected behavior]"

## Performance Conventions

### Batch Processing

```typescript
// Process in batches to optimize API calls
const BATCH_SIZE = 50;
const messageBatch: Message[] = [];

for await (const message of getMessages()) {
  messageBatch.push(message);

  if (messageBatch.length >= BATCH_SIZE) {
    await processBatch(messageBatch);
    messageBatch.length = 0;
  }
}
```

### Parallel with Limits

```typescript
// Limit concurrent operations
const PARALLEL_LIMIT = 10;

for (let i = 0; i < items.length; i += PARALLEL_LIMIT) {
  const batch = items.slice(i, i + PARALLEL_LIMIT);
  await Promise.all(batch.map(item => processItem(item)));
}
```

## Git Conventions

### Commit Messages

```
<type>: <description>

[optional body]
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

### Branch Naming

- `main` - Production branch
- `feature/<name>` - New features
- `fix/<issue>` - Bug fixes
- `docs/<topic>` - Documentation updates

---

*Last Updated: 2026-01-01*
