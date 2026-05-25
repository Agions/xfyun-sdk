/**
 * translator.ts 浏览器 API mock 测试
 * @description 使用 vi.stubGlobal 模拟浏览器环境
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts 浏览器 API mock 测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
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
    translator.destroy();
  });

  describe('MediaRecorder 集成测试', () => {
    it('应该创建 MediaRecorder 并处理 ondataavailable', () => {
      // Mock MediaRecorder 全局 - 需要是构造函数
      class MockMediaRecorder {
        state = 'recording';
        ondataavailable: any = null;
        onstop: any = null;
        constructor(public stream: any, public options: any) {}
        start = vi.fn();
        stop = vi.fn();
      }
      
      vi.stubGlobal('MediaRecorder', MockMediaRecorder);
      
      // 直接设置 microphoneStream
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
      };
      (translator as any).microphoneStream = mockStream;
      
      // 模拟 FileReader
      class MockFileReader {
        onload: any = null;
        result: any = null;
        readAsArrayBuffer = vi.fn().mockImplementation(function(this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: new ArrayBuffer(1024) } });
            }
          }, 10);
        });
      }
      vi.stubGlobal('FileReader', MockFileReader);
      
      // 调用 initRecorder
      (translator as any).initRecorder();
      
      // 验证 MediaRecorder 被创建
      expect(translator).toBeDefined();
      expect((translator as any).recorder).toBeDefined();
      expect((translator as any).recorder.start).toHaveBeenCalledWith(500);
      
      // 清理
      vi.unstubAllGlobals();
    });

    it('应该在 ondataavailable 中正确处理音频数据', (done) => {
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
      
      class MockFileReader {
        onload: any = null;
        result: any = null;
        readAsArrayBuffer = vi.fn().mockImplementation(function(this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: new ArrayBuffer(1024) } });
            }
          }, 10);
        });
      }
      vi.stubGlobal('FileReader', MockFileReader);
      
      const sendAudioDataSpy = vi.spyOn(translator as any, 'sendAudioData');
      
      (translator as any).initRecorder();
      
      // 等待异步操作
      setTimeout(() => {
        expect(sendAudioDataSpy).toHaveBeenCalled();
        vi.unstubAllGlobals();
        done();
      }, 50);
    });
  });
});
