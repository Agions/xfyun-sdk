import { 
  XfyunASROptions, 
  ASREventHandlers, 
  RecognizerState, 
  XfyunWebsocketRequest,
  XfyunWebsocketResponse,
  XfyunError
} from './types';
import { generateAuthUrl, arrayBufferToBase64, parseXfyunResult, calculateVolume } from './utils';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 统一的日志工具类
 */
export class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    switch (level) {
      case 'debug': this.level = LogLevel.DEBUG; break;
      case 'info': this.level = LogLevel.INFO; break;
      case 'warn': this.level = LogLevel.WARN; break;
      case 'error': this.level = LogLevel.ERROR; break;
    }
  }

  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug('[XfyunASR]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info('[XfyunASR]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn('[XfyunASR]', ...args);
    }
  }

  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error('[XfyunASR]', ...args);
    }
  }
}

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
 */
export class XfyunASR {
  private options: XfyunASROptions;
  private handlers: ASREventHandlers;
  private websocket: WebSocket | null = null;
  private recorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioChunks: Blob[] = [];
  private state: RecognizerState = 'idle';
  private audioDataQueue: string[] = [];
  private recognitionResult: string = '';
  private volumeTimer: number | null = null;
  private microphoneStream: MediaStream | null = null;
  
  // 重连相关
  private reconnectCount: number = 0;
  private reconnectTimer: number | null = null;
  private isReconnecting: boolean = false;
  
  // 日志器
  public logger: Logger;
  
  // 销毁状态
  private destroyed: boolean = false;

  /**
   * 创建语音识别实例
   * @param options 配置选项
   * @param handlers 事件处理程序
   */
  constructor(options: XfyunASROptions, handlers: ASREventHandlers = {}) {
    // 检查必要参数
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      throw new Error('缺少必要参数: appId, apiKey, apiSecret 不能为空');
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.handlers = handlers;
    
    // 初始化日志器
    this.logger = new Logger();
    this.logger.setLevel(this.options.logLevel || 'info');
    this.logger.info('XfyunASR 实例创建', this.options);

    // 如果设置为自动开始，则初始化后立即开始
    if (this.options.autoStart) {
      this.start();
    }
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

      if (this.state !== 'idle' && this.state !== 'stopped' && this.state !== 'error') {
        this.handleError({
          code: 10002,
          message: '语音识别已在进行中'
        });
        return;
      }

      // 重置状态
      this.setState('connecting');
      this.recognitionResult = '';
      this.audioChunks = [];
      this.audioDataQueue = [];
      this.reconnectCount = 0;

      // 请求麦克风权限
      await this.initMicrophone();

      // 创建WebSocket连接
      this.initWebSocket();

      // 触发开始事件
      if (this.handlers.onStart) {
        this.handlers.onStart();
      }
    } catch (error) {
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

      // 关闭WebSocket连接
      setTimeout(() => {
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
      }, 1000);

      // 关闭音频流
      this.releaseMicrophone();

      // 关闭音频上下文
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }

      // 触发停止事件
      if (this.handlers.onStop) {
        this.handlers.onStop();
      }
    } catch (error) {
      this.handleError({
        code: 10004,
        message: '停止语音识别失败',
        data: error
      });
    }
  }

  /**
   * 销毁实例，释放所有资源
   */
  public destroy(): void {
    this.destroyed = true;
    this.stop();
    this.logger.info('XfyunASR 实例已销毁');
  }

  /**
   * 获取当前识别结果
   */
  public getResult(): string {
    return this.recognitionResult;
  }

  /**
   * 获取当前状态
   */
  public getState(): RecognizerState {
    return this.state;
  }

  /**
   * 清除识别结果
   */
  public clearResult(): void {
    this.recognitionResult = '';
  }

  /**
   * 初始化麦克风
   */
  private async initMicrophone(): Promise<void> {
    try {
      // 获取麦克风权限
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({
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
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      // 创建分析器节点
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      // 连接音频源
      const source = this.audioContext.createMediaStreamSource(this.microphoneStream);
      source.connect(this.analyser);
      
      // 检查支持的MIME类型
      const mimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus'
      ];
      
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        throw new Error('浏览器不支持任何可用的音频编码格式');
      }
      
      this.logger.info('使用音频格式:', mimeType);
      
      // 创建音频录制器
      this.recorder = new MediaRecorder(this.microphoneStream, {
        mimeType,
        audioBitsPerSecond: 16000
      });
      
      // 处理录音数据
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
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
      this.recorder.onerror = (error) => {
        this.logger.error('录音出错:', error);
        this.handleError({
          code: 10009,
          message: '录音出错',
          data: error
        });
      };
      
      // 开始录音
      this.recorder.start(500);
      
      // 开始音量检测
      this.startVolumeDetection();
      
      this.logger.info('麦克风和录音器初始化完成');
    } catch (error) {
      this.logger.error('获取麦克风权限失败:', error);
      throw new Error(`获取麦克风权限失败: ${error}`);
    }
  }

  /**
   * 释放麦克风资源
   */
  private releaseMicrophone(): void {
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
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
   * 构建公共业务参数（抽取重复代码）
   */
  private buildBusinessParams(): NonNullable<XfyunWebsocketRequest['business']> {
    const business: NonNullable<XfyunWebsocketRequest['business']> = {
      language: this.options.language,
      domain: this.options.domain,
      accent: this.options.accent,
      vad_eos: this.options.vadEos,
      dwa: 'wpgs', // 开启动态修正功能
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

    return business;
  }

  /**
   * 初始化WebSocket连接
   */
  private initWebSocket(): void {
    try {
      // 生成WebSocket URL
      const url = generateAuthUrl(this.options.apiKey, this.options.apiSecret);
      
      this.logger.info('正在连接WebSocket');
      this.websocket = new WebSocket(url);
      
      // 连接建立
      this.websocket.onopen = () => {
        this.logger.info('WebSocket连接成功');
        this.setState('connected');
        this.sendStartFrame();
      };
      
      // 接收消息
      this.websocket.onmessage = (event) => {
        try {
          this.logger.debug('收到WebSocket消息');
          const message: XfyunWebsocketResponse = JSON.parse(event.data);
          
          if (message.code !== 0) {
            this.handleError({
              code: message.code,
              message: message.message || '识别错误'
            });
            // 尝试重连
            this.handleReconnect();
            return;
          }
          
          if (message.data && message.data.result) {
            const text = parseXfyunResult(message.data.result);
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
        } catch (error) {
          this.logger.error('解析WebSocket消息失败:', error);
          this.handleError({
            code: 10005,
            message: '解析消息失败',
            data: error
          });
        }
      };
      
      // 连接错误
      this.websocket.onerror = (error) => {
        this.logger.error('WebSocket连接错误:', error);
        this.handleError({
          code: 10006,
          message: 'WebSocket连接错误',
          data: error
        });
      };
      
      // 连接关闭
      this.websocket.onclose = (event) => {
        this.logger.info('WebSocket连接关闭:', event.code, event.reason);
        
        // 如果不是主动关闭，尝试重连
        if (this.state !== 'stopped' && this.state !== 'error' && !this.destroyed) {
          this.handleReconnect();
        }
      };
    } catch (error) {
      this.logger.error('初始化WebSocket失败:', error);
      throw new Error(`初始化WebSocket失败: ${error}`);
    }
  }

  /**
   * 处理重连逻辑
   */
  private handleReconnect(): void {
    if (this.destroyed) return;
    if (!this.options.enableReconnect) return;
    if (this.isReconnecting) return;
    
    const maxAttempts = this.options.reconnectAttempts || 3;
    const interval = this.options.reconnectInterval || 3000;
    
    if (this.reconnectCount >= maxAttempts) {
      this.logger.warn('已达到最大重连次数，重连停止');
      this.setState('error');
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectCount++;
    
    this.logger.info(`正在尝试第 ${this.reconnectCount} 次重连...`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.isReconnecting = false;
      
      if (this.state === 'error' || this.state === 'idle') {
        this.start();
      }
    }, interval);
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 发送开始帧
   */
  private sendStartFrame(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN || this.destroyed) {
      this.logger.error('WebSocket未连接，无法发送开始帧');
      return;
    }

    try {
      const frame: XfyunWebsocketRequest = {
        common: {
          app_id: this.options.appId,
        },
        business: this.buildBusinessParams(),
        data: {
          status: 0,
          format: this.options.audioFormat || 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: ''
        }
      };

      this.logger.debug('发送开始帧');
      this.websocket.send(JSON.stringify(frame));
      this.setState('recording');
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
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN || this.state !== 'recording' || this.destroyed) {
      return;
    }

    while (this.audioDataQueue.length > 0) {
      const audioData = this.audioDataQueue.shift();
      
      if (!audioData) continue;
      
      try {
        const frame: XfyunWebsocketRequest = {
          common: {
            app_id: this.options.appId
          },
          business: this.buildBusinessParams(),
          data: {
            status: 1,
            format: this.options.audioFormat || 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: audioData
          }
        };

        this.websocket.send(JSON.stringify(frame));
        this.logger.debug('发送音频数据帧, 大小:', audioData.length);
      } catch (error) {
        this.logger.error('发送音频数据失败:', error);
        this.handleError({
          code: 10007,
          message: '发送音频数据失败',
          data: error
        });
      }
    }
  }

  /**
   * 发送结束帧
   */
  private sendEndFrame(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const frame: XfyunWebsocketRequest = {
      common: {
        app_id: this.options.appId
      },
      business: this.buildBusinessParams(),
      data: {
        status: 2,
        format: this.options.audioFormat || 'audio/L16;rate=16000',
        encoding: 'raw',
        audio: ''
      }
    };

    this.websocket.send(JSON.stringify(frame));
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
   * 设置状态
   */
  private setState(state: RecognizerState): void {
    this.state = state;
    
    if (this.handlers.onStateChange) {
      this.handlers.onStateChange(state);
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: XfyunError): void {
    this.setState('error');
    
    if (this.handlers.onError) {
      this.handlers.onError(error);
    }
    
    this.logger.error('讯飞语音识别错误:', error);
  }
}
