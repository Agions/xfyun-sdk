import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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

  describe('错误状态管理', () => {
    it('handleError应该调用onError处理器', async () => {
      const testError = { code: 30001, message: 'Specific error' };
      let capturedError: any;

      translator.setHandlers({
        onError: (error: any) => {
          capturedError = error;
        }
      });

      (translator as any).handleError(testError);

      expect(capturedError).toEqual(testError);
      expect((translator as any).state).toBe('error');
    });

    it('应该在错误处理后阻止新的翻译请求', async () => {
      // 先触发错误状态
      (translator as any).state = 'error';

      // 尝试在错误状态下发起新请求 - 应该被start方法阻止
      await translator.start('test');
      expect((translator as any).state).toBe('error');
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
      (translator as any).handleError({ code: 30001, message: 'Translation error' });

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
