import { describe, it, expect } from 'vitest';
import { FileSize } from '../../src/utils/file-size.js';

describe('FileSize', () => {
  describe('constructor and properties', () => {
    it('should store total bytes', () => {
      const size = new FileSize(1500000);
      expect(size.totalBytes).toBe(1500000);
    });

    it('should calculate kilobytes', () => {
      const size = new FileSize(1500);
      expect(size.kilobytes).toBe(1.5);
    });

    it('should calculate megabytes', () => {
      const size = new FileSize(1500000);
      expect(size.megabytes).toBe(1.5);
    });

    it('should calculate gigabytes', () => {
      const size = new FileSize(1500000000);
      expect(size.gigabytes).toBe(1.5);
    });
  });

  describe('format', () => {
    it('should format bytes', () => {
      expect(new FileSize(500).format()).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(new FileSize(1500).format()).toBe('1.50 KB');
    });

    it('should format megabytes', () => {
      expect(new FileSize(1500000).format()).toBe('1.50 MB');
    });

    it('should format gigabytes', () => {
      expect(new FileSize(1500000000).format()).toBe('1.50 GB');
    });
  });

  describe('parse', () => {
    it('should parse bytes', () => {
      expect(FileSize.parse('500b').totalBytes).toBe(500);
    });

    it('should parse kilobytes', () => {
      expect(FileSize.parse('10kb').totalBytes).toBe(10000);
    });

    it('should parse megabytes', () => {
      expect(FileSize.parse('10mb').totalBytes).toBe(10000000);
    });

    it('should parse gigabytes', () => {
      expect(FileSize.parse('1gb').totalBytes).toBe(1000000000);
    });

    it('should handle decimal values', () => {
      expect(FileSize.parse('1.5mb').totalBytes).toBe(1500000);
    });

    it('should be case insensitive', () => {
      expect(FileSize.parse('10MB').totalBytes).toBe(10000000);
      expect(FileSize.parse('10Mb').totalBytes).toBe(10000000);
    });

    it('should handle whitespace', () => {
      expect(FileSize.parse('  10 mb  ').totalBytes).toBe(10000000);
    });

    it('should throw on invalid input', () => {
      expect(() => FileSize.parse('invalid')).toThrow('Invalid file size');
    });
  });

  describe('tryParse', () => {
    it('should return null for invalid input', () => {
      expect(FileSize.tryParse('invalid')).toBeNull();
    });

    it('should return FileSize for valid input', () => {
      const size = FileSize.tryParse('10mb');
      expect(size).not.toBeNull();
      expect(size?.totalBytes).toBe(10000000);
    });
  });
});
