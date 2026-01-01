import {
  MessageFilter,
  NullMessageFilter,
  ContainsMessageFilter,
  FromMessageFilter,
  MentionsMessageFilter,
  HasMessageFilter,
  ReactionMessageFilter,
  HasFilterKind,
} from './message-filter.js';

/**
 * Token types for filter parsing
 */
type Token =
  | { type: 'text'; value: string }
  | { type: 'quoted'; value: string }
  | { type: 'operator'; value: 'from' | 'mentions' | 'has' | 'reaction' }
  | { type: 'colon' }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'not' }
  | { type: 'and' }
  | { type: 'or' }
  | { type: 'eof' };

/**
 * Tokenize filter string
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    // Skip whitespace
    if (/\s/.test(input[i]!)) {
      i++;
      continue;
    }

    // Quoted string
    if (input[i] === '"') {
      i++;
      let value = '';
      while (i < input.length && input[i] !== '"') {
        if (input[i] === '\\' && i + 1 < input.length) {
          i++;
          value += input[i];
        } else {
          value += input[i];
        }
        i++;
      }
      if (i < input.length) i++; // Skip closing quote
      tokens.push({ type: 'quoted', value });
      continue;
    }

    // Parentheses
    if (input[i] === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (input[i] === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    // Colon
    if (input[i] === ':') {
      tokens.push({ type: 'colon' });
      i++;
      continue;
    }

    // Minus (negation) - only if at start or after space/paren
    if (input[i] === '-') {
      tokens.push({ type: 'not' });
      i++;
      continue;
    }

    // Word/text
    let word = '';
    while (i < input.length && !/[\s:()"\\-]/.test(input[i]!)) {
      word += input[i];
      i++;
    }

    if (word.length > 0) {
      const lower = word.toLowerCase();
      if (lower === 'from') {
        tokens.push({ type: 'operator', value: 'from' });
      } else if (lower === 'mentions') {
        tokens.push({ type: 'operator', value: 'mentions' });
      } else if (lower === 'has') {
        tokens.push({ type: 'operator', value: 'has' });
      } else if (lower === 'reaction') {
        tokens.push({ type: 'operator', value: 'reaction' });
      } else if (lower === 'and' || lower === '&' || lower === '&&') {
        tokens.push({ type: 'and' });
      } else if (lower === 'or' || lower === '|' || lower === '||') {
        tokens.push({ type: 'or' });
      } else if (lower === 'not' || lower === '!') {
        tokens.push({ type: 'not' });
      } else {
        tokens.push({ type: 'text', value: word });
      }
    }
  }

  tokens.push({ type: 'eof' });
  return tokens;
}

/**
 * Parser for filter expressions
 */
class FilterParser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  private current(): Token {
    return this.tokens[this.pos] ?? { type: 'eof' };
  }

  private advance(): Token {
    const token = this.current();
    this.pos++;
    return token;
  }

  private expect(type: Token['type']): Token {
    const token = this.current();
    if (token.type !== type) {
      throw new Error(`Expected ${type}, got ${token.type}`);
    }
    return this.advance();
  }

  parse(): MessageFilter {
    if (this.current().type === 'eof') {
      return NullMessageFilter.Instance;
    }
    return this.parseOr();
  }

  private parseOr(): MessageFilter {
    let left = this.parseAnd();

    while (this.current().type === 'or') {
      this.advance();
      const right = this.parseAnd();
      left = left.or(right);
    }

    return left;
  }

  private parseAnd(): MessageFilter {
    let left = this.parseUnary();

    // Implicit AND between terms
    while (
      this.current().type === 'and' ||
      (this.current().type !== 'or' &&
        this.current().type !== 'rparen' &&
        this.current().type !== 'eof')
    ) {
      if (this.current().type === 'and') {
        this.advance();
      }
      const right = this.parseUnary();
      left = left.and(right);
    }

    return left;
  }

  private parseUnary(): MessageFilter {
    if (this.current().type === 'not') {
      this.advance();
      return this.parsePrimary().negate();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): MessageFilter {
    const current = this.current();

    // Grouped expression
    if (current.type === 'lparen') {
      this.advance();
      const inner = this.parseOr();
      this.expect('rparen');
      return inner;
    }

    // Operator (from:, mentions:, has:, reaction:)
    if (current.type === 'operator') {
      const op = this.advance() as { type: 'operator'; value: string };
      this.expect('colon');
      const value = this.parseValue();
      return this.createOperatorFilter(op.value, value);
    }

    // Plain text (contains filter)
    if (current.type === 'text' || current.type === 'quoted') {
      const value = this.parseValue();
      return new ContainsMessageFilter(value);
    }

    throw new Error(`Unexpected token: ${current.type}`);
  }

  private parseValue(): string {
    const token = this.current();
    if (token.type === 'text') {
      this.advance();
      return token.value;
    }
    if (token.type === 'quoted') {
      this.advance();
      return token.value;
    }
    throw new Error(`Expected value, got ${token.type}`);
  }

  private createOperatorFilter(op: string, value: string): MessageFilter {
    switch (op) {
      case 'from':
        return new FromMessageFilter(value);
      case 'mentions':
        return new MentionsMessageFilter(value);
      case 'has':
        return new HasMessageFilter(this.parseHasKind(value));
      case 'reaction':
        return new ReactionMessageFilter(value);
      default:
        throw new Error(`Unknown operator: ${op}`);
    }
  }

  private parseHasKind(value: string): HasFilterKind {
    const lower = value.toLowerCase();
    const validKinds: HasFilterKind[] = [
      'link',
      'embed',
      'file',
      'video',
      'image',
      'sound',
      'sticker',
      'invite',
      'mention',
      'pin',
    ];

    if (validKinds.includes(lower as HasFilterKind)) {
      return lower as HasFilterKind;
    }

    // Aliases
    switch (lower) {
      case 'links':
      case 'url':
        return 'link';
      case 'embeds':
        return 'embed';
      case 'files':
      case 'attachment':
      case 'attachments':
        return 'file';
      case 'videos':
        return 'video';
      case 'images':
      case 'img':
        return 'image';
      case 'sounds':
      case 'audio':
        return 'sound';
      case 'stickers':
        return 'sticker';
      case 'invites':
        return 'invite';
      case 'mentions':
        return 'mention';
      case 'pinned':
        return 'pin';
      default:
        throw new Error(`Unknown has: kind '${value}'`);
    }
  }
}

/**
 * Parse a filter expression string
 *
 * Supports:
 * - Plain text: matches message content
 * - from:username - filter by author
 * - mentions:username - filter by mentioned user
 * - has:image|video|file|embed|link|sticker|sound|invite|mention|pin
 * - reaction:emoji - filter by reaction
 * - Parentheses for grouping
 * - Negation with - or not
 * - Conjunction with and, &, &&, or implicit (space)
 * - Disjunction with or, |, ||
 * - Quoted strings: "exact phrase"
 *
 * Examples:
 * - from:john has:image
 * - (from:john or from:jane) has:file
 * - -has:embed from:bot
 * - "hello world" from:user
 */
export function parseFilter(input: string): MessageFilter {
  const trimmed = input.trim();
  if (!trimmed) {
    return NullMessageFilter.Instance;
  }

  const tokens = tokenize(trimmed);
  const parser = new FilterParser(tokens);
  return parser.parse();
}

// Augment the MessageFilter class with a static parse method
// This avoids circular dependency issues
(MessageFilter as unknown as { parse: typeof parseFilter }).parse = parseFilter;
