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
