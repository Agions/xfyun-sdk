/**
 * recognizer.ts cleanupAudioResources 和 buildBusinessParams 剩余分支覆盖测试
 * @description 覆盖 cleanupAudioResources 的 microphoneStream 清理和 buildBusinessParams 的缓存/标点分支
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    recognizer.destroy();
  });

  describe('cleanupAudioResources microphoneStream 清理 (行 506-511)', () => {
    it('应该停止 microphoneStream 的所有轨道', () => {
      // Mock microphoneStream
      const mockStop = vi.fn();
      const mockTrack = {
        stop: mockStop,
      };
      const mockGetTracks = vi.fn().mockReturnValue([mockTrack, mockTrack]);

      (recognizer as any).microphoneStream = {
        getTracks: mockGetTracks,
      };

      // 调用 cleanupAudioResources
      (recognizer as any).cleanupAudioResources();

      // 验证 getTracks 被调用
      expect(mockGetTracks).toHaveBeenCalled();
      // 验证 stop 被调用两次（两个轨道）
      expect(mockStop).toHaveBeenCalledTimes(2);
      // 验证 microphoneStream 被清空
      expect((recognizer as any).microphoneStream).toBeNull();
    });

    it('应该在 microphoneStream 为 null 时不报错', () => {
      (recognizer as any).microphoneStream = null;

      // 调用 cleanupAudioResources
      // @ts-ignore - 测试私有方法
      (recognizer as any).cleanupAudioResources();

      // 应该不报错
      expect((recognizer as any).microphoneStream).toBeNull();
    });
  });

  describe('buildBusinessParams 缓存和标点分支', () => {
    it('应该返回缓存的 business params (行 530)', () => {
      // 设置缓存
      const cachedParams = { app_id: 'test-app-id', domain: 'iat', language: 'zh_cn', accent: 'mandarin', vad_eos: 3000, nbest: 1, wbest: 5 };
      (recognizer as any).cachedBusinessParams = cachedParams;

      const result = (recognizer as any).buildBusinessParams();

      // 应该返回缓存的参数
      expect(result).toBe(cachedParams);
    });

    it('应该处理 punctuation 为 true 的情况 (行 552)', () => {
      // 清除缓存以确保重新构建
      (recognizer as any).cachedBusinessParams = null;
      (recognizer as any).options.punctuation = true;

      const result = (recognizer as any).buildBusinessParams();

      expect(result.punctuation).toBe('on');
    });

    it('应该处理 punctuation 为 false 的情况 (行 552)', () => {
      // 清除缓存以确保重新构建
      (recognizer as any).cachedBusinessParams = null;
      (recognizer as any).options.punctuation = false;

      const result = (recognizer as any).buildBusinessParams();

      expect(result.punctuation).toBe('off');
    });
  });
});
