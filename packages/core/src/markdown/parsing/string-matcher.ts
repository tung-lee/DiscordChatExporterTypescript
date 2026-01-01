import { StringSegment } from './string-segment.js';
import { ParsedMatch } from './parsed-match.js';
import { Matcher } from './matcher.js';

/**
 * Matcher for exact string patterns
 */
export class StringMatcher<TContext, TValue> implements Matcher<TContext, TValue> {
  constructor(
    private readonly pattern: string,
    private readonly transform: (
      segment: StringSegment,
      context: TContext
    ) => TValue | null
  ) {}

  tryMatch(context: TContext, segment: StringSegment): ParsedMatch<TValue> | null {
    const str = segment.toString();
    const index = str.indexOf(this.pattern);

    if (index === -1) {
      return null;
    }

    const matchSegment = segment.relocate(
      segment.startIndex + index,
      this.pattern.length
    );

    const value = this.transform(matchSegment, context);
    if (value === null) {
      return null;
    }

    return new ParsedMatch(matchSegment, value);
  }
}
