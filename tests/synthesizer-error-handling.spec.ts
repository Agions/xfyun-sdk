import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTTS } from '../src/synthesizer.js';

describe('XfyunTTS 错误处理补充测试', () => {
  let tts: XfyunTTS;
  const mockWebSocket = {
    readyState: WebSocket.CONNECTING,
    send: vi.fn(),
    close: vi.fn(),
    binaryType: 'arraybuffer',
  };

  beforeEach(() => {
    vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket));
    vi.stubGlobal('window', {
      setTimeout: vi.fn((cb: Function) => cb()),
      clearTimeout: vi.fn(),
      AudioContext: vi.fn().mockImplementation(() => ({
        createAnalyser: vi.fn(),
        decodeAudioData: vi.fn(),
        disconnect: vi.fn(),
      })),
    });

    tts = new XfyunTTS({
      appId: 'test-app-id',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
    });
  });

  afterEach(() => {
    tts.destroy();
    vi.unstubAllGlobals();
  });

  describe('handleMessage 解析错误处理', () => {
    it('JSON 解析失败时应记录错误但不崩溃', () => {
      const mockOnAudioData = vi.fn();
      
      tts = new XfyunTTS(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        },
        { onAudioData: mockOnAudioData }
      );
      
      tts.start('测试');
      
      // 模拟 WebSocket 消息 - 无效 JSON
      const invalidJsonMessage = 'not valid json {{{';
      (tts as any).handleMessage(invalidJsonMessage);
      
      // 不应抛出异常
    });

    it('音频数据应在正确状态下处理', () => {
      const mockOnAudioData = vi.fn();
      
      tts = new XfyunTTS(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        },
        { onAudioData: mockOnAudioData }
      );
      
      // 在 idle 状态下收到音频数据
      (tts as any).state = 'idle';
      const audioData = new ArrayBuffer(100);
      (tts as any).handleMessage(audioData);
      
      // idle 状态下不应处理音频数据
      expect(mockOnAudioData).not.toHaveBeenCalled();
    });

    it('connected 状态下应正常处理音频数据', () => {
      const mockOnAudioData = vi.fn();
      
      tts = new XfyunTTS(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        },
        { onAudioData: mockOnAudioData }
      );
      
      (tts as any).state = 'connected';
      const audioData = new ArrayBuffer(100);
      (tts as any).handleMessage(audioData);
      
      expect(mockOnAudioData).toHaveBeenCalledWith(audioData);
    });

    it('synthesizing 状态下应正常处理音频数据', () => {
      const mockOnAudioData = vi.fn();
      
      tts = new XfyunTTS(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        },
        { onAudioData: mockOnAudioData }
      );
      
      (tts as any).state = 'synthesizing';
      const audioData = new ArrayBuffer(100);
      (tts as any).handleMessage(audioData);
      
      expect(mockOnAudioData).toHaveBeenCalledWith(audioData);
    });
  });

  describe('错误响应处理', () => {
    it('收到错误 code 时应调用 handleError', () => {
      const onError = vi.fn();
      
      tts = new XfyunTTS(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        },
        { onError }
      );
      
      tts.start('测试');
      
      // 模拟服务器返回错误
      const errorResponse = JSON.stringify({
        code: 10701,
        message: 'auth failed'
      });
      (tts as any).handleMessage(errorResponse);
      
      expect(onError).toHaveBeenCalled();
      // 错误对象可能包含 code 属性
      const error = onError.mock.calls[0][0];
      expect(error.code || error.message).toBeDefined();
    });
  });
});
