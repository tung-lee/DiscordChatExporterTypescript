import { StringSegment } from './string-segment.js';

/**
 * Represents a parsed match result
 */
export class ParsedMatch<T> {
  constructor(
    readonly segment: StringSegment,
    readonly value: T
  ) {}
}
