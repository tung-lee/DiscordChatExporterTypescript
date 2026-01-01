/**
 * Supported export formats
 */
export enum ExportFormat {
  PlainText = 'PlainText',
  HtmlDark = 'HtmlDark',
  HtmlLight = 'HtmlLight',
  Csv = 'Csv',
  Json = 'Json',
}

/**
 * Get the file extension for an export format
 */
export function getExportFormatFileExtension(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.PlainText:
      return 'txt';
    case ExportFormat.HtmlDark:
    case ExportFormat.HtmlLight:
      return 'html';
    case ExportFormat.Csv:
      return 'csv';
    case ExportFormat.Json:
      return 'json';
  }
}

/**
 * Get display name for an export format
 */
export function getExportFormatDisplayName(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.PlainText:
      return 'Plain Text';
    case ExportFormat.HtmlDark:
      return 'HTML (Dark)';
    case ExportFormat.HtmlLight:
      return 'HTML (Light)';
    case ExportFormat.Csv:
      return 'CSV';
    case ExportFormat.Json:
      return 'JSON';
  }
}

/**
 * Parse export format from string
 */
export function parseExportFormat(value: string): ExportFormat | null {
  const normalized = value.toLowerCase().trim();
  switch (normalized) {
    case 'plaintext':
    case 'txt':
    case 'text':
      return ExportFormat.PlainText;
    case 'htmldark':
    case 'html-dark':
    case 'html_dark':
      return ExportFormat.HtmlDark;
    case 'htmllight':
    case 'html-light':
    case 'html_light':
    case 'html':
      return ExportFormat.HtmlLight;
    case 'csv':
      return ExportFormat.Csv;
    case 'json':
      return ExportFormat.Json;
    default:
      return null;
  }
}
