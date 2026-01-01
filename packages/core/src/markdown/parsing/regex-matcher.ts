import { StringSegment } from './string-segment.js';
import { ParsedMatch } from './parsed-match.js';
import { Matcher } from './matcher.js';

/**
 * Extended match result with capture groups
 */
export interface RegexMatchResult {
  index: number;
  length: number;
  groups: RegexGroup[];
}

/**
 * Capture group in a regex match
 */
export interface RegexGroup {
  value: string;
  index: number;
  length: number;
  captures: RegexCapture[];
}

/**
 * Individual capture in a group
 */
export interface RegexCapture {
  value: string;
  index: number;
  length: number;
}

/**
 * Matcher for regex patterns
 */
export class RegexMatcher<TContext, TValue> implements Matcher<TContext, TValue> {
  private readonly regex: RegExp;

  constructor(
    regex: RegExp,
    private readonly transform: (
      context: TContext,
      segment: StringSegment,
      match: RegexMatchResult
    ) => TValue | null
  ) {
    // Ensure the regex has the necessary flags
    let flags = regex.flags;
    if (!flags.includes('g')) {
      flags += 'g';
    }
    // Create a new regex with 'd' flag for indices if supported
    this.regex = new RegExp(regex.source, flags);
  }

  tryMatch(context: TContext, segment: StringSegment): ParsedMatch<TValue> | null {
    // Reset regex state
    this.regex.lastIndex = 0;

    const str = segment.toString();
    const match = this.regex.exec(str);

    if (!match) {
      return null;
    }

    // For multiline patterns, verify the match works on the full context
    // This handles ^ and $ properly
    if (this.regex.multiline) {
      const fullStr = segment.source.substring(0, segment.endIndex);
      const testRegex = new RegExp(this.regex.source, this.regex.flags);
      testRegex.lastIndex = segment.startIndex;
      const fullMatch = testRegex.exec(fullStr);
      if (!fullMatch || fullMatch.index !== segment.startIndex + match.index) {
        return null;
      }
    }

    // Build the match result with groups
    const groups: RegexGroup[] = [];
    for (let i = 0; i < match.length; i++) {
      const value = match[i] ?? '';
      // Estimate the index - for simple cases this works
      const groupIndex = str.indexOf(value, i === 0 ? match.index : 0);
      groups.push({
        value,
        index: segment.startIndex + (groupIndex >= 0 ? groupIndex : match.index),
        length: value.length,
        captures: [
          {
            value,
            index: segment.startIndex + (groupIndex >= 0 ? groupIndex : match.index),
            length: value.length,
          },
        ],
      });
    }

    // Handle repeated captures for patterns like (?:pattern)+
    // This is a simplified version - for complex patterns, we may need more logic
    const matchResult: RegexMatchResult = {
      index: segment.startIndex + match.index,
      length: match[0].length,
      groups,
    };

    const matchSegment = segment.relocate(
      segment.startIndex + match.index,
      match[0].length
    );

    const value = this.transform(context, matchSegment, matchResult);
    if (value === null) {
      return null;
    }

    return new ParsedMatch(matchSegment, value);
  }
}
