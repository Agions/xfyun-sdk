import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator.js';

describe('XfyunTranslator 错误处理补充测试', () => {
  let translator: XfyunTranslator;
  let mockSetTimeout: ReturnType<typeof vi.fn>;
  let mockClearTimeout: ReturnType<typeof vi.fn>;

  const mockWebSocket = {
    readyState: WebSocket.CONNECTING,
    send: vi.fn(),
    close: vi.fn(),
  };

  beforeEach(() => {
    mockSetTimeout = vi.fn((cb: Function) => 1);
    mockClearTimeout = vi.fn();

    vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket));
    vi.stubGlobal('window', {
      setTimeout: mockSetTimeout,
      clearTimeout: mockClearTimeout,
      setInterval: vi.fn(() => 1),
      clearInterval: vi.fn(),
      AudioContext: vi.fn().mockImplementation(() => ({
        createAnalyser: vi.fn().mockReturnValue({
          fftSize: 2048,
          frequencyBinCount: 1024,
          getFloatTimeDomainData: vi.fn(),
          disconnect: vi.fn(),
        }),
        createMediaStreamSource: vi.fn().mockReturnValue({
          connect: vi.fn(),
          disconnect: vi.fn(),
        }),
        disconnect: vi.fn(),
      })),
      MediaStream: vi.fn(),
      navigator: {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }],
          }),
        },
      },
    });

    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      from: 'cn',
      to: 'en',
    });
  });

  afterEach(() => {
    translator.destroy();
    vi.unstubAllGlobals();
  });

  describe('handleError 定时器清理', () => {
    it('handleError 应清除 connectingTimer', () => {
      const onError = vi.fn();
      
      translator = new XfyunTranslator(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          from: 'cn',
          to: 'en',
        },
        { onError }
      );
      
      // 手动设置 connectingTimer
      (translator as any).connectingTimer = 123;
      
      // 触发 handleError
      (translator as any).handleError({ code: 10001, message: 'Test error' });
      
      // connectingTimer 应该被清除（变为 undefined 或 null）
      expect((translator as any).connectingTimer).toBeFalsy();
    });

    it('handleError 应清除 websocketCloseTimer', () => {
      const onError = vi.fn();
      
      translator = new XfyunTranslator(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          from: 'cn',
          to: 'en',
        },
        { onError }
      );
      
      // 手动设置 websocketCloseTimer
      (translator as any).websocketCloseTimer = 456;
      
      // 触发 handleError
      (translator as any).handleError({ code: 10001, message: 'Test error' });
      
      // websocketCloseTimer 应该被清除
      expect((translator as any).websocketCloseTimer).toBeFalsy();
    });

    it('handleError 应设置状态为 error', () => {
      const onError = vi.fn();
      
      translator = new XfyunTranslator(
        {
          appId: 'test-app-id',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          from: 'cn',
          to: 'en',
        },
        { onError }
      );
      
      (translator as any).handleError({ code: 10001, message: 'Test error' });
      
      expect((translator as any).state).toBe('error');
    });
  });

  describe('translateText 静态方法', () => {
    it('空文本应拒绝翻译', async () => {
      await expect(XfyunTranslator.translateText('', {
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test'
      })).rejects.toThrow('翻译文本不能为空');
    });

    it('仅空格文本应拒绝翻译', async () => {
      await expect(XfyunTranslator.translateText('   ', {
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test'
      })).rejects.toThrow('翻译文本不能为空');
    });
  });

  describe('clearWebSocketCloseTimer', () => {
    it('应正确清除 websocketCloseTimer', () => {
      (translator as any).websocketCloseTimer = 999;
      
      (translator as any).clearWebSocketCloseTimer();
      
      expect((translator as any).websocketCloseTimer).toBeFalsy();
      expect(mockClearTimeout).toHaveBeenCalled();
    });

    it('timer 为 null 时不应报错', () => {
      (translator as any).websocketCloseTimer = null;
      
      expect(() => {
        (translator as any).clearWebSocketCloseTimer();
      }).not.toThrow();
    });
  });

  describe('isDestroyed', () => {
    it('新建实例应返回 false', () => {
      expect(translator.isDestroyed()).toBe(false);
    });

    it('销毁后应返回 true', () => {
      translator.destroy();
      expect(translator.isDestroyed()).toBe(true);
    });
  });
});
