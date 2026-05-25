/**
 * recognizer.ts sendAudioData 异常路径测试
 * @description 覆盖 WebSocket 发送音频数据失败的 try-catch 异常路径 (670-678 行)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts sendAudioData 异常路径测试', () => {
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

  describe('sendAudioData 异常处理 (行 670-678)', () => {
    it('应该在 sendAudioData 中 safeSend 抛出异常时捕获并调用 handleError', async () => {
      // Mock safeSend 直接抛出异常 (绕过 ensureWebSocket)
      const originalSafeSend = (recognizer as any).safeSend;
      (recognizer as any).safeSend = () => {
        throw new Error('Mock send error');
      };

      // 设置状态为 recording
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;

      // 添加音频数据到队列
      const audioData = new Uint8Array([1, 2, 3, 4, 5]);
      (recognizer as any).audioDataQueue.push(audioData);

      let handleErrorCalled = false;
      let capturedError: any;

      (recognizer as any).handleError = (error: any) => {
        handleErrorCalled = true;
        capturedError = error;
      };

      // 调用 sendAudioData
      // @ts-ignore - 测试私有方法
      (recognizer as any).sendAudioData();

      // 恢复原始方法
      (recognizer as any).safeSend = originalSafeSend;

      // 验证 handleError 被调用
      expect(handleErrorCalled).toBe(true);
      expect(capturedError).toBeDefined();
      expect(capturedError.code).toBe(10007);
      expect(capturedError.message).toBe('发送音频数据失败');
    });

    it('应该在 audioDataQueue 为空时不发送数据', async () => {
      // Mock safeSend
      const safeSendSpy = vi.spyOn((recognizer as any), 'safeSend').mockReturnValue(true);

      // 设置状态为 recording
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;

      // 确保队列为空
      (recognizer as any).audioDataQueue = [];

      // 调用 sendAudioData
      // @ts-ignore - 测试私有方法
      (recognizer as any).sendAudioData();

      // 验证 safeSend 未被调用
      expect(safeSendSpy).not.toHaveBeenCalled();
    });

    it('应该在非 recording 状态时不发送数据', async () => {
      // Mock safeSend
      const safeSendSpy = vi.spyOn((recognizer as any), 'safeSend').mockReturnValue(true);

      // 设置状态为 connected (非 recording)
      (recognizer as any).state = 'connected';
      (recognizer as any).destroyed = false;

      // 添加音频数据到队列
      const audioData = new Uint8Array([1, 2, 3, 4, 5]);
      (recognizer as any).audioDataQueue.push(audioData);

      // 调用 sendAudioData
      // @ts-ignore - 测试私有方法
      (recognizer as any).sendAudioData();

      // 验证 safeSend 未被调用
      expect(safeSendSpy).not.toHaveBeenCalled();
    });

    it('应该在销毁状态下不发送数据', async () => {
      // Mock safeSend
      const safeSendSpy = vi.spyOn((recognizer as any), 'safeSend').mockReturnValue(true);

      // 设置状态为 recording
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = true;

      // 添加音频数据到队列
      const audioData = new Uint8Array([1, 2, 3, 4, 5]);
      (recognizer as any).audioDataQueue.push(audioData);

      // 调用 sendAudioData
      // @ts-ignore - 测试私有方法
      (recognizer as any).sendAudioData();

      // 验证 safeSend 未被调用
      expect(safeSendSpy).not.toHaveBeenCalled();
    });
  });
});
