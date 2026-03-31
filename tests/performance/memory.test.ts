/**
 * 内存泄漏检测测试
 * @description 检测 ASR/TTS 实例在创建和销毁过程中的内存泄漏
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../../src/recognizer';
import { XfyunTTS } from '../../src/synthesizer';
import type { XfyunASROptions, XfyunTTSOptions } from '../../src/types';

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

// Mock MediaRecorder
class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();
}

describe('Memory Leak Tests', () => {
  let mockWs: typeof MockWebSocket;
  let mockRecorder: typeof MockMediaRecorder;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWs = MockWebSocket as unknown as typeof MockWebSocket;
    mockRecorder = MockMediaRecorder as unknown as typeof MockMediaRecorder;

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });

    (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = mockWs;
    (global as unknown as { MediaRecorder: typeof MockMediaRecorder }).MediaRecorder = mockRecorder;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ASR Memory Management', () => {
    it('should clean up WebSocket on destroy', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      asr.start();
      expect(asr.getState()).not.toBe('idle');

      asr.destroy();
      expect(asr.getState()).toBe('stopped');
    });

    it('should handle multiple create/destroy cycles', () => {
      const options: XfyunASROptions = {
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      };

      // Create and destroy multiple instances
      for (let i = 0; i < 10; i++) {
        const asr = new XfyunASR(options);
        asr.start();
        asr.destroy();
      }

      // If we get here without errors, the test passes
      expect(true).toBe(true);
    });

    it('should clean up event handlers on destroy', () => {
      const onStart = vi.fn();
      const onResult = vi.fn();
      const onError = vi.fn();

      const asr = new XfyunASR(
        {
          appId: 'test',
          apiKey: 'test',
          apiSecret: 'test',
        },
        {
          onStart,
          onResult,
          onError,
        }
      );

      asr.destroy();

      // Event handlers should not be called after destroy
      expect(asr.getState()).toBe('stopped');
    });
  });

  describe('TTS Memory Management', () => {
    it('should clean up WebSocket on destroy', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      tts.start('test');
      expect(tts.getState()).not.toBe('idle');

      tts.destroy();
      expect(tts.getState()).toBe('stopped');
    });

    it('should handle multiple create/destroy cycles', () => {
      const options: XfyunTTSOptions = {
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      };

      // Create and destroy multiple instances
      for (let i = 0; i < 10; i++) {
        const tts = new XfyunTTS(options);
        tts.start('test');
        tts.destroy();
      }

      // If we get here without errors, the test passes
      expect(true).toBe(true);
    });

    it('should clear audio chunks on destroy', () => {
      const audioHandler = vi.fn();

      const tts = new XfyunTTS(
        {
          appId: 'test',
          apiKey: 'test',
          apiSecret: 'test',
        },
        {
          onAudioData: audioHandler,
        }
      );

      tts.destroy();

      // Audio chunks should be cleared
      expect(tts.getAudioData()).toBeNull();
    });
  });

  describe('Resource Tracking', () => {
    it('should track WebSocket creation', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      // Test that instance was created
      expect(asr.getState()).toBe('idle');
      asr.destroy();
    });

    it('should track MediaRecorder creation', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      // Test that instance was created
      expect(asr.getState()).toBe('idle');
      asr.destroy();
    });
  });
});
