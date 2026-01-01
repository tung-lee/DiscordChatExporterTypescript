/**
 * Represents an embed field
 */
export class EmbedField {
  readonly name: string;
  readonly value: string;
  readonly isInline: boolean;

  constructor(name: string, value: string, isInline: boolean) {
    this.name = name;
    this.value = value;
    this.isInline = isInline;
  }

  static parse(json: Record<string, unknown>): EmbedField {
    const name = json['name'] as string;
    const value = json['value'] as string;
    const isInline = (json['inline'] as boolean | undefined) ?? false;

    return new EmbedField(name, value, isInline);
  }
}
