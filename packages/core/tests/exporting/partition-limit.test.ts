import { describe, it, expect } from 'vitest';
import {
  PartitionLimit,
  NullPartitionLimit,
  FileSizePartitionLimit,
  MessageCountPartitionLimit,
} from '../../src/exporting/partitioning/partition-limit.js';
import { FileSize } from '../../src/utils/file-size.js';

describe('PartitionLimit', () => {
  describe('parse', () => {
    it('should return NullPartitionLimit for empty input', () => {
      expect(PartitionLimit.parse(null)).toBe(NullPartitionLimit.Instance);
      expect(PartitionLimit.parse(undefined)).toBe(NullPartitionLimit.Instance);
      expect(PartitionLimit.parse('')).toBe(NullPartitionLimit.Instance);
      expect(PartitionLimit.parse('  ')).toBe(NullPartitionLimit.Instance);
    });

    it('should parse message count', () => {
      const limit = PartitionLimit.parse('1000');
      expect(limit).toBeInstanceOf(MessageCountPartitionLimit);
      expect((limit as MessageCountPartitionLimit).limit).toBe(1000);
    });

    it('should parse file size in bytes', () => {
      const limit = PartitionLimit.parse('1048576b');
      expect(limit).toBeInstanceOf(FileSizePartitionLimit);
      expect((limit as FileSizePartitionLimit).limit.totalBytes).toBe(1048576);
    });

    it('should parse file size in KB (decimal, 1000-based)', () => {
      const limit = PartitionLimit.parse('500kb');
      expect(limit).toBeInstanceOf(FileSizePartitionLimit);
      // Using decimal KB: 500 * 1000 = 500000
      expect((limit as FileSizePartitionLimit).limit.totalBytes).toBe(500 * 1000);
    });

    it('should parse file size in MB (decimal, 1000-based)', () => {
      const limit = PartitionLimit.parse('10mb');
      expect(limit).toBeInstanceOf(FileSizePartitionLimit);
      // Using decimal MB: 10 * 1000000 = 10000000
      expect((limit as FileSizePartitionLimit).limit.totalBytes).toBe(10 * 1000000);
    });

    it('should be case insensitive for file sizes', () => {
      const limit1 = PartitionLimit.parse('10MB');
      const limit2 = PartitionLimit.parse('10mb');
      expect((limit1 as FileSizePartitionLimit).limit.totalBytes)
        .toBe((limit2 as FileSizePartitionLimit).limit.totalBytes);
    });

    it('should throw for invalid input', () => {
      expect(() => PartitionLimit.parse('invalid')).toThrow();
      expect(() => PartitionLimit.parse('abc123')).toThrow();
    });
  });

  describe('NullPartitionLimit', () => {
    it('should be a singleton', () => {
      expect(NullPartitionLimit.Instance).toBe(NullPartitionLimit.Instance);
    });

    it('should have isNull = true', () => {
      expect(NullPartitionLimit.Instance.isNull).toBe(true);
    });

    it('should never report limit reached', () => {
      const limit = NullPartitionLimit.Instance;
      expect(limit.isReached(0, 0)).toBe(false);
      expect(limit.isReached(1000000, 1000000000)).toBe(false);
    });
  });

  describe('FileSizePartitionLimit', () => {
    it('should have isNull = false', () => {
      const limit = new FileSizePartitionLimit(new FileSize(10 * 1000000));
      expect(limit.isNull).toBe(false);
    });

    it('should report limit reached when bytes exceed threshold', () => {
      const limit = new FileSizePartitionLimit(new FileSize(1000000));
      expect(limit.isReached(0, 999999)).toBe(false);
      expect(limit.isReached(0, 1000000)).toBe(true);
      expect(limit.isReached(0, 1000001)).toBe(true);
    });

    it('should ignore message count', () => {
      const limit = new FileSizePartitionLimit(new FileSize(10 * 1000000));
      expect(limit.isReached(1000000, 0)).toBe(false);
    });
  });

  describe('MessageCountPartitionLimit', () => {
    it('should have isNull = false', () => {
      const limit = new MessageCountPartitionLimit(100);
      expect(limit.isNull).toBe(false);
    });

    it('should report limit reached when messages exceed threshold', () => {
      const limit = new MessageCountPartitionLimit(100);
      expect(limit.isReached(99, 0)).toBe(false);
      expect(limit.isReached(100, 0)).toBe(true);
      expect(limit.isReached(101, 0)).toBe(true);
    });

    it('should ignore byte count', () => {
      const limit = new MessageCountPartitionLimit(100);
      expect(limit.isReached(0, 1000000000)).toBe(false);
    });
  });
});
