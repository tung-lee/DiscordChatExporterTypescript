import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { User } from './user.js';

/**
 * Represents a Discord interaction (slash command, etc.)
 */
export class Interaction implements HasId {
  readonly id: Snowflake;
  readonly name: string;
  readonly user: User;

  constructor(id: Snowflake, name: string, user: User) {
    this.id = id;
    this.name = name;
    this.user = user;
  }

  /**
   * Parse an Interaction from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Interaction {
    const id = Snowflake.parse(json['id'] as string);
    const name = json['name'] as string;
    const user = User.parse(json['user'] as Record<string, unknown>);

    return new Interaction(id, name, user);
  }
}
