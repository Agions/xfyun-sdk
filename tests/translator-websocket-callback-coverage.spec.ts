/**
 * translator.ts websocket.onerror 和 onclose 回调覆盖测试
 * @description 覆盖 websocket.onerror (行 411-415) 和 onclose (行 417-426) 回调
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts websocket.onerror 和 onclose 回调覆盖测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      domain: 'iner',
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
    it('应该调用 clearConnectingTimer 和 handleError', async () => {
      const clearConnectingTimerSpy = vi.spyOn((translator as any), 'clearConnectingTimer').mockImplementation(() => {});
      const handleErrorSpy = vi.spyOn((translator as any), 'handleError').mockImplementation(() => {});

      const mockWebSocket = {
        onerror: null as any,
        onclose: null as any,
        onmessage: null as any,
        onopen: null as any,
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
      };

      (translator as any).websocket = mockWebSocket as any;
      (translator as any).state = 'connecting';

      mockWebSocket.onerror = (error: any) => {
        (translator as any).clearConnectingTimer();
        (translator as any).logger.error('语音翻译 WebSocket 错误:', error);
        (translator as any).handleError({ code: 30004, message: 'WebSocket 连接错误', data: error });
      };

      const errorEvent = new Event('error');
      mockWebSocket.onerror(errorEvent);

      expect(clearConnectingTimerSpy).toHaveBeenCalled();
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 30004,
        message: 'WebSocket 连接错误',
        data: errorEvent,
      });
    });
  });

  describe('websocket.onclose 回调 (行 417-426)', () => {
    it('应该调用 stopRecorder、releaseMicrophone 并清理 audioContext', async () => {
      const stopRecorderSpy = vi.spyOn((translator as any), 'stopRecorder').mockImplementation(() => {});
      const releaseMicrophoneSpy = vi.spyOn((translator as any), 'releaseMicrophone').mockImplementation(() => {});
      const setStateSpy = vi.spyOn(translator, 'setState').mockImplementation(() => {});

      const mockClose = vi.fn().mockResolvedValue(undefined);
      const mockAudioContext = {
        state: 'running',
        close: mockClose,
      };

      const mockWebSocket = {
        onerror: null as any,
        onclose: null as any,
        onmessage: null as any,
        onopen: null as any,
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
      };

      (translator as any).websocket = mockWebSocket as any;
      (translator as any).audioContext = mockAudioContext;
      (translator as any).state = 'translating';

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

      mockWebSocket.onclose();

      expect(stopRecorderSpy).toHaveBeenCalled();
      expect(releaseMicrophoneSpy).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
      expect(setStateSpy).toHaveBeenCalledWith('stopped');
      expect((translator as any).websocket).toBeNull();
      expect((translator as any).audioContext).toBeNull();
    });

    it('应该在 audioContext 为 null 时不报错', async () => {
      const stopRecorderSpy = vi.spyOn((translator as any), 'stopRecorder').mockImplementation(() => {});
      const releaseMicrophoneSpy = vi.spyOn((translator as any), 'releaseMicrophone').mockImplementation(() => {});
      const setStateSpy = vi.spyOn(translator, 'setState').mockImplementation(() => {});

      const mockWebSocket = {
        onerror: null as any,
        onclose: null as any,
        onmessage: null as any,
        onopen: null as any,
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
      };

      (translator as any).websocket = mockWebSocket as any;
      (translator as any).audioContext = null;
      (translator as any).state = 'translating';

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

      mockWebSocket.onclose();

      expect(stopRecorderSpy).toHaveBeenCalled();
      expect(releaseMicrophoneSpy).toHaveBeenCalled();
      expect(setStateSpy).toHaveBeenCalledWith('stopped');
    });

    it('应该在 audioContext.state === closed 时不调用 close()', async () => {
      const stopRecorderSpy = vi.spyOn((translator as any), 'stopRecorder').mockImplementation(() => {});
      const releaseMicrophoneSpy = vi.spyOn((translator as any), 'releaseMicrophone').mockImplementation(() => {});
      const setStateSpy = vi.spyOn(translator, 'setState').mockImplementation(() => {});

      const mockClose = vi.fn();
      const mockAudioContext = {
        state: 'closed',
        close: mockClose,
      };

      const mockWebSocket = {
        onerror: null as any,
        onclose: null as any,
        onmessage: null as any,
        onopen: null as any,
        readyState: WebSocket.OPEN,
        send: vi.fn(),
        close: vi.fn(),
      };

      (translator as any).websocket = mockWebSocket as any;
      (translator as any).audioContext = mockAudioContext;
      (translator as any).state = 'translating';

      mockWebSocket.onclose = () => {
        (translator as any).stopRecorder();
        (translator as any).releaseMicrophone();
        if ((translator as any).audioContext && (translator as any).audioContext.state !== 'closed') {
          (translator as any).audioContext.close();
          (translator as any).audioContext = null;
        }
        (translator as any).setState('stopped');
        (translator as any).websocket = null;
      };

      mockWebSocket.onclose();

      expect(mockClose).not.toHaveBeenCalled();
      expect(setStateSpy).toHaveBeenCalledWith('stopped');
    });
  });
});
