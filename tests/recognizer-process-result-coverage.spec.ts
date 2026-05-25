/**
 * recognizer.ts processRecognitionResult 和 buildBusinessParams 覆盖测试
 * @description 覆盖 buildBusinessParams 的 punctuation 和 hotWords 分支，以及 processRecognitionResult 方法
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts 剩余分支覆盖测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
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

  describe('buildBusinessParams 分支覆盖', () => {
    it('应该处理 punctuation 为非布尔值的情况 (行 554)', () => {
      // 设置 punctuation 为字符串
      (recognizer as any).options.punctuation = 'custom';

      const result = (recognizer as any).buildBusinessParams();

      expect(result.punctuation).toBe('custom');
    });

    it('应该处理 hotWords 选项 (行 560)', () => {
      // 设置 hotWords
      (recognizer as any).options.hotWords = ['热词 1', '热词 2', '热词 3'];

      const result = (recognizer as any).buildBusinessParams();

      expect(result.hotwords).toBe('热词 1,热词 2,热词 3');
    });
  });

  describe('processRecognitionResult 分支覆盖 (行 571-588)', () => {
    it('应该在 message.data.result 为空时直接返回', () => {
      const message = {
        data: {
          result: null,
        },
      };

      // @ts-ignore - 测试私有方法
      (recognizer as any).processRecognitionResult(message);

      // 验证识别结果未被修改
      expect((recognizer as any).recognitionResult).toBe('');
    });

    it('应该处理有文本的识别结果并调用 onRecognitionResult', () => {
      let resultCallbackCalled = false;
      let capturedText: string | undefined;
      let capturedIsEnd: boolean | undefined;

      (recognizer as any).handlers = {
        onRecognitionResult: (text: string, isEnd: boolean) => {
          resultCallbackCalled = true;
          capturedText = text;
          capturedIsEnd = isEnd;
        },
      };

      const message = {
        data: {
          result: {
            text: '你好世界',
            ws: [{
              cw: [{
                w: '你好'
              }]
            }],
            ls: false,
          },
        },
      };

      // @ts-ignore - 测试私有方法
      (recognizer as any).processRecognitionResult(message);

      expect(resultCallbackCalled).toBe(true);
      expect(capturedText).toBe('你好');
      expect(capturedIsEnd).toBe(false);
    });

    it('应该在 isEnd=true 时重置 reconnectCount (行 587-588)', () => {
      // 设置 reconnectCount 为非零值
      (recognizer as any).reconnectCount = 5;

      const message = {
        data: {
          result: {
            text: '最终结果',
            ws: [{
              cw: [{
                w: '最终'
              }]
            }],
            ls: true, // isEnd = true
          },
        },
      };

      // @ts-ignore - 测试私有方法
      (recognizer as any).processRecognitionResult(message);

      expect((recognizer as any).reconnectCount).toBe(0);
    });

    it('应该在 text 为空时不调用 onRecognitionResult', () => {
      let resultCallbackCalled = false;

      (recognizer as any).handlers = {
        onRecognitionResult: () => {
          resultCallbackCalled = true;
        },
      };

      const message = {
        data: {
          result: {
            text: '',
            ws: [],
            ls: false,
          },
        },
      };

      // @ts-ignore - 测试私有方法
      (recognizer as any).processRecognitionResult(message);

      expect(resultCallbackCalled).toBe(false);
    });
  });
});
