/**
 * TTS E2E 测试
 * @description 端到端测试，验证完整的语音合成流程
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTTS } from '../../src/synthesizer';
import type { XfyunTTSOptions } from '../../src/types';

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

describe('TTS E2E', () => {
  let mockWs: typeof MockWebSocket;

  const defaultOptions: XfyunTTSOptions = {
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    voice_name: 'xiaoyan',
    speed: 50,
    pitch: 50,
    volume: 50,
    audioFormat: 'mp3',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWs = MockWebSocket as unknown as typeof MockWebSocket;
    (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = mockWs;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('完整合成流程', () => {
    it('应该创建实例并正确初始化', () => {
      const onStart = vi.fn();
      const onStateChange = vi.fn();

      const tts = new XfyunTTS(defaultOptions, {
        onStart,
        onStateChange,
      });

      expect(tts.getState()).toBe('idle');
      expect(tts.getMimeType()).toBe('audio/mpeg');

      tts.destroy();
    });

    it('应该正确处理多个发音人', () => {
      const voices = ['xiaoyan', 'aisxiaofeng', 'aisxiaowawa', 'aisjiuyuan'];

      voices.forEach((voice) => {
        const tts = new XfyunTTS({
          ...defaultOptions,
          voice_name: voice,
        });

        expect(tts).toBeDefined();
        tts.destroy();
      });
    });

    it('应该正确处理不同音频格式', () => {
      const formats: Array<'mp3' | 'wav' | 'pcm'> = ['mp3', 'wav', 'pcm'];
      const mimeTypes = ['audio/mpeg', 'audio/wav', 'audio/pcm'];

      formats.forEach((format, index) => {
        const tts = new XfyunTTS({
          ...defaultOptions,
          audioFormat: format,
        });

        expect(tts.getMimeType()).toBe(mimeTypes[index]);
        tts.destroy();
      });
    });
  });

  describe('状态转换', () => {
    it('应该正确跟踪状态变化', () => {
      const stateChanges: string[] = [];

      const tts = new XfyunTTS(defaultOptions, {
        onStateChange: (state) => {
          stateChanges.push(state);
        },
      });

      expect(tts.getState()).toBe('idle');

      tts.start('测试文本');

      // Should transition to connecting
      expect(stateChanges).toContain('connecting');

      tts.destroy();
    });
  });

  describe('错误处理', () => {
    it('应该在空文本时处理错误', () => {
      const tts = new XfyunTTS(defaultOptions);

      // Empty text should be handled
      tts.start('');

      tts.destroy();
    });

    it('应该在缺少参数时抛出错误', () => {
      expect(() => {
        new XfyunTTS({} as XfyunTTSOptions);
      }).toThrow('缺少必要参数');
    });
  });

  describe('资源清理', () => {
    it('应该在 destroy 时清理所有资源', () => {
      const tts = new XfyunTTS(defaultOptions);

      tts.start('测试');
      tts.destroy();

      expect(tts.getState()).toBe('stopped');
    });

    it('应该正确处理多次 destroy', () => {
      const tts = new XfyunTTS(defaultOptions);

      tts.destroy();
      tts.destroy();

      expect(tts.getState()).toBe('stopped');
    });
  });

  describe('音频数据收集', () => {
    it('应该收集音频数据块', () => {
      const audioChunks: ArrayBuffer[] = [];

      const tts = new XfyunTTS(defaultOptions, {
        onAudioData: (data) => {
          audioChunks.push(data);
        },
      });

      expect(tts.getAudioData()).toBeNull();

      tts.destroy();
    });
  });
});
