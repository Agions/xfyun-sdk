import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XfyunASR } from '../src/recognizer.js';

describe('XfyunASR 错误处理补充测试', () => {
  let asr: XfyunASR;
  let mockSetTimeout: ReturnType<typeof vi.fn>;
  let mockClearTimeout: ReturnType<typeof vi.fn>;
  let mockSetInterval: ReturnType<typeof vi.fn>;
  let mockClearInterval: ReturnType<typeof vi.fn>;

  const mockWebSocket = {
    readyState: WebSocket.CONNECTING,
    send: vi.fn(),
    close: vi.fn(),
  };

  beforeEach(() => {
    mockSetTimeout = vi.fn((cb: Function) => 1);
    mockClearTimeout = vi.fn();
    mockSetInterval = vi.fn(() => 1);
    mockClearInterval = vi.fn();

    vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket));
    vi.stubGlobal('window', {
      setTimeout: mockSetTimeout,
      clearTimeout: mockClearTimeout,
      setInterval: mockSetInterval,
      clearInterval: mockClearInterval,
      AudioContext: vi.fn().mockImplementation(() => ({
        createAnalyser: vi.fn().mockReturnValue({
          fftSize: 2048,
          frequencyBinCount: 1024,
          getFloatTimeDomainData: vi.fn(),
          disconnect: vi.fn(),
        }),
        createMediaStreamSource: vi.fn().mockReturnValue({
          connect: vi.fn(),
          disconnect: vi.fn(),
        }),
        disconnect: vi.fn(),
      })),
      MediaStream: vi.fn(),
      navigator: {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }],
          }),
        },
      },
    });

    asr = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
    });
  });

  afterEach(() => {
    asr.destroy();
    vi.unstubAllGlobals();
  });

  describe('sendStartFrame 错误处理', () => {
    it('WebSocket 未连接时不应发送开始帧', () => {
      asr.start();
      mockWebSocket.send.mockClear();
      
      (asr as any).sendStartFrame();
      
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it('WebSocket 已关闭时不应发送开始帧', () => {
      (mockWebSocket as any).readyState = 3; // WebSocket.CLOSED = 3
      asr.start();
      mockWebSocket.send.mockClear();
      
      (asr as any).sendStartFrame();
      
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it('实例已销毁时不应发送开始帧', () => {
      asr.destroy();
      (mockWebSocket as any).readyState = 1; // WebSocket.OPEN = 1
      
      (asr as any).sendStartFrame();
      
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });

  describe('volumeTimer 回调测试', () => {
    it('startVolumeDetection 应设置音量检测定时器', () => {
      asr.start();
      
      // 模拟 analyser 已存在
      (asr as any).analyser = {
        fftSize: 2048,
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn(),
        disconnect: vi.fn(),
      };
      
      (asr as any).startVolumeDetection();
      
      // setInterval 应该在 start 中被调用
      expect(mockSetInterval).toHaveBeenCalled();
    });

    it('实例销毁后音量检测应停止', () => {
      asr.start();
      
      // 模拟 analyser 已存在
      (asr as any).analyser = {
        fftSize: 2048,
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn(),
        disconnect: vi.fn(),
      };
      
      (asr as any).startVolumeDetection();
      asr.destroy();
      
      expect(mockClearInterval).toHaveBeenCalled();
    });
  });
});
