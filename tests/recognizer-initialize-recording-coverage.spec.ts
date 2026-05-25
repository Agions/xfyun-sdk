/**
 * recognizer.ts initMicrophone catch 块和 startRecording 覆盖测试
 * @description 覆盖 initMicrophone 的异常清理分支 (行 408-422) 和 startRecording (行 428-438)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

// Mock detectSupportedMimeType
vi.mock('../src/utils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    detectSupportedMimeType: vi.fn(),
  };
});

describe('recognizer.ts initMicrophone catch 和 startRecording 覆盖测试', () => {
  let recognizer: XfyunASR;
  let originalLogger: any;

  beforeEach(() => {
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      domain: 'iat',
      language: 'zh_cn',
      accent: 'mandarin',
    });
    originalLogger = (recognizer as any).logger;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    // 恢复 logger
    (recognizer as any).logger = originalLogger;
    recognizer.destroy();
  });

  describe('initMicrophone catch 块 (行 408-422)', () => {
    it('应该在 getUserMedia 失败时清理 tempStream (行 408-412)', async () => {
      // Mock getUserMedia 抛出异常
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
      });

      let errorLogged = false;
      (recognizer as any).logger = {
        info: originalLogger.info,
        warn: originalLogger.warn,
        error: vi.fn().mockImplementation(() => {
          errorLogged = true;
        }),
        debug: originalLogger.debug,
      };

      // 调用 initMicrophone
      // @ts-ignore - 测试私有方法
      await expect((recognizer as any).initMicrophone()).rejects.toThrow('Permission denied');

      // 验证错误被记录
      expect(errorLogged).toBe(true);
    });

    it('应该在 detectSupportedMimeType 返回 null 时清理 tempAudioContext (行 413-419)', async () => {
      // Mock 一个有效的 stream
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }, { stop: vi.fn() }]),
      };

      // Mock getUserMedia 先成功返回 stream
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue(mockStream),
        },
      });

      // Mock AudioContext (包括 webkitAudioContext)
      const mockClose = vi.fn().mockResolvedValue(undefined);
      const mockCreateAnalyser = vi.fn().mockReturnValue({ fftSize: 2048 });
      const mockConnect = vi.fn();
      const mockCreateMediaStreamSource = vi.fn().mockReturnValue({ connect: mockConnect });

      function MockAudioContext() {}
      MockAudioContext.prototype.close = mockClose;
      MockAudioContext.prototype.createAnalyser = mockCreateAnalyser;
      MockAudioContext.prototype.createMediaStreamSource = mockCreateMediaStreamSource;
      Object.defineProperty(MockAudioContext.prototype, 'state', {
        value: 'running',
        writable: true,
      });
      vi.stubGlobal('window', {
        AudioContext: MockAudioContext,
        webkitAudioContext: MockAudioContext,
      });

      // Mock detectSupportedMimeType 返回 null 触发异常
      const { detectSupportedMimeType } = await import('../src/utils');
      (detectSupportedMimeType as any).mockReturnValue(null);

      let errorLogged = false;
      (recognizer as any).logger = {
        info: originalLogger.info,
        warn: originalLogger.warn,
        error: vi.fn().mockImplementation(() => {
          errorLogged = true;
        }),
        debug: originalLogger.debug,
      };

      // 调用 initMicrophone
      // @ts-ignore - 测试私有方法
      await expect((recognizer as any).initMicrophone()).rejects.toThrow('浏览器不支持任何可用的音频编码格式');

      // 验证 tempAudioContext.close() 被调用
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('startRecording (行 428-438)', () => {
    it('应该在 recorder 存在且非 recording 状态时开始录音', () => {
      // Mock recorder
      const mockStart = vi.fn();
      (recognizer as any).recorder = {
        state: 'inactive',
        start: mockStart,
      };

      // Mock startVolumeDetection
      vi.spyOn((recognizer as any), 'startVolumeDetection').mockImplementation(() => {});

      // 调用 startRecording
      // @ts-ignore - 测试私有方法
      (recognizer as any).startRecording();

      // 验证方法被调用
      expect(mockStart).toHaveBeenCalledWith(500);
      expect((recognizer as any).state).toBe('recording');
    });

    it('应该在 recorder 为 recording 状态时直接返回', () => {
      // Mock recorder
      const mockStart = vi.fn();
      (recognizer as any).recorder = {
        state: 'recording',
        start: mockStart,
      };

      // 调用 startRecording
      // @ts-ignore - 测试私有方法
      (recognizer as any).startRecording();

      // 验证 start 未被调用
      expect(mockStart).not.toHaveBeenCalled();
    });

    it('应该在 recorder 为 null 时直接返回', () => {
      (recognizer as any).recorder = null;

      // 调用 startRecording
      // @ts-ignore - 测试私有方法
      (recognizer as any).startRecording();

      // 应该不报错
      expect((recognizer as any).recorder).toBeNull();
    });
  });
});
