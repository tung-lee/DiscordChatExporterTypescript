import { describe, it, expect } from 'vitest';
import { Color } from '../../src/utils/color.js';

describe('Color', () => {
  describe('constructor', () => {
    it('should create color with RGB values', () => {
      const color = new Color(255, 128, 64);
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(64);
    });

    it('should clamp values to 0-255', () => {
      const color = new Color(-10, 300, 128);
      expect(color.r).toBe(0);
      expect(color.g).toBe(255);
      expect(color.b).toBe(128);
    });
  });

  describe('toHex', () => {
    it('should convert to hex string', () => {
      const color = new Color(255, 128, 64);
      expect(color.toHex()).toBe('#FF8040');
    });

    it('should pad single digit values', () => {
      const color = new Color(0, 0, 0);
      expect(color.toHex()).toBe('#000000');
    });
  });

  describe('toRgb', () => {
    it('should convert to rgb() string', () => {
      const color = new Color(255, 128, 64);
      expect(color.toRgb()).toBe('rgb(255, 128, 64)');
    });
  });

  describe('toInt', () => {
    it('should convert to integer', () => {
      const color = new Color(255, 128, 64);
      expect(color.toInt()).toBe(0xff8040);
    });
  });

  describe('fromInt', () => {
    it('should create color from integer', () => {
      const color = Color.fromInt(0xff8040);
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(64);
    });
  });

  describe('fromHex', () => {
    it('should create color from hex with hash', () => {
      const color = Color.fromHex('#FF8040');
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(64);
    });

    it('should create color from hex without hash', () => {
      const color = Color.fromHex('FF8040');
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(64);
    });
  });

  describe('tryParse', () => {
    it('should parse integer', () => {
      const color = Color.tryParse(0xff8040);
      expect(color?.r).toBe(255);
      expect(color?.g).toBe(128);
      expect(color?.b).toBe(64);
    });

    it('should parse hex string', () => {
      const color = Color.tryParse('#FF8040');
      expect(color?.r).toBe(255);
    });

    it('should return null for null/undefined', () => {
      expect(Color.tryParse(null)).toBeNull();
      expect(Color.tryParse(undefined)).toBeNull();
    });
  });
});
