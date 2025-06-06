import { 
  XfyunASROptions, 
  ASREventHandlers, 
  RecognizerState, 
  XfyunWebsocketRequest,
  XfyunWebsocketResponse,
  XfyunError
} from './types';
import { generateAuthUrl, arrayBufferToBase64, parseXfyunResult, calculateVolume } from './utils';

// 默认配置
const DEFAULT_OPTIONS: Partial<XfyunASROptions> = {
  language: 'zh_cn',
  domain: 'iat',
  accent: 'mandarin',
  vadEos: 3000,
  maxAudioSize: 1024 * 1024,
  autoStart: false,
  audioFormat: 'audio/L16;rate=16000'
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

    // 如果设置为自动开始，则初始化后立即开始
    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * 开始语音识别
   */
  public async start(): Promise<void> {
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
    try {
      this.setState('stopped');

      // 停止录音
      if (this.recorder && this.recorder.state !== 'inactive') {
        this.recorder.stop();
      }

      // 停止音量检测
      if (this.volumeTimer) {
        window.clearInterval(this.volumeTimer);
        this.volumeTimer = null;
      }

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
      if (this.microphoneStream) {
        this.microphoneStream.getTracks().forEach(track => track.stop());
        this.microphoneStream = null;
      }

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
          sampleRate: 16000 // 确保使用16000Hz采样率
        },
        video: false
      });

      console.log('成功获取麦克风权限');

      // 创建音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // 确保使用16000Hz采样率
      });
      
      // 创建分析器节点，用于获取音频音量
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
      
      console.log('使用音频格式:', mimeType);
      
      // 创建音频录制器
      this.recorder = new MediaRecorder(this.microphoneStream, {
        mimeType,
        audioBitsPerSecond: 16000
      });
      
      // 处理录音数据
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
          // 转换为arrayBuffer后发送
          const reader = new FileReader();
          reader.onload = () => {
            if (this.state === 'recording' && reader.result instanceof ArrayBuffer) {
              try {
                const base64Audio = arrayBufferToBase64(reader.result);
                this.audioDataQueue.push(base64Audio);
                this.sendAudioData();
              } catch (error) {
                console.error('处理音频数据失败:', error);
              }
            }
          };
          reader.onerror = (error) => {
            console.error('读取音频数据失败:', error);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // 录音出错处理
      this.recorder.onerror = (error) => {
        console.error('录音出错:', error);
        this.handleError({
          code: 10009,
          message: '录音出错',
          data: error
        });
      };
      
      // 开始录音
      this.recorder.start(500); // 每500ms提供一次数据
      
      // 开始音量检测
      this.startVolumeDetection();
      
      console.log('麦克风和录音器初始化完成');
    } catch (error) {
      console.error('获取麦克风权限失败:', error);
      throw new Error(`获取麦克风权限失败: ${error}`);
    }
  }

  /**
   * 初始化WebSocket连接
   */
  private initWebSocket(): void {
    try {
      // 生成WebSocket URL
      const url = generateAuthUrl(this.options.apiKey, this.options.apiSecret);
      
      console.log('正在连接WebSocket:', url);
      this.websocket = new WebSocket(url);
      
      // 连接建立
      this.websocket.onopen = () => {
        console.log('WebSocket连接成功');
        this.setState('connected');
        this.sendStartFrame();
      };
      
      // 接收消息
      this.websocket.onmessage = (event) => {
        try {
          console.log('收到WebSocket消息:', event.data);
          const message: XfyunWebsocketResponse = JSON.parse(event.data);
          
          // 处理错误
          if (message.code !== 0) {
            this.handleError({
              code: message.code,
              message: message.message || '识别错误'
            });
            return;
          }
          
          // 处理识别结果
          if (message.data && message.data.result) {
            const text = parseXfyunResult(message.data.result);
            const isEnd = message.data.result.ls;
            
            console.log('解析识别结果:', text, '是否最终结果:', isEnd);
            
            if (text) {
              this.recognitionResult += text;
              
              if (this.handlers.onRecognitionResult) {
                this.handlers.onRecognitionResult(text, isEnd);
              }
            }
          }
        } catch (error) {
          console.error('解析WebSocket消息失败:', error, '原始消息:', event.data);
          this.handleError({
            code: 10005,
            message: '解析消息失败',
            data: error
          });
        }
      };
      
      // 连接错误
      this.websocket.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        this.handleError({
          code: 10006,
          message: 'WebSocket连接错误',
          data: error
        });
      };
      
      // 连接关闭
      this.websocket.onclose = (event) => {
        console.log('WebSocket连接关闭:', event.code, event.reason);
        if (this.state !== 'stopped' && this.state !== 'error') {
          this.setState('idle');
        }
      };
    } catch (error) {
      console.error('初始化WebSocket失败:', error);
      throw new Error(`初始化WebSocket失败: ${error}`);
    }
  }

  /**
   * 发送开始帧
   */
  private sendStartFrame(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket未连接，无法发送开始帧');
      return;
    }

    try {
      // 构建开始参数
      const frame: XfyunWebsocketRequest = {
        common: {
          app_id: this.options.appId,
        },
        business: {
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
          wbest: 5
        },
        data: {
          status: 0, // 0: 开始
          format: this.options.audioFormat || 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: '' // 开始帧不需要音频数据
        }
      };

      // 设置标点符号选项
      if (typeof this.options.punctuation !== 'undefined') {
        if (typeof this.options.punctuation === 'boolean') {
          frame.business!.punctuation = this.options.punctuation ? 'on' : 'off';
        } else {
          frame.business!.punctuation = this.options.punctuation;
        }
      }

      // 如果有热词，添加到请求中
      if (this.options.hotWords && this.options.hotWords.length > 0) {
        frame.business!.hotwords = this.options.hotWords.join(',');
      }

      console.log('发送开始帧:', JSON.stringify(frame));
      this.websocket.send(JSON.stringify(frame));
      this.setState('recording');
    } catch (error) {
      console.error('发送开始帧失败:', error);
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
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN || this.state !== 'recording') {
      return;
    }

    // 从队列中获取音频数据
    while (this.audioDataQueue.length > 0) {
      const audioData = this.audioDataQueue.shift();
      
      if (!audioData) continue;
      
      try {
        // 构建数据帧
        const frame: XfyunWebsocketRequest = {
          common: {
            app_id: this.options.appId
          },
          business: {
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
            wbest: 5
          },
          data: {
            status: 1, // 1: 连续帧
            format: this.options.audioFormat || 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: audioData
          }
        };

        // 如果有热词，添加到请求中
        if (this.options.hotWords && this.options.hotWords.length > 0) {
          frame.business!.hotwords = this.options.hotWords.join(',');
        }
        
        // 发送数据
        const jsonStr = JSON.stringify(frame);
        this.websocket.send(jsonStr);
        
        console.log('发送音频数据帧, 大小:', audioData.length);
      } catch (error) {
        console.error('发送音频数据失败:', error);
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

    // 构建结束帧
    const frame: XfyunWebsocketRequest = {
      common: {
        app_id: this.options.appId
      },
      business: {
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
        wbest: 5
      },
      data: {
        status: 2, // 2: 结束帧
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
      if (this.analyser && this.state === 'recording') {
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
    
    console.error('讯飞语音识别错误:', error);
  }
} 