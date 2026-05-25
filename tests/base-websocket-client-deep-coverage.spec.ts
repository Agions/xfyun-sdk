/**
 * base-websocket-client.ts 深度覆盖测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseWebSocketClient } from '../src/base-websocket-client';

describe('base-websocket-client.ts 深度覆盖测试', () => {
  let client: BaseWebSocketClient;

  beforeEach(() => {
    client = new (class extends BaseWebSocketClient {
      protected getModulePrefix(): string {
        return '[BaseClient]';
      }
      protected getErrorCodePrefix(): string {
        return 'TEST';
      }
      protected readonly STATE_TRANSITIONS: Record<string, string[]> = {
        idle: ['connecting', 'error'],
        connecting: ['connected', 'error', 'idle'],
        connected: ['idle', 'error'],
        error: ['idle'],
      };
      protected connect(): void {
        // Mock 连接
      }
      protected handleMessage(data: string | ArrayBuffer): void {
        // Mock 消息处理
      }
      protected handleOpen(): void {
        // Mock 打开
      }
      protected handleClose(code: number, reason: string): void {
        // Mock 关闭
      }
      protected handleError(error: Event): void {
        // Mock 错误
      }
    })({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    client.destroy();
  });

  describe('scheduleWebSocketClose', () => {
    it('应该调度 WebSocket 关闭定时器', async () => {
      vi.useFakeTimers();
      
      const safeCloseSpy = vi.spyOn(client, 'safeCloseWebSocket' as any);
      
      (client as any).scheduleWebSocketClose(10);
      
      expect((client as any).websocketCloseTimer).not.toBeNull();
      
      // 快进定时器
      await vi.advanceTimersByTimeAsync(20);
      
      expect(safeCloseSpy).toHaveBeenCalled();
      expect((client as any).websocketCloseTimer).toBeNull();
      
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('应该在 window 未定义时不创建定时器', () => {
      // 模拟 server 环境
      const originalWindow = (global as any).window;
      delete (global as any).window;
      
      (client as any).scheduleWebSocketClose(10);
      
      expect((client as any).websocketCloseTimer).toBeNull();
      
      // 恢复
      (global as any).window = originalWindow;
    });
  });

  describe('setupConnectingTimeout', () => {
    it('应该在连接超时时调用 safeCloseWebSocket 和 handleError', async () => {
      vi.useFakeTimers();
      
      const safeCloseSpy = vi.spyOn(client, 'safeCloseWebSocket' as any);
      const handleErrorSpy = vi.spyOn(client, 'handleError' as any);
      const warnSpy = vi.spyOn((client as any).logger, 'warn');
      
      (client as any).state = 'connecting';
      (client as any).destroyed = false;
      
      // 触发连接超时定时器
      (client as any).setupConnectingTimeout();
      
      // 快进定时器到超时时间（默认 30000ms）
      await vi.advanceTimersByTimeAsync(30000);
      
      expect(safeCloseSpy).toHaveBeenCalled();
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 'TEST5',
        message: 'WebSocket 连接超时',
        data: undefined
      });
      expect(warnSpy).toHaveBeenCalledWith('WebSocket connecting 超时，强制关闭');
      
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('应该在 destroyed 为 true 时不调用 setupConnectingTimeout', () => {
      (client as any).destroyed = true;
      
      const safeCloseSpy = vi.spyOn(client, 'safeCloseWebSocket' as any);
      
      (client as any).setupConnectingTimeout();
      
      expect(safeCloseSpy).not.toHaveBeenCalled();
    });
  });

  describe('getErrorCodePrefix', () => {
    it('应该返回正确的错误代码前缀', () => {
      expect((client as any).getErrorCodePrefix()).toBe('TEST');
    });
  });

  describe('handleWebSocketMessage', () => {
    it('应该处理 WebSocket 消息并调用 parseMessage', () => {
      // parseMessage 是私有方法，直接调用 handleWebSocketMessage 来覆盖代码行
      const loggerSpy = vi.spyOn((client as any).logger, 'debug');
      
      const mockEvent = { data: '{"test": "message"}' };
      (client as any).handleWebSocketMessage(mockEvent);
      
      expect(loggerSpy).toHaveBeenCalledWith('收到 WebSocket 消息');
    });

    it('应该在解析消息失败时记录错误并调用 handleError', () => {
      vi.spyOn(client, 'handleMessage' as any).mockImplementation(() => {
        throw new Error('Parse error');
      });
      
      const loggerSpy = vi.spyOn((client as any).logger, 'error');
      const handleErrorSpy = vi.spyOn(client, 'handleError' as any);
      
      const mockEvent = { data: 'invalid json' };
      (client as any).handleWebSocketMessage(mockEvent);
      
      expect(loggerSpy).toHaveBeenCalledWith('解析 WebSocket 消息失败:', expect.any(Error));
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 'TEST5',
        message: '解析消息失败',
        data: expect.any(Error)
      });
    });
  });

  describe('handleWebSocketError', () => {
    it('应该处理 WebSocket 错误并调用 handleError', () => {
      const clearConnectingTimerSpy = vi.spyOn(client as any, 'clearConnectingTimer');
      const loggerSpy = vi.spyOn((client as any).logger, 'error');
      const handleErrorSpy = vi.spyOn(client, 'handleError' as any);
      
      const mockError = new Event('error');
      (client as any).handleWebSocketError(mockError);
      
      expect(clearConnectingTimerSpy).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('WebSocket 连接错误:', mockError);
      expect(handleErrorSpy).toHaveBeenCalledWith({
        code: 'TEST2',
        message: 'WebSocket 连接错误',
        data: mockError
      });
    });
  });

  describe('handleWebSocketClose', () => {
    it('应该处理 WebSocket 关闭事件并调用 onWebSocketClosed', () => {
      const loggerSpy = vi.spyOn((client as any).logger, 'info');
      const onWebSocketClosedSpy = vi.spyOn(client, 'onWebSocketClosed' as any);
      
      const mockCloseEvent = new CloseEvent('close', { code: 1000, reason: 'Normal closure' });
      (client as any).handleWebSocketClose(mockCloseEvent);
      
      expect(loggerSpy).toHaveBeenCalledWith('WebSocket 连接关闭:', 1000, 'Normal closure');
      expect(onWebSocketClosedSpy).toHaveBeenCalledWith(mockCloseEvent);
      expect((client as any).websocket).toBeNull();
    });
  });
  describe('forceSetState', () => {
    it('应该强制设置状态（跳过状态机检查）', () => {
      const setStateSpy = vi.spyOn(client as any, 'setState');
      
      (client as any).forceSetState('connected');
      
      expect(setStateSpy).toHaveBeenCalledWith('connected', true);
    });
  });

  describe('setHandlers', () => {
    it('应该设置新的事件处理程序', () => {
      const newHandlers = {
        onConnected: vi.fn(),
        onError: vi.fn(),
      };
      
      (client as any).setHandlers(newHandlers);
      
      expect((client as any).handlers.onConnected).toBe(newHandlers.onConnected);
      expect((client as any).handlers.onError).toBe(newHandlers.onError);
    });

    it('应该在 newHandlers 无效时抛出 TypeError', () => {
      expect(() => {
        (client as any).setHandlers(null as any);
      }).toThrow('handlers 必须是有效的对象');
      
      expect(() => {
        (client as any).setHandlers('invalid' as any);
      }).toThrow('handlers 必须是有效的对象');
    });
  });
});
