/**
 * 科大讯飞 TTS 语音合成模块
 * @description 基于 WebSocket 的流式语音合成，支持多种音色、语速调节、多种音频格式
 */

import { toBase64, generateAuthUrl } from './utils';
import { BaseWebSocketClient } from './base-websocket-client';
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
 * 科大讯飞语音合成类
 * 
 * 继承 BaseWebSocketClient，复用 WebSocket 连接管理、状态管理、错误处理等通用逻辑。
 * 专注于语音合成特有的功能：文本转语音、音频流处理、缓存管理等。
 * 
 * @example
 * ```typescript
 * const synthesizer = new XfyunTTS({
 *   appId: 'your-app-id',
 *   apiKey: 'your-api-key',
 *   apiSecret: 'your-api-secret'
 * }, {
 *   onAudioData: (buffer) => console.log('音频数据:', buffer),
 *   onEnd: () => console.log('合成完成')
 * });
 * 
 * await synthesizer.speak('你好，这是语音合成测试');
 * await synthesizer.stop();
 * ```
 */
export class XfyunTTS extends BaseWebSocketClient<SynthesizerState, XfyunTTSOptions, TTSEventHandlers> {
  // ========== 音频相关 ==========
  private audioChunks: ArrayBuffer[] = [];
  private currentText: string = '';
  private textIndex: number = 0;

  // ========== 状态管理 ==========
  protected readonly STATE_TRANSITIONS: Record<SynthesizerState, SynthesizerState[]> = {
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
    super({ ...DEFAULT_OPTIONS, ...options } as XfyunTTSOptions, handlers);
  }

  // ========== 实现 BaseWebSocketClient 抽象方法 ==========

  protected getModulePrefix(): string {
    return '[XfyunTTS]';
  }

  protected getErrorCodePrefix(): number {
    return 20000;
  }

  protected generateAuthUrl(): string {
    return generateAuthUrl(this.options.apiKey, this.options.apiSecret, 'tts-api.xfyun.cn', '/v2/tts');
  }

  protected parseMessage(data: string | ArrayBuffer): void {
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

  // ========== 公共方法 ==========

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

  // ========== 私有方法 ==========

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
        common: { app_id: this.options.appId },
        business: {
          aue: format === 'pcm' ? 'raw' : 'lame',
          auf: SAMPLE_RATE_MAP[sampleRate] || '16000',
          voice_name: this.options.voice_name || 'xiaoyan',
          speed: this.options.speed ?? 50,
          pitch: this.options.pitch ?? 50,
          volume: this.options.volume ?? 50,
          tte: 'UTF8',
          reg: 0,
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
}
