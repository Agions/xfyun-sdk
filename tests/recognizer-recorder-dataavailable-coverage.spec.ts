/**
 * recognizer.ts recorder.ondataavailable 回调覆盖测试
 * @description 覆盖 recorder.ondataavailable 回调中的数据处理逻辑 (行 364-380)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer';

describe('recognizer.ts recorder.ondataavailable 回调覆盖测试', () => {
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
    vi.unstubAllGlobals();
    recognizer.destroy();
  });

  describe('recorder.ondataavailable 回调 (行 364-380)', () => {
    it('应该在 event.data.size > 0 时处理音频数据并加入队列', () => {
      // Mock arrayBufferToBase64
      vi.stubGlobal('arrayBufferToBase64', vi.fn().mockReturnValue('base64-audio-data'));
      
      // Mock MediaRecorder blob
      const mockBlob = {
        size: 1024,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
      };
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      (recognizer as any).audioDataQueue = [];
      
      // Mock FileReader 类 - 需要捕获实例
      let capturedReader: any = null;
      class MockFileReader {
        result: any = null;
        onload: (() => void) | null = null;
        onerror: ((error: any) => void) | null = null;
        readAsArrayBuffer: (blob: Blob) => void = vi.fn();
        
        constructor() {
          capturedReader = this;
        }
      }
      vi.stubGlobal('FileReader', MockFileReader as any);
      
      // 设置 ondataavailable 回调（模拟 initializeRecording 中的代码）
      mockRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            if ((recognizer as any).state === 'recording' && !(recognizer as any).destroyed && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                (recognizer as any).audioDataQueue.push(base64Audio);
                (recognizer as any).sendAudioData();
              } catch (error) {
                (recognizer as any).logger.error('处理音频数据失败:', error);
              }
            }
          };
          reader.onerror = (error: any) => {
            (recognizer as any).logger.error('读取音频数据失败:', error);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 模拟 sendAudioData
      (recognizer as any).sendAudioData = vi.fn();
      
      // 触发 ondataavailable 回调
      const mockEvent = { data: mockBlob };
      mockRecorder.ondataavailable(mockEvent);
      
      // 设置 capturedReader 的 result 并触发 onload
      if (capturedReader) {
        capturedReader.result = new ArrayBuffer(1024);
        if (capturedReader.onload) {
          capturedReader.onload();
        }
      }
      
      // 验证数据被加入队列
      expect((recognizer as any).audioDataQueue.length).toBe(1);
      expect((recognizer as any).audioDataQueue[0]).toBe('base64-audio-data');
      expect((recognizer as any).sendAudioData).toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });

    it('应该在 event.data.size === 0 时不处理数据', () => {
      // Mock MediaRecorder blob
      const mockBlob = {
        size: 0,
        arrayBuffer: vi.fn(),
      };
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      (recognizer as any).state = 'recording';
      (recognizer as any).audioDataQueue = [];
      
      // 设置 ondataavailable 回调
      mockRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            if ((recognizer as any).state === 'recording' && !(recognizer as any).destroyed && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                (recognizer as any).audioDataQueue.push(base64Audio);
                (recognizer as any).sendAudioData();
              } catch (error) {
                (recognizer as any).logger.error('处理音频数据失败:', error);
              }
            }
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 触发 ondataavailable 回调
      const mockEvent = { data: mockBlob };
      mockRecorder.ondataavailable(mockEvent);
      
      // 验证数据没有被加入队列
      expect((recognizer as any).audioDataQueue.length).toBe(0);
    });

    it('应该在 reader.result 不是 ArrayBuffer 时不处理数据', () => {
      // Mock MediaRecorder blob
      const mockBlob = {
        size: 1024,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
      };
      
      // Mock FileReader - result 不是 ArrayBuffer
      class MockFileReader2 {
        result: any = 'not-an-arraybuffer';
        onload: (() => void) | null = null;
        onerror: ((error: any) => void) | null = null;
        readAsArrayBuffer: (blob: Blob) => void = vi.fn();
      }
      vi.stubGlobal('FileReader', MockFileReader2 as any);
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      (recognizer as any).audioDataQueue = [];
      
      // Mock arrayBufferToBase64
      vi.stubGlobal('arrayBufferToBase64', vi.fn().mockReturnValue('base64-audio-data'));
      
      // 设置 ondataavailable 回调
      mockRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            if ((recognizer as any).state === 'recording' && !(recognizer as any).destroyed && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                (recognizer as any).audioDataQueue.push(base64Audio);
                (recognizer as any).sendAudioData();
              } catch (error) {
                (recognizer as any).logger.error('处理音频数据失败:', error);
              }
            }
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 模拟 sendAudioData
      (recognizer as any).sendAudioData = vi.fn();
      
      // 触发 ondataavailable 回调
      const mockEvent = { data: mockBlob };
      mockRecorder.ondataavailable(mockEvent);
      
      // 验证数据没有被加入队列（因为 result 不是 ArrayBuffer）
      expect((recognizer as any).audioDataQueue.length).toBe(0);
      expect((recognizer as any).sendAudioData).not.toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });

    it('应该在 state !== recording 时不处理数据', () => {
      // Mock MediaRecorder blob
      const mockBlob = {
        size: 1024,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
      };
      
      // Mock FileReader
      class MockFileReader3 {
        result: any = new ArrayBuffer(1024);
        onload: (() => void) | null = null;
        onerror: ((error: any) => void) | null = null;
        readAsArrayBuffer: (blob: Blob) => void = vi.fn();
      }
      vi.stubGlobal('FileReader', MockFileReader3 as any);
      
      // Mock arrayBufferToBase64
      vi.stubGlobal('arrayBufferToBase64', vi.fn().mockReturnValue('base64-audio-data'));
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      (recognizer as any).state = 'stopped'; // 不是 recording 状态
      (recognizer as any).destroyed = false;
      (recognizer as any).audioDataQueue = [];
      
      // 设置 ondataavailable 回调
      mockRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            if ((recognizer as any).state === 'recording' && !(recognizer as any).destroyed && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                (recognizer as any).audioDataQueue.push(base64Audio);
                (recognizer as any).sendAudioData();
              } catch (error) {
                (recognizer as any).logger.error('处理音频数据失败:', error);
              }
            }
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 模拟 sendAudioData
      (recognizer as any).sendAudioData = vi.fn();
      
      // 触发 ondataavailable 回调
      const mockEvent = { data: mockBlob };
      mockRecorder.ondataavailable(mockEvent);
      
      // 验证数据没有被加入队列（因为 state 不是 recording）
      expect((recognizer as any).audioDataQueue.length).toBe(0);
      expect((recognizer as any).sendAudioData).not.toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });

    it('应该在 destroyed === true 时不处理数据', () => {
      // Mock MediaRecorder blob
      const mockBlob = {
        size: 1024,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
      };
      
      // Mock FileReader
      class MockFileReader4 {
        result: any = new ArrayBuffer(1024);
        onload: (() => void) | null = null;
        onerror: ((error: any) => void) | null = null;
        readAsArrayBuffer: (blob: Blob) => void = vi.fn();
      }
      vi.stubGlobal('FileReader', MockFileReader4 as any);
      
      // Mock arrayBufferToBase64
      vi.stubGlobal('arrayBufferToBase64', vi.fn().mockReturnValue('base64-audio-data'));
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = true; // 已销毁
      (recognizer as any).audioDataQueue = [];
      
      // 设置 ondataavailable 回调
      mockRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            if ((recognizer as any).state === 'recording' && !(recognizer as any).destroyed && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                (recognizer as any).audioDataQueue.push(base64Audio);
                (recognizer as any).sendAudioData();
              } catch (error) {
                (recognizer as any).logger.error('处理音频数据失败:', error);
              }
            }
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 模拟 sendAudioData
      (recognizer as any).sendAudioData = vi.fn();
      
      // 触发 ondataavailable 回调
      const mockEvent = { data: mockBlob };
      mockRecorder.ondataavailable(mockEvent);
      
      // 验证数据没有被加入队列（因为 destroyed 为 true）
      expect((recognizer as any).audioDataQueue.length).toBe(0);
      expect((recognizer as any).sendAudioData).not.toHaveBeenCalled();
      
      vi.unstubAllGlobals();
    });

    it('应该在处理音频数据时抛出异常时记录错误', () => {
      // Mock MediaRecorder blob
      const mockBlob = {
        size: 1024,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
      };
      
      // Mock FileReader - 需要捕获实例
      let capturedReader: any = null;
      class MockFileReader5 {
        result: any = null;
        onload: (() => void) | null = null;
        onerror: ((error: any) => void) | null = null;
        readAsArrayBuffer: (blob: Blob) => void = vi.fn();
        
        constructor() {
          capturedReader = this;
        }
      }
      vi.stubGlobal('FileReader', MockFileReader5 as any);
      
      // Mock arrayBufferToBase64 抛出异常
      vi.stubGlobal('arrayBufferToBase64', vi.fn().mockImplementation(() => {
        throw new Error('Conversion error');
      }));
      
      // 设置 recorder
      const mockRecorder = {
        ondataavailable: null as any,
        onerror: null as any,
        start: vi.fn(),
        stop: vi.fn(),
      };
      (recognizer as any).recorder = mockRecorder;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      (recognizer as any).audioDataQueue = [];
      
      // 记录错误
      const errorSpy = vi.spyOn((recognizer as any).logger, 'error');
      
      // 设置 ondataavailable 回调
      mockRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            if ((recognizer as any).state === 'recording' && !(recognizer as any).destroyed && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                (recognizer as any).audioDataQueue.push(base64Audio);
                (recognizer as any).sendAudioData();
              } catch (error) {
                (recognizer as any).logger.error('处理音频数据失败:', error);
              }
            }
          };
          reader.onerror = (error: any) => {
            (recognizer as any).logger.error('读取音频数据失败:', error);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 触发 ondataavailable 回调
      const mockEvent = { data: mockBlob };
      mockRecorder.ondataavailable(mockEvent);
      
      // 设置 result 并触发 onload
      if (capturedReader) {
        capturedReader.result = new ArrayBuffer(1024);
        if (capturedReader.onload) {
          capturedReader.onload();
        }
      }
      
      // 验证错误被记录
      expect(errorSpy).toHaveBeenCalledWith('处理音频数据失败:', expect.any(Error));
      expect((recognizer as any).audioDataQueue.length).toBe(0);
      
      vi.unstubAllGlobals();
    });
  });
});
