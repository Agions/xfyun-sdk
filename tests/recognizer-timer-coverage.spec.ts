/**
 * recognizer.ts 定时器精确控制测试
 * @description 使用 vi.useFakeTimers 精确控制 startVolumeDetection 定时器
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts 定时器精确控制测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    vi.useFakeTimers();
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      domain: 'iat',
      language: 'zh_cn',
      accent: 'mandarin',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    recognizer.destroy();
  });

  describe('startVolumeDetection 定时器精确控制', () => {
    it('应该在 recording 状态且 analyser 存在时调用 onProcess', async () => {
      // Mock analyser
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

      let onProcessCalled = false;
      let capturedVolume: number | undefined;

      (recognizer as any).handlers = {
        onProcess: (volume: number) => {
          onProcessCalled = true;
          capturedVolume = volume;
        },
      };

      // 调用 startVolumeDetection
      (recognizer as any).startVolumeDetection();

      // 推进定时器执行
      await vi.advanceTimersByTimeAsync(100);

      // 验证 onProcess 被调用
      expect(onProcessCalled).toBe(true);
      expect(typeof capturedVolume).toBe('number');
      expect(capturedVolume).toBeGreaterThanOrEqual(0);
      expect(capturedVolume).toBeLessThanOrEqual(100);
    });

    it('应该在 analyser 为 null 时不调用 onProcess', async () => {
      (recognizer as any).analyser = null;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;

      let onProcessCalled = false;

      (recognizer as any).handlers = {
        onProcess: (volume: number) => {
          onProcessCalled = true;
        },
      };

      (recognizer as any).startVolumeDetection();

      // 推进定时器执行
      await vi.advanceTimersByTimeAsync(100);

      // 验证 onProcess 未被调用
      expect(onProcessCalled).toBe(false);
    });

    it('应该在销毁后停止音量检测', async () => {
      // Mock analyser
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

      (recognizer as any).handlers = {
        onProcess: (volume: number) => {
          onProcessCallCount++;
        },
      };

      (recognizer as any).startVolumeDetection();

      // 推进第一个定时器周期
      await vi.advanceTimersByTimeAsync(50);
      const countAfterFirst = onProcessCallCount;

      // 销毁 recognizer
      recognizer.destroy();

      // 再推进一个周期
      await vi.advanceTimersByTimeAsync(100);

      // 验证销毁后没有新的调用
      expect(onProcessCallCount).toBe(countAfterFirst);
    });
  });
});
