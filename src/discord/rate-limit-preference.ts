import { TokenKind } from './token-kind.js';

/**
 * Rate limit handling preference
 * This is a bitmask enum
 */
export enum RateLimitPreference {
  /**
   * Ignore all rate limit advisories
   */
  IgnoreAll = 0,

  /**
   * Respect rate limits for user tokens
   */
  RespectForUserTokens = 0b1,

  /**
   * Respect rate limits for bot tokens
   */
  RespectForBotTokens = 0b10,

  /**
   * Respect all rate limits (default)
   */
  RespectAll = RespectForUserTokens | RespectForBotTokens,
}

/**
 * Check if rate limits should be respected for a given token kind
 */
export function isRateLimitRespected(
  preference: RateLimitPreference,
  tokenKind: TokenKind
): boolean {
  switch (tokenKind) {
    case TokenKind.User:
      return (preference & RateLimitPreference.RespectForUserTokens) !== 0;
    case TokenKind.Bot:
      return (preference & RateLimitPreference.RespectForBotTokens) !== 0;
    default:
      return false;
  }
}

/**
 * Get display name for rate limit preference
 */
export function getRateLimitPreferenceDisplayName(
  preference: RateLimitPreference
): string {
  switch (preference) {
    case RateLimitPreference.IgnoreAll:
      return 'Always ignore';
    case RateLimitPreference.RespectForUserTokens:
      return 'Respect for user tokens';
    case RateLimitPreference.RespectForBotTokens:
      return 'Respect for bot tokens';
    case RateLimitPreference.RespectAll:
      return 'Always respect';
    default:
      return 'Unknown';
  }
}
