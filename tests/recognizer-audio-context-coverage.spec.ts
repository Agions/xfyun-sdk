/**
 * recognizer.ts cleanupAudioResources 和 releaseMicrophone 剩余分支覆盖测试
 * @description 覆盖 audioContext.close() 的条件分支和 audioSource.disconnect() 清理
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
    // 保存原始 logger 以便恢复
    (recognizer as any).originalLogger = (recognizer as any).logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    // 恢复 logger 到原始状态
    if ((recognizer as any).originalLogger) {
      (recognizer as any).logger = (recognizer as any).originalLogger;
    }
    recognizer.destroy();
  });

  describe('cleanupAudioResources audioContext 分支 (行 473-479)', () => {
    it('应该在 audioContext.state !== closed 时调用 close() (行 473-474)', async () => {
      // Mock audioContext
      const mockClose = vi.fn().mockResolvedValue(undefined);
      (recognizer as any).audioContext = {
        state: 'running',
        close: mockClose,
      };

      // 调用 cleanupAudioResources
      (recognizer as any).cleanupAudioResources();

      // 验证 close 被调用
      expect(mockClose).toHaveBeenCalled();
      // 验证 audioContext 被清空
      expect((recognizer as any).audioContext).toBeNull();
    });

    it('应该在 audioContext.state === closed 时不调用 close() (行 473)', async () => {
      // Mock audioContext 已关闭
      const mockClose = vi.fn().mockResolvedValue(undefined);
      (recognizer as any).audioContext = {
        state: 'closed',
        close: mockClose,
      };

      // 调用 cleanupAudioResources
      (recognizer as any).cleanupAudioResources();

      // 验证 close 未被调用
      expect(mockClose).not.toHaveBeenCalled();
      // 验证 audioContext 被清空
      expect((recognizer as any).audioContext).toBeNull();
    });

    it('应该在 audioContext.close() 抛出异常时捕获并记录警告 (行 478-479)', async () => {
      // Mock audioContext.close() 同步抛出异常（模拟 close 过程中的错误）
      const mockClose = vi.fn().mockImplementation(() => {
        throw new Error('Close error');
      });
      (recognizer as any).audioContext = {
        state: 'running',
        close: mockClose,
      };

      let warnCalled = false;
      const originalLogger = (recognizer as any).logger;
      (recognizer as any).logger = {
        info: originalLogger.info,
        warn: vi.fn().mockImplementation(() => {
          warnCalled = true;
        }),
        error: originalLogger.error,
        debug: originalLogger.debug,
      };

      // 调用 cleanupAudioResources
      (recognizer as any).cleanupAudioResources();

      // 验证 warn 被调用
      expect(warnCalled).toBe(true);
    });
  });

  describe('releaseMicrophone audioSource 清理 (行 498-499)', () => {
    it('应该断开 audioSource 连接并清空引用 (行 498-499)', () => {
      // Mock audioSource
      const mockDisconnect = vi.fn();
      (recognizer as any).audioSource = {
        disconnect: mockDisconnect,
      };

      // 调用 releaseMicrophone
      (recognizer as any).releaseMicrophone();

      // 验证 disconnect 被调用
      expect(mockDisconnect).toHaveBeenCalled();
      // 验证 audioSource 被清空
      expect((recognizer as any).audioSource).toBeNull();
    });

    it('应该在 audioSource 为 null 时不报错', () => {
      (recognizer as any).audioSource = null;

      // 调用 releaseMicrophone
      // @ts-ignore - 测试私有方法
      (recognizer as any).releaseMicrophone();

      // 应该不报错
      expect((recognizer as any).audioSource).toBeNull();
    });
  });
});
