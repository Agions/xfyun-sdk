/**
 * translator.ts 异步覆盖率覆盖测试
 * @description 使用 vi.useFakeTimers 控制异步操作
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts 异步覆盖率覆盖测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    vi.useFakeTimers();
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

  describe('ondataavailable 异步分支覆盖', () => {
    it('应该完整执行 ondataavailable 回调的所有分支', async () => {
      class MockMediaRecorder {
        state = 'recording';
        ondataavailable: any = null;
        onstop: any = null;
        constructor(public stream: any, public options: any) {}
        start = vi.fn();
        stop = vi.fn();
      }
      
      vi.stubGlobal('MediaRecorder', MockMediaRecorder);
      
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
      };
      (translator as any).microphoneStream = mockStream;
      (translator as any).state = 'translating';
      
      // 使用 class mock 来支持 new FileReader()
      class MockFileReader {
        onload: any = null;
        result: any = new ArrayBuffer(1024);
        readAsArrayBuffer = vi.fn(function(this: MockFileReader) {
          // 模拟异步触发 onload
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        });
      }
      vi.stubGlobal('FileReader', MockFileReader);
      
      (translator as any).initRecorder();
      
      // 验证 MediaRecorder 被创建
      expect((translator as any).recorder).toBeDefined();
      
      // 触发 ondataavailable
      const event = { data: new Blob([new ArrayBuffer(1024)]) };
      const recorder = (translator as any).recorder;
      
      // 手动触发 ondataavailable 回调
      if (recorder.ondataavailable) {
        recorder.ondataavailable(event);
      }
      
      // 推进时间让 FileReader 异步操作完成
      await vi.advanceTimersByTimeAsync(50);
      
      // 验证 audioDataQueue 被填充
      expect((translator as any).audioDataQueue.length).toBeGreaterThan(0);
    });

    it('应该在 reader.result 不是 ArrayBuffer 时跳过 sendAudioData', async () => {
      class MockMediaRecorder {
        state = 'recording';
        ondataavailable: any = null;
        onstop: any = null;
        constructor(public stream: any, public options: any) {}
        start = vi.fn();
        stop = vi.fn();
      }
      
      vi.stubGlobal('MediaRecorder', MockMediaRecorder);
      
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
      };
      (translator as any).microphoneStream = mockStream;
      (translator as any).state = 'translating';
      
      // 使用 class mock，result 不是 ArrayBuffer
      class MockFileReader {
        onload: any = null;
        result: any = 'string result';
        readAsArrayBuffer = vi.fn(function(this: MockFileReader) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: this });
            }
          }, 0);
        });
      }
      vi.stubGlobal('FileReader', MockFileReader);
      
      const sendAudioDataSpy = vi.spyOn(translator as any, 'sendAudioData');
      
      (translator as any).initRecorder();
      
      const event = { data: new Blob([new ArrayBuffer(1024)]) };
      const recorder = (translator as any).recorder;
      
      if (recorder.ondataavailable) {
        recorder.ondataavailable(event);
      }
      
      await vi.advanceTimersByTimeAsync(50);
      
      // 验证 sendAudioData 未被调用（因为 result 不是 ArrayBuffer）
      expect(sendAudioDataSpy).not.toHaveBeenCalled();
    });
  });
});
