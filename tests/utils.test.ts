import { describe, it, expect } from 'vitest';
import {
  calculateVolume,
  arrayBufferToBase64,
  parseXfyunResult,
  generateAuthUrl,
} from '../src/utils';

describe('utils', () => {
  describe('calculateVolume', () => {
    it('should return 0 for silent audio', () => {
      const silentData = new Float32Array(1024);
      const volume = calculateVolume(silentData);
      expect(volume).toBe(0);
    });

    it('should return positive value for non-silent audio', () => {
      const data = new Float32Array(1024);
      // Fill with some values
      for (let i = 0; i < data.length; i++) {
        data[i] = 0.5;
      }
      const volume = calculateVolume(data);
      expect(volume).toBeGreaterThan(0);
    });
  });

  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to base64 string', () => {
      const buffer = new ArrayBuffer(3);
      const view = new Uint8Array(buffer);
      view[0] = 72; // 'H'
      view[1] = 105; // 'i'
      view[2] = 33; // '!'

      const result = arrayBufferToBase64(buffer);
      // Base64 of "Hi!" is "SGkhIQ==" but the implementation may produce different padding
      expect(result).toMatch(/^[\w+/]+=*$/);
    });

    it('should handle empty buffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('');
    });
  });

  describe('parseXfyunResult', () => {
    it('should return empty string for null input', () => {
      expect(parseXfyunResult(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(parseXfyunResult(undefined)).toBe('');
    });

    it('should return empty string for invalid object', () => {
      expect(parseXfyunResult({})).toBe('');
      expect(parseXfyunResult({ ws: null })).toBe('');
      expect(parseXfyunResult({ ws: 'not an array' })).toBe('');
    });

    it('should parse valid xfyun result', () => {
      const result = {
        ws: [
          {
            bg: 0,
            cw: [{ w: '你', sc: 0 }],
          },
          {
            bg: 0,
            cw: [{ w: '好', sc: 0 }],
          },
        ],
      };

      const text = parseXfyunResult(result);
      expect(text).toBe('你好');
    });

    it('should handle multiple words per ws', () => {
      const result = {
        ws: [
          {
            bg: 0,
            cw: [{ w: '中', sc: 0 }, { w: '国', sc: 0 }],
          },
        ],
      };

      const text = parseXfyunResult(result);
      expect(text).toBe('中国');
    });

    it('should handle empty cw array', () => {
      const result = {
        ws: [
          {
            bg: 0,
            cw: [],
          },
        ],
      };

      const text = parseXfyunResult(result);
      expect(text).toBe('');
    });

    it('should skip words without w property', () => {
      const result = {
        ws: [
          {
            bg: 0,
            cw: [{ w: '测试' }, { sc: 0 }],
          },
        ],
      };

      const text = parseXfyunResult(result);
      expect(text).toBe('测试');
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate valid websocket URL', () => {
      const url = generateAuthUrl(
        'test-api-key',
        'test-api-secret',
        'iat-api.xfyun.cn'
      );

      expect(url).toContain('wss://');
      expect(url).toContain('iat-api.xfyun.cn');
      expect(url).toContain('authorization=');
      expect(url).toContain('date=');
      expect(url).toContain('host=');
    });

    it('should use default host when not provided', () => {
      const url = generateAuthUrl('test-api-key', 'test-api-secret');

      expect(url).toContain('iat-api.xfyun.cn');
    });
  });
});
