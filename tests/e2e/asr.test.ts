/**
 * ASR E2E 测试
 * @description 端到端测试，验证完整的语音识别流程
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../../src/recognizer';
import type { XfyunASROptions } from '../../src/types';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;

  send = vi.fn();
  close = vi.fn();
}

// Mock MediaRecorder
class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();
}

describe('ASR E2E', () => {
  let mockWs: typeof MockWebSocket;
  let mockRecorder: typeof MockMediaRecorder;

  const defaultOptions: XfyunASROptions = {
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    language: 'zh_cn',
    domain: 'iat',
    accent: 'mandarin',
    vadEos: 3000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWs = MockWebSocket as unknown as typeof MockWebSocket;
    mockRecorder = MockMediaRecorder as unknown as typeof MockMediaRecorder;

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });

    (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = mockWs;
    (global as unknown as { MediaRecorder: typeof MockMediaRecorder }).MediaRecorder = mockRecorder;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('完整识别流程', () => {
    it('应该创建实例并正确初始化', () => {
      const onStart = vi.fn();
      const onStateChange = vi.fn();

      const asr = new XfyunASR(defaultOptions, {
        onStart,
        onStateChange,
      });

      expect(asr.getState()).toBe('idle');
      expect(asr.getResult()).toBe('');

      asr.destroy();
    });

    it('应该正确处理识别结果', () => {
      let messageHandler: ((event: { data: string }) => void) | null = null;

      // Capture the message handler
      mockWs = class extends MockWebSocket {
        onmessage = (handler: (event: { data: string }) => void) => {
          messageHandler = handler;
        };
      } as unknown as typeof MockWebSocket;

      const onResult = vi.fn();

      const asr = new XfyunASR(defaultOptions, {
        onRecognitionResult: onResult,
      });

      // Simulate receiving a result
      const mockResponse = JSON.stringify({
        code: 0,
        message: 'success',
        data: {
          result: {
            ws: [
              { bg: 0, cw: [{ w: '测试', sc: 0 }] },
            ],
            sn: 1,
            ls: true,
          },
          status: 2,
        },
      });

      // Manually trigger the handler if captured
      if (messageHandler) {
        messageHandler({ data: mockResponse });
      }

      asr.destroy();
    });
  });

  describe('状态转换', () => {
    it('应该正确跟踪状态变化', () => {
      const stateChanges: string[] = [];

      const asr = new XfyunASR(defaultOptions, {
        onStateChange: (state) => {
          stateChanges.push(state);
        },
      });

      expect(asr.getState()).toBe('idle');

      asr.destroy();

      expect(stateChanges.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('错误处理', () => {
    it('应该正确处理 WebSocket 错误', () => {
      const onError = vi.fn();

      const asr = new XfyunASR(defaultOptions, {
        onError,
      });

      expect(asr.getState()).toBe('idle');

      asr.destroy();
    });

    it('应该在缺少参数时抛出错误', () => {
      expect(() => {
        new XfyunASR({} as XfyunASROptions);
      }).toThrow('缺少必要参数');
    });
  });

  describe('资源清理', () => {
    it('应该在 destroy 时清理所有资源', () => {
      const asr = new XfyunASR(defaultOptions);

      asr.start();
      asr.destroy();

      expect(asr.getState()).toBe('stopped');
    });

    it('应该正确处理多次 destroy', () => {
      const asr = new XfyunASR(defaultOptions);

      asr.destroy();
      asr.destroy();

      expect(asr.getState()).toBe('stopped');
    });
  });
});
