import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts 音频发送测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-key',
      apiSecret: 'test-secret'
    });
  });

  afterEach(() => {
    // 模拟 websocket 的 close 方法
    if ((recognizer as any).websocket) {
      (recognizer as any).websocket.close = () => {};
    }
    recognizer.destroy();
  });

  describe('sendAudioData 发送音频数据', () => {
    it('应该在 websocket 未连接时不发送', () => {
      const sendSpy = vi.fn();
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.CLOSED 
      };
      (recognizer as any).state = 'recording';
      (recognizer as any).audioDataQueue = ['dGVzdA=='];

      (recognizer as any).sendAudioData();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在状态不是 recording 时不发送', () => {
      const sendSpy = vi.fn();
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };
      (recognizer as any).state = 'idle';
      (recognizer as any).audioDataQueue = ['dGVzdA=='];

      (recognizer as any).sendAudioData();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在已销毁时不发送', () => {
      const sendSpy = vi.fn();
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = true;
      (recognizer as any).audioDataQueue = ['dGVzdA=='];

      (recognizer as any).sendAudioData();

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('应该在音频数据超过大小时停止发送', () => {
      const sendSpy = vi.fn();
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };
      (recognizer as any).state = 'recording';
      (recognizer as any).totalAudioBytes = 1024 * 1024 - 1;
      (recognizer as any).audioDataQueue = ['dGVzdA=='];

      (recognizer as any).sendAudioData();

      expect((recognizer as any).audioDataQueue.length).toBe(0);
    });

    it('应该正常发送音频数据', () => {
      const sendSpy = vi.fn();
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };
      (recognizer as any).state = 'recording';
      (recognizer as any).totalAudioBytes = 0;
      (recognizer as any).audioDataQueue = ['dGVzdA=='];

      (recognizer as any).sendAudioData();

      expect(sendSpy).toHaveBeenCalled();
      const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
      expect(sentData.data.status).toBe(1);
      expect(sentData.data.audio).toBe('dGVzdA==');
    });

    it('应该处理发送失败的情况', () => {
      const sendSpy = vi.fn(() => { throw new Error('Send failed'); });
      (recognizer as any).websocket = { 
        send: sendSpy, 
        readyState: WebSocket.OPEN 
      };
      (recognizer as any).state = 'recording';
      (recognizer as any).audioDataQueue = ['dGVzdA=='];

      (recognizer as any).sendAudioData();

      expect(recognizer.getState()).toBe('error');
    });
  });

  describe('startVolumeDetection 音量检测', () => {
    it('应该在有 analyser 和 recording 状态时启动音量检测', () => {
      const mockAnalyser = {
        frequencyBinCount: 256,
        getFloatTimeDomainData: vi.fn()
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;

      (recognizer as any).startVolumeDetection();

      expect((recognizer as any).volumeTimer).not.toBeNull();

      if ((recognizer as any).volumeTimer) {
        clearInterval((recognizer as any).volumeTimer);
      }
    });

    it('应该在非 recording 状态时不调用 onProcess', () => {
      const onProcessFn = vi.fn();
      const mockAnalyser = {
        frequencyBinCount: 256,
        getFloatTimeDomainData: vi.fn()
      };
      
      recognizer = new XfyunASR({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret'
      }, {
        onProcess: onProcessFn
      });

      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'idle';
      (recognizer as any).destroyed = false;

      (recognizer as any).startVolumeDetection();

      if ((recognizer as any).volumeTimer) {
        clearInterval((recognizer as any).volumeTimer);
      }

      expect(onProcessFn).not.toHaveBeenCalled();
    });

    it('应该在已销毁时停止音量检测', () => {
      const onProcessFn = vi.fn();
      const mockAnalyser = {
        frequencyBinCount: 256,
        getFloatTimeDomainData: vi.fn()
      };
      
      recognizer = new XfyunASR({
        appId: 'test-app-id',
        apiKey: 'test-key',
        apiSecret: 'test-secret'
      }, {
        onProcess: onProcessFn
      });

      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = true;

      (recognizer as any).startVolumeDetection();

      expect(onProcessFn).not.toHaveBeenCalled();
    });
  });

  describe('buildBusinessParams 构建业务参数', () => {
    it('应该返回正确的业务参数', () => {
      const params = (recognizer as any).buildBusinessParams();
      
      expect(params).toBeDefined();
      expect(params.language).toBe('zh_cn');
      expect(params.domain).toBe('iat');
    });
  });
});
