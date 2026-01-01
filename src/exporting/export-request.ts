import * as path from 'path';
import * as fs from 'fs';
import { Snowflake } from '../discord/snowflake.js';
import { Guild } from '../discord/data/guild.js';
import { Channel } from '../discord/data/channel.js';
import { ExportFormat, getExportFormatFileExtension } from './export-format.js';
import { PartitionLimit, NullPartitionLimit } from './partitioning/partition-limit.js';
import { MessageFilter, NullMessageFilter } from './filtering/message-filter.js';

/**
 * Options for creating an export request
 */
export interface ExportRequestOptions {
  guild: Guild;
  channel: Channel;
  outputPath: string;
  assetsDirPath?: string;
  format: ExportFormat;
  after?: Snowflake | null;
  before?: Snowflake | null;
  partitionLimit?: PartitionLimit;
  messageFilter?: MessageFilter;
  shouldFormatMarkdown?: boolean;
  shouldDownloadAssets?: boolean;
  shouldReuseAssets?: boolean;
  locale?: string;
  isUtcNormalizationEnabled?: boolean;
}

/**
 * Represents a request to export a channel's messages
 */
export class ExportRequest {
  readonly guild: Guild;
  readonly channel: Channel;
  readonly outputFilePath: string;
  readonly outputDirPath: string;
  readonly assetsDirPath: string;
  readonly format: ExportFormat;
  readonly after: Snowflake | null;
  readonly before: Snowflake | null;
  readonly partitionLimit: PartitionLimit;
  readonly messageFilter: MessageFilter;
  readonly shouldFormatMarkdown: boolean;
  readonly shouldDownloadAssets: boolean;
  readonly shouldReuseAssets: boolean;
  readonly locale: string | null;
  readonly isUtcNormalizationEnabled: boolean;

  constructor(options: ExportRequestOptions) {
    this.guild = options.guild;
    this.channel = options.channel;
    this.format = options.format;
    this.after = options.after ?? null;
    this.before = options.before ?? null;
    this.partitionLimit = options.partitionLimit ?? NullPartitionLimit.Instance;
    this.messageFilter = options.messageFilter ?? NullMessageFilter.Instance;
    this.shouldFormatMarkdown = options.shouldFormatMarkdown ?? true;
    this.shouldDownloadAssets = options.shouldDownloadAssets ?? false;
    this.shouldReuseAssets = options.shouldReuseAssets ?? false;
    this.locale = options.locale ?? null;
    this.isUtcNormalizationEnabled = options.isUtcNormalizationEnabled ?? false;

    this.outputFilePath = ExportRequest.getOutputBaseFilePath(
      this.guild,
      this.channel,
      options.outputPath,
      this.format,
      this.after,
      this.before
    );

    this.outputDirPath = path.dirname(this.outputFilePath);

    if (options.assetsDirPath && options.assetsDirPath.trim()) {
      this.assetsDirPath = ExportRequest.formatPath(
        options.assetsDirPath,
        this.guild,
        this.channel,
        this.after,
        this.before
      );
    } else {
      this.assetsDirPath = `${this.outputFilePath}_Files${path.sep}`;
    }
  }

  /**
   * Escape illegal file name characters
   */
  private static escapeFileName(name: string): string {
    // Replace illegal characters with underscore
    return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  }

  /**
   * Format date as yyyy-MM-dd
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get the default output file name for an export
   */
  static getDefaultOutputFileName(
    guild: Guild,
    channel: Channel,
    format: ExportFormat,
    after: Snowflake | null = null,
    before: Snowflake | null = null
  ): string {
    let fileName = guild.name;

    // Parent name
    if (channel.parent) {
      fileName += ` - ${channel.parent.name}`;
    }

    // Channel name and ID
    fileName += ` - ${channel.name} [${channel.id}]`;

    // Date range
    if (after !== null || before !== null) {
      fileName += ' (';

      if (after !== null && before !== null) {
        fileName += `${this.formatDate(after.toDate())} to ${this.formatDate(before.toDate())}`;
      } else if (after !== null) {
        fileName += `after ${this.formatDate(after.toDate())}`;
      } else if (before !== null) {
        fileName += `before ${this.formatDate(before.toDate())}`;
      }

      fileName += ')';
    }

    // File extension
    fileName += `.${getExportFormatFileExtension(format)}`;

    return this.escapeFileName(fileName);
  }

  /**
   * Format a path with placeholders
   *
   * Supported placeholders:
   * - %g: guild ID
   * - %G: guild name
   * - %t: parent channel ID
   * - %T: parent channel name
   * - %c: channel ID
   * - %C: channel name
   * - %p: channel position
   * - %P: parent channel position
   * - %a: after date (yyyy-MM-dd)
   * - %b: before date (yyyy-MM-dd)
   * - %d: current date (yyyy-MM-dd)
   * - %%: literal %
   */
  static formatPath(
    pathTemplate: string,
    guild: Guild,
    channel: Channel,
    after: Snowflake | null,
    before: Snowflake | null
  ): string {
    return pathTemplate.replace(/%./g, (match) => {
      let replacement: string;

      switch (match) {
        case '%g':
          replacement = guild.id.toString();
          break;
        case '%G':
          replacement = guild.name;
          break;
        case '%t':
          replacement = channel.parent?.id?.toString() ?? '';
          break;
        case '%T':
          replacement = channel.parent?.name ?? '';
          break;
        case '%c':
          replacement = channel.id.toString();
          break;
        case '%C':
          replacement = channel.name;
          break;
        case '%p':
          replacement = channel.position?.toString() ?? '0';
          break;
        case '%P':
          replacement = channel.parent?.position?.toString() ?? '0';
          break;
        case '%a':
          replacement = after ? this.formatDate(after.toDate()) : '';
          break;
        case '%b':
          replacement = before ? this.formatDate(before.toDate()) : '';
          break;
        case '%d':
          replacement = this.formatDate(new Date());
          break;
        case '%%':
          replacement = '%';
          break;
        default:
          replacement = match;
      }

      return this.escapeFileName(replacement);
    });
  }

  /**
   * Get the base output file path
   */
  private static getOutputBaseFilePath(
    guild: Guild,
    channel: Channel,
    outputPath: string,
    format: ExportFormat,
    after: Snowflake | null = null,
    before: Snowflake | null = null
  ): string {
    const actualOutputPath = this.formatPath(outputPath, guild, channel, after, before);

    // Check if output is a directory (exists as dir or has no extension)
    const isDirectory =
      (fs.existsSync(actualOutputPath) && fs.statSync(actualOutputPath).isDirectory()) ||
      !path.extname(actualOutputPath);

    if (isDirectory) {
      const fileName = this.getDefaultOutputFileName(guild, channel, format, after, before);
      return path.join(actualOutputPath, fileName);
    }

    return actualOutputPath;
  }
}
