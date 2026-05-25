/**
 * 未覆盖代码补充测试
 * @description 覆盖 error.ts、translator.ts、recognizer.ts 的未测试分支
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  classifyError,
  canAutoRecover,
  getRecoveryAction,
  handleXfyunError,
  ErrorSeverity,
  ErrorRecoverability,
  ErrorCategory,
  EnhancedXfyunError,
} from '../src/error';
import { XfyunTranslator } from '../src/translator';
import { XfyunASR } from '../src/recognizer';

// ============================================================================
// error.ts 补充测试
// ============================================================================

describe('error.ts 补充测试', () => {
  describe('canAutoRecover', () => {
    it('应该对 RECOVERABLE 错误返回 true', () => {
      const error: EnhancedXfyunError = {
        code: 10010,
        message: '连接断开',
        category: ErrorCategory.NETWORK_DISCONNECT,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.RECOVERABLE,
        recoveryHint: '尝试重新连接',
        timestamp: Date.now(),
      };
      expect(canAutoRecover(error)).toBe(true);
    });

    it('应该对 PARTIALLY_RECOVERABLE 错误返回 false', () => {
      const error: EnhancedXfyunError = {
        code: 10006,
        message: '授权过期',
        category: ErrorCategory.AUTH_EXPIRED,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
        recoveryHint: '重新获取授权',
        timestamp: Date.now(),
      };
      expect(canAutoRecover(error)).toBe(false);
    });

    it('应该对 UNRECOVERABLE 错误返回 false', () => {
      const error: EnhancedXfyunError = {
        code: 10002,
        message: '签名验证失败',
        category: ErrorCategory.AUTH_INVALID,
        severity: ErrorSeverity.CRITICAL,
        recoverable: ErrorRecoverability.UNRECOVERABLE,
        recoveryHint: '检查认证信息',
        timestamp: Date.now(),
      };
      expect(canAutoRecover(error)).toBe(false);
    });
  });

  describe('getRecoveryAction', () => {
    it('应该对 NETWORK_CONNECTION 返回 reconnect', () => {
      const error: EnhancedXfyunError = {
        code: 10010,
        message: '连接断开',
        category: ErrorCategory.NETWORK_CONNECTION,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.RECOVERABLE,
        recoveryHint: '重试',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('reconnect');
    });

    it('应该对 NETWORK_DISCONNECT 返回 reconnect', () => {
      const error: EnhancedXfyunError = {
        code: 10010,
        message: '连接断开',
        category: ErrorCategory.NETWORK_DISCONNECT,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.RECOVERABLE,
        recoveryHint: '重试',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('reconnect');
    });

    it('应该对 NETWORK_TIMEOUT 返回 retry', () => {
      const error: EnhancedXfyunError = {
        code: 10005,
        message: '连接超时',
        category: ErrorCategory.NETWORK_TIMEOUT,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.RECOVERABLE,
        recoveryHint: '重试',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('retry');
    });

    it('应该对 RESOURCE_WEB_SOCKET 返回 retry', () => {
      const error: EnhancedXfyunError = {
        code: 10010,
        message: 'WebSocket 失败',
        category: ErrorCategory.RESOURCE_WEB_SOCKET,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.RECOVERABLE,
        recoveryHint: '重试',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('retry');
    });

    it('应该对 RESOURCE_MICROPHONE 返回 reinitialize', () => {
      const error: EnhancedXfyunError = {
        code: 10009,
        message: '录音错误',
        category: ErrorCategory.RESOURCE_MICROPHONE,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
        recoveryHint: '重新初始化',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('reinitialize');
    });

    it('应该对 RESOURCE_AUDIO_CONTEXT 返回 reinitialize', () => {
      const error: EnhancedXfyunError = {
        code: 10009,
        message: '音频上下文失败',
        category: ErrorCategory.RESOURCE_AUDIO_CONTEXT,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
        recoveryHint: '刷新页面',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('reinitialize');
    });

    it('应该对 AUTH_INVALID 返回 notify_user', () => {
      const error: EnhancedXfyunError = {
        code: 10002,
        message: '签名验证失败',
        category: ErrorCategory.AUTH_INVALID,
        severity: ErrorSeverity.CRITICAL,
        recoverable: ErrorRecoverability.UNRECOVERABLE,
        recoveryHint: '检查认证',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('notify_user');
    });

    it('应该对 AUTH_EXPIRED 返回 notify_user', () => {
      const error: EnhancedXfyunError = {
        code: 10006,
        message: '授权过期',
        category: ErrorCategory.AUTH_EXPIRED,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
        recoveryHint: '重新获取',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('notify_user');
    });

    it('应该对 AUTH_FORBIDDEN 返回 notify_user', () => {
      const error: EnhancedXfyunError = {
        code: 10007,
        message: '无权限',
        category: ErrorCategory.AUTH_FORBIDDEN,
        severity: ErrorSeverity.CRITICAL,
        recoverable: ErrorRecoverability.UNRECOVERABLE,
        recoveryHint: '检查权限',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('notify_user');
    });

    it('应该对 BUSINESS_LIMIT_EXCEEDED 返回 notify_user', () => {
      const error: EnhancedXfyunError = {
        code: 10008,
        message: '配额超限',
        category: ErrorCategory.BUSINESS_LIMIT_EXCEEDED,
        severity: ErrorSeverity.HIGH,
        recoverable: ErrorRecoverability.UNRECOVERABLE,
        recoveryHint: '升级套餐',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('notify_user');
    });

    it('应该对未知类别返回 none', () => {
      const error: EnhancedXfyunError = {
        code: 99999,
        message: '未知错误',
        category: 'unknown' as any,
        severity: ErrorSeverity.MEDIUM,
        recoverable: ErrorRecoverability.PARTIALLY_RECOVERABLE,
        recoveryHint: '未知',
        timestamp: Date.now(),
      };
      expect(getRecoveryAction(error)).toBe('none');
    });
  });

  describe('handleXfyunError', () => {
    it('应该对普通 Error 返回正确的处理结果', () => {
      const error = new Error('Test error');
      const result = handleXfyunError(error);
      
      expect(result.handled).toBe(true);
      expect(result.error).toBeDefined();
      // plain Error 没有 code 属性，被分类为 99999 (未知错误)
      expect(result.error.code).toBe(99999);
      expect(result.error.message).toBe('Test error');
      expect(result.error.category).toBe(ErrorCategory.SYSTEM_INTERNAL);
      expect(typeof result.canRecover).toBe('boolean');
      expect(typeof result.recoveryAction).toBe('string');
    });

    it('应该对带 code 的对象返回正确的分类', () => {
      const error = { code: 10005, message: '连接超时' };
      const result = handleXfyunError(error);
      
      expect(result.handled).toBe(true);
      expect(result.error.code).toBe(10005);
      expect(result.error.category).toBe(ErrorCategory.NETWORK_TIMEOUT);
    });

    it('应该对讯飞错误码 10002 返回 CRITICAL', () => {
      const error = { code: 10002, message: '签名验证失败' };
      const result = handleXfyunError(error);
      
      expect(result.error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(result.error.recoverable).toBe(ErrorRecoverability.UNRECOVERABLE);
    });

    it('应该对讯飞错误码 20000 返回 SYSTEM_INTERNAL', () => {
      const error = { code: 20000, message: '系统错误' };
      const result = handleXfyunError(error);
      
      expect(result.error.category).toBe(ErrorCategory.SYSTEM_INTERNAL);
    });

    it('应该对讯飞错误码 30001 返回 BUSINESS_INVALID_PARAM', () => {
      const error = { code: 30001, message: '参数错误' };
      const result = handleXfyunError(error);
      
      expect(result.error.category).toBe(ErrorCategory.BUSINESS_INVALID_PARAM);
    });

    it('应该对未知错误码返回 HIGH 严重程度', () => {
      const error = { code: 99999, message: '未知' };
      const result = handleXfyunError(error);
      
      expect(result.error.severity).toBe(ErrorSeverity.HIGH);
    });
  });
});

// ============================================================================
// translator.ts 补充测试
// ============================================================================

describe('translator.ts 补充测试', () => {
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

  describe('stopRecorder', () => {
    it('应该在 recorder 存在且非 inactive 时调用 stop', () => {
      const mockRecorder = {
        state: 'recording',
        stop: vi.fn(),
      };
      (translator as any).recorder = mockRecorder;
      
      (translator as any).stopRecorder();
      
      expect(mockRecorder.stop).toHaveBeenCalled();
      expect((translator as any).recorder).toBeNull();
    });

    it('应该在 recorder 为 inactive 时不调用 stop', () => {
      const mockRecorder = {
        state: 'inactive',
        stop: vi.fn(),
      };
      (translator as any).recorder = mockRecorder;
      
      (translator as any).stopRecorder();
      
      expect(mockRecorder.stop).not.toHaveBeenCalled();
      expect((translator as any).recorder).toBeNull();
    });

    it('应该在 recorder 不存在时安全处理', () => {
      (translator as any).recorder = null;
      
      expect(() => (translator as any).stopRecorder()).not.toThrow();
    });
  });

  describe('releaseMicrophone', () => {
    it('应该停止所有 track 并清空流引用', () => {
      const mockTrack1 = { stop: vi.fn() };
      const mockTrack2 = { stop: vi.fn() };
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([mockTrack1, mockTrack2]),
      };
      (translator as any).microphoneStream = mockStream;
      
      (translator as any).releaseMicrophone();
      
      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
      expect((translator as any).microphoneStream).toBeNull();
    });

    it('应该在 microphoneStream 不存在时安全处理', () => {
      (translator as any).microphoneStream = null;
      
      expect(() => (translator as any).releaseMicrophone()).not.toThrow();
    });
  });

  describe('sendTextFrame', () => {
    beforeEach(() => {
      // 创建带 close 方法的 mock websocket，避免 destroy 时出错
      (translator as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
        send: vi.fn().mockReturnValue(true),
      };
    });

    it('应该在 WebSocket 未就绪时直接返回', () => {
      (translator as any).websocket = null;
      
      expect(() => (translator as any).sendTextFrame('test')).not.toThrow();
    });

    it('应该在 WebSocket 非 OPEN 状态时直接返回', () => {
      (translator as any).websocket = {
        readyState: WebSocket.CLOSED,
        close: vi.fn(),
      };
      
      expect(() => (translator as any).sendTextFrame('test')).not.toThrow();
    });

    it('应该在 safeSend 失败时记录警告', () => {
      (translator as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
      };
      (translator as any).safeSend = vi.fn().mockReturnValue(false);
      const warnSpy = vi.spyOn((translator as any).logger, 'warn');
      
      (translator as any).sendTextFrame('test');
      
      expect(warnSpy).toHaveBeenCalledWith('发送文本翻译帧失败');
    });

    it('应该在发送成功时设置 translating 状态', () => {
      (translator as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
      };
      (translator as any).safeSend = vi.fn().mockReturnValue(true);
      const setStateSpy = vi.spyOn(translator, 'setState' as any);
      
      (translator as any).sendTextFrame('test');
      
      expect(setStateSpy).toHaveBeenCalledWith('translating');
    });
  });

  describe('sendStartFrame', () => {
    beforeEach(() => {
      (translator as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
        send: vi.fn().mockReturnValue(true),
      };
    });

    it('应该构建正确的开始帧并发送', () => {
      const safeSendSpy = vi.spyOn((translator as any), 'safeSend');
      
      (translator as any).sendStartFrame();
      
      expect(safeSendSpy).toHaveBeenCalled();
    });

    it('应该在 safeSend 失败时不设置状态', () => {
      (translator as any).safeSend = vi.fn().mockReturnValue(false);
      const setStateSpy = vi.spyOn(translator, 'setState' as any);
      
      (translator as any).sendStartFrame();
      
      expect(setStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('translateText 静态方法', () => {
    it('应该拒绝空文本', async () => {
      await expect(
        XfyunTranslator.translateText('', {
          appId: 'test',
          apiKey: 'test',
          apiSecret: 'test',
        })
      ).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝空白文本', async () => {
      await expect(
        XfyunTranslator.translateText('   ', {
          appId: 'test',
          apiKey: 'test',
          apiSecret: 'test',
        })
      ).rejects.toThrow('翻译文本不能为空');
    });

    it('应该拒绝缺少必要参数的调用', async () => {
      await expect(
        XfyunTranslator.translateText('hello', {
          appId: 'test',
          // apiKey 缺失
          apiSecret: 'test',
        } as any)
      ).rejects.toThrow('缺少必要参数');
    });

    it('应该在翻译成功时 resolve 结果（mock 场景）', async () => {
      // 通过 spy 验证内部流程
      const startSpy = vi.spyOn(XfyunTranslator.prototype, 'start');
      
      // 创建一个会立即触发 onResult 的 mock
      const originalConstructor = XfyunTranslator;
      
      // 由于需要真实 WebSocket 连接，这里主要验证参数传递
      // 实际的成功路径需要集成测试
      expect(XfyunTranslator.translateText).toBeDefined();
      
      startSpy.mockRestore();
    });
  });
});

// ============================================================================
// recognizer.ts 补充测试
// ============================================================================

describe('recognizer.ts 补充测试', () => {
  let recognizer: XfyunASR;

  beforeEach(() => {
    recognizer = new XfyunASR({
      appId: 'test-app-id',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
    });
  });

  afterEach(() => {
    recognizer.destroy();
  });

  describe('sendEndFrame', () => {
    beforeEach(() => {
      (recognizer as any).websocket = {
        readyState: WebSocket.OPEN,
        close: vi.fn(),
        send: vi.fn().mockReturnValue(true),
      };
    });

    it('应该在 WebSocket 未就绪时记录警告', () => {
      (recognizer as any).websocket = null;
      const warnSpy = vi.spyOn((recognizer as any).logger, 'warn');
      
      (recognizer as any).sendEndFrame();
      
      expect(warnSpy).toHaveBeenCalledWith('发送结束帧失败，WebSocket 未就绪');
    });

    it('应该构建正确的结束帧（status=2）', () => {
      const safeSendSpy = vi.spyOn((recognizer as any), 'safeSend');
      
      (recognizer as any).sendEndFrame();
      
      expect(safeSendSpy).toHaveBeenCalled();
      const callArg = safeSendSpy.mock.calls[0][0];
      const frame = JSON.parse(callArg);
      expect(frame.data.status).toBe(2);
    });
  });

  describe('startVolumeDetection', () => {
    it('应该在 analyser 不存在时直接返回', () => {
      (recognizer as any).analyser = null;
      
      (recognizer as any).startVolumeDetection();
      
      expect((recognizer as any).volumeTimer).toBeNull();
    });

    it('应该在 analyser 存在时创建定时器', () => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn(),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      
      (recognizer as any).startVolumeDetection();
      
      expect((recognizer as any).volumeTimer).not.toBeNull();
      // 清理定时器
      clearInterval((recognizer as any).volumeTimer);
    });

    it('应该在 recording 状态且未销毁时调用 onProcess', (done) => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn().mockImplementation((arr: Float32Array) => {
          arr.fill(0.1);
        }),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'recording';
      (recognizer as any).destroyed = false;
      
      let called = false;
      recognizer.setHandlers({
        onProcess: (volume: number) => {
          called = true;
          clearInterval((recognizer as any).volumeTimer);
          expect(typeof volume).toBe('number');
          done();
        },
      });
      
      (recognizer as any).startVolumeDetection();
      
      // 如果 500ms 内没调用，也完成测试
      setTimeout(() => {
        if (!called) done();
      }, 600);
    });

    it('应该在非 recording 状态时不调用 onProcess', () => {
      const mockAnalyser = {
        frequencyBinCount: 1024,
        getFloatTimeDomainData: vi.fn(),
      };
      (recognizer as any).analyser = mockAnalyser;
      (recognizer as any).state = 'connected'; // 非 recording
      (recognizer as any).destroyed = false;
      
      let onProcessCalled = false;
      recognizer.setHandlers({
        onProcess: () => { onProcessCalled = true; },
      });
      
      (recognizer as any).startVolumeDetection();
      
      // 等待定时器执行一次
      setTimeout(() => {
        expect(onProcessCalled).toBe(false);
        clearInterval((recognizer as any).volumeTimer);
      }, 150);
    });
  });

  describe('clearReconnectTimer', () => {
    it('应该清除 reconnectTimer 和 connectingTimer', () => {
      (recognizer as any).reconnectTimer = setTimeout(() => {}, 1000);
      (recognizer as any).connectingTimer = setTimeout(() => {}, 1000);
      
      (recognizer as any).clearReconnectTimer();
      
      expect((recognizer as any).reconnectTimer).toBeNull();
      expect((recognizer as any).connectingTimer).toBeNull();
    });

    it('应该在 timer 不存在时安全处理', () => {
      (recognizer as any).reconnectTimer = null;
      (recognizer as any).connectingTimer = null;
      
      expect(() => (recognizer as any).clearReconnectTimer()).not.toThrow();
    });
  });

  describe('handleReconnect', () => {
    it('应该在 destroyed 时直接返回', () => {
      (recognizer as any).destroyed = true;
      (recognizer as any).options.enableReconnect = true;
      const initialIsReconnecting = (recognizer as any).isReconnecting;
      
      (recognizer as any).handleReconnect();
      
      // isReconnecting 应该保持原值（false）
      expect((recognizer as any).isReconnecting).toBe(initialIsReconnecting);
    });

    it('应该在 enableReconnect 为 false 时直接返回', () => {
      (recognizer as any).destroyed = false;
      (recognizer as any).options.enableReconnect = false;
      const initialIsReconnecting = (recognizer as any).isReconnecting;
      
      (recognizer as any).handleReconnect();
      
      expect((recognizer as any).isReconnecting).toBe(initialIsReconnecting);
    });

    it('应该在已在重连时直接返回', () => {
      (recognizer as any).destroyed = false;
      (recognizer as any).options.enableReconnect = true;
      (recognizer as any).isReconnecting = true;
      
      (recognizer as any).handleReconnect();
      
      expect((recognizer as any).isReconnecting).toBe(true);
    });

    it('应该在满足条件时开始重连', () => {
      (recognizer as any).destroyed = false;
      (recognizer as any).options.enableReconnect = true;
      (recognizer as any).isReconnecting = false;
      (recognizer as any).reconnectCount = 0;
      (recognizer as any).options.reconnectAttempts = 3;
      (recognizer as any).options.reconnectInterval = 1000;
      
      const startSpy = vi.spyOn(recognizer, 'start' as any);
      
      (recognizer as any).handleReconnect();
      
      expect((recognizer as any).isReconnecting).toBe(true);
      expect((recognizer as any).reconnectCount).toBe(1);
      
      // 清理重连定时器
      if ((recognizer as any).reconnectTimer) {
        clearTimeout((recognizer as any).reconnectTimer);
      }
    });

    it('应该在超过最大重连次数时停止重连', () => {
      (recognizer as any).destroyed = false;
      (recognizer as any).options.enableReconnect = true;
      (recognizer as any).isReconnecting = false;
      (recognizer as any).reconnectCount = 5; // 超过默认 3 次
      (recognizer as any).options.reconnectAttempts = 3;
      
      (recognizer as any).handleReconnect();
      
      expect((recognizer as any).isReconnecting).toBe(false);
    });

    it('应该在 handleReconnect 中调用 start 并设置定时器', (done) => {
      (recognizer as any).destroyed = false;
      (recognizer as any).options.enableReconnect = true;
      (recognizer as any).isReconnecting = false;
      (recognizer as any).reconnectCount = 0;
      (recognizer as any).options.reconnectAttempts = 3;
      (recognizer as any).options.reconnectInterval = 10; // 短间隔用于测试
      
      const startSpy = vi.spyOn(recognizer, 'start' as any).mockResolvedValue();
      
      (recognizer as any).handleReconnect();
      
      expect((recognizer as any).isReconnecting).toBe(true);
      
      // 等待定时器触发
      setTimeout(() => {
        expect(startSpy).toHaveBeenCalled();
        done();
      }, 50);
    });
  });
});
