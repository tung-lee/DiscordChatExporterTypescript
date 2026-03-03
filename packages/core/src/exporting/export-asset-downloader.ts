import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { request as undiciRequest, RetryAgent, Agent } from 'undici';

/**
 * Downloads and caches assets for export
 */
export class ExportAssetDownloader {
  private readonly agent: RetryAgent;
  private readonly previousPathsByUrl = new Map<string, string>();
  private readonly locks = new Map<string, Promise<string>>();

  constructor(
    private readonly workingDirPath: string,
    private readonly reuse: boolean
  ) {
    this.agent = new RetryAgent(new Agent(), {
      maxRetries: 3,
      minTimeout: 1000,
      maxTimeout: 5000,
    });
  }

  /**
   * Download an asset and return the local file path
   */
  async download(url: string): Promise<string> {
    const fileName = ExportAssetDownloader.getFileNameFromUrl(url);
    const filePath = path.join(this.workingDirPath, fileName);

    // Check if we have a cached path for this URL
    const cachedPath = this.previousPathsByUrl.get(url);
    if (cachedPath) {
      return cachedPath;
    }

    // Check if there's already a download in progress for this file
    const existingLock = this.locks.get(filePath);
    if (existingLock) {
      return existingLock;
    }

    // Start the download
    const downloadPromise = this.doDownload(url, filePath);
    this.locks.set(filePath, downloadPromise);

    try {
      const result = await downloadPromise;
      this.previousPathsByUrl.set(url, result);
      return result;
    } finally {
      this.locks.delete(filePath);
    }
  }

  private async doDownload(url: string, filePath: string): Promise<string> {
    // Reuse existing files if allowed
    if (this.reuse && fs.existsSync(filePath)) {
      return filePath;
    }

    // Check for legacy file (5-char hash) and migrate if found
    if (this.reuse) {
      const legacyFileName = ExportAssetDownloader.getLegacyFileNameFromUrl(url);
      const legacyFilePath = path.join(this.workingDirPath, legacyFileName);
      if (legacyFilePath !== filePath && fs.existsSync(legacyFilePath)) {
        fs.mkdirSync(this.workingDirPath, { recursive: true });
        fs.renameSync(legacyFilePath, filePath);
        return filePath;
      }
    }

    // Ensure directory exists
    fs.mkdirSync(this.workingDirPath, { recursive: true });

    // Download the file
    const response = await undiciRequest(url, {
      dispatcher: this.agent,
      headers: {
        'User-Agent': 'DiscordChatExporter',
      },
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(`Failed to download asset: HTTP ${response.statusCode}`);
    }

    // Write to file
    const buffer = Buffer.from(await response.body.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return filePath;
  }

  /**
   * Get the relative path from the export file to the asset
   */
  getRelativePath(assetPath: string, fromPath: string): string {
    const fromDir = path.dirname(fromPath);
    return path.relative(fromDir, assetPath);
  }

  /**
   * Generate a hash for the URL (for file naming)
   * Uses 16 chars (64 bits) to minimize collision probability
   */
  private static getUrlHash(url: string): string {
    const normalizedUrl = this.normalizeUrl(url);
    const hash = crypto.createHash('sha256').update(normalizedUrl).digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Generate a legacy 5-char hash (for migration detection)
   */
  private static getLegacyUrlHash(url: string): string {
    const normalizedUrl = this.normalizeUrl(url);
    const hash = crypto.createHash('sha256').update(normalizedUrl).digest('hex');
    return hash.substring(0, 5);
  }

  /**
   * Normalize Discord CDN URLs by removing signature parameters
   */
  private static normalizeUrl(url: string): string {
    try {
      const uri = new URL(url);
      if (uri.host.toLowerCase() !== 'cdn.discordapp.com') {
        return url;
      }

      // Remove signature parameters
      uri.searchParams.delete('ex');
      uri.searchParams.delete('is');
      uri.searchParams.delete('hm');

      return uri.origin + uri.pathname + uri.search;
    } catch {
      return url;
    }
  }

  /**
   * Get a file name from URL using legacy 5-char hash (for migration)
   */
  private static getLegacyFileNameFromUrl(url: string): string {
    const urlHash = this.getLegacyUrlHash(url);

    const match = url.match(/.+\/([^?]*)/);
    const fileName = match?.[1] ?? '';

    if (!fileName || !fileName.trim()) {
      return urlHash;
    }

    let fileNameWithoutExtension = path.basename(fileName, path.extname(fileName));
    let fileExtension = path.extname(fileName);

    if (fileExtension.length > 41) {
      fileNameWithoutExtension = fileName;
      fileExtension = '';
    }

    const truncatedName = fileNameWithoutExtension.substring(0, 42);
    const resultName = `${truncatedName}-${urlHash}${fileExtension}`;

    return resultName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  }

  /**
   * Get a file name from URL
   */
  private static getFileNameFromUrl(url: string): string {
    const urlHash = this.getUrlHash(url);

    // Try to extract the file name from URL
    const match = url.match(/.+\/([^?]*)/);
    const fileName = match?.[1] ?? '';

    // If no file name, just use the hash
    if (!fileName || !fileName.trim()) {
      return urlHash;
    }

    // Get file name and extension
    let fileNameWithoutExtension = path.basename(fileName, path.extname(fileName));
    let fileExtension = path.extname(fileName);

    // If extension is too long (probably not an extension, just a dot in the name)
    if (fileExtension.length > 41) {
      fileNameWithoutExtension = fileName;
      fileExtension = '';
    }

    // Truncate file name and inject hash
    const truncatedName = fileNameWithoutExtension.substring(0, 42);
    const resultName = `${truncatedName}-${urlHash}${fileExtension}`;

    // Escape illegal characters
    return resultName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  }
}
