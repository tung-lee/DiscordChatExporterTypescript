import type { Snowflake } from '../../snowflake.js';

/**
 * Discord CDN URL utilities
 * @see https://discord.com/developers/docs/reference#image-formatting
 */
const CDN_BASE = 'https://cdn.discordapp.com';
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72';

export const ImageCdn = {
  /**
   * Get URL for a standard emoji (Twemoji)
   */
  getStandardEmojiUrl(name: string): string {
    const codePoints = [...name]
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join('-');
    return `${TWEMOJI_BASE}/${codePoints}.png`;
  },

  /**
   * Get URL for a custom emoji
   */
  getCustomEmojiUrl(emojiId: Snowflake, isAnimated: boolean): string {
    const ext = isAnimated ? 'gif' : 'png';
    return `${CDN_BASE}/emojis/${emojiId}.${ext}`;
  },

  /**
   * Get URL for a guild icon
   */
  getGuildIconUrl(guildId: Snowflake, iconHash: string): string {
    const ext = iconHash.startsWith('a_') ? 'gif' : 'png';
    return `${CDN_BASE}/icons/${guildId}/${iconHash}.${ext}?size=128`;
  },

  /**
   * Get URL for a channel icon (group DM)
   */
  getChannelIconUrl(channelId: Snowflake, iconHash: string): string {
    return `${CDN_BASE}/channel-icons/${channelId}/${iconHash}.png?size=128`;
  },

  /**
   * Get URL for a user avatar
   */
  getUserAvatarUrl(userId: Snowflake, avatarHash: string): string {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${CDN_BASE}/avatars/${userId}/${avatarHash}.${ext}?size=128`;
  },

  /**
   * Get URL for a member-specific avatar
   */
  getMemberAvatarUrl(
    guildId: Snowflake,
    userId: Snowflake,
    avatarHash: string
  ): string {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${CDN_BASE}/guilds/${guildId}/users/${userId}/avatars/${avatarHash}.${ext}?size=128`;
  },

  /**
   * Get URL for a fallback user avatar (default Discord avatar)
   */
  getFallbackUserAvatarUrl(index: number = 0): string {
    return `${CDN_BASE}/embed/avatars/${index % 6}.png`;
  },

  /**
   * Get URL for a sticker
   */
  getStickerUrl(stickerId: Snowflake, format: 'png' | 'gif' | 'json'): string {
    return `${CDN_BASE}/stickers/${stickerId}.${format}`;
  },
};
