import { describe, it, expect, beforeEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('XfyunRecognizer 状态管理测试', () => {
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

  describe('setState方法边界条件', () => {
    it('应该正确处理空的onStateChange处理器', () => {
      // 直接设置handlers对象来测试setState方法
      (recognizer as any).handlers = {};

      // 调用setState不应出错
      expect(() => {
        recognizer.setState('idle');
      }).not.toThrow();
    });

    it('应该正确调用onStateChange处理器', () => {
      let capturedState: string | undefined;

      // 直接设置handlers对象来测试setState方法
      (recognizer as any).handlers = {
        onStateChange: (state: string) => {
          capturedState = state;
        }
      };

      recognizer.setState('recording');

      expect(capturedState).toBe('recording');
    });

    it('应该在错误状态时触发状态变化', () => {
      let stateChanges: string[] = [];

      // 直接设置handlers对象来测试setState方法
      (recognizer as any).handlers = {
        onStateChange: (state: string) => {
          stateChanges.push(state);
        }
      };

      // 模拟进入错误状态
      (recognizer as any).handleError(new Error('Test error'));

      expect(stateChanges).toContain('error');
    });
  });

  describe('状态转换完整性', () => {
    it('应该在初始化后处于正确的初始状态', () => {
      expect(recognizer.getState()).toBe('idle');
    });

    it('应该能够从不同状态转换到error状态', () => {
      let stateChanges: string[] = [];

      // 直接设置handlers对象来测试setState方法
      (recognizer as any).handlers = {
        onStateChange: (state: string) => {
          stateChanges.push(state);
        }
      };

      // 模拟状态转换序列
      recognizer.setState('connecting');
      recognizer.setState('ready');
      (recognizer as any).handleError(new Error('Test error'));

      expect(stateChanges).toEqual(['connecting', 'ready', 'error']);
    });
  });
});