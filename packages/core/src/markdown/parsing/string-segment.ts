/**
 * Represents a segment of a string
 */
export class StringSegment {
  constructor(
    readonly source: string,
    readonly startIndex: number,
    readonly length: number
  ) {}

  /**
   * Create a segment from the entire string
   */
  static from(source: string): StringSegment {
    return new StringSegment(source, 0, source.length);
  }

  /**
   * Get the end index (exclusive)
   */
  get endIndex(): number {
    return this.startIndex + this.length;
  }

  /**
   * Create a new segment with different bounds
   */
  relocate(newStartIndex: number, newLength: number): StringSegment {
    return new StringSegment(this.source, newStartIndex, newLength);
  }

  /**
   * Create a new segment from a regex capture
   */
  relocateToCapture(capture: { index: number; length: number }): StringSegment {
    return this.relocate(capture.index, capture.length);
  }

  /**
   * Get the string content of this segment
   */
  toString(): string {
    return this.source.substring(this.startIndex, this.endIndex);
  }
}
