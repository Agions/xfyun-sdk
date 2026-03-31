/**
 * 科大讯飞 TTS 语音合成模块
 * @description 基于 WebSocket 的流式语音合成，支持多种音色、语速调节、多种音频格式
 */
import CryptoJS from 'crypto-js';
import { Logger, LogLevel } from './logger';

/**
 * TTS 音频格式
 */
export type TTSAudioFormat = 'mp3' | 'wav' | 'pcm';

/**
 * TTS 音色名称
 */
export type TTSVoiceName =
  | 'xiaoyan'      // 青年女声-小燕
  | 'aisjiuxu'      // 青年女声-许久
  | 'aisxping'      // 青年女声-小萍
  | 'aisjinger'     // 青年女声-京儿
  | 'aisbabyxu'     // 青年女声-小旭
  | 'aisxiaoyuan'   // 青年女声-小媛
  | 'aisxingchen'   // 青年女声-星辰
  | 'aisdengdeng'   // 青年女声-叮当
  | 'aisyaoyao'     // 青年女声-瑶瑶
  | 'aismall'       // 青年女声-小暖
  | 'aisduxiaoyao'  // 青年女声-杜小姚
  | 'aisjiuxu'      // 青年女声-许久
  | 'aisduxiaop'    // 青年女声-杜晓萍
  | 'aispingping'   // 青年女声-平平
  | 'aismeini'      // 青年女声-美妮
  | 'aisxiaofeng'   // 青年男声-小峰
  | 'aisnan'        // 青年男声-楠楠
  | 'aisxiaosong'   // 青年男声-小松
  | 'aisxiaoyong'   // 青年男声-小勇
  | 'aisxiaowang'   // 青年男声-小王
  | 'aisxiaole'     // 青年男声-小乐
  | 'aisxiaoy'      // 青年男声-小宇
  | 'aisxiaolin'    // 青年男声-小林
  | 'aisxiaoming'   // 青年男声-小明
  | 'aisxiaogang'   // 青年男声-小刚
  | 'aisdarong'     // 中年男声-大荣
  | 'aisnvpeach'    // 中年女声-青娇
  | 'aisxiaoyan'    // 老年女声-小燕
  | 'aisxiaowuma'   // 老年男声-无马
  | 'aisxiaorong'   // 老年男声-小荣
  | 'aischanghong'  // 老年女声-长红
  | 'aisxiaoyaxi'   // 英文女声-雅西
  | 'aisxiaolin'    // 英文男声-小林
  | 'aisduck'       // 英文男声-德克
  | 'aisjiuyuan'    // 四川话女声
  | 'aisxiaoxian'   // 陕西话女声-小贤
  | 'aisxiaomao'    // 东北话女声-小矛
  | 'aisxiaoli'     // 东北话女声-小黎
  | 'aisxiaokan'    // 河南话女声-小侃
  | 'aisduxiaoyao'  // 湖南话女声-杜小姚
  | 'aisxiaoning'   // 普通话男声-小宁
  | 'aismary'       // 英中双语女声
  | 'aisxiaowawa'   // 童声
  | 'aisxiaoxue'    // 童声-小学
  | 'aisxiaoyan'    // 粤语女声-小燕
  ;

/**
 * TTS 合成器状态
 */
export type SynthesizerState = 'idle' | 'connecting' | 'connected' | 'synthesizing' | 'stopped' | 'error';

/**
 * TTS 错误
 */
export interface TTSError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * TTS 事件处理函数
 */
export interface TTSEventHandlers {
  /** 开始合成 */
  onStart?: () => void;
  /** 合成结束 */
  onEnd?: () => void;
  /** 停止合成 */
  onStop?: () => void;
  /** 音频数据返回（流式） */
  onAudioData?: (audioData: ArrayBuffer) => void;
  /** 文本进度（当前已合成的字符数/总字符数） */
  onProgress?: (current: number, total: number) => void;
  /** 错误回调 */
  onError?: (error: TTSError) => void;
  /** 状态变化 */
  onStateChange?: (state: SynthesizerState) => void;
}

/**
 * TTS 配置选项
 */
export interface XfyunTTSOptions {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 发音人，默认为青年女声 */
  voice_name?: TTSVoiceName | string;
  /** 语速，范围 0-100，默认 50 */
  speed?: number;
  /** 音调，范围 0-100，默认 50 */
  pitch?: number;
  /** 音量，范围 0-100，默认 50 */
  volume?: number;
  /** 口音/方言，默认为普通话 */
  accent?: string;
  /** 音频格式，默认 mp3 */
  audioFormat?: TTSAudioFormat;
  /** 采样率，默认 16000 */
  sampleRate?: number;
  /** 是否自动开始合成，默认 false */
  autoStart?: boolean;
  /** 是否启用缓存，默认 true */
  enableCache?: boolean;
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// 默认配置
const DEFAULT_OPTIONS: Partial<XfyunTTSOptions> = {
  voice_name: 'xiaoyan',
  speed: 50,
  pitch: 50,
  volume: 50,
  accent: 'accent=mandarin',
  audioFormat: 'mp3',
  sampleRate: 16000,
  autoStart: false,
  enableCache: true,
  logLevel: 'info',
};

// 音频格式映射
const AUDIO_FORMAT_MAP: Record<TTSAudioFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  pcm: 'audio/pcm',
};

// 采样率映射
const SAMPLE_RATE_MAP: Record<number, string> = {
  8000: '8000',
  16000: '16000',
  24000: '24000',
  48000: '48000',
};

/**
 * 科大讯飞 TTS 语音合成类
 */
export class XfyunTTS {
  private options: XfyunTTSOptions;
  private handlers: TTSEventHandlers;
  private websocket: WebSocket | null = null;
  private websocketCloseTimer: number | null = null;
  private audioChunks: ArrayBuffer[] = [];
  private state: SynthesizerState = 'idle';
  private destroyed: boolean = false;
  private currentText: string = '';
  private textIndex: number = 0;

  /** 日志器 */
  public logger: Logger;

  /**
   * 创建 TTS 合成器实例
   * @param options 配置选项
   * @param handlers 事件处理程序
   */
  constructor(options: XfyunTTSOptions, handlers: TTSEventHandlers = {}) {
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      throw new Error('缺少必要参数: appId, apiKey, apiSecret 不能为空');
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.handlers = handlers;

    this.logger = new Logger('[XfyunTTS]');
    this.logger.setLevel(this.options.logLevel || 'info');
    this.logger.info('XfyunTTS 实例创建', this.options);

    if (this.options.autoStart) {
      this.start(this.currentText);
    }
  }

  /**
   * 开始语音合成
   * @param text 要合成的文本
   */
  public start(text: string): void {
    if (this.destroyed) {
      this.logger.error('实例已销毁，无法启动');
      return;
    }

    if (!text || text.trim().length === 0) {
      this.handleError({ code: 20001, message: '合成文本不能为空' });
      return;
    }

    if (this.state === 'synthesizing' || this.state === 'connecting') {
      this.logger.warn('合成正在进行中，忽略此次请求');
      return;
    }

    this.currentText = text;
    this.textIndex = 0;
    this.audioChunks = [];

    this.initWebSocket();
  }

  /**
   * 停止合成
   */
  public stop(): void {
    if (this.state === 'idle' || this.state === 'stopped') {
      return;
    }

    this.clearWebSocketCloseTimer();
    this.setState('stopped');

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.handlers.onStop) {
      this.handlers.onStop();
    }

    this.logger.info('TTS 合成已停止');
  }

  /**
   * 销毁实例，释放所有资源
   */
  public destroy(): void {
    this.destroyed = true;
    this.clearWebSocketCloseTimer();

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.audioChunks = [];
    this.currentText = '';
    this.textIndex = 0;
    this.setState('stopped');

    this.logger.info('XfyunTTS 实例已销毁');
  }

  /**
   * 获取当前状态
   */
  public getState(): SynthesizerState {
    return this.state;
  }

  /**
   * 获取累积的音频数据
   */
  public getAudioData(): ArrayBuffer | null {
    if (this.audioChunks.length === 0) {
      return null;
    }

    const totalLength = this.audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const result = new ArrayBuffer(totalLength);
    const resultArray = new Uint8Array(result);

    let offset = 0;
    for (const chunk of this.audioChunks) {
      resultArray.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }

    return result;
  }

  /**
   * 获取 MIME 类型
   */
  public getMimeType(): string {
    const format = this.options.audioFormat || 'mp3';
    return AUDIO_FORMAT_MAP[format] || 'audio/mpeg';
  }

  /**
   * 初始化 WebSocket 连接
   */
  private initWebSocket(): void {
    try {
      this.setState('connecting');

      const url = this.generateAuthUrl();
      this.logger.info('正在连接 TTS WebSocket');

      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        this.logger.info('TTS WebSocket 连接成功');
        this.setState('connected');
        this.sendStartFrame();
      };

      this.websocket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.websocket.onerror = (error) => {
        this.logger.error('TTS WebSocket 错误:', error);
        this.handleError({ code: 20002, message: 'WebSocket 连接错误', data: error });
      };

      this.websocket.onclose = (event) => {
        this.logger.info('TTS WebSocket 连接关闭:', event.code, event.reason);

        if (this.state === 'synthesizing') {
          this.setState('stopped');
          if (this.handlers.onEnd) {
            this.handlers.onEnd();
          }
        }

        this.websocket = null;
      };
    } catch (error) {
      this.logger.error('初始化 TTS WebSocket 失败:', error);
      this.handleError({ code: 20003, message: '初始化 WebSocket 失败', data: error });
    }
  }

  /**
   * 处理 WebSocket 消息
   */
  private handleMessage(data: string | ArrayBuffer): void {
    if (typeof data === 'string') {
      try {
        const message = JSON.parse(data);

        if (message.code !== 0) {
          this.handleError({ code: message.code, message: message.message || '合成错误' });
          return;
        }

        // 进度更新
        if (message.data && message.data.current_index !== undefined) {
          const current = message.data.current_index;
          const total = this.currentText.length;

          if (this.handlers.onProgress) {
            this.handlers.onProgress(current, total);
          }
        }
      } catch (error) {
        this.logger.error('解析 TTS 消息失败:', error);
      }
    } else {
      // 音频数据
      if (this.state === 'synthesizing' || this.state === 'connected') {
        this.audioChunks.push(data);

        if (this.handlers.onAudioData) {
          this.handlers.onAudioData(data);
        }
      }
    }
  }

  /**
   * 发送开始帧
   */
  private sendStartFrame(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket 未连接，无法发送开始帧');
      return;
    }

    try {
      const format = this.options.audioFormat || 'mp3';
      const sampleRate = this.options.sampleRate || 16000;

      const frame = {
        common: {
          app_id: this.options.appId,
        },
        business: {
          aue: format === 'pcm' ? 'raw' : 'lame',
          auf: SAMPLE_RATE_MAP[sampleRate] || '16000',
          voice_name: this.options.voice_name || 'xiaoyan',
          speed: this.options.speed ?? 50,
          pitch: this.options.pitch ?? 50,
          volume: this.options.volume ?? 50,
          tte: 'UTF8',
          // 增加安静时长
          // sil_time: 500,
          // vcn: this.options.voice_name || 'xiaoyan',
          reg: 0,
          // 用户词
          // user_words: '',
          // 背景音 0:无背景音 1:有小溪 2:有滴水 3:轻柔音乐
          bg: 0,
        },
        data: {
          status: 0,
          text: Buffer.from(this.currentText, 'utf-8').toString('base64'),
        },
      };

      this.logger.debug('发送 TTS 开始帧');
      this.websocket.send(JSON.stringify(frame));
      this.setState('synthesizing');
    } catch (error) {
      this.logger.error('发送 TTS 开始帧失败:', error);
      this.handleError({ code: 20004, message: '发送开始帧失败', data: error });
    }
  }

  /**
   * 生成认证 URL
   */
  private generateAuthUrl(): string {
    const host = 'tts-api.xfyun.cn';
    const date = new Date().toUTCString();
    const algorithm = 'hmac-sha256';

    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.options.apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);

    const authorizationOrigin = `api_key="${this.options.apiKey}", algorithm="${algorithm}", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin, 'binary').toString('base64');

    return `wss://${host}/v2/tts?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
  }

  /**
   * 设置状态
   */
  private setState(state: SynthesizerState): void {
    this.state = state;

    if (this.handlers.onStateChange) {
      this.handlers.onStateChange(state);
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: TTSError): void {
    this.setState('error');

    if (this.handlers.onError) {
      this.handlers.onError(error);
    }

    this.logger.error('讯飞 TTS 错误:', error);
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

// Types are exported inline above (no re-export needed)
