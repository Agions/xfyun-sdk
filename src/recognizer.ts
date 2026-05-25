/**
 * 科大讯飞语音识别模块
 * @description 基于 WebSocket 的实时语音识别，支持麦克风录音、文件识别、重连机制
 * 
 * @resource-management
 * 所有音频资源（AudioContext、MediaStream、MediaRecorder、AnalyserNode）
 * 必须在使用完毕后通过 destroy() 或 stop() 正确释放，避免内存泄漏。
 */

import {
  XfyunASROptions,
  ASREventHandlers,
  RecognizerState,
  XfyunWebsocketRequest,
  XfyunWebsocketResponse,
} from './types';
import { generateAuthUrl, arrayBufferToBase64, parseXfyunResult, calculateVolume, detectSupportedMimeType, createAudioContext } from './utils';
import { BaseWebSocketClient } from './base-websocket-client';

// 默认配置
const DEFAULT_OPTIONS: Partial<XfyunASROptions> = {
  language: 'zh_cn',
  domain: 'iat',
  accent: 'mandarin',
  vadEos: 3000,
  maxAudioSize: 1024 * 1024,
  autoStart: false,
  audioFormat: 'audio/L16;rate=16000',
  reconnectAttempts: 3,
  reconnectInterval: 3000,
  enableReconnect: false,
  logLevel: 'info',
};

/**
 * 科大讯飞语音识别类
 * 
 * 继承 BaseWebSocketClient，复用 WebSocket 连接管理、状态管理、错误处理等通用逻辑。
 * 专注于语音识别特有的功能：麦克风管理、音频录制、重连机制等。
 * 
 * @example
 * ```typescript
 * const recognizer = new XfyunASR({
 *   appId: 'your-app-id',
 *   apiKey: 'your-api-key',
 *   apiSecret: 'your-api-secret'
 * }, {
 *   onResult: (text) => console.log('识别结果:', text),
 *   onError: (err) => console.error('错误:', err)
 * });
 * 
 * await recognizer.start();
 * recognizer.record();
 * await recognizer.stop();
 * ```
 */
export class XfyunASR extends BaseWebSocketClient<RecognizerState, XfyunASROptions, ASREventHandlers> {
  // ========== 音频相关 ==========
  private recorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private audioDataQueue: string[] = [];
  private totalAudioBytes: number = 0;
  private recognitionResult: string = '';
  private volumeTimer: number | null = null;
  private microphoneStream: MediaStream | null = null;
  
  // 业务参数缓存（避免每帧都 new 对象）
  private cachedBusinessParams: NonNullable<XfyunWebsocketRequest['business']> | null = null;

  // ========== 重连相关 ==========
  private reconnectCount: number = 0;
  private reconnectTimer: number | null = null;
  private isReconnecting: boolean = false;

  // ========== 状态管理 ==========
  protected readonly STATE_TRANSITIONS: Record<RecognizerState, RecognizerState[]> = {
    'idle': ['connecting'],
    'connecting': ['connected', 'stopped', 'error'],
    'connected': ['recording', 'stopped', 'error'],
    'recording': ['stopped', 'error'],
    'stopped': ['idle', 'connecting'],
    'error': ['idle', 'connecting']
  };

  /**
   * 创建语音识别实例
   * @param options 配置选项
   * @param handlers 事件处理程序
   */
  constructor(options: XfyunASROptions, handlers: ASREventHandlers = {}) {
    super({ ...DEFAULT_OPTIONS, ...options } as XfyunASROptions, handlers);
    
    // 如果设置为自动开始，使用 setTimeout 延迟启动，确保父类构造函数完全执行
    if (this.options.autoStart) {
      setTimeout(() => {
        if (!this.destroyed) {
          this.start().catch((err) => {
            this.logger.error('autoStart 启动失败:', err);
          });
        }
      }, 0);
    }
  }

  // ========== 实现 BaseWebSocketClient 抽象方法 ==========

  protected getModulePrefix(): string {
    return '[XfyunASR]';
  }

  protected getErrorCodePrefix(): number {
    return 10000;
  }

  protected generateAuthUrl(): string {
    return generateAuthUrl(this.options.apiKey, this.options.apiSecret);
  }

  protected onConnected(): void {
    // 连接成功后开始录音
    this.startRecording();
  }

  protected onWebSocketClosed(_event: CloseEvent): void {
    // WebSocket 关闭后，如果不是主动停止，尝试重连
    if (this.state !== 'stopped' && this.state !== 'error' && !this.destroyed) {
      this.handleReconnect();
    }
  }

  protected parseMessage(data: string | ArrayBuffer): void {
    if (typeof data !== 'string') return;
    
    const message: XfyunWebsocketResponse = JSON.parse(data);

    // 处理错误响应
    if (message.code !== 0) {
      this.handleError({
        code: message.code,
        message: message.message || '识别错误'
      });
      this.handleReconnect();
      return;
    }

    // 处理识别结果
    this.processRecognitionResult(message);
  }

  // ========== 公共方法 ==========

  /**
   * 设置事件处理程序
   */
  public setHandlers(handlers: ASREventHandlers): void {
    // 验证回调函数类型
    const validHandlers = ['onStart', 'onStop', 'onRecognitionResult', 'onProcess', 'onError', 'onStateChange'];
    for (const key of validHandlers) {
      if (handlers[key as keyof ASREventHandlers] && typeof handlers[key as keyof ASREventHandlers] !== 'function') {
        throw new TypeError(`${key} 必须是函数`);
      }
    }
    super.setHandlers(handlers);
  }

  /**
   * 开始语音识别
   */
  public async start(): Promise<void> {
    if (this.destroyed) {
      this.logger.error('实例已销毁，无法启动');
      return;
    }
    
    try {
      // 检查浏览器兼容性
      if (!navigator.mediaDevices || !window.WebSocket) {
        this.handleError({
          code: 10001,
          message: '浏览器不支持语音识别功能，请使用现代浏览器'
        });
        return;
      }

      if (this.state === 'connecting' || this.state === 'connected' || this.state === 'recording') {
        this.logger.warn('语音识别已在进行中，忽略此次启动请求');
        return;
      }

      // 重置状态
      this.setState('connecting');
      this.recognitionResult = '';
      
      // 清理之前的资源（防止重复启动导致资源泄漏）
      this.cleanupAudioResources();
      
      this.reconnectCount = 0;

      // 请求麦克风权限
      await this.initMicrophone();

      // 创建 WebSocket 连接
      this.initWebSocket();

      // 触发开始事件
      if (this.handlers.onStart) {
        this.handlers.onStart();
      }
    } catch (error) {
      // 启动失败，清理所有已分配的资源
      this.cleanupAudioResources();
      this.handleError({
        code: 10003,
        message: '启动语音识别失败',
        data: error
      });
    }
  }

  /**
   * 停止语音识别
   */
  public stop(): void {
    if (this.state === 'idle' || this.state === 'stopped') {
      return;
    }

    this.clearReconnectTimer();
    this.isReconnecting = false;

    try {
      this.setState('stopped');

      // 停止录音
      if (this.recorder && this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }

      // 停止音量检测
      this.stopVolumeDetection();

      // 发送结束帧
      this.sendEndFrame();

      // 延迟关闭 WebSocket
      this.scheduleWebSocketClose(1000);

      // 清理音频资源（使用统一的清理方法）
      this.cleanupAudioResources();

      // 触发停止事件
      if (this.handlers.onStop) {
        this.handlers.onStop();
      }
    } catch (error) {
      // 即使清理失败也要确保资源被释放
      this.cleanupAudioResources();
      this.handleError({
        code: 10004,
        message: '停止语音识别失败',
        data: error
      });
    }
  }

  /**
   * 销毁实例，释放所有资源
   * 此方法应被调用以确保所有资源正确释放，避免内存泄漏
   */
  public destroy(): void {
    this.destroyed = true;
    this.clearReconnectTimer();
    
    // 清除连接超时定时器
    this.clearConnectingTimer();

    // 立即关闭 websocket
    this.clearWebSocketCloseTimer();
    this.safeCloseWebSocket();

    // 使用统一的资源清理方法
    this.cleanupAudioResources();

    this.setState('stopped');
    this.logger.info('XfyunASR 实例已销毁');
  }

  /**
   * 获取当前识别结果
   */
  public getResult(): string {
    return this.recognitionResult;
  }

  /**
   * 清除识别结果
   */
  public clearResult(): void {
    this.recognitionResult = '';
  }

  /**
   * 是否正在录音中
   */
  public isRecording(): boolean {
    return this.state === 'recording';
  }

  // ========== 私有方法 ==========

  /**
   * 初始化麦克风
   * 注意：如果此方法抛出异常，已分配的部分资源会被自动清理
   */
  private async initMicrophone(): Promise<void> {
    // 临时变量用于部分初始化失败时的清理
    let tempStream: MediaStream | null = null;
    let tempAudioContext: AudioContext | null = null;
    
    try {
      // 获取麦克风权限
      tempStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        },
        video: false
      });

      this.logger.info('成功获取麦克风权限');

      // 创建音频上下文
      tempAudioContext = createAudioContext();

      // 创建分析器节点
      const analyser = tempAudioContext.createAnalyser();
      analyser.fftSize = 2048;

      // 连接音频源
      const audioSource = tempAudioContext.createMediaStreamSource(tempStream);
      audioSource.connect(analyser);

      // 检测支持的音频格式
      const mimeType = detectSupportedMimeType();

      if (!mimeType) {
        throw new Error('浏览器不支持任何可用的音频编码格式');
      }

      this.logger.info('使用音频格式:', mimeType);

      // 创建音频录制器
      const recorder = new MediaRecorder(tempStream, {
        mimeType,
        audioBitsPerSecond: 16000
      });
      
      // 处理录音数据
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            if (this.state === 'recording' && !this.destroyed && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                this.audioDataQueue.push(base64Audio);
                this.sendAudioData();
              } catch (error) {
                this.logger.error('处理音频数据失败:', error);
              }
            }
          };
          reader.onerror = (error) => {
            this.logger.error('读取音频数据失败:', error);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 录音出错处理
      recorder.onerror = (error) => {
        this.logger.error('录音出错:', error);
        this.handleError({
          code: 10009,
          message: '录音出错',
          data: error
        });
      };
      
      // 所有资源初始化成功，赋值给实例变量
      this.microphoneStream = tempStream;
      this.audioContext = tempAudioContext;
      this.analyser = analyser;
      this.audioSource = audioSource;
      this.recorder = recorder;
      
      // 清空临时变量，避免被 finally 块清理
      tempStream = null;
      tempAudioContext = null;
      
      this.logger.info('麦克风和录音器初始化完成');
    } catch (error) {
      // 清理部分初始化的资源（使用临时变量）
      if (tempStream) {
        try {
          tempStream.getTracks().forEach(track => track.stop());
        } catch {}
      }
      if (tempAudioContext) {
        try {
          if (tempAudioContext.state !== 'closed') {
            void tempAudioContext.close();
          }
        } catch {}
      }
      this.logger.error('初始化麦克风失败:', error);
      throw error;
    }
  }

  /**
   * 开始录音
   */
  private startRecording(): void {
    if (!this.recorder || this.recorder.state === 'recording') return;
    
    // 开始录音（每 500ms 触发一次 dataavailable）
    this.recorder.start(500);
    
    // 开始音量检测
    this.startVolumeDetection();
    
    this.setState('recording');
    this.logger.info('开始录音');
  }

  // ========== 资源管理（核心改进）==========
  
  /**
   * 清理所有音频相关资源
   * 使用 try-catch 确保每个资源都能被清理，即使某个资源清理失败
   */
  private cleanupAudioResources(): void {
    // 1. 停止音量检测定时器
    this.stopVolumeDetection();
    
    // 2. 停止并清理 MediaRecorder
    try {
      if (this.recorder) {
        if (this.recorder.state === 'recording' || this.recorder.state === 'paused') {
          this.recorder.stop();
        }
        // 清空 dataavailable 监听器，防止后续回调
        this.recorder.ondataavailable = null;
        this.recorder.onerror = null;
        this.recorder = null;
      }
    } catch (e) {
      this.logger.warn('清理 MediaRecorder 时出错:', e);
    }
    
    // 3. 释放麦克风流（先断开节点，再停止轨道）
    this.releaseMicrophone();
    
    // 4. 关闭 AudioContext
    try {
      if (this.audioContext) {
        // 如果 context 已关闭或已暂停，不需要再 close
        if (this.audioContext.state !== 'closed') {
          void this.audioContext.close();
        }
        this.audioContext = null;
      }
    } catch (e) {
      this.logger.warn('清理 AudioContext 时出错:', e);
    }
    
    // 5. 清空音频数据队列
    this.audioDataQueue = [];
    this.totalAudioBytes = 0;
    
    // 6. 重置业务参数缓存
    this.cachedBusinessParams = null;
    
    this.logger.debug('音频资源已清理完毕');
  }

  /**
   * 释放麦克风资源（独立方法，可被多次安全调用）
   */
  private releaseMicrophone(): void {
    // 先断开音频节点连接，再停止轨道
    if (this.audioSource) {
      try { this.audioSource.disconnect(); } catch {}
      this.audioSource = null;
    }
    if (this.analyser) {
      try { this.analyser.disconnect(); } catch {}
      this.analyser = null;
    }
    if (this.microphoneStream) {
      try {
        this.microphoneStream.getTracks().forEach(track => {
          try { track.stop(); } catch {}
        });
      } catch {}
      this.microphoneStream = null;
    }
  }

  /**
   * 停止音量检测
   */
  private stopVolumeDetection(): void {
    if (this.volumeTimer) {
      window.clearInterval(this.volumeTimer);
      this.volumeTimer = null;
    }
  }

  /**
   * 构建公共业务参数（缓存避免重复创建）
   */
  private buildBusinessParams(): NonNullable<XfyunWebsocketRequest['business']> {
    if (this.cachedBusinessParams) {
      return this.cachedBusinessParams;
    }

    const business: NonNullable<XfyunWebsocketRequest['business']> = {
      language: this.options.language,
      domain: this.options.domain,
      accent: this.options.accent,
      vad_eos: this.options.vadEos,
      dwa: 'wpgs',
      pd: 'speech',
      ptt: 0,
      rlang: 'zh-cn',
      vinfo: 1,
      nunum: 1,
      speex_size: 70,
      nbest: 1,
      wbest: 5,
    };

    // 设置标点符号选项
    if (typeof this.options.punctuation !== 'undefined') {
      if (typeof this.options.punctuation === 'boolean') {
        business.punctuation = this.options.punctuation ? 'on' : 'off';
      } else {
        business.punctuation = this.options.punctuation;
      }
    }

    // 如果有热词，添加到请求中
    if (this.options.hotWords && this.options.hotWords.length > 0) {
      business.hotwords = this.options.hotWords.join(',');
    }

    this.cachedBusinessParams = business;
    return business;
  }

  /**
   * 处理识别结果数据
   */
  private processRecognitionResult(message: XfyunWebsocketResponse): void {
    if (!message.data || !message.data.result) return;

    const text = parseXfyunResult(message.data.result, this.logger);
    const isEnd = message.data.result.ls;

    this.logger.debug('解析识别结果:', text, '是否最终结果:', isEnd);

    if (text) {
      this.recognitionResult += text;

      if (this.handlers.onRecognitionResult) {
        this.handlers.onRecognitionResult(text, isEnd);
      }
    }

    // 如果是最终结果，重置重连计数
    if (isEnd) {
      this.reconnectCount = 0;
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
      const frame: XfyunWebsocketRequest = {
        common: { app_id: this.options.appId },
        business: this.buildBusinessParams(),
        data: {
          status: 0,
          format: this.options.audioFormat || 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: ''
        }
      };

      this.logger.debug('发送开始帧');
      if (!this.safeSend(JSON.stringify(frame))) {
        throw new Error('WebSocket 发送失败');
      }
    } catch (error) {
      this.logger.error('发送开始帧失败:', error);
      this.handleError({
        code: 10008,
        message: '发送开始帧失败',
        data: error
      });
    }
  }

  /**
   * 发送音频数据
   */
  private sendAudioData(): void {
    if (this.state !== 'recording' || this.destroyed) {
      return;
    }

    while (this.audioDataQueue.length > 0) {
      const audioData = this.audioDataQueue.shift();

      if (!audioData) continue;

      const maxSize = this.options.maxAudioSize || 1024 * 1024;
      if (this.totalAudioBytes + audioData.length > maxSize) {
        this.logger.warn('音频数据超过大小限制，停止发送');
        this.audioDataQueue = [];
        break;
      }

      try {
        // 后续帧只发 common + data，不带 business 减少冗余数据传输
        const frame = {
          common: { app_id: this.options.appId },
          data: {
            status: 1,
            format: this.options.audioFormat || 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: audioData
          }
        };

        if (!this.safeSend(JSON.stringify(frame))) {
          this.audioDataQueue.unshift(audioData);
          this.handleError({
            code: 10007,
            message: '发送音频数据失败: WebSocket 未就绪或发送失败'
          });
          break;
        }

        this.totalAudioBytes += audioData.length;
        this.logger.debug('发送音频数据帧, 大小:', audioData.length);
      } catch (error) {
        this.logger.error('发送音频数据失败:', error);
        this.audioDataQueue.unshift(audioData);
        this.handleError({
          code: 10007,
          message: '发送音频数据失败',
          data: error
        });
        break; // 修复：异常后跳出循环，避免无限重试
      }
    }
  }

  /**
   * 发送结束帧
   */
  private sendEndFrame(): void {
    const frame: XfyunWebsocketRequest = {
      common: { app_id: this.options.appId },
      business: this.buildBusinessParams(),
      data: {
        status: 2,
        format: this.options.audioFormat || 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: ''
      }
    };

    this.logger.debug('发送结束帧');
    if (!this.safeSend(JSON.stringify(frame))) {
      this.logger.warn('发送结束帧失败，WebSocket 未就绪');
    }
  }

  /**
   * 开始音量检测
   */
  private startVolumeDetection(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    this.volumeTimer = window.setInterval(() => {
      if (this.analyser && this.state === 'recording' && !this.destroyed) {
        this.analyser.getFloatTimeDomainData(dataArray);
        const volume = calculateVolume(dataArray);
        
        if (this.handlers.onProcess) {
          this.handlers.onProcess(volume);
        }
      }
    }, 100);
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearConnectingTimer();
  }

  /**
   * 处理重连逻辑
   */
  private handleReconnect(): void {
    if (this.destroyed) return;
    if (!this.options.enableReconnect) return;
    if (this.isReconnecting) return;

    const maxAttempts = this.options.reconnectAttempts || 3;
    const baseInterval = this.options.reconnectInterval || 3000;

    if (this.reconnectCount >= maxAttempts) {
      this.logger.warn('已达到最大重连次数，重连停止');
      this.setState('error');
      return;
    }

    this.isReconnecting = true;
    this.reconnectCount++;

    // 指数退避: interval * 2^(attempt-1)，上限 30s
    const interval = Math.min(baseInterval * Math.pow(2, this.reconnectCount - 1), 30000);
    this.logger.info(`正在尝试第 ${this.reconnectCount} 次重连，间隔 ${interval}ms...`);

    this.reconnectTimer = window.setTimeout(() => {
      this.isReconnecting = false;

      if (this.state === 'error' || this.state === 'idle' || this.state === 'connecting') {
        this.start();
      }
    }, interval);
  }
}

export { LogLevel, Logger } from './logger';
