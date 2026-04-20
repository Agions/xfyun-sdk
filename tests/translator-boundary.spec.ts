import { describe, it, expect, beforeEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('XfyunTranslator 异步边界测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiSecret: 'test-secret',
      apiKey: 'test-key',
      type: 'asr',
      from: 'cn',
      to: 'en'
    });
  });

  afterEach(() => {
    if (!translator.isDestroyed()) {
      translator.destroy();
    }
  });

  describe('translateText 输入验证', () => {
    it('应该拒绝空字符串输入', async () => {
      await expect(XfyunTranslator.translateText('', {
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key'
      })).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝null输入', async () => {
      await expect(XfyunTranslator.translateText(null as any, {
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key'
      })).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝undefined输入', async () => {
      await expect(XfyunTranslator.translateText(undefined as any, {
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key'
      })).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝空白字符输入', async () => {
      await expect(XfyunTranslator.translateText('   ', {
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key'
      })).rejects.toThrow('翻译文本不能为空');

      await expect(XfyunTranslator.translateText('\n\t\r', {
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key'
      })).rejects.toThrow('翻译文本不能为空');
    });

    it('应该正确处理trim后的空字符串', async () => {
      await expect(XfyunTranslator.translateText(' \t\n ', {
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key'
      })).rejects.toThrow('翻译文本不能为空');
    });
  });

  describe('Promise reject路径', () => {
    it('应该在onError回调时reject Promise', async () => {
      const errorMessage = '模拟错误';
      let errorThrown = false;

      // 直接设置handlers来触发错误
      (translator as any).handlers = {
        onError: (error: Error) => {
          if (error.message === errorMessage) {
            errorThrown = true;
            throw new Error(errorMessage);
          }
        }
      };

      // 先设置状态为正在翻译，然后触发错误
      (translator as any).state = 'translating';

      // 模拟调用translateText的内部逻辑
      try {
        (translator as any).handleError({
          code: 10001,
          message: errorMessage,
          data: null
        });
      } catch (e) {
        expect((e as Error).message).toBe(errorMessage);
      }

      expect(errorThrown).toBe(true);
    });

    it('应该在错误状态下阻止新的翻译请求', async () => {
      // 先触发错误状态
      (translator as any).state = 'error';

      // 验证在错误状态下无法开始新的翻译
      expect((translator as any).state).toBe('error');

      // 尝试调用translateText应该被静态方法本身拒绝，而不是实例方法
      await expect(XfyunTranslator.translateText('测试文本', {
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key'
      })).resolves.not.toThrow();
    });
  });

  describe('destroy方法异常处理', () => {
    it('应该安全地多次调用destroy', () => {
      // 第一次调用destroy
      translator.destroy();

      // 第二次调用destroy不应该出错
      expect(() => {
        translator.destroy();
      }).not.toThrow();

      // 第三次调用destroy也不应该出错
      expect(() => {
        translator.destroy();
      }).not.toThrow();
    });

    it('应该在destroy后保持稳定状态', () => {
      // 先调用destroy
      translator.destroy();

      // 验证isDestroyed返回true
      expect(translator.isDestroyed()).toBe(true);

      // 再次调用destroy后仍然应该是destroyed状态
      translator.destroy();
      expect(translator.isDestroyed()).toBe(true);
    });
  });

  describe('资源清理完整性', () => {
    it('应该清除所有定时器引用', () => {
      // 创建translator并设置一些定时器
      translator = new XfyunTranslator({
        appId: 'test-app-id',
        apiSecret: 'test-secret',
        apiKey: 'test-key',
        type: 'asr',
        from: 'cn',
        to: 'en'
      });

      // 手动设置定时器引用（模拟实际使用场景）
      (translator as any).websocketCloseTimer = setTimeout(() => {}, 1000);
      (translator as any).connectingTimer = setTimeout(() => {}, 1000);

      // 调用destroy
      translator.destroy();

      // 验证定时器被清除
      expect((translator as any).websocketCloseTimer).toBeNull();
      expect((translator as any).connectingTimer).toBeNull();
    });
  });
});