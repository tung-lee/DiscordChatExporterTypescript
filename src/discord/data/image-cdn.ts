/**
 * Helper class for constructing Discord CDN image URLs
 */
export class ImageCdn {
  private static readonly CdnBaseUrl = 'https://cdn.discordapp.com';

  /**
   * Get the URL for a custom emoji
   */
  static getEmojiUrl(emojiId: string, isAnimated: boolean): string {
    const ext = isAnimated ? 'gif' : 'png';
    return `${this.CdnBaseUrl}/emojis/${emojiId}.${ext}`;
  }

  /**
   * Get the URL for a guild icon
   */
  static getGuildIconUrl(guildId: string, iconHash: string): string {
    const ext = iconHash.startsWith('a_') ? 'gif' : 'png';
    return `${this.CdnBaseUrl}/icons/${guildId}/${iconHash}.${ext}`;
  }

  /**
   * Get the URL for a guild splash
   */
  static getGuildSplashUrl(guildId: string, splashHash: string): string {
    return `${this.CdnBaseUrl}/splashes/${guildId}/${splashHash}.png`;
  }

  /**
   * Get the URL for a user avatar
   */
  static getUserAvatarUrl(userId: string, avatarHash: string): string {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${this.CdnBaseUrl}/avatars/${userId}/${avatarHash}.${ext}`;
  }

  /**
   * Get the default avatar URL for a user based on their discriminator or user ID
   */
  static getDefaultUserAvatarUrl(discriminator: number | null, userId: string): string {
    // For users with the new username system (discriminator 0 or null), use user ID
    // For users with the legacy system, use discriminator
    const index =
      discriminator && discriminator !== 0
        ? discriminator % 5
        : Number(BigInt(userId) >> 22n) % 6;
    return `${this.CdnBaseUrl}/embed/avatars/${index}.png`;
  }

  /**
   * Get the URL for a member avatar (server-specific avatar)
   */
  static getMemberAvatarUrl(guildId: string, userId: string, avatarHash: string): string {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${this.CdnBaseUrl}/guilds/${guildId}/users/${userId}/avatars/${avatarHash}.${ext}`;
  }

  /**
   * Get the URL for a sticker
   */
  static getStickerUrl(stickerId: string, format: 'png' | 'apng' | 'gif' | 'lottie'): string {
    const ext = format === 'lottie' ? 'json' : format;
    return `${this.CdnBaseUrl}/stickers/${stickerId}.${ext}`;
  }
}
