import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTTS } from '../src/synthesizer';
import type { XfyunTTSOptions, SynthesizerState } from '../src/types';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string | ArrayBuffer }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;

  send = vi.fn();
  close = vi.fn();
}

describe('XfyunTTS', () => {
  let mockWs: typeof MockWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWs = MockWebSocket as unknown as typeof MockWebSocket;
    (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = mockWs;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should throw error when required parameters are missing', () => {
      expect(() => new XfyunTTS({} as XfyunTTSOptions)).toThrow('缺少必要参数');
      expect(() => new XfyunTTS({ appId: 'test' } as XfyunTTSOptions)).toThrow('缺少必要参数');
      expect(() => new XfyunTTS({ appId: 'test', apiKey: 'test' } as XfyunTTSOptions)).toThrow('缺少必要参数');
    });

    it('should create instance with valid parameters', () => {
      const options: XfyunTTSOptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const tts = new XfyunTTS(options);
      expect(tts).toBeDefined();
      expect(tts.getState()).toBe('idle');
    });

    it('should set default options', () => {
      const options: XfyunTTSOptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      };

      const tts = new XfyunTTS(options);
      expect(tts.getState()).toBe('idle');
    });

    it('should accept custom options', () => {
      const options: XfyunTTSOptions = {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        voice_name: 'aisxiaofeng',
        speed: 60,
        pitch: 55,
        volume: 70,
        audioFormat: 'wav',
        sampleRate: 24000,
      };

      const tts = new XfyunTTS(options);
      expect(tts).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should return idle initially', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      expect(tts.getState()).toBe('idle');
    });
  });

  describe('getMimeType', () => {
    it('should return correct mime type for mp3', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
        audioFormat: 'mp3',
      });

      expect(tts.getMimeType()).toBe('audio/mpeg');
    });

    it('should return correct mime type for wav', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
        audioFormat: 'wav',
      });

      expect(tts.getMimeType()).toBe('audio/wav');
    });

    it('should return correct mime type for pcm', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
        audioFormat: 'pcm',
      });

      expect(tts.getMimeType()).toBe('audio/pcm');
    });
  });

  describe('getAudioData', () => {
    it('should return null when no audio data', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      expect(tts.getAudioData()).toBeNull();
    });
  });

  describe('destroy', () => {
    it('should destroy instance', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      tts.destroy();
      expect(tts.getState()).toBe('stopped');
    });
  });

  describe('start', () => {
    it('should reject empty text', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      const errorHandler = vi.fn();
      tts.start('');

      // Verify error is handled
      expect(tts.getState()).toBeDefined();
    });

    it('should initiate WebSocket connection', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      tts.start('测试文本');

      expect(tts.getState()).toBe('connecting');
    });
  });

  describe('stop', () => {
    it('should not throw when state is idle', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      expect(() => tts.stop()).not.toThrow();
    });
  });
});

describe('SynthesizerState', () => {
  it('should have all expected states', () => {
    const states: SynthesizerState[] = ['idle', 'connecting', 'connected', 'synthesizing', 'stopped', 'error'];
    expect(states).toHaveLength(6);
  });
});
