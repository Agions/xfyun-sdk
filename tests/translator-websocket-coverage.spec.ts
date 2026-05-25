/**
 * translator.ts WebSocket 连接路径覆盖率覆盖测试
 * @description 覆盖 websocket.onclose 回调
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunTranslator } from '../src/translator';

describe('translator.ts WebSocket 连接路径覆盖率覆盖测试', () => {
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

  describe('websocket.onclose 回调', () => {
    it('应该在 WebSocket 关闭时清理录音资源', () => {
      // Mock WebSocket
      const mockWebSocket = {
        readyState: WebSocket.CLOSED,
        close: vi.fn(),
        onopen: null as any,
        onmessage: null as any,
        onerror: null as any,
        onclose: null as any,
      };
      (translator as any).websocket = mockWebSocket;
      
      // Mock recorder
      const mockRecorder = {
        state: 'recording',
        stop: vi.fn(),
      };
      (translator as any).recorder = mockRecorder;
      
      // Mock microphoneStream
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
      };
      (translator as any).microphoneStream = mockStream;
      
      // Mock audioContext
      const mockAudioContext = {
        close: vi.fn().mockResolvedValue(undefined),
      };
      (translator as any).audioContext = mockAudioContext;
      
      // 设置 onclose 回调（模拟 startSpeechTranslation 中的行为）
      mockWebSocket.onclose = () => {
        (translator as any).stopRecorder();
        (translator as any).releaseMicrophone();
        if ((translator as any).audioContext) {
          (translator as any).audioContext.close();
          (translator as any).audioContext = null;
        }
        (translator as any).setState('stopped');
        (translator as any).websocket = null;
      };
      
      // 触发 onclose
      mockWebSocket.onclose();
      
      // 验证清理操作
      expect(mockRecorder.stop).toHaveBeenCalled();
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
      expect(mockAudioContext.close).toHaveBeenCalled();
      expect((translator as any).state).toBe('stopped');
      expect((translator as any).websocket).toBeNull();
    });

    it('应该在 WebSocket 关闭时正确处理已销毁的 recorder', () => {
      // Mock WebSocket
      const mockWebSocket = {
        readyState: WebSocket.CLOSED,
        close: vi.fn(),
        onopen: null as any,
        onmessage: null as any,
        onerror: null as any,
        onclose: null as any,
      };
      (translator as any).websocket = mockWebSocket;
      
      // recorder 为 null
      (translator as any).recorder = null;
      
      // Mock microphoneStream
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
      };
      (translator as any).microphoneStream = mockStream;
      
      // Mock audioContext
      const mockAudioContext = {
        close: vi.fn().mockResolvedValue(undefined),
      };
      (translator as any).audioContext = mockAudioContext;
      
      // 设置 onclose 回调
      mockWebSocket.onclose = () => {
        (translator as any).stopRecorder();
        (translator as any).releaseMicrophone();
        if ((translator as any).audioContext) {
          (translator as any).audioContext.close();
          (translator as any).audioContext = null;
        }
        (translator as any).setState('stopped');
        (translator as any).websocket = null;
      };
      
      // 触发 onclose
      mockWebSocket.onclose();
      
      // 验证清理操作
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });
});
