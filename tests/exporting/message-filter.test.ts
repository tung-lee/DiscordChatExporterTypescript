import { describe, it, expect, beforeAll } from 'vitest';
import { MessageFilter, NullMessageFilter } from '../../src/exporting/filtering/message-filter.js';
import { parseFilter } from '../../src/exporting/filtering/filter-grammar.js';
import { Message } from '../../src/discord/data/message.js';
import { User } from '../../src/discord/data/user.js';
import { Snowflake } from '../../src/discord/snowflake.js';
import { MessageKind, MessageFlags } from '../../src/discord/data/enums.js';

// Ensure filter-grammar is loaded to add parse method to MessageFilter
beforeAll(() => {
  // Import to trigger the side effect
  parseFilter('');
});

// Helper to create a test user
function createUser(name: string, id?: string): User {
  const snowflakeId = Snowflake.parse(id ?? '123456789');
  return new User(
    snowflakeId,
    false, // isBot
    1, // discriminator
    name, // name
    name, // displayName
    'https://cdn.discordapp.com/embed/avatars/0.png' // avatarUrl
  );
}

// Helper to create a test message
function createMessage(options: {
  content?: string;
  authorName?: string;
  authorId?: string;
}): Message {
  const author = createUser(options.authorName ?? 'TestUser', options.authorId);

  return new Message(
    Snowflake.parse('111111111'),
    MessageKind.Default,
    MessageFlags.None,
    author,
    new Date(),
    null,
    null,
    false,
    options.content ?? '',
    [],
    [],
    [],
    [],
    [],
    null,
    null,
    null
  );
}

describe('MessageFilter', () => {
  describe('Null filter', () => {
    it('should match everything', () => {
      const filter = MessageFilter.Null;
      expect(filter).toBe(NullMessageFilter.Instance);
      expect(filter.isMatch(createMessage({ content: 'hello' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: '' }))).toBe(true);
    });
  });

  describe('parseFilter', () => {
    it('should return NullMessageFilter for empty input', () => {
      expect(parseFilter('')).toBe(NullMessageFilter.Instance);
      expect(parseFilter('  ')).toBe(NullMessageFilter.Instance);
    });

    it('should parse simple contains filter', () => {
      const filter = parseFilter('hello');
      expect(filter.isMatch(createMessage({ content: 'hello world' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'HELLO world' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'goodbye' }))).toBe(false);
    });

    it('should parse quoted contains filter', () => {
      const filter = parseFilter('"hello world"');
      expect(filter.isMatch(createMessage({ content: 'say hello world!' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'hello there world' }))).toBe(false);
    });

    it('should parse from: filter (exact match, case insensitive)', () => {
      const filter = parseFilter('from:john');
      expect(filter.isMatch(createMessage({ authorName: 'John' }))).toBe(true);
      expect(filter.isMatch(createMessage({ authorName: 'JOHN' }))).toBe(true);
      expect(filter.isMatch(createMessage({ authorName: 'johnny' }))).toBe(false); // exact match only
      expect(filter.isMatch(createMessage({ authorName: 'Jane' }))).toBe(false);
    });

    it('should parse negated filter', () => {
      const filter = parseFilter('-hello');
      expect(filter.isMatch(createMessage({ content: 'hello' }))).toBe(false);
      expect(filter.isMatch(createMessage({ content: 'goodbye' }))).toBe(true);
    });

    it('should parse AND expression (implicit)', () => {
      const filter = parseFilter('hello world');
      expect(filter.isMatch(createMessage({ content: 'hello world' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'hello there' }))).toBe(false);
      expect(filter.isMatch(createMessage({ content: 'world peace' }))).toBe(false);
    });

    it('should parse AND expression (explicit)', () => {
      const filter = parseFilter('hello and world');
      expect(filter.isMatch(createMessage({ content: 'hello world' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'hello there' }))).toBe(false);
    });

    it('should parse OR expression', () => {
      const filter = parseFilter('hello or goodbye');
      expect(filter.isMatch(createMessage({ content: 'hello' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'goodbye' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'world' }))).toBe(false);
    });

    it('should parse grouped expression', () => {
      const filter = parseFilter('(hello or goodbye) world');
      expect(filter.isMatch(createMessage({ content: 'hello world' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'goodbye world' }))).toBe(true);
      expect(filter.isMatch(createMessage({ content: 'hello there' }))).toBe(false);
    });

    it('should parse complex expression', () => {
      const filter = parseFilter('from:john (hello or hi)');
      expect(filter.isMatch(createMessage({ authorName: 'John', content: 'hello' }))).toBe(true);
      expect(filter.isMatch(createMessage({ authorName: 'John', content: 'hi' }))).toBe(true);
      expect(filter.isMatch(createMessage({ authorName: 'John', content: 'hey' }))).toBe(false);
      expect(filter.isMatch(createMessage({ authorName: 'Jane', content: 'hello' }))).toBe(false);
    });
  });

  describe('MessageFilter static parse', () => {
    it('should be available as static method', () => {
      expect(typeof MessageFilter.parse).toBe('function');
    });

    it('should work correctly', () => {
      const filter = MessageFilter.parse('hello');
      expect(filter.isMatch(createMessage({ content: 'hello' }))).toBe(true);
    });
  });

  describe('Filter chaining', () => {
    it('should support and()', () => {
      const filter1 = parseFilter('hello');
      const filter2 = parseFilter('world');
      const combined = filter1.and(filter2);

      expect(combined.isMatch(createMessage({ content: 'hello world' }))).toBe(true);
      expect(combined.isMatch(createMessage({ content: 'hello' }))).toBe(false);
    });

    it('should support or()', () => {
      const filter1 = parseFilter('hello');
      const filter2 = parseFilter('goodbye');
      const combined = filter1.or(filter2);

      expect(combined.isMatch(createMessage({ content: 'hello' }))).toBe(true);
      expect(combined.isMatch(createMessage({ content: 'goodbye' }))).toBe(true);
      expect(combined.isMatch(createMessage({ content: 'world' }))).toBe(false);
    });

    it('should support negate()', () => {
      const filter = parseFilter('hello').negate();

      expect(filter.isMatch(createMessage({ content: 'hello' }))).toBe(false);
      expect(filter.isMatch(createMessage({ content: 'world' }))).toBe(true);
    });
  });
});
