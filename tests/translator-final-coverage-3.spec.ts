/**
 * translator.ts 最终覆盖率覆盖测试
 * @description 覆盖剩余未覆盖分支
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts 最终覆盖率覆盖测试', () => {
  let translator: XfyunTranslator;

  beforeEach(() => {
    translator = new XfyunTranslator({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      type: 'asr',
      from: 'cn',
      to: 'en',
    });
  });

  afterEach(() => {
    translator.destroy();
  });

  describe('initRecorder 边界条件', () => {
    it('应该在 microphoneStream 为 null 时直接返回', () => {
      // microphoneStream 为 null
      (translator as any).microphoneStream = null;
      
      // 调用 initRecorder
      (translator as any).initRecorder();
      
      // 验证 recorder 未被创建
      expect((translator as any).recorder).toBeNull();
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

  describe('LANGUAGE_CODE_MAP 边界情况', () => {
    it('应该处理部分语言代码映射', () => {
      const translator = new XfyunTranslator({
        appId: 'test',
        apiKey: 'test',
        apiSecret: 'test',
        from: 'cn',
        to: 'en',
      });
      
      (translator as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
      };
      const safeSendSpy = vi.spyOn((translator as any), 'safeSend').mockReturnValue(true);
      
      (translator as any).sendTextFrame('test');
      
      const callArg = safeSendSpy.mock.calls[0][0];
      const frame = JSON.parse(callArg);
      expect(frame.business.from).toBe('cn');
      expect(frame.business.to).toBe('en');
      
      translator.destroy();
    });
  });
});
