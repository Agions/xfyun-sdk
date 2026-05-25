/**
 * recognizer.ts 深度覆盖测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';
import { calculateVolume } from '../src/utils';

describe('recognizer.ts 深度覆盖测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
    });
  });

  afterEach(() => {
    recognizer.destroy();
  });

  describe('sendAudioData 错误处理', () => {
    it('应该在发送失败时调用 handleError', () => {
      (recognizer as any).state = 'recording';
      const testData = new ArrayBuffer(100);
      (recognizer as any).audioDataQueue = [testData];
      (recognizer as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
      };
      (recognizer as any).safeSend = vi.fn().mockReturnValue(false);
      const handleErrorSpy = vi.spyOn(recognizer, 'handleError' as any);
      
      (recognizer as any).sendAudioData();
      
      expect(handleErrorSpy).toHaveBeenCalled();
      expect((recognizer as any).audioDataQueue.length).toBe(1);
    });

    it('应该在发送异常时记录错误日志', () => {
      (recognizer as any).state = 'recording';
      const testData = new ArrayBuffer(100);
      (recognizer as any).audioDataQueue = [testData];
      (recognizer as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
        send: vi.fn().mockImplementation(() => {
          throw new Error('Send failed');
        }),
      };
      const errorSpy = vi.spyOn((recognizer as any).logger, 'error');
      
      (recognizer as any).sendAudioData();
      
      expect(errorSpy).toHaveBeenCalledWith('WebSocket 发送数据失败:', expect.any(Error));
    });

    it('应该在 safeSend 返回 true 时清空队列', () => {
      (recognizer as any).state = 'recording';
      const testData = new ArrayBuffer(100);
      (recognizer as any).audioDataQueue = [testData];
      (recognizer as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
      };
      (recognizer as any).safeSend = vi.fn().mockReturnValue(true);
      
      (recognizer as any).sendAudioData();
      
      expect((recognizer as any).audioDataQueue.length).toBe(0);
    });
  });

  describe('startVolumeDetection 定时器回调', () => {
    it('应该在 recording 状态且未销毁时调用 onProcess', (done) => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn().mockImplementation((arr: Float32Array) => {
          arr.fill(0.1);
        }),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      
      let onProcessCalled = false;
      let volumeValue: number | undefined;
      
      recognizer.setHandlers({
        onProcess: (volume: number) => {
          onProcessCalled = true;
          volumeValue = volume;
          clearInterval((recognizer as any).volumeTimer);
        },
      });
      
      (recognizer as any).startVolumeDetection();
      
      setTimeout(() => {
        expect(onProcessCalled).toBe(true);
        expect(typeof volumeValue).toBe('number');
        expect(mockAnalyser.getFloatTimeDomainData).toHaveBeenCalled();
        done();
      }, 150);
    });

    it('应该在非 recording 状态时不调用 onProcess', (done) => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn(),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'connected';
      (recognizer as any).destroyed = false;
      
      let onProcessCalled = false;
      
      recognizer.setHandlers({
        onProcess: () => { onProcessCalled = true; },
      });
      
      (recognizer as any).startVolumeDetection();
      
      setTimeout(() => {
        expect(onProcessCalled).toBe(false);
        clearInterval((recognizer as any).volumeTimer);
        done();
      }, 150);
    });

    it('应该在已销毁时不调用 onProcess', (done) => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn(),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = true;
      
      let onProcessCalled = false;
      
      recognizer.setHandlers({
        onProcess: () => { onProcessCalled = true; },
      });
      
      (recognizer as any).startVolumeDetection();
      
      setTimeout(() => {
        expect(onProcessCalled).toBe(false);
        clearInterval((recognizer as any).volumeTimer);
        done();
      }, 150);
    });

    it('应该在 analyser 存在时创建定时器', () => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn(),
      };
      (recognizer as any).analyser = mockAnalyser;
      
      (recognizer as any).startVolumeDetection();
      
      expect((recognizer as any).volumeTimer).not.toBeNull();
      clearInterval((recognizer as any).volumeTimer);
    });

    it('应该在 analyser 不存在时直接返回', () => {
      (recognizer as any).analyser = null;
      
      (recognizer as any).startVolumeDetection();
      
      expect((recognizer as any).volumeTimer).toBeNull();
    });
  });

  describe('buildBusinessParams', () => {
    it('应该构建正确的业务参数', () => {
      const params = (recognizer as any).buildBusinessParams();
      
      expect(params).toHaveProperty('language');
      expect(params).toHaveProperty('domain');
      expect(params).toHaveProperty('accent');
      expect(params).toHaveProperty('vad_eos');
      expect(params).toHaveProperty('dwa');
    });

    it('应该使用自定义选项构建参数', () => {
      const customRecognizer = new XfyunASR({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
        language: 'en_us',
        domain: 'medical',
        accent: 'cantonese',
        vadEos: 5000,
      });
      
      const params = (customRecognizer as any).buildBusinessParams();
      
      expect(params.language).toBe('en_us');
      expect(params.domain).toBe('medical');
      expect(params.accent).toBe('cantonese');
      expect(params.vad_eos).toBe(5000);
      
      customRecognizer.destroy();
    });
  });

  describe('calculateVolume', () => {
    it('应该计算正确的音量值', () => {
      const silent = new Float32Array(1024).fill(0);
      expect(calculateVolume(silent)).toBe(0);
      
      const maxVolume = new Float32Array(1024).fill(1);
      expect(calculateVolume(maxVolume)).toBeGreaterThan(0);
    });
  });

  describe('sendEndFrame 错误处理', () => {
    it('应该在 safeSend 失败时记录警告', () => {
      (recognizer as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
      };
      (recognizer as any).safeSend = vi.fn().mockReturnValue(false);
      const warnSpy = vi.spyOn((recognizer as any).logger, 'warn');
      
      (recognizer as any).sendEndFrame();
      
      expect(warnSpy).toHaveBeenCalledWith('发送结束帧失败，WebSocket 未就绪');
    });

    it('应该在 WebSocket 为 null 时记录警告', () => {
      (recognizer as any).websocket = null;
      const warnSpy = vi.spyOn((recognizer as any).logger, 'warn');
      
      (recognizer as any).sendEndFrame();
      
      expect(warnSpy).toHaveBeenCalledWith('发送结束帧失败，WebSocket 未就绪');
    });
  });

  describe('initMicrophone 部分初始化失败', () => {
    it('应该在 getUserMedia 失败时清理已分配资源', async () => {
      if (!navigator.mediaDevices) {
        return;
      }
      
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(
        new Error('Permission denied')
      );
      
      try {
        await (recognizer as any).initMicrophone();
      } catch (e) {
        expect(e).toBeDefined();
        expect((recognizer as any).audioContext).toBeNull();
        expect((recognizer as any).microphoneStream).toBeNull();
      } finally {
        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
      }
    });
  });
});
