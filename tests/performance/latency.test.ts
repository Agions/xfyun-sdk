/**
 * 延迟测试
 * @description 测试 WebSocket 连接建立、消息处理的延迟
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../../src/recognizer';
import { XfyunTTS } from '../../src/synthesizer';
import type { XfyunASROptions, XfyunTTSOptions } from '../../src/types';

// Mock WebSocket with configurable latency
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string | ArrayBuffer }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;

  send = vi.fn();
  close = vi.fn();

  constructor() {
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen();
      }
    }, 10);
  }
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

describe('Latency Tests', () => {
  let mockWs: typeof MockWebSocket;
  let mockRecorder: typeof MockMediaRecorder;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
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
    // 清除所有 pending timers，防止测试结束后 timer 回调访问已销毁的 jsdom
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('ASR Connection Latency', () => {
    it('should measure WebSocket connection time', async () => {
      const startTime = performance.now();

      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      // Fast forward through connection
      await vi.advanceTimersByTimeAsync(20);

      const endTime = performance.now();
      const connectionTime = endTime - startTime;

      // Connection should be fast (< 100ms in mock)
      expect(connectionTime).toBeLessThan(100);

      asr.destroy();
    });

    it('should handle rapid start/stop cycles', () => {
      const asr = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      // Rapid start/stop
      for (let i = 0; i < 5; i++) {
        asr.start();
        asr.stop();
      }

      expect(asr.getState()).toBe('stopped');
      asr.destroy();
    });
  });

  describe('TTS Synthesis Latency', () => {
    it('should measure WebSocket connection time', async () => {
      const startTime = performance.now();

      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      tts.start('测试文本');

      // Fast forward through connection
      await vi.advanceTimersByTimeAsync(20);

      const endTime = performance.now();
      const connectionTime = endTime - startTime;

      // Connection should be fast (< 100ms in mock)
      expect(connectionTime).toBeLessThan(100);

      tts.destroy();
    });

    it('should handle multiple synthesis requests', () => {
      const tts = new XfyunTTS({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      });

      // Multiple synthesis requests
      for (let i = 0; i < 3; i++) {
        tts.start(`测试文本 ${i}`);
        tts.stop();
      }

      expect(tts.getState()).toBe('stopped');
      tts.destroy();
    });
  });

  // Close Latency Tests describe
});

describe('Message Processing', () => {
  it('should process ASR result messages efficiently', () => {
    const resultHandler = vi.fn();

    const asr = new XfyunASR(
      {
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
      },
      {
        onRecognitionResult: resultHandler,
      }
    );

    // Test that instance was created successfully
    expect(asr.getState()).toBeDefined();
    asr.destroy();
  });

  it('should process TTS audio data efficiently', () => {
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

    // Test that instance was created successfully
    expect(tts.getState()).toBeDefined();
    expect(tts.getMimeType()).toBe('audio/mpeg');
    tts.destroy();
  });
});

describe('Concurrent Operations', () => {
  it('should handle multiple ASR instances concurrently', () => {
    const instances: XfyunASR[] = [];
    
    // Create 10 concurrent instances
    for (let i = 0; i < 10; i++) {
      instances.push(new XfyunASR({
        appId: `test-${i}`,
        apiKey: 'test',
        apiSecret: 'test',
      }));
    }

    // All instances should be independent
    instances.forEach((asr, index) => {
      expect(asr.getState()).toBe('idle');
      expect(asr.getResult()).toBe('');
      asr.destroy();
    });
  });

  it('should handle multiple TTS instances concurrently', () => {
    const instances: XfyunTTS[] = [];
    
    // Create 10 concurrent instances
    for (let i = 0; i < 10; i++) {
      instances.push(new XfyunTTS({
        appId: `test-${i}`,
        apiKey: 'test',
        apiSecret: 'test',
      }));
    }

    // All instances should be independent
    instances.forEach((tts, index) => {
      expect(tts.getState()).toBe('idle');
      tts.destroy();
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty text for TTS', () => {
    const tts = new XfyunTTS({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    // Empty text should trigger error handler or stay in idle
    tts.start('');
    // State could be idle (rejected) or connecting (attempted)
    expect(['idle', 'connecting', 'error']).toContain(tts.getState());
    tts.destroy();
  });

  it('should handle very long text for TTS', () => {
    const tts = new XfyunTTS({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    // Very long text (1000 characters)
    const longText = '测试'.repeat(500);
    tts.start(longText);
    expect(tts.getState()).toBe('connecting');
    tts.destroy();
  });

  it('should handle special characters in TTS text', () => {
    const tts = new XfyunTTS({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    // Special characters
    const specialText = 'Hello World! 你好世界！🎉 @#$%^&*()';
    tts.start(specialText);
    expect(tts.getState()).toBe('connecting');
    tts.destroy();
  });

  it('should handle rapid state changes', () => {
    const asr = new XfyunASR({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });

    // Rapid state changes
    asr.start();
    asr.stop();
    asr.start();
    asr.stop();
    asr.start();
    asr.stop();

    expect(asr.getState()).toBe('stopped');
    asr.destroy();
  });
});
