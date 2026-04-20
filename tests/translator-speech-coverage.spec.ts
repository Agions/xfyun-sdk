import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts 语音翻译测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      type: 'asr',
      from: 'cn',
      to: 'en'
    });
  });

  afterEach(() => {
    if (!translator.isDestroyed()) {
      // 模拟 websocket 的 close 方法
      if ((translator as any).websocket) {
        (translator as any).websocket.close = () => {};
      }
      translator.destroy();
    }
  });

  describe('sendTextFrame 发送文本帧', () => {
    it('应该在 websocket 未连接时不发送', () => {
      const sendSpy = vi.fn();
      (translator as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.CLOSED 
      };

      (translator as any).sendTextFrame('test');

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在 websocket 已连接时发送文本帧', () => {
      const sendSpy = vi.fn();
      (translator as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };

      (translator as any).sendTextFrame('hello');

      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.business.from).toBe('cn');
      expect(sentData.business.to).toBe('en');
    });
  });

  describe('sendStartFrame 发送开始帧', () => {
    it('应该在 websocket 未连接时不发送', () => {
      const sendSpy = vi.fn();
      (translator as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.CLOSED 
      };

      (translator as any).sendStartFrame();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在 websocket 已连接时发送开始帧', () => {
      const sendSpy = vi.fn();
      (translator as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };

      (translator as any).sendStartFrame();

      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.data.status).toBe(0);
      expect(sentData.business.data_type).toBe('audio');
    });
  });

  describe('sendAudioData 发送音频数据', () => {
    it('应该在 websocket 未连接时不发送', () => {
      const sendSpy = vi.fn();
      (translator as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.CLOSED 
      };
      (translator as any).audioDataQueue = ['dGVzdA=='];

      (translator as any).sendAudioData();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在状态不是 translating 时不发送', () => {
      const sendSpy = vi.fn();
      (translator as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };
      (translator as any).state = 'idle';
      (translator as any).audioDataQueue = ['dGVzdA=='];

      (translator as any).sendAudioData();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在已连接且状态为 translating 时发送', () => {
      const sendSpy = vi.fn();
      (translator as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };
      (translator as any).state = 'translating';
      (translator as any).audioDataQueue = ['dGVzdA=='];

      (translator as any).sendAudioData();

      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.data.status).toBe(1);
      expect(sentData.data.audio).toBe('dGVzdA==');
    });
  });

  describe('handleSpeechMessage 处理语音消息', () => {
    it('应该在数据不是字符串时返回', () => {
      expect(() => {
        (translator as any).handleSpeechMessage(new ArrayBuffer(100));
      }).not.toThrow();
    });

    it('应该在消息 code 不为 0 时调用 handleError', () => {
      const handleErrorSpy = vi.spyOn(translator as any, 'handleError');
      const message = JSON.stringify({ code: 10001, message: 'error' });

      (translator as any).handleSpeechMessage(message);

      expect(handleErrorSpy).toHaveBeenCalledWith({ code: 10001, message: 'error' });
    });

    it('应该在成功时调用 onResult 回调', () => {
      let capturedResult: any;
      translator.setHandlers({
        onResult: (result) => {
          capturedResult = result;
        }
      });

      const message = JSON.stringify({
        code: 0,
        data: {
          result: {
            source: '你好',
            target: 'hello'
          },
          status: 2
        }
      });

      (translator as any).handleSpeechMessage(message);

      expect(capturedResult).toBeDefined();
      expect(capturedResult.sourceText).toBe('你好');
      expect(capturedResult.targetText).toBe('hello');
      expect(capturedResult.isFinal).toBe(true);
    });

    it('应该在非最终结果时调用 onResult 但不调用 onEnd', () => {
      let onEndCalled = false;
      translator.setHandlers({
        onResult: () => {},
        onEnd: () => { onEndCalled = true; }
      });

      const message = JSON.stringify({
        code: 0,
        data: {
          result: {
            source: '你好',
            target: 'hello'
          },
          status: 1 // 非最终结果
        }
      });

      (translator as any).handleSpeechMessage(message);

      expect(onEndCalled).toBe(false);
    });
  });

  describe('handleMessage 处理文本消息', () => {
    it('应该在消息 code 不为 0 时调用 handleError', () => {
      const handleErrorSpy = vi.spyOn(translator as any, 'handleError');
      const message = JSON.stringify({ code: 10001, message: 'error' });

      (translator as any).handleMessage(message);

      expect(handleErrorSpy).toHaveBeenCalled();
    });

    it('应该在成功时调用 onResult 和 onEnd 回调', () => {
      let capturedResult: any;
      let onEndCalled = false;
      translator.setHandlers({
        onResult: (result) => { capturedResult = result; },
        onEnd: () => { onEndCalled = true; }
      });

      const message = JSON.stringify({
        code: 0,
        data: {
          result: {
            source: '你好',
            target: 'hello'
          }
        }
      });

      (translator as any).handleMessage(message);

      expect(capturedResult).toBeDefined();
      expect(capturedResult.isFinal).toBe(true);
      expect(onEndCalled).toBe(true);
    });
  });

  describe('stop 停止翻译', () => {
    it('应该在 idle 状态下直接返回', () => {
      (translator as any).state = 'idle';
      
      expect(() => {
        translator.stop();
      }).not.toThrow();
    });

    it('应该在 stopped 状态下直接返回', () => {
      (translator as any).state = 'stopped';
      
      expect(() => {
        translator.stop();
      }).not.toThrow();
    });

    it('应该在 translating 状态下停止并清理资源', () => {
      (translator as any).state = 'translating';
      // 需要先设置 recorder 才会调用 stopRecorder
      (translator as any).recorder = { state: 'recording', stop: () => {} };
      // 需要先设置 microphoneStream 才会调用 releaseMicrophone
      (translator as any).microphoneStream = { getTracks: () => [{ stop: () => {} }] };
      const stopRecorderSpy = vi.spyOn(translator as any, 'stopRecorder');
      const releaseMicSpy = vi.spyOn(translator as any, 'releaseMicrophone');

      translator.stop();

      expect(stopRecorderSpy).toHaveBeenCalled();
      expect(releaseMicSpy).toHaveBeenCalled();
      expect((translator as any).state).toBe('stopped');
    });
  });

  describe('releaseMicrophone 释放麦克风', () => {
    it('应该在没有麦克风流时安全返回', () => {
      (translator as any).microphoneStream = null;
      
      expect(() => {
        (translator as any).releaseMicrophone();
      }).not.toThrow();
    });
  });

  describe('setState 状态管理', () => {
    it('应该在状态变化时调用 onStateChange', () => {
      let stateChanges: string[] = [];
      translator.setHandlers({
        onStateChange: (state) => { stateChanges.push(state); }
      });

      (translator as any).setState('connecting');
      (translator as any).setState('connected');

      expect(stateChanges).toContain('connecting');
      expect(stateChanges).toContain('connected');
    });
  });
});
