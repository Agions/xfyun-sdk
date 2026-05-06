/**
 * 科大讯飞翻译模块
 * @description 支持语音翻译（边说边译）和文本翻译
 */

import { toBase64, arrayBufferToBase64, generateAuthUrl, detectSupportedMimeType, createAudioContext } from './utils';
import { BaseWebSocketClient } from './base-websocket-client';
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
  cn: 'cn', en: 'en', ja: 'ja', ko: 'ko', fr: 'fr', es: 'es', it: 'it', de: 'de',
  pt: 'pt', vi: 'vi', id: 'id', ms: 'ms', ru: 'ru', ar: 'ar', hi: 'hi', th: 'th',
};

/**
 * 科大讯飞翻译类
 * 
 * 继承 BaseWebSocketClient，复用 WebSocket 连接管理、状态管理、错误处理等通用逻辑。
 * 专注于语音/文本翻译特有的功能：多语言支持、实时翻译结果、翻译模式切换等。
 * 
 * @example
 * ```typescript
 * const translator = new XfyunTranslator({
 *   appId: 'your-app-id',
 *   apiKey: 'your-api-key',
 *   apiSecret: 'your-api-secret',
 *   type: 'asr',
 *   from: 'cn',
 *   to: 'en'
 * }, {
 *   onResult: (result) => console.log('翻译结果:', result),
 *   onError: (err) => console.error('错误:', err)
 * });
 * 
 * await translator.start();
 * translator.record();
 * await translator.stop();
 * ```
 */
export class XfyunTranslator extends BaseWebSocketClient<TranslatorState, XfyunTranslatorOptions, TranslatorEventHandlers> {
  // ========== 文本翻译（静态方法，无需实例化）==========
  static translateText: (
    text: string,
    options: XfyunTranslatorOptions
  ) => Promise<TranslationResult>;

  // ========== 音频相关（语音翻译模式）==========
  private microphoneStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private recorder: MediaRecorder | null = null;
  private audioDataQueue: string[] = [];

  // ========== 状态管理 ==========
  protected readonly STATE_TRANSITIONS: Record<TranslatorState, TranslatorState[]> = {
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
    super({ ...DEFAULT_OPTIONS, ...options } as XfyunTranslatorOptions, handlers);
  }

  // ========== 实现 BaseWebSocketClient 抽象方法 ==========

  protected getModulePrefix(): string {
    return '[XfyunTranslator]';
  }

  protected getErrorCodePrefix(): number {
    return 30000;
  }

  protected generateAuthUrl(): string {
    // 根据类型选择不同的路径
    const path = this.options.type === 'text' ? '/v2/translate' : '/v2/itr';
    return generateAuthUrl(this.options.apiKey, this.options.apiSecret, 'itr-api.xfyun.cn', path);
  }

  protected onConnected(): void {
    // 连接成功后，根据类型执行不同逻辑
    if (this.options.type === 'asr') {
      this.initRecorder();
      this.sendStartFrame();
    }
  }

  protected parseMessage(data: string | ArrayBuffer): void {
    if (typeof data !== 'string') return;
    
    try {
      const message = JSON.parse(data);

      if (message.code !== 0) {
        this.handleError({ code: message.code, message: message.message || '翻译错误' });
        return;
      }

      if (message.data) {
        // 文本翻译模式：result 直接包含 source/target，没有 status 字段
        // 语音翻译模式：data 包含 status 字段，status === 2 表示最终结果
        const isTextTranslation = this.options.type === 'text';
        const status = message.data.status;  // status 在 data 层级，不在 result 层级
        
        const result: TranslationResult = {
          sourceLanguage: (this.options.from || 'cn') as SourceLanguage,
          targetLanguage: (this.options.to || 'en') as TargetLanguage,
          sourceText: message.data.result?.source || '',
          targetText: message.data.result?.target || '',
          isFinal: isTextTranslation || status === 2,  // 文本翻译直接是最终结果
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
      this.logger.error('解析翻译消息失败:', error);
    }
  }

  // ========== 公共方法 ==========

  /**
   * 设置事件处理程序
   */
  public setHandlers(handlers: TranslatorEventHandlers): void {
    const validHandlers = ['onStart', 'onEnd', 'onStop', 'onResult', 'onError', 'onStateChange'];
    for (const key of validHandlers) {
      if (handlers[key as keyof TranslatorEventHandlers] && typeof handlers[key as keyof TranslatorEventHandlers] !== 'function') {
        throw new TypeError(`${key} 必须是函数`);
      }
    }
    super.setHandlers(handlers);
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
      await this.startTextTranslation(text);
    } else {
      // 语音翻译模式
      await this.startSpeechTranslation();
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
    if (this.websocket) {
      if (this.options.type === 'asr') {
        this.sendTranslationEndFrame();
      }
      this.scheduleWebSocketClose(500);
    }

    if (this.handlers.onStop) {
      this.handlers.onStop();
    }

    this.logger.info('翻译已停止');
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.destroyed = true;
    this.clearWebSocketCloseTimer();
    this.clearConnectingTimer();

    this.cleanupRecordingResources();
    this.safeCloseWebSocket();

    this.audioDataQueue = [];
    this.setState('stopped');
    this.logger.info('XfyunTranslator 实例已销毁');
  }

  // ========== 私有方法 ==========

  /**
   * 清理所有录音相关资源
   */
  private cleanupRecordingResources(): void {
    if (this.recorder) {
      this.stopRecorder();
      this.recorder = null;
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
      const url = generateAuthUrl(this.options.apiKey, this.options.apiSecret, 'itr-api.xfyun.cn', '/v2/translate');
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        this.clearConnectingTimer();
        this.logger.info('文本翻译 WebSocket 连接成功');
        this.setState('connected');
        this.sendTextFrame(text);
      };

      this.websocket.onmessage = (event) => {
        this.parseMessage(event.data);
      };

      this.websocket.onerror = (error) => {
        this.clearConnectingTimer();
        this.logger.error('文本翻译 WebSocket 错误:', error);
        this.handleError({ code: 30002, message: 'WebSocket 连接错误', data: error });
      };

      this.websocket.onclose = () => {
        this.setState('stopped');
        this.websocket = null;
      };
    } catch (error) {
      this.clearConnectingTimer();
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
      const url = generateAuthUrl(this.options.apiKey, this.options.apiSecret, 'itr-api.xfyun.cn', '/v2/itr');
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        this.clearConnectingTimer();
        this.logger.info('语音翻译 WebSocket 连接成功');
        this.setState('connected');
        this.initRecorder();
        this.sendStartFrame();
      };

      this.websocket.onmessage = (event) => {
        this.parseMessage(event.data);
      };

      this.websocket.onerror = (error) => {
        this.clearConnectingTimer();
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
   * 释放麦克风
   */
  private releaseMicrophone(): void {
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }
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
      common: { app_id: this.options.appId },
      business: { from, to, data_type: 'text' },
      data: { text: toBase64(text, 'utf-8') },
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
      common: { app_id: this.options.appId },
      business: {
        from, to,
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
        common: { app_id: this.options.appId },
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
        this.audioDataQueue.unshift(audioData);
        break;
      }
    }
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
