import { StringSegment } from './string-segment.js';
import { ParsedMatch } from './parsed-match.js';

/**
 * Interface for pattern matchers
 */
export interface Matcher<TContext, TValue> {
  tryMatch(context: TContext, segment: StringSegment): ParsedMatch<TValue> | null;
}

/**
 * Match all patterns in a segment, yielding results as found
 */
export function* matchAll<TContext, TValue>(
  matcher: Matcher<TContext, TValue>,
  context: TContext,
  segment: StringSegment,
  transformFallback: (context: TContext, segment: StringSegment) => TValue
): Generator<ParsedMatch<TValue>> {
  let currentIndex = segment.startIndex;

  while (currentIndex < segment.endIndex) {
    // Find a match within this segment
    const match = matcher.tryMatch(
      context,
      segment.relocate(currentIndex, segment.endIndex - currentIndex)
    );

    if (match === null) {
      break;
    }

    // If this match doesn't start immediately at current position, yield fallback first
    if (match.segment.startIndex > currentIndex) {
      const fallbackSegment = segment.relocate(
        currentIndex,
        match.segment.startIndex - currentIndex
      );

      yield new ParsedMatch(
        fallbackSegment,
        transformFallback(context, fallbackSegment)
      );
    }

    yield match;

    // Shift current index to end of match
    currentIndex = match.segment.startIndex + match.segment.length;
  }

  // If EOL hasn't been reached, yield remaining part as fallback
  if (currentIndex < segment.endIndex) {
    const fallbackSegment = segment.relocate(
      currentIndex,
      segment.endIndex - currentIndex
    );

    yield new ParsedMatch(
      fallbackSegment,
      transformFallback(context, fallbackSegment)
    );
  }
}
