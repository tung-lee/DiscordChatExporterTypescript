import type { Snowflake } from '../../snowflake.js';

/**
 * Interface for entities that have a Snowflake ID
 */
export interface HasId {
  readonly id: Snowflake;
}
