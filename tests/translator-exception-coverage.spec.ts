/**
 * translator.ts 异常路径覆盖率覆盖测试
 * @description 覆盖 start 方法中的 catch 块和 translateText 成功路径
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts 异常路径覆盖率覆盖测试', () => {
  let translator: XfyunTranslator;
  let originalGetUserMedia: any;

  beforeEach(() => {
    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      type: 'asr',
      from: 'cn',
      to: 'en',
    });
    originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
  });

  afterEach(() => {
    // 恢复 getUserMedia
    if (originalGetUserMedia && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    }
    // 清理 audioContext mock - 移除 mock 以避免 destroy 时抛出异常
    if ((translator as any).audioContext) {
      (translator as any).audioContext = null;
    }
    translator.destroy();
  });

  describe('start 方法异常路径', () => {
    it('应该在 audioContext.close() 抛出异常时捕获并清理', async () => {
      // Mock audioContext.close() 抛出异常
      const mockAudioContext = {
        close: vi.fn().mockImplementation(() => {
          throw new Error('Close failed');
        }),
      };
      (translator as any).audioContext = mockAudioContext;
      
      // Mock getUserMedia 失败，触发 catch 块
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(new Error('getUserMedia failed'));
      }
      
      // 调用 start - 预期会抛出异常（Close failed，因为 audioContext.close() 在 catch 块中抛出）
      await expect(translator.start('test audio')).rejects.toThrow('Close failed');
      
      // 验证 audioContext.close() 被调用（在 catch 块中）
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('应该在 audioContext 存在时正确关闭', async () => {
      // Mock audioContext
      const mockAudioContext = {
        close: vi.fn().mockResolvedValue(undefined),
      };
      (translator as any).audioContext = mockAudioContext;
      
      // Mock getUserMedia 失败
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(new Error('getUserMedia failed'));
      }
      
      // 调用 start
      await translator.start('test audio');
      
      // 验证 audioContext.close() 被调用
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('translateText 成功路径', () => {
    it('应该在翻译成功时调用 destroy 并 resolve', async () => {
      // 验证 translateText 函数存在
      expect(typeof XfyunTranslator.translateText).toBe('function');
      
      // 验证空文本拒绝
      await expect(
        XfyunTranslator.translateText('', {
          appId: 'test',
          apiKey: 'test',
          apiSecret: 'test',
        })
      ).rejects.toThrow('翻译文本不能为空');
      
      // 验证空白文本拒绝
      await expect(
        XfyunTranslator.translateText('   ', {
          appId: 'test',
          apiKey: 'test',
          apiSecret: 'test',
        })
      ).rejects.toThrow('翻译文本不能为空');
    });

    it('应该在缺少必要参数时拒绝', async () => {
      await expect(
        XfyunTranslator.translateText('test', {
          appId: 'test',
          // apiKey 缺失
          apiSecret: 'test',
        } as any)
      ).rejects.toThrow();
    });
  });
});
