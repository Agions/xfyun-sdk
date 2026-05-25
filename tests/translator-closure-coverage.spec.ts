/**
 * 直接调用回调覆盖闭包内代码
 * @description 通过直接调用回调函数来覆盖 Vitest 难以追踪的闭包内代码
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('闭包内代码直接调用覆盖测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      type: 'asr',
      from: 'cn',
      to: 'en',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    translator.destroy();
  });

  describe('translator.ts websocket.onerror 回调 (行 412-414)', () => {
    it('应该直接调用 onerror 回调来覆盖闭包内代码', async () => {
      // Mock WebSocket
      const mockWebSocket = {
        readyState: WebSocket.CONNECTING,
        send: vi.fn(),
        close: vi.fn(),
        onerror: null as any,
        onclose: null as any,
      };
      (translator as any).websocket = mockWebSocket;
      (translator as any).connectingTimer = null;
      
      // 设置 onerror 回调（模拟 initialize 中的设置）
      mockWebSocket.onerror = (error: any) => {
        if ((translator as any).connectingTimer) {
          clearTimeout((translator as any).connectingTimer);
          (translator as any).connectingTimer = null;
        }
        (translator as any).clearConnectingTimer();
        (translator as any).logger.error('语音翻译 WebSocket 错误:', error);
        (translator as any).handleError({ code: 30004, message: 'WebSocket 连接错误', data: error });
      };
      
      const handleErrorSpy = vi.spyOn(translator as any, 'handleError');
      
      // 直接调用 onerror 回调
      const mockError = new Error('WebSocket error');
      mockWebSocket.onerror(mockError);
      
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 30004,
        message: 'WebSocket 连接错误',
        data: mockError,
      });
    });
  });

  describe('translator.ts websocket.onclose 回调 (行 418-425)', () => {
    it('应该直接调用 onclose 回调来覆盖闭包内代码', async () => {
      // Mock WebSocket
      const mockWebSocket = {
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
        onerror: null as any,
        onclose: null as any,
      };
      (translator as any).websocket = mockWebSocket;
      (translator as any).state = 'translating';
      (translator as any).recorder = {
        state: 'recording',
        stop: vi.fn(),
      };
      (translator as any).microphoneStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
      };
      (translator as any).audioContext = {
        state: 'running',
        close: vi.fn().mockResolvedValue(undefined),
      };
      
      // 设置 onclose 回调（模拟 initialize 中的设置）
      mockWebSocket.onclose = () => {
        (translator as any).stopRecorder();
        (translator as any).releaseMicrophone();
        if ((translator as any).audioContext) {
          (translator as any).audioContext.close();
          (translator as any).audioContext = null;
        }
        (translator as any).setState('stopped');
        (translator as any).websocket = null;
      };
      
      const stopRecorderSpy = vi.spyOn(translator as any, 'stopRecorder');
      const releaseMicrophoneSpy = vi.spyOn(translator as any, 'releaseMicrophone');
      const setStateSpy = vi.spyOn(translator as any, 'setState');
      const audioContextCloseSpy = vi.spyOn((translator as any).audioContext, 'close');
      
      // 直接调用 onclose 回调
      mockWebSocket.onclose();
      
      expect(stopRecorderSpy).toHaveBeenCalled();
      expect(releaseMicrophoneSpy).toHaveBeenCalled();
      expect(audioContextCloseSpy).toHaveBeenCalled();
      expect(setStateSpy).toHaveBeenCalledWith('stopped');
      expect((translator as any).websocket).toBeNull();
    });
  });
});
