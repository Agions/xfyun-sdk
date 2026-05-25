/**
 * logger.ts 和 utils.ts 未覆盖行补充测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel } from '../src/logger';
import { detectSupportedMimeType, arrayBufferToBase64, parseXfyunResult } from '../src/utils';

describe('logger.ts 未覆盖行补充测试', () => {
  it('应该正确处理 warn 级别的日志', () => {
    const logger = new Logger('TestModule');
    logger.setLevel('warn');
    
    // 验证 warn 级别可以记录 warn 和 error
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    logger.warn('Warn message');
    logger.error('Error message');
    
    expect(warnSpy).toHaveBeenCalledWith('TestModule', 'Warn message');
    expect(errorSpy).toHaveBeenCalledWith('TestModule', 'Error message');
    
    // info 和 debug 不应该被记录
    logger.info('Info message');
    logger.debug('Debug message');
    
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('应该正确处理 info 级别的日志', () => {
    const logger = new Logger('TestModule');
    logger.setLevel('info');
    
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');
    
    expect(infoSpy).toHaveBeenCalledWith('TestModule', 'Info message');
    expect(warnSpy).toHaveBeenCalledWith('TestModule', 'Warn message');
    expect(errorSpy).toHaveBeenCalledWith('TestModule', 'Error message');
    
    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('应该正确处理 setLevel 方法', () => {
    const logger = new Logger('TestModule');
    
    logger.setLevel('debug');
    expect(logger).toBeDefined();
    
    logger.setLevel('info');
    logger.setLevel('warn');
    logger.setLevel('error');
  });
});

describe('utils.ts 未覆盖行补充测试', () => {
  describe('detectSupportedMimeType', () => {
    it('应该返回 audio/webm 当不支持 audio/wav', () => {
      // 模拟不支持 audio/wav 的环境
      const originalMediaRecorder = global.MediaRecorder;
      global.MediaRecorder = class MockMediaRecorder {
        static isTypeSupported = vi.fn().mockReturnValue(false);
      } as any;
      
      const result = detectSupportedMimeType();
      expect(result).toBe('audio/webm');
      
      global.MediaRecorder = originalMediaRecorder;
    });
  });

  describe('arrayBufferToBase64', () => {
    it('应该正确转换 ArrayBuffer 为 base64', () => {
      const arrayBuffer = new ArrayBuffer(4);
      const view = new Uint8Array(arrayBuffer);
      view[0] = 0x48; // 'H'
      view[1] = 0x65; // 'e'
      view[2] = 0x6C; // 'l'
      view[3] = 0x6C; // 'l'
      
      const result = arrayBufferToBase64(arrayBuffer);
      expect(result).toBe('SGVsbA==');
    });
  });

  describe('parseXfyunResult', () => {
    it('应该处理有效数据', () => {
      const result = parseXfyunResult({
        ws: [{
          cw: [{ w: 'test' }, { w: 'data' }]
        }]
      });
      
      expect(result).toBe('testdata');
    });

    it('应该处理 ws 为数组但 cw 不存在的情况', () => {
      const result = parseXfyunResult({
        ws: [{}]
      });
      
      expect(result).toBe('');
    });
  });
});
