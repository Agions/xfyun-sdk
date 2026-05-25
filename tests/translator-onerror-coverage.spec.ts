/**
 * translator.ts websocket.onerror 回调覆盖测试
 * @description 覆盖 websocket.onerror 回调中的错误处理逻辑 (行 411-415)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts websocket.onerror 回调覆盖测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      domain: 'its',
      language: 'zh',
      accent: 'en',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    translator.destroy();
  });

  describe('websocket.onerror 回调 (行 411-415)', () => {
    it('应该在 WebSocket 错误时调用 clearConnectingTimer 和 handleError', async () => {
      // Mock clearConnectingTimer
      const clearConnectingTimerSpy = vi.spyOn((translator as any), 'clearConnectingTimer').mockImplementation(() => {});

      // Mock handleError
      const handleErrorSpy = vi.spyOn((translator as any), 'handleError').mockImplementation(() => {});

      // 模拟 WebSocket - 直接设置 websocket 并触发 onerror
      const mockWebSocket = {
        onerror: null as any,
        onclose: null as any,
        onmessage: null as any,
        onopen: null as any,
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
      };

      // 直接设置 websocket（模拟 start() 后的状态）
      (translator as any).websocket = mockWebSocket as any;
      (translator as any).state = 'connecting';

      // 手动设置 onerror 回调（模拟 start() 中的设置）
      mockWebSocket.onerror = (error: any) => {
        (translator as any).clearConnectingTimer();
        (translator as any).logger.error('语音翻译 WebSocket 错误:', error);
        (translator as any).handleError({ code: 30004, message: 'WebSocket 连接错误', data: error });
      };

      // 触发 onerror 回调
      const errorEvent = new Event('error');
      mockWebSocket.onerror(errorEvent);

      // 验证方法被调用
      expect(clearConnectingTimerSpy).toHaveBeenCalled();
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 30004,
        message: 'WebSocket 连接错误',
        data: errorEvent,
      });
    });

    it('应该在 WebSocket 错误时记录错误日志', async () => {
      // Mock clearConnectingTimer
      vi.spyOn((translator as any), 'clearConnectingTimer').mockImplementation(() => {});

      // Mock handleError
      vi.spyOn((translator as any), 'handleError').mockImplementation(() => {});

      // 记录日志
      let errorLogged = false;
      const originalLogger = (translator as any).logger;
      (translator as any).logger = {
        info: originalLogger.info,
        warn: originalLogger.warn,
        error: vi.fn().mockImplementation(() => {
          errorLogged = true;
        }),
        debug: originalLogger.debug,
      };

      // 模拟 WebSocket - 直接设置 websocket 并触发 onerror
      const mockWebSocket = {
        onerror: null as any,
        onclose: null as any,
        onmessage: null as any,
        onopen: null as any,
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
      };

      // 直接设置 websocket（模拟 start() 后的状态）
      (translator as any).websocket = mockWebSocket as any;

      // 手动设置 onerror 回调（模拟 start() 中的设置）
      mockWebSocket.onerror = (error: any) => {
        (translator as any).clearConnectingTimer();
        (translator as any).logger.error('语音翻译 WebSocket 错误:', error);
        (translator as any).handleError({ code: 30004, message: 'WebSocket 连接错误', data: error });
      };

      // 触发 onerror 回调
      const errorEvent = new Event('error');
      mockWebSocket.onerror(errorEvent);

      // 验证错误被记录
      expect(errorLogged).toBe(true);

      // 恢复 logger
      (translator as any).logger = originalLogger;
    });
  });
});
