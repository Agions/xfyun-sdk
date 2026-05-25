/**
 * recognizer.ts 最终覆盖率覆盖测试
 * @description 覆盖 sendAudioData try-catch 异常路径和 startVolumeDetection 定时器回调
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts 最终覆盖率覆盖测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      type: 'asr',
      domain: 'iat',
      language: 'zh_cn',
      accent: 'mandarin',
    });
  });

  afterEach(() => {
    recognizer.destroy();
  });

  describe('sendAudioData 异常处理', () => {
    it('应该在 WebSocket.send 抛出异常时捕获并记录错误', () => {
      (recognizer as any).state = 'recording';
      const testData = new Uint8Array(100);
      (recognizer as any).audioDataQueue = [testData];
      (recognizer as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
        send: vi.fn().mockImplementation(() => {
          throw new Error('Network error');
        }),
      };
      const errorSpy = vi.spyOn((recognizer as any).logger, 'error');
      const handleErrorSpy = vi.spyOn(recognizer, 'handleError' as any);
      
      (recognizer as any).sendAudioData();
      
      // 验证错误被捕获
      expect(errorSpy).toHaveBeenCalledWith('WebSocket 发送数据失败:', expect.any(Error));
      expect(handleErrorSpy).toHaveBeenCalled();
      // 数据应该被放回队列头部
      expect((recognizer as any).audioDataQueue.length).toBe(1);
    });

    it('应该在 safeSend 返回 false 时调用 handleError', () => {
      (recognizer as any).state = 'recording';
      const testData = new Uint8Array(100);
      (recognizer as any).audioDataQueue = [testData];
      (recognizer as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
      };
      (recognizer as any).safeSend = vi.fn().mockReturnValue(false);
      const handleErrorSpy = vi.spyOn(recognizer, 'handleError' as any);
      
      (recognizer as any).sendAudioData();
      
      expect(handleErrorSpy).toHaveBeenCalled();
      const errorArg = handleErrorSpy.mock.calls[0][0];
      expect(errorArg.code).toBe(10007);
      // 错误消息被 classifyError 增强
      expect(errorArg.message).toContain('发送音频数据失败');
    });
  });

  describe('startVolumeDetection 定时器回调', () => {
    it('应该在 recording 状态且未销毁时调用 onProcess 并传递音量值', async () => {
      vi.useFakeTimers();
      
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn().mockImplementation((arr: Float32Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.sin(i * 0.1) * 0.1;
          }
        }),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      
      // Mock handlers.onProcess
      (recognizer as any).handlers = {
        onProcess: null as any,
      };
      
      let onProcessCalled = false;
      let capturedVolume: number | undefined;
      
      (recognizer as any).handlers.onProcess = (volume: number) => {
        onProcessCalled = true;
        capturedVolume = volume;
      };
      
      // 调用 startVolumeDetection
      (recognizer as any).startVolumeDetection();
      
      // 等待定时器执行（setInterval 100ms 间隔）
      await vi.advanceTimersByTimeAsync(100);
      
      expect(onProcessCalled).toBe(true);
      expect(typeof capturedVolume).toBe('number');
      expect(capturedVolume).toBeGreaterThanOrEqual(0);
      expect(capturedVolume).toBeLessThanOrEqual(100);
      
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('应该在 analyser 为 null 时不调用 onProcess', async () => {
      vi.useFakeTimers();
      
      (recognizer as any).analyser = null;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      
      let onProcessCalled = false;
      
      (recognizer as any).onProcess = (volume: number) => {
        onProcessCalled = true;
      };
      
      (recognizer as any).startVolumeDetection();
      
      await vi.advanceTimersByTimeAsync(100);
      
      expect(onProcessCalled).toBe(false);
      
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('应该在销毁后停止音量检测', async () => {
      vi.useFakeTimers();
      
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn().mockImplementation((arr: Float32Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.sin(i * 0.1) * 0.1;
          }
        }),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      
      let onProcessCallCount = 0;
      
      (recognizer as any).onProcess = (volume: number) => {
        onProcessCallCount++;
      };
      
      (recognizer as any).startVolumeDetection();
      
      // 在第一个定时器周期后销毁
      await vi.advanceTimersByTimeAsync(50);
      recognizer.destroy();
      
      // 再等一个周期
      const initialCalls = onProcessCallCount;
      await vi.advanceTimersByTimeAsync(100);
      
      expect(onProcessCallCount).toBe(initialCalls);
      
      vi.clearAllTimers();
      vi.useRealTimers();
    });
  });
});
