import type { Snowflake } from '../../snowflake.js';

/**
 * Discord CDN URL utilities
 * @see https://discord.com/developers/docs/reference#image-formatting
 */
const CDN_BASE = 'https://cdn.discordapp.com';

export const ImageCdn = {
  /**
   * Get URL for a standard emoji (Twemoji SVG)
   * Variant selector (0xfe0f) is skipped in Twemoji IDs,
   * except when the emoji also contains a zero-width joiner (0x200d).
   */
  getStandardEmojiUrl(name: string): string {
    const runes: number[] = [];
    for (const char of name) {
      const cp = char.codePointAt(0);
      if (cp !== undefined) runes.push(cp);
    }

    const hasZwj = runes.some((r) => r === 0x200d);
    const filtered = hasZwj ? runes : runes.filter((r) => r !== 0xfe0f);

    const twemojiId = filtered.map((r) => r.toString(16)).join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${twemojiId}.svg`;
  },

  /**
   * Get URL for a custom emoji
   */
  getCustomEmojiUrl(emojiId: Snowflake, isAnimated: boolean = false): string {
    const ext = isAnimated ? 'gif' : 'png';
    return `${CDN_BASE}/emojis/${emojiId}.${ext}`;
  },

  /**
   * Get URL for a guild icon
   */
  getGuildIconUrl(guildId: Snowflake, iconHash: string, size: number = 512): string {
    const ext = iconHash.startsWith('a_') ? 'gif' : 'png';
    return `${CDN_BASE}/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
  },

  /**
   * Get URL for a channel icon (group DM)
   */
  getChannelIconUrl(channelId: Snowflake, iconHash: string, size: number = 512): string {
    const ext = iconHash.startsWith('a_') ? 'gif' : 'png';
    return `${CDN_BASE}/channel-icons/${channelId}/${iconHash}.${ext}?size=${size}`;
  },

  /**
   * Get URL for a user avatar
   */
  getUserAvatarUrl(userId: Snowflake, avatarHash: string, size: number = 512): string {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${CDN_BASE}/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
  },

  /**
   * Get URL for a member-specific avatar
   */
  getMemberAvatarUrl(
    guildId: Snowflake,
    userId: Snowflake,
    avatarHash: string,
    size: number = 512
  ): string {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${CDN_BASE}/guilds/${guildId}/users/${userId}/avatars/${avatarHash}.${ext}?size=${size}`;
  },

  /**
   * Get URL for a fallback user avatar (default Discord avatar)
   */
  getFallbackUserAvatarUrl(index: number = 0): string {
    return `${CDN_BASE}/embed/avatars/${index}.png`;
  },

  /**
   * Get URL for a sticker
   */
  getStickerUrl(stickerId: Snowflake, format: string = 'png'): string {
    return `${CDN_BASE}/stickers/${stickerId}.${format}`;
  },
};
