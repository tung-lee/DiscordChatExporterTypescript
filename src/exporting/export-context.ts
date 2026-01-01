import * as path from 'path';
import { Snowflake } from '../discord/snowflake.js';
import { DiscordClient } from '../discord/discord-client.js';
import { User } from '../discord/data/user.js';
import { Member } from '../discord/data/member.js';
import { Channel } from '../discord/data/channel.js';
import { Role } from '../discord/data/role.js';
import { Color } from '../utils/color.js';
import { ExportRequest } from './export-request.js';
import { ExportFormat } from './export-format.js';
import { ExportAssetDownloader } from './export-asset-downloader.js';

/**
 * Context for exporting a channel
 * Provides caching and utilities for the export process
 */
export class ExportContext {
  private readonly membersById = new Map<string, Member | null>();
  private readonly channelsById = new Map<string, Channel>();
  private readonly rolesById = new Map<string, Role>();
  private readonly assetDownloader: ExportAssetDownloader;

  constructor(
    readonly discord: DiscordClient,
    readonly request: ExportRequest
  ) {
    this.assetDownloader = new ExportAssetDownloader(
      request.assetsDirPath,
      request.shouldReuseAssets
    );
  }

  /**
   * Normalize a date based on UTC normalization setting
   */
  normalizeDate(instant: Date): Date {
    if (this.request.isUtcNormalizationEnabled) {
      return instant;
    }
    return instant;
  }

  /**
   * Format a date according to the export settings
   */
  formatDate(instant: Date, format: string = 'g'): string {
    const normalized = this.normalizeDate(instant);
    const locale = this.request.locale ?? undefined;

    switch (format) {
      case 'g':
        // Short date and time
        return normalized.toLocaleString(locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      case 'd':
        // Short date
        return normalized.toLocaleDateString(locale, {
          dateStyle: 'short',
        });
      case 't':
        // Short time
        return normalized.toLocaleTimeString(locale, {
          timeStyle: 'short',
        });
      case 'f':
        // Full date and time
        return normalized.toLocaleString(locale, {
          dateStyle: 'full',
          timeStyle: 'short',
        });
      case 'F':
        // Full date and long time
        return normalized.toLocaleString(locale, {
          dateStyle: 'full',
          timeStyle: 'long',
        });
      case 'R':
        // Relative time (not supported, fall back to full)
        return normalized.toLocaleString(locale);
      default:
        return normalized.toLocaleString(locale);
    }
  }

  /**
   * Populate channels and roles cache
   */
  async populateChannelsAndRoles(): Promise<void> {
    const guildId = this.request.guild.id;

    for await (const channel of this.discord.getGuildChannels(guildId)) {
      this.channelsById.set(channel.id.toString(), channel);
    }

    for await (const role of this.discord.getGuildRoles(guildId)) {
      this.rolesById.set(role.id.toString(), role);
    }
  }

  /**
   * Populate a member in the cache
   */
  private async populateMemberInternal(
    id: Snowflake,
    fallbackUser: User | null
  ): Promise<void> {
    const idStr = id.toString();
    if (this.membersById.has(idStr)) {
      return;
    }

    let member = await this.discord.tryGetGuildMember(this.request.guild.id, id);

    // User may have left the guild since they were mentioned.
    // Create a dummy member object based on the user info.
    if (member === null) {
      const user = fallbackUser ?? (await this.discord.tryGetUser(id));

      // User may have been deleted since they were mentioned
      if (user !== null) {
        member = Member.createFallback(user);
      }
    }

    // Store the result even if it's null, to avoid re-fetching non-existing members
    this.membersById.set(idStr, member);
  }

  /**
   * Populate a member by ID
   */
  async populateMember(id: Snowflake): Promise<void> {
    await this.populateMemberInternal(id, null);
  }

  /**
   * Populate a member from a user object
   */
  async populateMemberFromUser(user: User): Promise<void> {
    await this.populateMemberInternal(user.id, user);
  }

  /**
   * Try to get a cached member
   */
  tryGetMember(id: Snowflake): Member | null {
    return this.membersById.get(id.toString()) ?? null;
  }

  /**
   * Try to get a cached channel
   */
  tryGetChannel(id: Snowflake): Channel | null {
    return this.channelsById.get(id.toString()) ?? null;
  }

  /**
   * Try to get a cached role
   */
  tryGetRole(id: Snowflake): Role | null {
    return this.rolesById.get(id.toString()) ?? null;
  }

  /**
   * Get all roles for a user, sorted by position
   */
  getUserRoles(id: Snowflake): Role[] {
    const member = this.tryGetMember(id);
    if (!member) {
      return [];
    }

    const roles: Role[] = [];
    for (const roleId of member.roleIds) {
      const role = this.tryGetRole(roleId);
      if (role) {
        roles.push(role);
      }
    }

    // Sort by position descending
    return roles.sort((a, b) => b.position - a.position);
  }

  /**
   * Try to get a user's display color from their highest colored role
   */
  tryGetUserColor(id: Snowflake): Color | null {
    const roles = this.getUserRoles(id);
    for (const role of roles) {
      if (role.color) {
        return role.color;
      }
    }
    return null;
  }

  /**
   * Resolve an asset URL (download if configured, otherwise return original)
   */
  async resolveAssetUrl(url: string): Promise<string> {
    if (!this.request.shouldDownloadAssets) {
      return url;
    }

    try {
      const filePath = await this.assetDownloader.download(url);
      const relativeFilePath = path.relative(this.request.outputDirPath, filePath);

      // Prefer the relative path so that the export package can be copied around without breaking references.
      // However, if the assets directory lies outside the export directory, use the absolute path instead.
      const shouldUseAbsoluteFilePath =
        relativeFilePath.startsWith('..' + path.sep) ||
        relativeFilePath.startsWith('..' + path.posix.sep);

      const optimalFilePath = shouldUseAbsoluteFilePath ? filePath : relativeFilePath;

      // For HTML, the path needs to be properly formatted
      if (
        this.request.format === ExportFormat.HtmlDark ||
        this.request.format === ExportFormat.HtmlLight
      ) {
        return this.encodeFilePath(optimalFilePath);
      }

      return optimalFilePath;
    } catch (error) {
      // Don't crash the export if asset download fails
      // TODO: add logging
      return url;
    }
  }

  /**
   * Encode a file path for use in HTML
   */
  private encodeFilePath(filePath: string): string {
    // Convert Windows path separators to forward slashes for URLs
    const normalized = filePath.replace(/\\/g, '/');
    // Encode each path segment
    return normalized
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
  }
}
