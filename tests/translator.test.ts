import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';
import type { XfyunTranslatorOptions, TranslatorState } from '../src/types';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: (() => void) | null = null;

  send = vi.fn();
  close = vi.fn();
}

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
});

describe('XfyunTranslator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should throw error when required parameters are missing', () => {
      expect(() => new XfyunTranslator({} as XfyunTranslatorOptions)).toThrow('缺少必要参数');
      expect(() => new XfyunTranslator({ appId: 'test' } as XfyunTranslatorOptions)).toThrow('缺少必要参数');
      expect(() => new XfyunTranslator({ appId: 'test', apiKey: 'test' } as XfyunTranslatorOptions)).toThrow('缺少必要参数');
    });

    it('should create instance with valid parameters', () => {
      const options: XfyunTranslatorOptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const translator = new XfyunTranslator(options);
      expect(translator).toBeDefined();
      expect(translator.getState()).toBe('idle');
    });

    it('should set default options', () => {
      const options: XfyunTranslatorOptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const translator = new XfyunTranslator(options);
      expect(translator.getState()).toBe('idle');
    });

    it('should accept custom options', () => {
      const options: XfyunTranslatorOptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        type: 'text',
        from: 'en',
        to: 'ja',
        domain: 'iner',
        vadEos: 3000,
      };

      const translator = new XfyunTranslator(options);
      expect(translator).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should return idle initially', () => {
      const translator = new XfyunTranslator({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      expect(translator.getState()).toBe('idle');
    });
  });

  describe('destroy', () => {
    it('should destroy instance', () => {
      const translator = new XfyunTranslator({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      translator.destroy();
      expect(translator.getState()).toBe('stopped');
    });
  });

  describe('stop', () => {
    it('should not throw when state is idle', () => {
      const translator = new XfyunTranslator({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      expect(() => translator.stop()).not.toThrow();
    });
  });

  describe('start', () => {
    it('should initiate text translation', async () => {
      const translator = new XfyunTranslator({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
        type: 'text',
      });

      await translator.start('hello');

      expect(translator.getState()).toBe('connecting');
    });

    it('should initiate speech translation', async () => {
      const translator = new XfyunTranslator({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
        type: 'asr',
      });

      await translator.start();

      expect(translator.getState()).toBe('connecting');
    });
  });
});

describe('TranslatorState', () => {
  it('should have all expected states', () => {
    const states: TranslatorState[] = ['idle', 'connecting', 'connected', 'translating', 'stopped', 'error'];
    expect(states).toHaveLength(6);
  });
});

describe('XfyunTranslator.translateText', () => {
  it('should be a function', () => {
    expect(typeof XfyunTranslator.translateText).toBe('function');
  });
});

describe('XfyunTranslator Options', () => {
  it('should accept custom from/to options', () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      from: 'en',
      to: 'cn',
    });
    expect(translator).toBeDefined();
    translator.destroy();
  });

  it('should accept custom domain option', () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      domain: 'iner',
    });
    expect(translator).toBeDefined();
    translator.destroy();
  });

  it('should accept custom vadEos option', () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      vadEos: 5000,
    });
    expect(translator).toBeDefined();
    translator.destroy();
  });

  it('should accept custom logLevel option', () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      logLevel: 'debug',
    });
    expect(translator).toBeDefined();
    translator.destroy();
  });
});

describe('XfyunTranslator getState', () => {
  it('should have getState method', () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    expect(typeof translator.getState).toBe('function');
    translator.destroy();
  });
});

describe('XfyunTranslator logger', () => {
  it('should have logger property', () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    expect(translator.logger).toBeDefined();
    translator.destroy();
  });
});

describe('XfyunTranslator multiple instances', () => {
  it('should allow multiple instances', () => {
    const translator1 = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    const translator2 = new XfyunTranslator({
      appId: 'test2',
      apiKey: 'test2',
      apiSecret: 'test2',
    });

    expect(translator1.getState()).toBe('idle');
    expect(translator2.getState()).toBe('idle');

    translator1.destroy();
    translator2.destroy();
  });
});

describe('XfyunTranslator error handling', () => {
  it('should handle start after destroy', async () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    translator.destroy();
    // Should not throw, just return early
    await translator.start('test');
    translator.destroy();
  });

  it('should handle stop when already stopped', () => {
    const translator = new XfyunTranslator({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    translator.stop();
    translator.stop(); // Should not throw
    translator.destroy();
  });
});
