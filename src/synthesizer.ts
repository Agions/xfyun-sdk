/**
 * 科大讯飞 TTS 语音合成模块
 * @description 基于 WebSocket 的流式语音合成，支持多种音色、语速调节、多种音频格式
 */
import { Logger } from './logger';
import { toBase64, generateAuthUrl } from './utils';
import type {
  TTSAudioFormat,
  TTSVoiceName,
  SynthesizerState,
  TTSError,
  TTSEventHandlers,
  XfyunTTSOptions,
} from './types';

// Re-export types for backwards compatibility
export type {
  TTSAudioFormat,
  TTSVoiceName,
  SynthesizerState,
  TTSError,
  TTSEventHandlers,
  XfyunTTSOptions,
};

// Default options
const DEFAULT_OPTIONS: Partial<XfyunTTSOptions> = {
  voice_name: 'xiaoyan',
  speed: 50,
  pitch: 50,
  volume: 50,
  accent: 'accent=mandarin',
  audioFormat: 'mp3',
  sampleRate: 16000,
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
  
  // WebSocket connecting 超时兜底
  private connectingTimer: number | null = null;
  private static readonly CONNECTING_TIMEOUT_MS = 10000;

  /** Logger instance */
  public logger: Logger;

  /**
   * 状态转换规则映射
   * 定义了每个状态可以合法转换到的下一个状态
   */
  private static readonly STATE_TRANSITIONS: Record<SynthesizerState, SynthesizerState[]> = {
    'idle': ['connecting'],
    'connecting': ['connected', 'stopped', 'error'],
    'connected': ['synthesizing', 'stopped', 'error'],
    'synthesizing': ['stopped', 'error'],
    'stopped': ['idle', 'connecting'],
    'error': ['idle', 'connecting']
  };

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

    this.safeCloseWebSocket();

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
    this.clearConnectingTimer();

    this.safeCloseWebSocket();

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
  private safeSend(data: string): boolean {
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
   * Export audio blob
   * @returns Audio Blob object, or null if no audio data
   */
  public exportAudio(): Blob | null {
    const mimeType = this.getMimeType();
    const audioData = this.getAudioData();
    if (!audioData) {
      return null;
    }
    return new Blob([audioData], { type: mimeType });
  }

  /**
   * Download audio file
   * @param filename - Name of the file to download
   */
  public downloadAudio(filename: string = 'synthesis'): void {
    // 参数验证
    if (!filename || typeof filename !== 'string') {
      throw new TypeError('filename 必须是字符串');
    }
    if (filename.trim().length === 0) {
      throw new Error('filename 不能为空');
    }
    if (filename.includes('/') || filename.includes('\\') || filename.includes('\x00')) {
      throw new Error('filename 包含非法字符');
    }

    // Check browser environment
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
      this.logger.warn('downloadAudio is only available in browser environment');
      return;
    }

    const blob = this.exportAudio();
    if (!blob) {
      this.logger.warn('No audio data to download');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + this.getFileExtension();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get file extension based on audio format
   */
  private getFileExtension(): string {
    const format = this.options.audioFormat || 'mp3';
    return '.' + format;
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

      // 设置WebSocket事件处理器和超时检测
      this.setupTTSWebSocketHandlers();
      this.setupConnectingTimeoutForTTS();
    } catch (error) {
      this.logger.error('初始化 TTS WebSocket 失败:', error);
      this.handleError({ code: 20003, message: '初始化 WebSocket 失败', data: error });
    }
  }

  /**
   * 设置 TTS WebSocket 所有事件处理器
   */
  private setupTTSWebSocketHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onopen = this.handleTTSWebSocketOpen.bind(this);
    this.websocket.onmessage = this.handleTTSWebSocketMessage.bind(this);
    this.websocket.onerror = this.handleTTSWebSocketError.bind(this);
    this.websocket.onclose = this.handleTTSWebSocketClose.bind(this);
  }

  /**
   * 处理 TTS WebSocket 连接打开事件
   */
  private handleTTSWebSocketOpen(): void {
    this.clearConnectingTimer();
    this.logger.info('TTS WebSocket 连接成功');
    this.setState('connected');
    this.sendStartFrame();
  }

  /**
   * 处理 TTS WebSocket 消息事件
   */
  private handleTTSWebSocketMessage(event: MessageEvent): void {
    this.handleMessage(event.data);
  }

  /**
   * 处理 TTS WebSocket 错误事件
   */
  private handleTTSWebSocketError(error: Event): void {
    this.clearConnectingTimer();
    this.logger.error('TTS WebSocket 错误:', error);
    this.handleError({ code: 20002, message: 'WebSocket 连接错误', data: error });
  }

  /**
   * 处理 TTS WebSocket 关闭事件
   */
  private handleTTSWebSocketClose(event: CloseEvent): void {
    this.clearConnectingTimer();
    this.logger.info('TTS WebSocket 连接关闭:', event.code, event.reason);

    if (this.state === 'synthesizing') {
      this.setState('stopped');
      if (this.handlers.onEnd) {
        this.handlers.onEnd();
      }
    }

    this.websocket = null;
  }

  /**
   * 设置 TTS Connecting 超时检测
   */
  private setupConnectingTimeoutForTTS(): void {
    this.connectingTimer = window.setTimeout(() => {
      if (this.state === 'connecting' && !this.destroyed) {
        this.logger.warn('TTS WebSocket connecting 超时，强制关闭');
        this.safeCloseWebSocket();
        this.handleError({
          code: 20005,
          message: 'WebSocket 连接超时',
        });
      }
    }, XfyunTTS.CONNECTING_TIMEOUT_MS);
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
    if (this.destroyed) {
      this.logger.warn('实例已销毁，无法发送开始帧');
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
          text: toBase64(this.currentText, 'utf-8'),
        },
      };

      this.logger.debug('发送 TTS 开始帧');
      if (!this.safeSend(JSON.stringify(frame))) {
        throw new Error('WebSocket 发送失败');
      }
      this.setState('synthesizing');
    } catch (error) {
      this.logger.error('发送 TTS 开始帧失败:', error);
      this.handleError({ code: 20004, message: '发送开始帧失败', data: error });
    }
  }

  /**
   * 生成认证 URL - 复用 utils 的统一实现
   */
  private generateAuthUrl(): string {
    return generateAuthUrl(this.options.apiKey, this.options.apiSecret, 'tts-api.xfyun.cn', '/v2/tts');
  }

  /**
   * 设置状态
   * @param state 新状态
   */
  private setState(state: SynthesizerState): void {
    // 检查状态转换是否合法
    const validTransitions = XfyunTTS.STATE_TRANSITIONS[this.state] || [];
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
  
  /**
   * 清除连接超时定时器
   */
  private clearConnectingTimer(): void {
    if (this.connectingTimer) {
      window.clearTimeout(this.connectingTimer);
      this.connectingTimer = null;
    }
  }
}

// Types are exported inline above (no re-export needed)
