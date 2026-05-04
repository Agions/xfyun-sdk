/**
 * WebSocket 客户端基类
 * @description 提取所有基于 WebSocket 的讯飞 API 客户端的通用逻辑
 * 
 * 包含功能：
 * - WebSocket 连接管理（创建、发送、关闭）
 * - 定时器管理（连接超时、关闭延迟）
 * - 状态管理（状态转换验证）
 * - 错误处理模式
 * 
 * @example
 * ```typescript
 * abstract class MyClient extends BaseWebSocketClient<MyState> {
 *   protected readonly STATE_TRANSITIONS: Record<MyState, MyState[]> = { ... };
 *   
 *   protected parseMessage(data: string | ArrayBuffer): void {
 *     // 子类实现消息解析
 *   }
 *   
 *   protected getModulePrefix(): string {
 *     return '[MyClient]';
 *   }
 * }
 * ```
 */

import { Logger, LogLevel } from './logger';
import type { XfyunError } from './types';

/**
 * 基础状态类型
 */
export type BaseState = 'idle' | 'connecting' | 'connected' | 'stopped' | 'error';

/**
 * WebSocket 就绪状态映射
 */
const WS_STATE_MAP: Record<number, string> = {
  [WebSocket.CONNECTING]: 'CONNECTING',
  [WebSocket.OPEN]: 'OPEN',
  [WebSocket.CLOSING]: 'CLOSING',
  [WebSocket.CLOSED]: 'CLOSED',
};

/**
 * WebSocket 客户端配置接口
 */
export interface BaseWebSocketClientOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * 事件处理器基接口
 */
export interface BaseEventHandlers<State extends string = string> {
  onError?: (error: XfyunError) => void;
  onStateChange?: (state: State) => void;
  onStop?: () => void;
}

/**
 * WebSocket 客户端基类
 * 
 * 提供通用的 WebSocket 连接管理、状态管理和错误处理功能。
 * 子类需要实现特定的消息解析和业务逻辑。
 */
export abstract class BaseWebSocketClient<
  State extends string = BaseState,
  Options extends BaseWebSocketClientOptions = BaseWebSocketClientOptions,
  Handlers extends BaseEventHandlers<State> = BaseEventHandlers<State>
> {
  // ========== WebSocket 相关 ==========
  protected websocket: WebSocket | null = null;
  protected websocketCloseTimer: number | null = null;
  protected connectingTimer: number | null = null;
  
  // 连接超时兜底（部分浏览器 WebSocket 失败不触发 onerror）
  protected static readonly CONNECTING_TIMEOUT_MS = 10000;
  
  // ========== 状态管理 ==========
  protected state: State = 'idle' as State;
  
  // 状态转换规则 - 由子类提供
  protected abstract readonly STATE_TRANSITIONS: Record<State, State[]>;
  
  // ========== 日志 ==========
  public readonly logger: Logger;
  
  // ========== 配置 ==========
  protected readonly options: Options;
  protected handlers: Handlers;
  
  // ========== 销毁状态 ==========
  protected destroyed: boolean = false;

  /**
   * 创建 WebSocket 客户端实例
   * @param options 配置选项
   * @param handlers 事件处理程序
   */
  constructor(options: Options, handlers: Handlers = {} as Handlers) {
    // 验证必要参数
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      throw new Error('缺少必要参数: appId, apiKey, apiSecret 不能为空');
    }

    this.options = options;
    this.handlers = handlers;
    
    // 初始化日志器
    const prefix = this.getModulePrefix();
    this.logger = new Logger(prefix);
    this.logger.setLevel(options.logLevel || 'info');
    this.logger.info(`${prefix} 实例创建`, options);
  }

  // ========== 抽象方法 - 子类必须实现 ==========

  /**
   * 获取模块前缀（用于日志）
   */
  protected abstract getModulePrefix(): string;

  /**
   * 解析 WebSocket 消息
   * @param data 接收到的数据
   */
  protected abstract parseMessage(data: string | ArrayBuffer): void;

  /**
   * 获取错误码前缀（用于错误码命名空间）
   */
  protected abstract getErrorCodePrefix(): number;

  /**
   * 生成认证 URL
   */
  protected abstract generateAuthUrl(): string;

  // ========== WebSocket 管理 ==========

  /**
   * 确保 WebSocket 已初始化
   * @throws 如果 WebSocket 未初始化则抛出错误
   */
  protected ensureWebSocket(): WebSocket {
    if (!this.websocket) {
      this.logger.error('WebSocket 未初始化');
      throw new Error('WebSocket 未初始化，请先调用 start() 方法');
    }
    return this.websocket;
  }

  /**
   * 安全地发送 WebSocket 消息
   * @param data 要发送的数据
   * @returns 发送是否成功
   */
  protected safeSend(data: string | ArrayBuffer): boolean {
    try {
      const ws = this.ensureWebSocket();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        this.logger.debug('WebSocket 发送数据成功');
        return true;
      } else {
        this.logger.warn(`WebSocket 未就绪，当前状态: ${WS_STATE_MAP[ws.readyState]}`);
        return false;
      }
    } catch (error) {
      this.logger.error('WebSocket 发送数据失败:', error);
      return false;
    }
  }

  /**
   * 安全地关闭 WebSocket 连接
   */
  protected safeCloseWebSocket(): void {
    if (this.websocket) {
      if (this.websocket.readyState === WebSocket.OPEN || 
          this.websocket.readyState === WebSocket.CONNECTING) {
        this.websocket.close(1000, '正常关闭');
      }
      this.websocket = null;
      this.logger.debug('WebSocket 已安全关闭');
    }
  }

  /**
   * 初始化 WebSocket 连接
   */
  protected initWebSocket(): void {
    try {
      this.setState('connecting' as State);
      
      const url = this.generateAuthUrl();
      this.logger.info('正在连接 WebSocket');
      
      this.websocket = new WebSocket(url);
      
      // 设置 WebSocket 事件处理器
      this.setupWebSocketHandlers();
      
      // Connecting 超时兜底
      this.setupConnectingTimeout();
    } catch (error) {
      this.logger.error('初始化 WebSocket 失败:', error);
      this.handleError({
        code: this.getErrorCodePrefix() + 3,
        message: '初始化 WebSocket 失败',
        data: error
      });
    }
  }

  /**
   * 设置 WebSocket 所有事件处理器
   */
  protected setupWebSocketHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onopen = () => this.handleWebSocketOpen();
    this.websocket.onmessage = (event: MessageEvent) => this.handleWebSocketMessage(event);
    this.websocket.onerror = (error: Event) => this.handleWebSocketError(error);
    this.websocket.onclose = (event: CloseEvent) => this.handleWebSocketClose(event);
  }

  /**
   * 处理 WebSocket 连接打开事件
   */
  protected handleWebSocketOpen(): void {
    this.clearConnectingTimer();
    this.logger.info('WebSocket 连接成功');
    this.setState('connected' as State);
    this.onConnected();
  }

  /**
   * 连接成功后的回调 - 子类可重写
   */
  protected onConnected(): void {
    // 默认空实现，子类根据需要重写
  }

  /**
   * 处理 WebSocket 消息事件
   */
  protected handleWebSocketMessage(event: MessageEvent): void {
    try {
      this.logger.debug('收到 WebSocket 消息');
      this.parseMessage(event.data);
    } catch (error) {
      this.logger.error('解析 WebSocket 消息失败:', error);
      this.handleError({
        code: this.getErrorCodePrefix() + 5,
        message: '解析消息失败',
        data: error
      });
    }
  }

  /**
   * 处理 WebSocket 错误事件
   */
  protected handleWebSocketError(error: Event): void {
    this.clearConnectingTimer();
    this.logger.error('WebSocket 连接错误:', error);
    this.handleError({
      code: this.getErrorCodePrefix() + 2,
      message: 'WebSocket 连接错误',
      data: error
    });
  }

  /**
   * 处理 WebSocket 关闭事件
   */
  protected handleWebSocketClose(event: CloseEvent): void {
    this.logger.info('WebSocket 连接关闭:', event.code, event.reason);
    this.websocket = null;
    
    // 子类可以在这里添加关闭后的处理逻辑
    this.onWebSocketClosed(event);
  }

  /**
   * WebSocket 关闭后的回调 - 子类可重写
   */
  protected onWebSocketClosed(_event: CloseEvent): void {
    // 默认空实现
  }

  /**
   * 设置 Connecting 超时检测
   */
  protected setupConnectingTimeout(): void {
    if (typeof window === 'undefined') return;
    
    this.connectingTimer = window.setTimeout(() => {
      if (this.state === 'connecting' && !this.destroyed) {
        this.logger.warn('WebSocket connecting 超时，强制关闭');
        this.safeCloseWebSocket();
        this.handleError({
          code: this.getErrorCodePrefix() + 5,
          message: 'WebSocket 连接超时',
        });
      }
    }, (this.constructor as typeof BaseWebSocketClient).CONNECTING_TIMEOUT_MS);
  }

  // ========== 定时器管理 ==========

  /**
   * 清除 WebSocket 关闭定时器
   */
  protected clearWebSocketCloseTimer(): void {
    if (this.websocketCloseTimer && typeof window !== 'undefined') {
      window.clearTimeout(this.websocketCloseTimer);
      this.websocketCloseTimer = null;
    }
  }

  /**
   * 清除连接超时定时器
   */
  protected clearConnectingTimer(): void {
    if (this.connectingTimer && typeof window !== 'undefined') {
      window.clearTimeout(this.connectingTimer);
      this.connectingTimer = null;
    }
  }

  /**
   * 安排 WebSocket 延迟关闭
   * @param delay 延迟时间（毫秒）
   */
  protected scheduleWebSocketClose(delay: number = 1000): void {
    this.clearWebSocketCloseTimer();
    if (typeof window !== 'undefined') {
      this.websocketCloseTimer = window.setTimeout(() => {
        this.safeCloseWebSocket();
        this.websocketCloseTimer = null;
      }, delay);
    }
  }

  // ========== 状态管理 ==========

  /**
   * 获取当前状态
   */
  public getState(): State {
    return this.state;
  }

  /**
   * 设置状态（带转换验证）
   * @param newState 新状态
   */
  protected setState(newState: State): void {
    // 检查状态转换是否合法
    const validTransitions = this.STATE_TRANSITIONS[this.state] || [];
    if (!validTransitions.includes(newState)) {
      this.logger.warn(
        `⚠️ 非法状态转换: ${this.state} -> ${newState}`,
        `合法转换: [${validTransitions.join(', ')}]`
      );
    }

    const oldState = this.state;
    this.state = newState;

    if (this.handlers.onStateChange) {
      this.handlers.onStateChange(newState);
    }

    this.logger.debug(`状态变更: ${oldState} -> ${newState}`);
  }

  // ========== 错误处理 ==========

  /**
   * 处理错误
   * @param error 错误信息
   */
  protected handleError(error: XfyunError): void {
    // 清除所有定时器
    this.clearWebSocketCloseTimer();
    this.clearConnectingTimer();

    this.setState('error' as State);

    if (this.handlers.onError) {
      this.handlers.onError(error);
    }

    // 通知停止（让调用方知道操作已结束）
    if (this.handlers.onStop) {
      this.handlers.onStop();
    }

    this.logger.error(`${this.getModulePrefix()} 错误:`, error);
  }

  // ========== 生命周期 ==========

  /**
   * 销毁实例，释放所有资源
   */
  public destroy(): void {
    this.destroyed = true;
    this.clearWebSocketCloseTimer();
    this.clearConnectingTimer();
    this.safeCloseWebSocket();
    this.setState('stopped' as State);
    this.logger.info(`${this.getModulePrefix()} 实例已销毁`);
  }

  /**
   * 检查实例是否已销毁
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * 设置事件处理程序
   * @param newHandlers 新的事件处理程序
   */
  public setHandlers(newHandlers: Partial<Handlers>): void {
    if (!newHandlers || typeof newHandlers !== 'object') {
      throw new TypeError('handlers 必须是有效的对象');
    }
    this.handlers = { ...this.handlers, ...newHandlers };
  }
}

/**
 * 构造函数类型（用于 Mixin）
 */
export interface Constructor<T = object> {
  new (...args: any[]): T;
}
