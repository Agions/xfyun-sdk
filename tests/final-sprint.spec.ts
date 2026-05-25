/**
 * 最终覆盖率冲刺测试
 * @description 覆盖剩余未测试分支
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('最终覆盖率冲刺', () => {
  describe('recognizer.ts 剩余未覆盖代码', () => {
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

    describe('sendAudioData 异常路径', () => {
      it('应该在 WebSocket send 抛出异常时捕获并处理', () => {
        (recognizer as any).state = 'recording';
        (recognizer as any).websocket = {
          readyState: WebSocket.OPEN,
          close: vi.fn(),
          send: vi.fn().mockImplementation(() => {
            throw new Error('WebSocket send error');
          }),
        };
        (recognizer as any).audioDataQueue = [new ArrayBuffer(100)];
        
        const errorSpy = vi.spyOn((recognizer as any).logger, 'error');
        const handleErrorSpy = vi.spyOn(recognizer, 'handleError' as any);
        
        (recognizer as any).sendAudioData();
        
        // 验证异常被捕获
        expect(errorSpy).toHaveBeenCalled();
        expect(handleErrorSpy).toHaveBeenCalled();
        // 数据应该被放回队列头部
        expect((recognizer as any).audioDataQueue.length).toBe(1);
      });
    });

    describe('startVolumeDetection 定时器回调', () => {
      it('应该在定时器回调中调用 onProcess', (done) => {
        const mockAnalyser = {
          frequencyBinCount: 1024,
          getFloatTimeDomainData: vi.fn().mockImplementation((arr: Float32Array) => {
            arr.fill(0.3);
          }),
        };
        (recognizer as any).analyser = mockAnalyser;
        (recognizer as any).state = 'recording';
        (recognizer as any).destroyed = false;
        
        let capturedVolume: number | undefined;
        
        recognizer.setHandlers({
          onProcess: (volume: number) => {
            capturedVolume = volume;
            clearInterval((recognizer as any).volumeTimer);
          },
        });
        
        (recognizer as any).startVolumeDetection();
        
        // 等待定时器执行
        setTimeout(() => {
          expect(capturedVolume).toBeDefined();
          expect(typeof capturedVolume).toBe('number');
          expect(capturedVolume).toBeGreaterThanOrEqual(0);
          expect(capturedVolume).toBeLessThanOrEqual(1);
          done();
        }, 150);
      });
    });
  });
});
