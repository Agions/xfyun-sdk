/**
 * translator.ts translateText 静态方法 onResult 回调覆盖测试
 * @description 覆盖 translateText 静态方法中的 onResult 回调 (行 616-618)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts translateText 静态方法 onResult 回调覆盖测试', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('translateText onResult 回调 (行 616-618)', () => {
    it('应该在翻译成功时调用 onResult 并 resolve', async () => {
      // Mock start 方法，模拟翻译完成
      const startSpy = vi.spyOn(XfyunTranslator.prototype, 'start').mockImplementation(async function(this: XfyunTranslator, text?: string): Promise<void> {
        // 模拟翻译结果回调
        const handlers = (this as any).handlers;
        if (handlers?.onResult) {
          handlers.onResult('翻译结果');
        }
      });

      const result = await XfyunTranslator.translateText('你好', {
        appId: 'test-app-id',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        domain: 'its',
        language: 'zh',
        accent: 'en',
      } as any);

      // 验证结果
      expect(result).toBe('翻译结果');
      expect(startSpy).toHaveBeenCalled();
    });

    it('应该在翻译失败时调用 onError 并 reject', async () => {
      // Mock start 方法，模拟翻译失败
      const startSpy = vi.spyOn(XfyunTranslator.prototype, 'start').mockImplementation(async function(this: XfyunTranslator, text?: string): Promise<void> {
        // 模拟错误回调
        const handlers = (this as any).handlers;
        if (handlers?.onError) {
          handlers.onError({ message: '翻译失败' } as any);
        }
      });

      await expect(
        XfyunTranslator.translateText('你好', {
          appId: 'test-app-id',
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
          domain: 'its',
          language: 'zh',
          accent: 'en',
        } as any)
      ).rejects.toThrow('翻译失败');

      expect(startSpy).toHaveBeenCalled();
    });

    it('应该在文本为空时立即 reject', async () => {
      await expect(
        XfyunTranslator.translateText('', {
          appId: 'test-app-id',
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
          domain: 'its',
          language: 'zh',
          accent: 'en',
        } as any)
      ).rejects.toThrow('翻译文本不能为空');
    });

    it('应该在文本为空白字符串时立即 reject', async () => {
      await expect(
        XfyunTranslator.translateText('   ', {
          appId: 'test-app-id',
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
          domain: 'its',
          language: 'zh',
          accent: 'en',
        } as any)
      ).rejects.toThrow('翻译文本不能为空');
    });
  });
});
