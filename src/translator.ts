/**
 * 科大讯飞翻译模块
 * @description 支持语音翻译（边说边译）和文本翻译
 */
import CryptoJS from 'crypto-js';
import { Logger } from './logger';

/**
 * 翻译类型
 */
export type TranslatorType = 'asr' | 'text';

/**
 * 源语言类型
 */
export type SourceLanguage =
  | 'cn'    // 中文
  | 'en'    // 英文
  | 'ja'    // 日语
  | 'ko'    // 韩语
  | 'fr'    // 法语
  | 'es'    // 西班牙语
  | 'it'    // 意大利语
  | 'de'    // 德语
  | 'pt'    // 葡萄牙语
  | 'vi'    // 越南语
  | 'id'    // 印尼语
  | 'ms'    // 马来西亚语
  | 'ru'    // 俄语
  | 'ar'    // 阿拉伯语
  | 'hi'    // 印地语
  | 'th'    // 泰语
  ;

/**
 * 目标语言类型
 */
export type TargetLanguage =
  | 'cn'    // 中文
  | 'en'    // 英文
  | 'ja'    // 日语
  | 'ko'    // 韩语
  | 'fr'    // 法语
  | 'es'    // 西班牙语
  | 'it'    // 意大利语
  | 'de'    // 德语
  | 'pt'    // 葡萄牙语
  | 'vi'    // 越南语
  | 'id'    // 印尼语
  | 'ms'    // 马来西亚语
  | 'ru'    // 俄语
  | 'ar'    // 阿拉伯语
  | 'hi'    // 印地语
  | 'th'    // 泰语
  ;

/**
 * 翻译器状态
 */
export type TranslatorState = 'idle' | 'connecting' | 'connected' | 'translating' | 'stopped' | 'error';

/**
 * 翻译错误
 */
export interface TranslatorError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * 翻译结果
 */
export interface TranslationResult {
  /** 源语言 */
  sourceLanguage: SourceLanguage;
  /** 目标语言 */
  targetLanguage: TargetLanguage;
  /** 源文本 */
  sourceText: string;
  /** 翻译结果 */
  targetText: string;
  /** 是否为最终结果 */
  isFinal: boolean;
  /** 识别分数 */
  confidence?: number;
}

/**
 * 语音翻译事件处理函数
 */
export interface TranslatorEventHandlers {
  /** 开始翻译 */
  onStart?: () => void;
  /** 翻译结束 */
  onEnd?: () => void;
  /** 停止翻译 */
  onStop?: () => void;
  /** 翻译结果返回 */
  onResult?: (result: TranslationResult) => void;
  /** 错误回调 */
  onError?: (error: TranslatorError) => void;
  /** 状态变化 */
  onStateChange?: (state: TranslatorState) => void;
}

/**
 * 翻译器配置选项
 */
export interface XfyunTranslatorOptions {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 翻译类型：asr=语音翻译，text=文本翻译 */
  type?: TranslatorType;
  /** 源语言 */
  from?: SourceLanguage;
  /** 目标语言 */
  to?: TargetLanguage;
  /** 场景（语音翻译专用） */
  domain?: 'iner' | 'video' | 'command' | 'doc' | 'phonecall' | 'medical';
  /** 是否自动开始，默认 false */
  autoStart?: boolean;
  /** VAD 超时时间（ms） */
  vadEos?: number;
  /** 采样率 */
  sampleRate?: number;
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

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

    try {
      const url = this.generateAuthUrl('translate');
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
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
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate: this.options.sampleRate || 16000,
      });

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

    const mimeTypes = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
    ];

    let mimeType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    if (!mimeType) {
      mimeType = 'audio/webm';
    }

    this.recorder = new MediaRecorder(this.microphoneStream, {
      mimeType,
      audioBitsPerSecond: 16000,
    });

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          if (this.state === 'translating' && reader.result instanceof ArrayBuffer) {
            const base64Audio = this.arrayBufferToBase64(reader.result);
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
        text: Buffer.from(text, 'utf-8').toString('base64'),
      },
    };

    this.websocket.send(JSON.stringify(frame));
    this.setState('translating');
  }

  /**
   * 发送语音翻译开始帧
   */
  private sendStartFrame(): void {
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

    this.websocket.send(JSON.stringify(frame));
  }

  /**
   * 发送音频数据
   */
  private sendAudioData(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN || this.state !== 'translating') {
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

      this.websocket.send(JSON.stringify(frame));
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

    this.setState('stopped');

    if (this.websocket) {
      // 发送结束帧
      if (this.options.type === 'asr') {
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
        this.websocket.send(JSON.stringify(endFrame));
      }

      this.websocketCloseTimer = window.setTimeout(() => {
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
      }, 500);
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

    this.stopRecorder();
    this.releaseMicrophone();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

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
   * 生成认证 URL
   */
  private generateAuthUrl(path: string): string {
    const host = path === 'translate' ? 'itr-api.xfyun.cn' : 'itr-api.xfyun.cn';
    const date = new Date().toUTCString();
    const algorithm = 'hmac-sha256';

    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/${path} HTTP/1.1`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.options.apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);

    const authorizationOrigin = `api_key="${this.options.apiKey}", algorithm="${algorithm}", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin, 'binary').toString('base64');

    return `wss://${host}/v2/${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
  }

  /**
   * ArrayBuffer 转 Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return Buffer.from(binary, 'binary').toString('base64');
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
   */
  private setState(state: TranslatorState): void {
    this.state = state;

    if (this.handlers.onStateChange) {
      this.handlers.onStateChange(state);
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: TranslatorError): void {
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
}

// 静态方法：文本翻译（无需实例化）
XfyunTranslator.translateText = async function (
  text: string,
  options: XfyunTranslatorOptions
): Promise<TranslationResult> {
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

    translator.start(text);
  });
};

// Types are exported inline above (no re-export needed)
