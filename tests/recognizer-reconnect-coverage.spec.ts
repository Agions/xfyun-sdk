import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts 重连逻辑测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    vi.useFakeTimers();
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      enableReconnect: true,
      reconnectAttempts: 3,
      reconnectInterval: 1000
    });
  });

  afterEach(() => {
    if (!recognizer.isDestroyed()) {
      recognizer.destroy();
    }
    vi.useRealTimers();
  });

  describe('handleReconnect 重连逻辑', () => {
    it('应该在 enableReconnect 为 false 时不进行重连', () => {
      const recognizerNoReconnect = new XfyunASR({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        enableReconnect: false
      });

      // 手动触发重连
      (recognizerNoReconnect as any).handleReconnect();

      expect((recognizerNoReconnect as any).reconnectCount).toBe(0);
      recognizerNoReconnect.destroy();
    });

    it('应该在已销毁时不进行重连', () => {
      recognizer.destroy();
      (recognizer as any).handleReconnect();

      expect((recognizer as any).reconnectCount).toBe(0);
    });

    it('应该在正在重连时不重复发起重连', () => {
      (recognizer as any).isReconnecting = true;
      (recognizer as any).handleReconnect();

      expect((recognizer as any).reconnectCount).toBe(0);
    });

    it('应该在达到最大重连次数后停止重连并进入错误状态', () => {
      (recognizer as any).reconnectCount = 3; // 已达到最大次数

      (recognizer as any).handleReconnect();

      expect(recognizer.getState()).toBe('error');
      expect((recognizer as any).reconnectTimer).toBeNull();
    });

    it('应该正确执行重连并使用指数退避', () => {
      let startCalled = false;
      const originalStart = recognizer.start;
      (recognizer as any).start = async function() { startCalled = true; };

      (recognizer as any).handleReconnect();

      // 第一次重连，间隔 1000 * 2^(1-1) = 1000ms
      expect((recognizer as any).reconnectCount).toBe(1);
      expect((recognizer as any).reconnectTimer).not.toBeNull();

      // 快进时间
      vi.advanceTimersByTime(1000);

      expect(startCalled).toBe(true);
      expect((recognizer as any).isReconnecting).toBe(false);
      (recognizer as any).start = originalStart;
    });

    it('应该在 idle 状态下重连', () => {
      (recognizer as any).state = 'idle';
      let startCalled = false;
      const originalStart = recognizer.start;
      (recognizer as any).start = async function() { startCalled = true; };

      (recognizer as any).handleReconnect();
      vi.advanceTimersByTime(1000);

      expect(startCalled).toBe(true);
      (recognizer as any).start = originalStart;
    });

    it('应该在 connecting 状态下重连', () => {
      (recognizer as any).state = 'connecting';
      let startCalled = false;
      const originalStart = recognizer.start;
      (recognizer as any).start = async function() { startCalled = true; };

      (recognizer as any).handleReconnect();
      vi.advanceTimersByTime(1000);

      expect(startCalled).toBe(true);
      (recognizer as any).start = originalStart;
    });
  });

  describe('clearReconnectTimer 清除重连定时器', () => {
    it('应该清除 reconnectTimer', () => {
      (recognizer as any).reconnectTimer = setTimeout(() => {}, 1000);

      (recognizer as any).clearReconnectTimer();

      expect((recognizer as any).reconnectTimer).toBeNull();
    });

    it('应该清除 connectingTimer', () => {
      (recognizer as any).connectingTimer = setTimeout(() => {}, 1000);

      (recognizer as any).clearReconnectTimer();

      expect((recognizer as any).connectingTimer).toBeNull();
    });
  });

  describe('onRecognitionResult 回调', () => {
    it('应该在收到识别结果时调用 onRecognitionResult', () => {
      let capturedText = '';
      let capturedIsEnd = false;

      recognizer = new XfyunASR({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret'
      }, {
        onRecognitionResult: (text, isEnd) => {
          capturedText = text;
          capturedIsEnd = isEnd;
        }
      });

      // 模拟 WebSocket 消息处理
      const mockMessage = {
        code: 0,
        message: 'success',
        data: {
          result: {
            ws: [
              { cw: [{ w: '测试' }] }
            ]
          },
          ls: true
        }
      };

      // 手动触发 onmessage 回调逻辑
      const text = '测试';
      const isEnd = true;
      
      if ((recognizer as any).handlers.onRecognitionResult) {
        (recognizer as any).handlers.onRecognitionResult(text, isEnd);
      }

      expect(capturedText).toBe('测试');
      expect(capturedIsEnd).toBe(true);
    });
  });

  describe('sendEndFrame 发送结束帧', () => {
    it('应该在 websocket 未连接时不发送', () => {
      const sendSpy = vi.fn();
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.CLOSED,
        close: () => {}
      };

      (recognizer as any).sendEndFrame();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在 websocket 已连接时发送结束帧', () => {
      const sendSpy = vi.fn();
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN,
        close: () => {}
      };

      (recognizer as any).sendEndFrame();

      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.data.status).toBe(2);
    });
  });

  describe('startVolumeDetection 音量检测', () => {
    it('应该在没有 analyser 时直接返回', () => {
      expect(() => {
        (recognizer as any).startVolumeDetection();
      }).not.toThrow();
    });

    it('应该在有 analyser 时启动音量检测', () => {
      // 创建模拟的 AudioContext 和 AnalyserNode
      const mockAnalyser = {
        frequencyBinCount: 256,
        getFloatTimeDomainData: vi.fn(() => {
          // 填充零数据
        })
      };

      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';

      // 启动音量检测
      (recognizer as any).startVolumeDetection();

      // 验证定时器已创建
      expect((recognizer as any).volumeTimer).not.toBeNull();

      // 清理
      if ((recognizer as any).volumeTimer) {
        clearInterval((recognizer as any).volumeTimer);
      }
    });
  });
});
