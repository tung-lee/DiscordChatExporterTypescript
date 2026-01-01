import { describe, it, expect } from 'vitest';
import { Snowflake } from '../../src/discord/snowflake.js';

describe('Snowflake', () => {
  describe('constructor and toString', () => {
    it('should store and return the correct value', () => {
      const snowflake = new Snowflake(123456789012345678n);
      expect(snowflake.toString()).toBe('123456789012345678');
    });

    it('should handle zero', () => {
      expect(Snowflake.Zero.toString()).toBe('0');
    });
  });

  describe('toDate', () => {
    it('should extract correct timestamp from snowflake', () => {
      // Known snowflake: 175928847299117063 = 2016-04-30T11:18:25.796Z
      const snowflake = new Snowflake(175928847299117063n);
      const date = snowflake.toDate();
      expect(date.getUTCFullYear()).toBe(2016);
      expect(date.getUTCMonth()).toBe(3); // April (0-indexed)
      expect(date.getUTCDate()).toBe(30);
    });

    it('should handle Discord epoch start', () => {
      const snowflake = new Snowflake(0n);
      const date = snowflake.toDate();
      expect(date.getUTCFullYear()).toBe(2015);
      expect(date.getUTCMonth()).toBe(0); // January
      expect(date.getUTCDate()).toBe(1);
    });
  });

  describe('fromDate', () => {
    it('should create snowflake from date', () => {
      const date = new Date('2020-01-01T00:00:00.000Z');
      const snowflake = Snowflake.fromDate(date);

      // The extracted date should match the original
      const extractedDate = snowflake.toDate();
      expect(extractedDate.getUTCFullYear()).toBe(2020);
      expect(extractedDate.getUTCMonth()).toBe(0);
      expect(extractedDate.getUTCDate()).toBe(1);
    });

    it('should round-trip correctly', () => {
      const original = new Date('2023-06-15T12:30:45.000Z');
      const snowflake = Snowflake.fromDate(original);
      const extracted = snowflake.toDate();

      // Should match within a second (timestamp is in ms)
      expect(Math.abs(extracted.getTime() - original.getTime())).toBeLessThan(1000);
    });
  });

  describe('parse', () => {
    it('should parse numeric string', () => {
      const snowflake = Snowflake.parse('175928847299117063');
      expect(snowflake.value).toBe(175928847299117063n);
    });

    it('should parse date string', () => {
      const snowflake = Snowflake.parse('2020-01-01');
      const date = snowflake.toDate();
      expect(date.getUTCFullYear()).toBe(2020);
    });

    it('should throw on invalid input', () => {
      expect(() => Snowflake.parse('invalid')).toThrow('Invalid snowflake');
    });
  });

  describe('tryParse', () => {
    it('should return snowflake for valid input', () => {
      const snowflake = Snowflake.tryParse('175928847299117063');
      expect(snowflake).not.toBeNull();
      expect(snowflake?.value).toBe(175928847299117063n);
    });

    it('should return null for invalid input', () => {
      expect(Snowflake.tryParse('invalid')).toBeNull();
    });

    it('should return null for null/undefined/empty', () => {
      expect(Snowflake.tryParse(null)).toBeNull();
      expect(Snowflake.tryParse(undefined)).toBeNull();
      expect(Snowflake.tryParse('')).toBeNull();
      expect(Snowflake.tryParse('   ')).toBeNull();
    });
  });

  describe('comparison', () => {
    it('should compare snowflakes correctly', () => {
      const a = new Snowflake(100n);
      const b = new Snowflake(200n);
      const c = new Snowflake(100n);

      expect(a.isLessThan(b)).toBe(true);
      expect(b.isGreaterThan(a)).toBe(true);
      expect(a.equals(c)).toBe(true);
      expect(a.compareTo(b)).toBe(-1);
      expect(b.compareTo(a)).toBe(1);
      expect(a.compareTo(c)).toBe(0);
    });

    it('should handle equals with null', () => {
      const snowflake = new Snowflake(100n);
      expect(snowflake.equals(null)).toBe(false);
      expect(snowflake.equals(undefined)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to string for JSON', () => {
      const snowflake = new Snowflake(175928847299117063n);
      const json = JSON.stringify({ id: snowflake });
      expect(json).toBe('{"id":"175928847299117063"}');
    });
  });
});
