/**
 * Represents a color with RGB components
 */
export class Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;

  constructor(r: number, g: number, b: number) {
    this.r = Math.max(0, Math.min(255, Math.floor(r)));
    this.g = Math.max(0, Math.min(255, Math.floor(g)));
    this.b = Math.max(0, Math.min(255, Math.floor(b)));
  }

  /**
   * Convert to hex string (e.g., "#FF5733")
   */
  toHex(): string {
    const r = this.r.toString(16).padStart(2, '0');
    const g = this.g.toString(16).padStart(2, '0');
    const b = this.b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }

  /**
   * Convert to CSS rgb() string
   */
  toRgb(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  /**
   * Convert to integer value (used by Discord API)
   */
  toInt(): number {
    return (this.r << 16) | (this.g << 8) | this.b;
  }

  toString(): string {
    return this.toHex();
  }

  /**
   * Create a Color from a Discord API integer value
   */
  static fromInt(value: number): Color {
    const r = (value >> 16) & 0xff;
    const g = (value >> 8) & 0xff;
    const b = value & 0xff;
    return new Color(r, g, b);
  }

  /**
   * Create a Color from a hex string
   */
  static fromHex(hex: string): Color {
    const cleaned = hex.replace('#', '');
    const value = parseInt(cleaned, 16);
    return Color.fromInt(value);
  }

  /**
   * Try to parse a color from a string (hex) or number
   */
  static tryParse(value: string | number | null | undefined): Color | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return Color.fromInt(value);
    }

    if (typeof value === 'string') {
      const cleaned = value.replace('#', '');
      const parsed = parseInt(cleaned, 16);
      if (!isNaN(parsed)) {
        return Color.fromInt(parsed);
      }
    }

    return null;
  }
}
