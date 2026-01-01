import { StringSegment } from './string-segment.js';
import { ParsedMatch } from './parsed-match.js';
import { Matcher } from './matcher.js';

/**
 * Matcher that tries multiple matchers and returns the earliest match
 */
export class AggregateMatcher<TContext, TValue> implements Matcher<TContext, TValue> {
  private readonly matchers: readonly Matcher<TContext, TValue>[];

  constructor(...matchers: Matcher<TContext, TValue>[]) {
    this.matchers = matchers;
  }

  tryMatch(context: TContext, segment: StringSegment): ParsedMatch<TValue> | null {
    let earliestMatch: ParsedMatch<TValue> | null = null;

    // Try to match with each matcher and get the match with the lowest start index
    for (const matcher of this.matchers) {
      const match = matcher.tryMatch(context, segment);

      if (match === null) {
        continue;
      }

      // If this match is earlier than previous earliest, replace
      if (
        earliestMatch === null ||
        match.segment.startIndex < earliestMatch.segment.startIndex
      ) {
        earliestMatch = match;
      }

      // If the earliest match starts at the very beginning, break
      // because it's impossible to find a match earlier than that
      if (earliestMatch.segment.startIndex === segment.startIndex) {
        break;
      }
    }

    return earliestMatch;
  }
}
