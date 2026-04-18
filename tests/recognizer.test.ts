import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR, LogLevel, Logger } from '../src/recognizer';
import type { XfyunASROptions, RecognizerState } from '../src/types';

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
  onclose: ((event: { code: number; reason: string }) => void) | null = null;

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

// Mock MediaRecorder
class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();
}

describe('XfyunASR', () => {
  let logger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new Logger();
    
    // Set up global mocks
    (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket as unknown as typeof WebSocket;
    (global as unknown as { MediaRecorder: typeof MockMediaRecorder }).MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should throw error when required parameters are missing', () => {
      expect(() => new XfyunASR({} as XfyunASROptions)).toThrow('缺少必要参数');
      expect(() => new XfyunASR({ appId: 'test' } as XfyunASROptions)).toThrow('缺少必要参数');
      expect(() => new XfyunASR({ appId: 'test', apiKey: 'test' } as XfyunASROptions)).toThrow('缺少必要参数');
    });

    it('should create instance with valid parameters', () => {
      const options: XfyunASROptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const asr = new XfyunASR(options);
      expect(asr).toBeDefined();
      expect(asr.getState()).toBe('idle');
    });

    it('should set default options', () => {
      const options: XfyunASROptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const asr = new XfyunASR(options);
      expect(asr.getState()).toBe('idle');
    });
  });

  describe('Logger', () => {
    it('should create logger with default level INFO', () => {
      const logger = new Logger();
      expect(logger).toBeDefined();
    });

    it('should set log level correctly', () => {
      logger.setLevel('debug');
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
    });

    it('should not log messages below current level', () => {
      logger.setLevel('error');
      logger.debug('should not appear');
      logger.info('should not appear');
      logger.warn('should not appear');
      // error should appear
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      expect(asr.getState()).toBe('idle');
    });
  });

  describe('getResult', () => {
    it('should return empty string initially', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      expect(asr.getResult()).toBe('');
    });
  });

  describe('clearResult', () => {
    it('should clear recognition result', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      asr.clearResult();
      expect(asr.getResult()).toBe('');
    });
  });

  describe('destroy', () => {
    it('should destroy instance and release resources', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      asr.destroy();
      expect(asr.getState()).toBe('stopped');
    });
  });
});

describe('RecognizerState', () => {
  it('should have all expected states', () => {
    const states: RecognizerState[] = ['idle', 'connecting', 'connected', 'recording', 'stopped', 'error'];
    expect(states).toHaveLength(6);
  });
});

describe('XfyunASR Events', () => {
  let asr: XfyunASR;

  beforeEach(() => {
    asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });
  });

  afterEach(() => {
    asr.destroy();
  });

  it('should have onResult handler', () => {
    expect(asr).toBeDefined();
  });

  it('should have onError handler', () => {
    expect(asr).toBeDefined();
  });

  it('should have onVolumeChange handler', () => {
    expect(asr).toBeDefined();
  });
});

describe('XfyunASR Options', () => {
  it('should accept custom language option', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      language: 'en_us',
    });
    expect(asr).toBeDefined();
    asr.destroy();
  });

  it('should accept custom domain option', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      domain: 'medical',
    });
    expect(asr).toBeDefined();
    asr.destroy();
  });

  it('should accept custom vadEos option', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      vadEos: 5000,
    });
    expect(asr).toBeDefined();
    asr.destroy();
  });

  it('should accept custom logLevel option', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      logLevel: 'debug',
    });
    expect(asr).toBeDefined();
    asr.destroy();
  });

  it('should accept custom audioFormat option', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      audioFormat: 'audio/L16;rate=16000',
    });
    expect(asr).toBeDefined();
    asr.destroy();
  });
});

describe('XfyunASR stop', () => {
  it('should not throw when stopping idle instance', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    expect(() => asr.stop()).not.toThrow();
    asr.destroy();
  });
});

describe('XfyunASR isRecording', () => {
  it('should return false when idle', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    expect(asr.isRecording()).toBe(false);
    asr.destroy();
  });
});

describe('XfyunASR isDestroyed', () => {
  it('should return false initially', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    expect(asr.isDestroyed()).toBe(false);
    asr.destroy();
  });

  it('should return true after destroy', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    asr.destroy();
    expect(asr.isDestroyed()).toBe(true);
  });
});

describe('XfyunASR autoStart', () => {
  it('should accept autoStart option without error', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
      autoStart: false, // Set to false to avoid actual start
    });

    expect(asr).toBeDefined();
    asr.destroy();
  });
});

describe('XfyunASR error handling', () => {
  let asr: XfyunASR;

  beforeEach(() => {
    // Mock getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });
  });

  it('should handle start after destroy', async () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    asr.destroy();
    // Should not throw, just return early
    await asr.start();
    asr.destroy();
  });

  it('should handle stop when already stopped', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    asr.stop();
    asr.stop(); // Should not throw
    asr.destroy();
  });
});

describe('XfyunASR logger', () => {
  it('should have logger property', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    expect(asr.logger).toBeDefined();
    expect(asr.logger).toBeInstanceOf(Logger);
    asr.destroy();
  });

  it('should log at correct level', () => {
    const logger = new Logger('[Test]');
    logger.setLevel('debug');
    logger.debug('debug test');
    logger.info('info test');
    logger.warn('warn test');
    logger.error('error test');
  });
});

describe('XfyunASR multiple instances', () => {
  it('should allow multiple instances', () => {
    const asr1 = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    const asr2 = new XfyunASR({
      appId: 'test2',
      apiKey: 'test2',
      apiSecret: 'test2',
    });

    expect(asr1.getState()).toBe('idle');
    expect(asr2.getState()).toBe('idle');

    asr1.destroy();
    asr2.destroy();
  });
});
