/**
 * Discord Snowflake ID type.
 * Discord uses 64-bit IDs that encode timestamp information.
 * We use BigInt to preserve full precision.
 *
 * Structure: timestamp_ms (42 bits) | worker_id (5 bits) | process_id (5 bits) | increment (12 bits)
 *
 * @see https://discord.com/developers/docs/reference#snowflakes
 */

const DISCORD_EPOCH = 1420070400000n; // Discord epoch: 2015-01-01T00:00:00.000Z

export class Snowflake {
  readonly value: bigint;

  constructor(value: bigint) {
    this.value = value;
  }

  /**
   * Extract the timestamp from the snowflake as a Date
   */
  toDate(): Date {
    const timestamp = (this.value >> 22n) + DISCORD_EPOCH;
    return new Date(Number(timestamp));
  }

  toString(): string {
    return this.value.toString();
  }

  toJSON(): string {
    return this.toString();
  }

  /**
   * Compare this snowflake with another
   */
  compareTo(other: Snowflake): number {
    if (this.value < other.value) return -1;
    if (this.value > other.value) return 1;
    return 0;
  }

  /**
   * Check if this snowflake is greater than another
   */
  isGreaterThan(other: Snowflake): boolean {
    return this.value > other.value;
  }

  /**
   * Check if this snowflake is less than another
   */
  isLessThan(other: Snowflake): boolean {
    return this.value < other.value;
  }

  /**
   * Check equality with another snowflake
   */
  equals(other: Snowflake | null | undefined): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  /**
   * Zero snowflake (used as initial cursor in pagination)
   */
  static readonly Zero = new Snowflake(0n);

  /**
   * Create a snowflake from a Date (useful for before/after boundaries)
   */
  static fromDate(date: Date): Snowflake {
    const ms = BigInt(date.getTime());
    return new Snowflake((ms - DISCORD_EPOCH) << 22n);
  }

  /**
   * Try to parse a snowflake from a string value.
   * Accepts either a numeric string or an ISO date string.
   */
  static tryParse(value: string | null | undefined): Snowflake | null {
    if (!value || !value.trim()) {
      return null;
    }

    const trimmed = value.trim();

    // Try parsing as a numeric string
    try {
      const numValue = BigInt(trimmed);
      return new Snowflake(numValue);
    } catch {
      // Not a valid number
    }

    // Try parsing as a date string
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return Snowflake.fromDate(date);
    }

    return null;
  }

  /**
   * Parse a snowflake from a string value.
   * Throws if the value is invalid.
   */
  static parse(value: string): Snowflake {
    const result = Snowflake.tryParse(value);
    if (!result) {
      throw new Error(`Invalid snowflake: '${value}'`);
    }
    return result;
  }
}
