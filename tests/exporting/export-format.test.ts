import { describe, it, expect } from 'vitest';
import {
  ExportFormat,
  getExportFormatFileExtension,
  getExportFormatDisplayName,
  parseExportFormat,
} from '../../src/exporting/export-format.js';

describe('ExportFormat', () => {
  describe('getExportFormatFileExtension', () => {
    it('should return txt for PlainText', () => {
      expect(getExportFormatFileExtension(ExportFormat.PlainText)).toBe('txt');
    });

    it('should return html for HtmlDark', () => {
      expect(getExportFormatFileExtension(ExportFormat.HtmlDark)).toBe('html');
    });

    it('should return html for HtmlLight', () => {
      expect(getExportFormatFileExtension(ExportFormat.HtmlLight)).toBe('html');
    });

    it('should return csv for Csv', () => {
      expect(getExportFormatFileExtension(ExportFormat.Csv)).toBe('csv');
    });

    it('should return json for Json', () => {
      expect(getExportFormatFileExtension(ExportFormat.Json)).toBe('json');
    });
  });

  describe('getExportFormatDisplayName', () => {
    it('should return display names', () => {
      expect(getExportFormatDisplayName(ExportFormat.PlainText)).toBe('Plain Text');
      expect(getExportFormatDisplayName(ExportFormat.HtmlDark)).toBe('HTML (Dark)');
      expect(getExportFormatDisplayName(ExportFormat.HtmlLight)).toBe('HTML (Light)');
      expect(getExportFormatDisplayName(ExportFormat.Csv)).toBe('CSV');
      expect(getExportFormatDisplayName(ExportFormat.Json)).toBe('JSON');
    });
  });

  describe('parseExportFormat', () => {
    it('should parse json', () => {
      expect(parseExportFormat('json')).toBe(ExportFormat.Json);
      expect(parseExportFormat('JSON')).toBe(ExportFormat.Json);
    });

    it('should parse html-dark', () => {
      expect(parseExportFormat('html-dark')).toBe(ExportFormat.HtmlDark);
      expect(parseExportFormat('htmldark')).toBe(ExportFormat.HtmlDark);
    });

    it('should parse html-light', () => {
      expect(parseExportFormat('html-light')).toBe(ExportFormat.HtmlLight);
      expect(parseExportFormat('htmllight')).toBe(ExportFormat.HtmlLight);
      // Plain 'html' defaults to HtmlLight
      expect(parseExportFormat('html')).toBe(ExportFormat.HtmlLight);
    });

    it('should parse csv', () => {
      expect(parseExportFormat('csv')).toBe(ExportFormat.Csv);
      expect(parseExportFormat('CSV')).toBe(ExportFormat.Csv);
    });

    it('should parse txt/plaintext', () => {
      expect(parseExportFormat('txt')).toBe(ExportFormat.PlainText);
      expect(parseExportFormat('text')).toBe(ExportFormat.PlainText);
      expect(parseExportFormat('plaintext')).toBe(ExportFormat.PlainText);
    });

    it('should return null for invalid formats', () => {
      expect(parseExportFormat('invalid')).toBeNull();
      expect(parseExportFormat('xml')).toBeNull();
      expect(parseExportFormat('')).toBeNull();
    });
  });
});
