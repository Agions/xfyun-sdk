/**
 * 测试工具函数
 * @description 提供共享的 Mock 类和测试辅助函数，减少测试文件重复
 */

import { vi, Mock } from 'vitest';

/**
 * Mock WebSocket 类
 * 用于所有需要 WebSocket 的测试文件
 */
export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string | ArrayBuffer }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;

  send = vi.fn();
  close = vi.fn();

  constructor(_url: string) {
    // Mock 构造函数
  }
}

/**
 * Mock MediaRecorder 类
 * 用于需要录音功能的测试
 */
export class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();

  constructor(_stream: MediaStream, _options?: { mimeType?: string; audioBitsPerSecond?: number }) {
    // Mock 构造函数
  }
}

/**
 * 创建 Mock MediaStream
 */
export function createMockMediaStream(): MediaStream {
  return {
    getTracks: () => [{ stop: vi.fn() }],
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    active: true,
  } as unknown as MediaStream;
}

/**
 * 设置全局 WebSocket Mock
 */
export function setGlobalWebSocketMock(MockClass: typeof MockWebSocket): void {
  (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockClass as unknown as typeof WebSocket;
}

/**
 * 设置全局 MediaRecorder Mock
 */
export function setGlobalMediaRecorderMock(MockClass: typeof MockMediaRecorder): void {
  (global as unknown as { MediaRecorder: typeof MockMediaRecorder }).MediaRecorder = MockClass as unknown as typeof MediaRecorder;
}

/**
 * 设置 navigator.mediaDevices Mock
 */
export function setMediaDevicesMock(mockGetUserMedia?: ReturnType<typeof vi.fn>): void {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: mockGetUserMedia || vi.fn().mockResolvedValue(createMockMediaStream()),
    },
  });
}

/**
 * 创建测试用的标准配置选项
 */
export function createTestASROptions(overrides?: Partial<any>): any {
  return {
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    ...overrides,
  };
}

export function createTestTTSOptions(overrides?: Partial<any>): any {
  return {
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    voice_name: 'xiaoyan',
    ...overrides,
  };
}

export function createTestTranslatorOptions(overrides?: Partial<any>): any {
  return {
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    type: 'text',
    from: 'cn',
    to: 'en',
    ...overrides,
  };
}

/**
 * 测试前清理钩子 - 恢复所有 mocks
 */
export function cleanupMocks(): void {
  vi.restoreAllMocks();
  vi.clearAllMocks();
}

/**
 * 创建测试用的 Blob
 */
export function createTestBlob(data: string, type: string = 'audio/mp3'): Blob {
  return new Blob([data], { type });
}

/**
 * 创建测试用的 ArrayBuffer
 */
export function createTestArrayBuffer(size: number = 4): ArrayBuffer {
  return new ArrayBuffer(size);
}

/**
 * 模拟 document 环境（用于 downloadAudio 测试）
 */
export function createMockDocument(): any {
  return {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  };
}

/**
 * 模拟 URL 环境
 */
export function createMockURL(): any {
  return {
    createObjectURL: vi.fn(() => 'blob:test-url'),
    revokeObjectURL: vi.fn(),
  };
}

/**
 * 测试后恢复环境
 */
export function restoreEnvironment(): void {
  (global as any).document = undefined;
  (global as any).URL = undefined;
}
