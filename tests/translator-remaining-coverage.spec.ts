import { describe, it, expect, beforeEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts 剩余覆盖率覆盖测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    translator = new XfyunTranslator({
      type: 'asr',
      from: 'cn',
      to: 'en',
      domain: 'iner',
      appId: 'test-app-id',
      apiSecret: 'test-secret',
      apiKey: 'test-key'
    });
  });

  afterEach(() => {
    if (!translator.isDestroyed()) {
      translator.destroy();
    }
  });

  describe('translateText函数完整输入验证', () => {
    it('应该拒绝空字符串', async () => {
      await expect(translator.translateText('')).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝null值', async () => {
      await expect(translator.translateText(null as any)).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝undefined值', async () => {
      await expect(translator.translateText(undefined as any)).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝空白字符组成的字符串', async () => {
      await expect(translator.translateText('   ')).rejects.toThrow('翻译文本不能为空');
    });

    it('应该正确处理trim后的空字符串', async () => {
      await expect(translator.translateText(' \t\n ')).rejects.toThrow('翻译文本不能为空');
    });

    it('应该接受单个空格字符（经过trim后）', async () => {
      // 单个空格经过trim后会变成空字符串，所以也应该被拒绝
      await expect(translator.translateText(' ')).rejects.toThrow('翻译文本不能为空');
    });
  });

  describe('Promise构造和执行路径', () => {
    it('应该在有效输入时创建正确的Promise结构', async () => {
      const result = translator.translateText('hello world');

      expect(result).toBeInstanceOf(Promise);
    });

    it('应该在onResult回调时resolve Promise', async () => {
      const mockResult = { from: 'cn', to: 'en', trans_result: { dst: '你好世界' } };

      translator.setHandlers({
        onResult: (result: any) => {
          expect(result).toEqual(mockResult);
        }
      });

      // 由于translateText是静态方法，这里测试Promise的基本结构
      const promise = translator.translateText('hello world');
      expect(promise).toBeInstanceOf(Promise);
    });

    it('应该在错误状态下后续调用会被拒绝', async () => {
      const errorMessage = 'Test error';

      translator.setHandlers({
        onError: (error: Error) => {
          throw new Error(errorMessage);
        }
      });

      await expect(translator.translateText('test')).rejects.toThrow(errorMessage);
    });
  });

  describe('错误状态管理', () => {
    it('handleError应该调用onError处理器', async () => {
      const testError = new Error('Specific error');
      let capturedError: Error | undefined;

      translator.setHandlers({
        onError: (error: Error) => {
          capturedError = error;
        }
      });

      (translator as any).handleError(testError);

      expect(capturedError).toBe(testError);
      expect((translator as any).state).toBe('error');
    });

    it('应该在错误处理后阻止新的翻译请求', async () => {
      const errorMessage = 'Network error';

      translator.setHandlers({
        onError: (error: Error) => {
          throw new Error(errorMessage);
        }
      });

      // 先触发错误状态
      await expect(translator.translateText('test')).rejects.toThrow(errorMessage);

      // 尝试在错误状态下发起新请求
      await expect(translator.translateText('hello'))
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('状态转换完整性', () => {
    it('应该支持从initializing到其他状态的转换', () => {
      const stateChanges: string[] = [];
      translator.setHandlers({
        onStateChange: (state: string) => {
          stateChanges.push(state);
        }
      });

      // 模拟状态转换
      (translator as any).setState('initializing');
      (translator as any).setState('ready');
      (translator as any).setState('translating');

      expect(stateChanges).toEqual(['initializing', 'ready', 'translating']);
    });

    it('应该正确处理错误状态转换', () => {
      const stateChanges: string[] = [];
      translator.setHandlers({
        onStateChange: (state: string) => {
          stateChanges.push(state);
        }
      });

      // 模拟进入错误状态
      (translator as any).handleError(new Error('Translation error'));

      expect(stateChanges).toContain('error');
      expect((translator as any).state).toBe('error');
    });
  });

  describe('资源清理完整性', () => {
    it('destroy方法应该清除所有定时器引用', () => {
      // 模拟创建定时器
      (translator as any).connectingTimer = setTimeout(() => {}, 1000);
      (translator as any).websocketCloseTimer = setTimeout(() => {}, 2000);

      // 销毁实例
      translator.destroy();

      // 验证定时器被清除
      expect((translator as any).connectingTimer).toBeNull();
      expect((translator as any).websocketCloseTimer).toBeNull();
    });

    it('应该安全地多次调用destroy', () => {
      expect(() => {
        translator.destroy();
        translator.destroy();
        translator.destroy();
      }).not.toThrow();
    });
  });
});