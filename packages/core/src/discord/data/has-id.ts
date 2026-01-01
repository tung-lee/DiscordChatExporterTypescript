import { Snowflake } from '../snowflake.js';

/**
 * Interface for objects that have a Discord Snowflake ID
 */
export interface HasId {
  readonly id: Snowflake;
}
