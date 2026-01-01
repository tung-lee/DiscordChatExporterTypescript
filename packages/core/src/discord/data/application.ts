import { Snowflake } from '../snowflake.js';
import type { HasId } from './common/has-id.js';
import { ApplicationFlags } from './enums.js';

/**
 * Represents a Discord application (bot)
 * @see https://discord.com/developers/docs/resources/application#application-object
 */
export class Application implements HasId {
  readonly id: Snowflake;
  readonly name: string;
  readonly flags: ApplicationFlags;

  constructor(id: Snowflake, name: string, flags: ApplicationFlags) {
    this.id = id;
    this.name = name;
    this.flags = flags;
  }

  /**
   * Whether the bot has the Message Content Intent enabled
   */
  get isMessageContentIntentEnabled(): boolean {
    return (
      (this.flags & ApplicationFlags.GatewayMessageContent) !== 0 ||
      (this.flags & ApplicationFlags.GatewayMessageContentLimited) !== 0
    );
  }

  /**
   * Parse an Application from Discord API JSON
   */
  static parse(json: Record<string, unknown>): Application {
    const id = Snowflake.parse(json['id'] as string);
    const name = json['name'] as string;
    const flags = (json['flags'] as number | undefined) ?? ApplicationFlags.None;

    return new Application(id, name, flags);
  }
}
