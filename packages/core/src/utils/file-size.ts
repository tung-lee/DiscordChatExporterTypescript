/**
 * Represents a file size with formatting utilities
 */
export class FileSize {
  readonly totalBytes: number;

  constructor(bytes: number) {
    this.totalBytes = bytes;
  }

  get kilobytes(): number {
    return this.totalBytes / 1000;
  }

  get megabytes(): number {
    return this.totalBytes / 1000000;
  }

  get gigabytes(): number {
    return this.totalBytes / 1000000000;
  }

  /**
   * Format the file size as a human-readable string
   */
  format(): string {
    if (this.totalBytes >= 1000000000) {
      return `${this.gigabytes.toFixed(2)} GB`;
    }
    if (this.totalBytes >= 1000000) {
      return `${this.megabytes.toFixed(2)} MB`;
    }
    if (this.totalBytes >= 1000) {
      return `${this.kilobytes.toFixed(2)} KB`;
    }
    return `${this.totalBytes} B`;
  }

  toString(): string {
    return this.format();
  }

  /**
   * Parse a file size from a string like "10mb", "500kb", "1gb"
   */
  static tryParse(value: string): FileSize | null {
    const match = value.trim().match(/^\s*(\d+(?:[.,]?\d*)?)\s*(\w)?b\s*$/i);
    if (!match) {
      return null;
    }

    const number = parseFloat(match[1]!.replace(',', '.'));
    if (isNaN(number)) {
      return null;
    }

    const magnitude = (match[2]?.toUpperCase() ?? '') as 'G' | 'M' | 'K' | '';
    const multipliers: Record<typeof magnitude, number> = {
      G: 1000000000,
      M: 1000000,
      K: 1000,
      '': 1,
    };

    const multiplier = multipliers[magnitude];
    if (multiplier === undefined) {
      return null;
    }

    return new FileSize(Math.floor(number * multiplier));
  }

  /**
   * Parse a file size from a string. Throws if invalid.
   */
  static parse(value: string): FileSize {
    const result = FileSize.tryParse(value);
    if (!result) {
      throw new Error(`Invalid file size: '${value}'`);
    }
    return result;
  }
}
