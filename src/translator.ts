/**
 * 科大讯飞翻译模块
 * @description 支持语音翻译（边说边译）和文本翻译
 */
import { Logger } from './logger';
import { toBase64, arrayBufferToBase64, generateAuthUrl, detectSupportedMimeType, createAudioContext } from './utils';
import type {
  TranslatorType,
  SourceLanguage,
  TargetLanguage,
  TranslatorState,
  TranslatorError,
  TranslationResult,
  TranslatorEventHandlers,
  XfyunTranslatorOptions,
} from './types';

// Re-export types for backwards compatibility
export type {
  TranslatorType,
  SourceLanguage,
  TargetLanguage,
  TranslatorState,
  TranslatorError,
  TranslationResult,
  TranslatorEventHandlers,
  XfyunTranslatorOptions,
};

// 默认配置
const DEFAULT_OPTIONS: Partial<XfyunTranslatorOptions> = {
  type: 'asr',
  from: 'cn',
  to: 'en',
  domain: 'iner',
  autoStart: false,
  vadEos: 5000,
  sampleRate: 16000,
  logLevel: 'info',
};

// 语言代码映射
const LANGUAGE_CODE_MAP: Record<SourceLanguage | TargetLanguage, string> = {
  cn: 'cn',
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  fr: 'fr',
  es: 'es',
  it: 'it',
  de: 'de',
  pt: 'pt',
  vi: 'vi',
  id: 'id',
  ms: 'ms',
  ru: 'ru',
  ar: 'ar',
  hi: 'hi',
  th: 'th',
};

/**
 * 科大讯飞翻译器类
 * @description 支持语音翻译（边说边译）和文本翻译两种模式
 */
export class XfyunTranslator {
  /**
   * 文本翻译（静态方法，无需实例化）
   */
  static translateText: (
    text: string,
    options: XfyunTranslatorOptions
  ) => Promise<TranslationResult>;

  private options: XfyunTranslatorOptions;
  private handlers: TranslatorEventHandlers;
  private websocket: WebSocket | null = null;
  private websocketCloseTimer: number | null = null;
  private connectingTimer: number | null = null;
  private state: TranslatorState = 'idle';
  private destroyed: boolean = false;
  private microphoneStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private recorder: MediaRecorder | null = null;
  private audioDataQueue: string[] = [];
  private reconnectCount: number = 0;

  /** 日志器 */
  public logger: Logger;

  /**
   * 状态转换规则映射
   * 定义了每个状态可以合法转换到的下一个状态
   */
  private static readonly STATE_TRANSITIONS: Record<TranslatorState, TranslatorState[]> = {
    'idle': ['connecting'],
    'connecting': ['connected', 'stopped', 'error'],
    'connected': ['translating', 'stopped', 'error'],
    'translating': ['stopped', 'error'],
    'stopped': ['idle', 'connecting'],
    'error': ['idle', 'connecting']
  };

  /**
   * 创建翻译器实例
   * @param options 配置选项
   * @param handlers 事件处理程序
   */
  constructor(options: XfyunTranslatorOptions, handlers: TranslatorEventHandlers = {}) {
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      throw new Error('缺少必要参数: appId, apiKey, apiSecret 不能为空');
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.handlers = handlers;

    this.logger = new Logger('[XfyunTranslator]');
    this.logger.setLevel(this.options.logLevel || 'info');
    this.logger.info('XfyunTranslator 实例创建', this.options);
  }

  /**
   * 设置事件处理程序
   * @param handlers 新的事件处理程序
   */
  public setHandlers(handlers: TranslatorEventHandlers): void {
    if (!handlers || typeof handlers !== 'object') {
      throw new TypeError('handlers 必须是有效的对象');
    }

    // 验证各个回调函数的类型
    if (handlers.onStart && typeof handlers.onStart !== 'function') {
      throw new TypeError('handlers.onStart 必须是函数');
    }
    if (handlers.onEnd && typeof handlers.onEnd !== 'function') {
      throw new TypeError('handlers.onEnd 必须是函数');
    }
    if (handlers.onStop && typeof handlers.onStop !== 'function') {
      throw new TypeError('handlers.onStop 必须是函数');
    }
    if (handlers.onResult && typeof handlers.onResult !== 'function') {
      throw new TypeError('handlers.onResult 必须是函数');
    }
    if (handlers.onError && typeof handlers.onError !== 'function') {
      throw new TypeError('handlers.onError 必须是函数');
    }

    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * 开始翻译
   * @param text 文本翻译的文本（语音翻译模式可省略）
   */
  public async start(text?: string): Promise<void> {
    if (this.destroyed) {
      this.logger.error('实例已销毁，无法启动');
      return;
    }

    if (this.state === 'translating' || this.state === 'connecting') {
      this.logger.warn('翻译正在进行中，忽略此次请求');
      return;
    }

    const type = this.options.type || 'asr';

    if (type === 'text') {
      // 文本翻译模式
      if (!text || text.trim().length === 0) {
        this.handleError({ code: 30001, message: '翻译文本不能为空' });
        return;
      }
      this.startTextTranslation(text);
    } else {
      // 语音翻译模式
      await this.startSpeechTranslation();
    }
  }

  /**
   * 文本翻译
   */
  private async startTextTranslation(text: string): Promise<void> {
    this.setState('connecting');

    // 设置连接超时定时器
    this.connectingTimer = window.setTimeout(() => {
      if (this.state === 'connecting') {
        this.handleError({ code: 30004, message: '连接超时' });
      }
    }, 10000);

    try {
      const url = this.generateAuthUrl('translate');
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        // 清除连接超时定时器
        if (this.connectingTimer) {
          window.clearTimeout(this.connectingTimer);
          this.connectingTimer = null;
        }
        this.logger.info('文本翻译 WebSocket 连接成功');
        this.setState('connected');
        this.sendTextFrame(text);
      };

      this.websocket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.websocket.onerror = (error) => {
        this.logger.error('文本翻译 WebSocket 错误:', error);
        this.handleError({ code: 30002, message: 'WebSocket 连接错误', data: error });
      };

      this.websocket.onclose = () => {
        this.setState('stopped');
        this.websocket = null;
      };
    } catch (error) {
      // 清除连接超时定时器
      if (this.connectingTimer) {
        window.clearTimeout(this.connectingTimer);
        this.connectingTimer = null;
      }
      this.logger.error('文本翻译失败:', error);
      this.handleError({ code: 30003, message: '文本翻译失败', data: error });
    }
  }

  /**
   * 语音翻译
   */
  private async startSpeechTranslation(): Promise<void> {
    this.setState('connecting');

    try {
      // 获取麦克风权限
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.options.sampleRate || 16000,
        },
        video: false,
      });

      // 创建音频上下文
      this.audioContext = createAudioContext(this.options.sampleRate || 16000);

      // 初始化 WebSocket
      const url = this.generateAuthUrl('itr');
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        this.logger.info('语音翻译 WebSocket 连接成功');
        this.setState('connected');
        this.initRecorder();
        this.sendStartFrame();
      };

      this.websocket.onmessage = (event) => {
        this.handleSpeechMessage(event.data);
      };

      this.websocket.onerror = (error) => {
        this.logger.error('语音翻译 WebSocket 错误:', error);
        this.handleError({ code: 30004, message: 'WebSocket 连接错误', data: error });
      };

      this.websocket.onclose = () => {
        this.stopRecorder();
        this.releaseMicrophone();
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
        this.setState('stopped');
        this.websocket = null;
      };
    } catch (error) {
      this.releaseMicrophone();
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      this.logger.error('语音翻译初始化失败:', error);
      this.handleError({ code: 30005, message: '初始化失败', data: error });
    }
  }

  /**
   * 初始化录音器
   */
  private initRecorder(): void {
    if (!this.microphoneStream) return;

    const mimeType = detectSupportedMimeType();

    this.recorder = new MediaRecorder(this.microphoneStream, {
      mimeType,
      audioBitsPerSecond: 16000,
    });

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          if (this.state === 'translating' && reader.result instanceof ArrayBuffer) {
            const base64Audio = arrayBufferToBase64(reader.result);
            this.audioDataQueue.push(base64Audio);
            this.sendAudioData();
          }
        };
        reader.readAsArrayBuffer(event.data);
      }
    };

    this.recorder.start(500);
    this.setState('translating');
  }

  /**
   * 停止录音
   */
  private stopRecorder(): void {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    this.recorder = null;
  }

  /**
   * 发送文本翻译帧
   */
  private sendTextFrame(text: string): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const from = LANGUAGE_CODE_MAP[this.options.from || 'cn'] || 'cn';
    const to = LANGUAGE_CODE_MAP[this.options.to || 'en'] || 'en';

    const frame = {
      common: {
        app_id: this.options.appId,
      },
      business: {
        from,
        to,
        data_type: 'text',
      },
      data: {
        text: toBase64(text, 'utf-8'),
      },
    };

    if (!this.safeSend(JSON.stringify(frame))) {
      this.logger.warn('发送文本翻译帧失败');
      return;
    }
    this.setState('translating');
  }

  /**
   * 发送语音翻译开始帧
   */
  private sendStartFrame(): void {
    const from = LANGUAGE_CODE_MAP[this.options.from || 'cn'] || 'cn';
    const to = LANGUAGE_CODE_MAP[this.options.to || 'en'] || 'en';

    const frame = {
      common: {
        app_id: this.options.appId,
      },
      business: {
        from,
        to,
        domain: this.options.domain || 'iner',
        data_type: 'audio',
        vad_eos: this.options.vadEos || 5000,
        rlang: 'zh-cn',
      },
      data: {
        status: 0,
        format: 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: '',
      },
    };

    if (!this.safeSend(JSON.stringify(frame))) {
      this.logger.warn('发送语音翻译开始帧失败');
    }
  }

  /**
   * 发送音频数据
   */
  private sendAudioData(): void {
    if (this.state !== 'translating') {
      return;
    }

    while (this.audioDataQueue.length > 0) {
      const audioData = this.audioDataQueue.shift();
      if (!audioData) continue;

      const frame = {
        common: {
          app_id: this.options.appId,
        },
        business: {
          from: LANGUAGE_CODE_MAP[this.options.from || 'cn'] || 'cn',
          to: LANGUAGE_CODE_MAP[this.options.to || 'en'] || 'en',
          domain: this.options.domain || 'iner',
          data_type: 'audio',
        },
        data: {
          status: 1,
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: audioData,
        },
      };

      if (!this.safeSend(JSON.stringify(frame))) {
        // 发送失败，将数据放回队列
        this.audioDataQueue.unshift(audioData);
        break;
      }
    }
  }

  /**
   * 处理语音翻译消息
   */
  private handleSpeechMessage(data: string | ArrayBuffer): void {
    if (typeof data !== 'string') return;

    try {
      const message = JSON.parse(data);

      if (message.code !== 0) {
        this.handleError({ code: message.code, message: message.message || '翻译错误' });
        return;
      }

      if (message.data) {
        const result: TranslationResult = {
          sourceLanguage: (this.options.from || 'cn') as SourceLanguage,
          targetLanguage: (this.options.to || 'en') as TargetLanguage,
          sourceText: message.data.result?.source || '',
          targetText: message.data.result?.target || '',
          isFinal: message.data.status === 2,
          confidence: message.data.result?.confidence,
        };

        if (this.handlers.onResult) {
          this.handlers.onResult(result);
        }

        if (result.isFinal) {
          this.setState('stopped');
          if (this.handlers.onEnd) {
            this.handlers.onEnd();
          }
        }
      }
    } catch (error) {
      this.logger.error('解析语音翻译消息失败:', error);
    }
  }

  /**
   * 处理文本翻译消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      if (message.code !== 0) {
        this.handleError({ code: message.code, message: message.message || '翻译错误' });
        return;
      }

      if (message.data) {
        const result: TranslationResult = {
          sourceLanguage: (this.options.from || 'cn') as SourceLanguage,
          targetLanguage: (this.options.to || 'en') as TargetLanguage,
          sourceText: message.data.result?.source || '',
          targetText: message.data.result?.target || '',
          isFinal: true,
        };

        if (this.handlers.onResult) {
          this.handlers.onResult(result);
        }

        this.setState('stopped');
        if (this.handlers.onEnd) {
          this.handlers.onEnd();
        }
      }
    } catch (error) {
      this.logger.error('解析翻译消息失败:', error);
    }
  }

  /**
   * 停止翻译
   */
  public stop(): void {
    if (this.state === 'idle' || this.state === 'stopped') {
      return;
    }

    this.clearWebSocketCloseTimer();

    // 清理所有录音资源
    this.cleanupRecordingResources();

    this.setState('stopped');

    // 处理 WebSocket 关闭
    this.handleWebSocketOnStop();

    if (this.handlers.onStop) {
      this.handlers.onStop();
    }

    this.logger.info('翻译已停止');
  }

  /**
   * 清理所有录音相关资源
   */
  private cleanupRecordingResources(): void {
    if (this.recorder) {
      this.stopRecorder();
    }

    if (this.microphoneStream) {
      this.releaseMicrophone();
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * 停止时处理 WebSocket 关闭逻辑
   */
  private handleWebSocketOnStop(): void {
    if (!this.websocket) return;

    // 发送结束帧
    if (this.options.type === 'asr') {
      this.sendTranslationEndFrame();
    }

    // 延迟关闭 WebSocket
    this.scheduleWebSocketClose(500);
  }

  /**
   * 发送翻译结束帧
   */
  private sendTranslationEndFrame(): void {
    const endFrame = {
      common: { app_id: this.options.appId },
      business: {
        from: LANGUAGE_CODE_MAP[this.options.from || 'cn'] || 'cn',
        to: LANGUAGE_CODE_MAP[this.options.to || 'en'] || 'en',
        data_type: 'audio',
      },
      data: {
        status: 2,
        format: 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: '',
      },
    };

    if (!this.safeSend(JSON.stringify(endFrame))) {
      this.logger.warn('发送翻译结束帧失败');
    }
  }

  /**
   * 安排 WebSocket 延迟关闭
   * @param delay 延迟时间（毫秒）
   */
  private scheduleWebSocketClose(delay: number): void {
    if (this.websocketCloseTimer) {
      window.clearTimeout(this.websocketCloseTimer);
    }

    this.websocketCloseTimer = window.setTimeout(() => {
      this.safeCloseWebSocket();
      this.websocketCloseTimer = null;
    }, delay);
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.destroyed = true;
    this.clearWebSocketCloseTimer();

    // 清除连接超时定时器
    if (this.connectingTimer) {
      window.clearTimeout(this.connectingTimer);
      this.connectingTimer = null;
    }

    this.stopRecorder();
    this.releaseMicrophone();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.safeCloseWebSocket();

    this.audioDataQueue = [];
    this.setState('stopped');

    this.logger.info('XfyunTranslator 实例已销毁');
  }

  /**
   * 获取当前状态
   */
  public getState(): TranslatorState {
    return this.state;
  }

  /**
   * 确保 WebSocket 已初始化
   * @throws 如果 WebSocket 未初始化则抛出错误
   */
  private ensureWebSocket(): WebSocket {
    if (!this.websocket) {
      this.logger.error('WebSocket 未初始化');
      throw new Error('WebSocket 未初始化');
    }
    return this.websocket;
  }

  /**
   * 安全地发送 WebSocket 消息
   * @param data 要发送的数据
   * @returns 发送是否成功
   */
  private safeSend(data: string | ArrayBuffer): boolean {
    try {
      const ws = this.ensureWebSocket();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        this.logger.debug('WebSocket 发送数据成功');
        return true;
      } else {
        const stateMap: Record<number, string> = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED'
        };
        this.logger.warn(`WebSocket 未就绪，当前状态: ${stateMap[ws.readyState]}`);
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
  private safeCloseWebSocket(): void {
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
   * 生成认证 URL - 复用 utils 的统一实现
   */
  private generateAuthUrl(path: string): string {
    // 翻译和语音翻译使用相同的 host 和 v2 路径前缀
    return generateAuthUrl(this.options.apiKey, this.options.apiSecret, 'itr-api.xfyun.cn', `/v2/${path}`);
  }

  /**
   * 释放麦克风
   */
  private releaseMicrophone(): void {
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }
  }

  /**
   * 设置状态
   * @param state 新状态
   */
  private setState(state: TranslatorState): void {
    // 检查状态转换是否合法
    const validTransitions = XfyunTranslator.STATE_TRANSITIONS[this.state] || [];
    if (!validTransitions.includes(state)) {
      this.logger.warn(
        `⚠️ 非法状态转换: ${this.state} -> ${state}`,
        `合法转换: [${validTransitions.join(', ')}]`
      );
    }

    this.state = state;

    if (this.handlers.onStateChange) {
      this.handlers.onStateChange(state);
    }

    this.logger.debug(`状态变更: ${this.state}`);
  }

  /**
   * 处理错误
   */
  private handleError(error: TranslatorError): void {
    // 清除所有定时器
    this.clearWebSocketCloseTimer();
    if (this.connectingTimer) {
      window.clearTimeout(this.connectingTimer);
      this.connectingTimer = null;
    }

    this.setState('error');

    if (this.handlers.onError) {
      this.handlers.onError(error);
    }

    this.logger.error('讯飞翻译错误:', error);
  }

  /**
   * 清除 WebSocket 关闭定时器
   */
  private clearWebSocketCloseTimer(): void {
    if (this.websocketCloseTimer) {
      window.clearTimeout(this.websocketCloseTimer);
      this.websocketCloseTimer = null;
    }
  }

  /**
   * 检查实例是否已销毁
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }
}

// 静态方法：文本翻译（无需实例化）
XfyunTranslator.translateText = async function (
  text: string,
  options: XfyunTranslatorOptions
): Promise<TranslationResult> {
  // 参数校验
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return Promise.reject(new Error('翻译文本不能为空'));
  }

  return new Promise((resolve, reject) => {
    const translator = new XfyunTranslator(
      { ...options, type: 'text' },
      {
        onResult: (result) => {
          translator.destroy();
          resolve(result);
        },
        onError: (error) => {
          translator.destroy();
          reject(new Error(error.message));
        },
      }
    );

    translator.start(text.trim());
  });
};

// Types are exported inline above (no re-export needed)