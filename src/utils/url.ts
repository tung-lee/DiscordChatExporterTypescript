/**
 * URL builder utility for constructing API endpoints
 */
export class UrlBuilder {
  private path: string = '';
  private params: Map<string, string> = new Map();

  setPath(path: string): this {
    this.path = path;
    return this;
  }

  setQueryParameter(name: string, value: string | null | undefined): this {
    if (value !== null && value !== undefined) {
      this.params.set(name, value);
    }
    return this;
  }

  build(): string {
    if (this.params.size === 0) {
      return this.path;
    }

    const queryString = Array.from(this.params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return `${this.path}?${queryString}`;
  }
}

/**
 * Encode a file path for use in HTML (handles special characters and paths)
 */
export function encodeFilePath(filePath: string): string {
  // Replace backslashes with forward slashes for URLs
  const normalized = filePath.replace(/\\/g, '/');

  // Encode special characters but keep path separators
  return normalized
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}
