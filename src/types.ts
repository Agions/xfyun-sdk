// 配置选项
export interface XfyunASROptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  language?: 'zh_cn' | 'en_us'; // 语言
  domain?: 'iat' | 'medical' | 'assistant'; // 领域
  accent?: 'mandarin' | 'cantonese'; // 方言
  vadEos?: number; // 静默检测，单位 ms，默认 3000ms
  maxAudioSize?: number; // 最大音频大小，默认 1MB
  autoStart?: boolean; // 自动开始，默认 false
  hotWords?: string[]; // 热词
  punctuation?: boolean|string; // 是否包含标点符号，默认 true
  audioFormat?: string; // 音频格式，默认 'audio/L16;rate=16000'
}

// 状态
export type RecognizerState = 'idle' | 'connecting' | 'connected' | 'recording' | 'stopped' | 'error';

// 错误码
export interface XfyunError {
  code: number;
  message: string;
  data?: any;
}

// 事件处理器
export interface ASREventHandlers {
  onStart?: () => void;
  onStop?: () => void;
  onRecognitionResult?: (text: string, isEnd: boolean) => void;
  onProcess?: (volume: number) => void;
  onError?: (error: XfyunError) => void;
  onStateChange?: (state: RecognizerState) => void;
}

// WebSocket 消息模型
export interface XfyunWebsocketRequest {
  common?: {
    app_id: string;
  };
  business?: {
    language?: string;
    domain?: string;
    accent?: string;
    vad_eos?: number;
    dwa?: string;
    pd?: string;
    ptt?: number;
    rlang?: string;
    vinfo?: number;
    nunum?: number;
    speex_size?: number;
    nbest?: number;
    wbest?: number;
    nlu?: string;
    hotwords?: string;
    punctuation?: string;
  };
  data?: {
    status: number; // 0:第一帧, 1:中间帧, 2:最后一帧
    format: string;
    encoding: string;
    audio?: string; // base64 编码音频
  };
}

export interface XfyunWebsocketResponse {
  code: number;
  message: string;
  sid?: string;
  data?: {
    result?: {
      ws: Array<{
        bg: number;
        cw: Array<{
          w: string;
          sc: number;
        }>;
      }>;
      sn: number;
      ls: boolean;
      bg: number;
      ed: number;
    };
    status: number;
  };
} 