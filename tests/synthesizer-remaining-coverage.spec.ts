import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { XfyunTTS } from '../src/synthesizer';

describe('synthesizer.ts 剩余覆盖率测试', () => {
  let synthesizer: XfyunTTS;

  beforeEach(() => {
    synthesizer = new XfyunTTS({
      appId: 'test-app-id',
      apiKey: 'test-key',
      apiSecret: 'test-secret'
    });
  });

  afterEach(() => {
    // 模拟 websocket 的 close 方法
    if ((synthesizer as any).websocket) {
      (synthesizer as any).websocket.close = () => {};
    }
    synthesizer.destroy();
  });

  describe('handleError 错误处理', () => {
    it('应该在发生错误时调用 onError 回调', () => {
      let capturedError: any;
      synthesizer = new XfyunTTS({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret'
      }, {
        onError: (error) => {
          capturedError = error;
        }
      });

      const testError = { code: 10001, message: 'Test error' };
      (synthesizer as any).handleError(testError);

      expect(capturedError).toEqual(testError);
      expect(synthesizer.getState()).toBe('error');
    });

    it('应该在没有 onError 回调时安全处理', () => {
      // 不传入 handlers
      const synthNoHandler = new XfyunTTS({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret'
      });

      expect(() => {
        (synthNoHandler as any).handleError({ code: 10001, message: 'Test error' });
      }).not.toThrow();

      synthNoHandler.destroy();
    });
  });

  describe('clearWebSocketCloseTimer 清除定时器', () => {
    it('应该清除 websocketCloseTimer', () => {
      (synthesizer as any).websocketCloseTimer = setTimeout(() => {}, 1000);

      (synthesizer as any).clearWebSocketCloseTimer();

      expect((synthesizer as any).websocketCloseTimer).toBeNull();
    });

    it('应该在 timer 为 null 时安全处理', () => {
      (synthesizer as any).websocketCloseTimer = null;

      expect(() => {
        (synthesizer as any).clearWebSocketCloseTimer();
      }).not.toThrow();
    });
  });

  describe('clearConnectingTimer 清除连接定时器', () => {
    it('应该清除 connectingTimer', () => {
      (synthesizer as any).connectingTimer = setTimeout(() => {}, 1000);

      (synthesizer as any).clearConnectingTimer();

      expect((synthesizer as any).connectingTimer).toBeNull();
    });

    it('应该在 timer 为 null 时安全处理', () => {
      (synthesizer as any).connectingTimer = null;

      expect(() => {
        (synthesizer as any).clearConnectingTimer();
      }).not.toThrow();
    });
  });

  describe('setState 状态管理', () => {
    it('应该在状态变化时调用 onStateChange', () => {
      let stateChanges: string[] = [];
      synthesizer = new XfyunTTS({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret'
      }, {
        onStateChange: (state) => {
          stateChanges.push(state);
        }
      });

      (synthesizer as any).setState('connecting');
      (synthesizer as any).setState('playing');

      expect(stateChanges).toContain('connecting');
      expect(stateChanges).toContain('playing');
    });

    it('应该在没有 onStateChange 时安全处理', () => {
      expect(() => {
        (synthesizer as any).setState('connecting');
      }).not.toThrow();
    });
  });

  describe('getMimeType MIME类型', () => {
    it('应该返回正确的 mp3 MIME类型', () => {
      expect(synthesizer.getMimeType()).toBe('audio/mpeg');
    });

    it('应该支持不同的音频格式', () => {
      const synthWav = new XfyunTTS({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        audioFormat: 'wav'
      });
      expect(synthWav.getMimeType()).toBe('audio/wav');
      synthWav.destroy();

      const synthPcm = new XfyunTTS({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        audioFormat: 'pcm'
      });
      expect(synthPcm.getMimeType()).toBe('audio/pcm');
      synthPcm.destroy();
    });
  });

  describe('getFileExtension 文件扩展名', () => {
    it('应该返回正确的扩展名', () => {
      expect((synthesizer as any).getFileExtension()).toBe('.mp3');
    });
  });

  describe('destroy 销毁', () => {
    it('应该在已销毁状态下安全处理', () => {
      synthesizer.destroy();
      
      expect(() => {
        synthesizer.destroy();
      }).not.toThrow();
    });

    it('应该清除所有定时器', () => {
      (synthesizer as any).websocketCloseTimer = setTimeout(() => {}, 1000);
      (synthesizer as any).connectingTimer = setTimeout(() => {}, 1000);

      synthesizer.destroy();

      expect((synthesizer as any).websocketCloseTimer).toBeNull();
      expect((synthesizer as any).connectingTimer).toBeNull();
    });
  });

  describe('getAudioData 获取音频数据', () => {
    it('应该在没有音频数据时返回 null', () => {
      expect(synthesizer.getAudioData()).toBeNull();
    });
  });

  describe('exportAudio 导出音频', () => {
    it('应该在没有音频数据时返回 null', () => {
      expect(synthesizer.exportAudio()).toBeNull();
    });
  });

  describe('downloadAudio 下载音频', () => {
    it('应该在没有音频数据时不抛出异常', () => {
      expect(() => {
        synthesizer.downloadAudio('test');
      }).not.toThrow();
    });
  });

  describe('sendStartFrame 发送开始帧', () => {
    it('应该在 websocket 未连接时记录错误日志', () => {
      const sendSpy = vi.fn();
      (synthesizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.CLOSED 
      };

      (synthesizer as any).sendStartFrame();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在 websocket 已连接时发送开始帧', () => {
      const sendSpy = vi.fn();
      (synthesizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };

      (synthesizer as any).sendStartFrame();

      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.business.voice_name).toBe('xiaoyan');
      expect(synthesizer.getState()).toBe('synthesizing');
    });

    it('应该在发送失败时调用 handleError', () => {
      const sendSpy = vi.fn(() => { throw new Error('Send failed'); });
      (synthesizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };

      (synthesizer as any).sendStartFrame();

      expect(synthesizer.getState()).toBe('error');
    });
  });
});
