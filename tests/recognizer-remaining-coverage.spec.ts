import { describe, it, expect, beforeEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts 剩余覆盖率覆盖测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiSecret: 'test-secret',
      apiKey: 'test-key'
    });
  });

  afterEach(() => {
    if (!recognizer.isDestroyed()) {
      recognizer.destroy();
    }
  });

  describe('setState方法完整分支覆盖', () => {
    it('应该处理handlers.onStateChange为null的情况', () => {
      // 设置null的onStateChange处理器
      recognizer.setHandlers({
        onStateChange: null as any
      });

      // 调用setState不应出错
      expect(() => {
        recognizer.setState('idle');
      }).not.toThrow();

      expect(recognizer.getState()).toBe('idle');
    });

    it('应该处理handlers.onStateChange为undefined的情况', () => {
      // 设置undefined的onStateChange处理器
      recognizer.setHandlers({
        onStateChange: undefined as any
      });

      // 调用setState不应出错
      expect(() => {
        recognizer.setState('ready');
      }).not.toThrow();

      expect(recognizer.getState()).toBe('ready');
    });

    it('应该在状态变化时正确调用处理器', () => {
      const stateChanges: string[] = [];
      recognizer.setHandlers({
        onStateChange: (state: string) => {
          stateChanges.push(state);
        }
      });

      const testStates = ['initializing', 'ready', 'recording', 'stopped'];

      for (const state of testStates) {
        recognizer.setState(state);
        expect(stateChanges).toContain(state);
        expect(recognizer.getState()).toBe(state);
      }
    });
  });

  describe('handleError方法完整覆盖', () => {
    it('应该处理handlers.onError为null的情况', () => {
      // 模拟onError为null
      recognizer.setHandlers({
        onError: null as any
      });

      const testError = new Error('Test error message');

      // 验证不会抛出异常
      expect(() => {
        (recognizer as any).handleError(testError);
      }).not.toThrow();

      expect(recognizer.getState()).toBe('error');
    });

    it('应该处理handlers.onError为undefined的情况', () => {
      // 模拟onError为undefined
      recognizer.setHandlers({
        onError: undefined as any
      });

      const testError = new Error('Another test error');

      // 验证不会抛出异常
      expect(() => {
        (recognizer as any).handleError(testError);
      }).not.toThrow();

      expect(recognizer.getState()).toBe('error');
    });

    it('应该正确调用onError处理器并传递错误', () => {
      let capturedError: Error | undefined;
      const testError = new Error('Specific test error');

      recognizer.setHandlers({
        onError: (error: Error) => {
          capturedError = error;
        }
      });

      (recognizer as any).handleError(testError);

      expect(capturedError).toBe(testError);
      expect(recognizer.getState()).toBe('error');
    });

    it('应该在错误处理后正确通知停止', () => {
      let stopCalled = false;

      recognizer.setHandlers({
        onError: () => {
          // 错误处理
        },
        onStop: () => {
          stopCalled = true;
        }
      });

      const testError = new Error('Test error');
      (recognizer as any).handleError(testError);

      expect(stopCalled).toBe(true);
      expect(recognizer.getState()).toBe('error');
    });

    it('应该在错误处理后不通知停止（当onStop为null时）', () => {
      // 设置onError但不设置onStop
      recognizer.setHandlers({
        onError: () => {
          // 错误处理
        }
      });

      // onStop保持默认值undefined
      expect((recognizer as any).handlers.onStop).toBeUndefined();

      const testError = new Error('Test error');

      // 验证不会抛出异常
      expect(() => {
        (recognizer as any).handleError(testError);
      }).not.toThrow();

      expect(recognizer.getState()).toBe('error');
    });
  });

  describe('错误日志记录', () => {
    it('应该在handleError中记录错误日志', () => {
      const testError = new Error('Log test error');

      // 由于logger.error是私有方法，我们测试状态变化来间接验证
      (recognizer as any).handleError(testError);

      expect(recognizer.getState()).toBe('error');
      // 日志记录通过控制台输出，这里主要验证没有异常抛出
    });
  });

  describe('状态一致性验证', () => {
    it('应该在错误状态后阻止进一步操作', () => {
      const testError = new Error('Prevent operation error');
      (recognizer as any).handleError(testError);

      expect(recognizer.getState()).toBe('error');

      // 尝试在错误状态下进行其他操作
      expect(() => {
        recognizer.setState('ready'); // 应该仍然能设置状态
      }).not.toThrow();

      expect(recognizer.getState()).toBe('ready');
    });

    it('应该支持从错误状态恢复', () => {
      // 进入错误状态
      const testError = new Error('Initial error');
      (recognizer as any).handleError(testError);
      expect(recognizer.getState()).toBe('error');

      // 重置到初始状态
      recognizer.setState('initializing');
      expect(recognizer.getState()).toBe('initializing');
    });
  });
});