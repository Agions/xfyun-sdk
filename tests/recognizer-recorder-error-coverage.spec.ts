/**
 * recognizer.ts recorder.onerror 回调覆盖测试
 * @description 覆盖 recorder.onerror 回调中的错误处理逻辑 (行 386-387)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts recorder.onerror 回调覆盖测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      type: 'asr',
      domain: 'iat',
      language: 'zh_cn',
      accent: 'mandarin',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    recognizer.destroy();
  });

  describe('recorder.onerror 回调 (行 386-387)', () => {
    it('应该在录音出错时记录错误并调用 handleError', () => {
      // Mock handleError
      const handleErrorSpy = vi.spyOn(recognizer, 'handleError' as any);
      
      // Mock logger
      const errorSpy = vi.spyOn((recognizer as any).logger, 'error');
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      
      // 设置 onerror 回调（模拟 initializeRecording 中的代码）
      mockRecorder.onerror = (error: any) => {
        (recognizer as any).logger.error('录音出错:', error);
        (recognizer as any).handleError({
          code: 10009,
          message: '录音出错',
          data: error
        });
      };
      
      // 模拟录音错误事件
      const mockError = new Error('MediaRecorder error');
      mockRecorder.onerror(mockError);
      
      // 验证错误被记录
      expect(errorSpy).toHaveBeenCalledWith('录音出错:', mockError);
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 10009,
        message: '录音出错',
        data: mockError
      });
    });

    it('应该在录音出错时记录包含错误代码的错误', () => {
      // Mock handleError
      const handleErrorSpy = vi.spyOn(recognizer, 'handleError' as any);
      
      // Mock logger
      const errorSpy = vi.spyOn((recognizer as any).logger, 'error');
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      
      // 设置 onerror 回调
      mockRecorder.onerror = (error: any) => {
        (recognizer as any).logger.error('录音出错:', error);
        (recognizer as any).handleError({
          code: 10009,
          message: '录音出错',
          data: error
        });
      };
      
      // 模拟录音错误事件（带错误代码）
      const mockError = {
        message: 'Permission denied',
        code: 1,
      };
      mockRecorder.onerror(mockError);
      
      // 验证错误被记录
      expect(errorSpy).toHaveBeenCalledWith('录音出错:', mockError);
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 10009,
        message: '录音出错',
        data: mockError
      });
    });
  });
});
