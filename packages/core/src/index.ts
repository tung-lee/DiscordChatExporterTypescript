/**
 * Discord Chat Exporter Core
 *
 * TypeScript library and CLI for exporting Discord chat history.
 * Supports JSON, HTML (dark/light), CSV, and PlainText formats.
 */

// Core types
export { Snowflake } from './discord/snowflake.js';

// Token and rate limiting
export { TokenKind } from './discord/token-kind.js';
export {
  RateLimitPreference,
  isRateLimitRespected,
  getRateLimitPreferenceDisplayName,
} from './discord/rate-limit-preference.js';

// API Client
export { DiscordClient, type ProgressCallback } from './discord/discord-client.js';

// Data models
export * from './discord/data/index.js';

// Markdown
export * from './markdown/index.js';

// Utilities
export { FileSize } from './utils/file-size.js';
export { Color } from './utils/color.js';

// Exceptions
export * from './exceptions/index.js';

// Exporting
export * from './exporting/index.js';
