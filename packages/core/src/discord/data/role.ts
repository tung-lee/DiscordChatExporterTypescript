import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { Color } from '../../utils/color.js';

/**
 * Represents a Discord role
 * @see https://discord.com/developers/docs/topics/permissions#role-object
 */
export class Role implements HasId {
  readonly id: Snowflake;
  readonly name: string;
  readonly color: Color | null;
  readonly position: number;

  constructor(
    id: Snowflake,
    name: string,
    color: Color | null,
    position: number
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.position = position;
  }

  /**
   * Parse a Role from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Role {
    const id = Snowflake.parse(json['id'] as string);
    const name = json['name'] as string;
    const position = json['position'] as number;

    const colorValue = json['color'] as number | undefined;
    const color =
      colorValue !== undefined && colorValue !== 0
        ? Color.fromInt(colorValue)
        : null;

    return new Role(id, name, color, position);
  }
}
