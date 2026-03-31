/**
 * 科大讯飞语音 SDK 类型定义
 */

// ==================== ASR 类型 ====================

/** ASR 识别状态 */
export type RecognizerState = 'idle' | 'connecting' | 'connected' | 'recording' | 'stopped' | 'error';

/** ASR 配置选项 */
export interface XfyunASROptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  language?: 'zh_cn' | 'en_us';
  domain?: 'iat' | 'medical' | 'assistant';
  accent?: 'mandarin' | 'cantonese';
  vadEos?: number;
  maxAudioSize?: number;
  autoStart?: boolean;
  hotWords?: string[];
  punctuation?: boolean | string;
  audioFormat?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  enableReconnect?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/** ASR 事件处理函数 */
export interface ASREventHandlers {
  onStart?: () => void;
  onStop?: () => void;
  onRecognitionResult?: (text: string, isEnd: boolean) => void;
  onProcess?: (volume: number) => void;
  onError?: (error: XfyunError) => void;
  onStateChange?: (state: RecognizerState) => void;
}

/** ASR 错误 */
export interface XfyunError {
  code: number;
  message: string;
  data?: unknown;
}

/** WebSocket 请求 */
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
    status: number;
    format: string;
    encoding: string;
    audio?: string;
  };
}

/** WebSocket 响应 */
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

// ==================== TTS 类型 ====================

/** TTS 音频格式 */
export type TTSAudioFormat = 'mp3' | 'wav' | 'pcm';

/** TTS 音色名称 */
export type TTSVoiceName =
  | 'xiaoyan'       // 青年女声-小燕
  | 'aisjiuxu'       // 青年女声-许久
  | 'aisxping'       // 青年女声-小萍
  | 'aisjinger'      // 青年女声-京儿
  | 'aisbabyxu'      // 青年女声-小旭
  | 'aisxiaoyuan'    // 青年女声-小媛
  | 'aisxingchen'    // 青年女声-星辰
  | 'aisdengdeng'    // 青年女声-叮当
  | 'aisyaoyao'      // 青年女声-瑶瑶
  | 'aismall'        // 青年女声-小暖
  | 'aisxiaofeng'    // 青年男声-小峰
  | 'aisnan'         // 青年男声-楠楠
  | 'aisxiaosong'    // 青年男声-小松
  | 'aisxiaoyong'    // 青年男声-小勇
  | 'aisxiaowang'    // 青年男声-小王
  | 'aisxiaole'      // 青年男声-小乐
  | 'aisxiaoy'       // 青年男声-小宇
  | 'aisxiaolin'     // 青年男声-小林
  | 'aisxiaoming'    // 青年男声-小明
  | 'aisxiaogang'    // 青年男声-小刚
  | 'aisdarong'      // 中年男声-大荣
  | 'aisnvpeach'     // 中年女声-青娇
  | 'aisxiaowuma'    // 老年男声-无马
  | 'aisxiaorong'    // 老年男声-小荣
  | 'aischanghong'   // 老年女声-长红
  | 'aisxiaoyaxi'    // 英文女声-雅西
  | 'aisjiuyuan'     // 四川话女声
  | 'aisxiaoxian'    // 陕西话女声-小贤
  | 'aisxiaomao'     // 东北话女声-小矛
  | 'aisxiaoli'      // 东北话女声-小黎
  | 'aisxiaokan'     // 河南话女声-小侃
  | 'aisxiaoning'    // 普通话男声-小宁
  | 'aismary'        // 英中双语女声
  | 'aisxiaowawa'    // 童声
  | 'aisxiaoxue'     // 童声-小学
  | 'aisxiaoyan'     // 粤语女声-小燕
  ;

/** TTS 合成器状态 */
export type SynthesizerState = 'idle' | 'connecting' | 'connected' | 'synthesizing' | 'stopped' | 'error';

/** TTS 错误 */
export interface TTSError {
  code: number;
  message: string;
  data?: unknown;
}

/** TTS 事件处理函数 */
export interface TTSEventHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onStop?: () => void;
  onAudioData?: (audioData: ArrayBuffer) => void;
  onProgress?: (current: number, total: number) => void;
  onError?: (error: TTSError) => void;
  onStateChange?: (state: SynthesizerState) => void;
}

/** TTS 配置选项 */
export interface XfyunTTSOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  voice_name?: TTSVoiceName | string;
  speed?: number;
  pitch?: number;
  volume?: number;
  accent?: string;
  audioFormat?: TTSAudioFormat;
  sampleRate?: number;
  autoStart?: boolean;
  enableCache?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// ==================== 翻译类型 ====================

/** 翻译类型 */
export type TranslatorType = 'asr' | 'text';

/** 源语言 */
export type SourceLanguage =
  | 'cn' | 'en' | 'ja' | 'ko' | 'fr' | 'es' | 'it' | 'de'
  | 'pt' | 'vi' | 'id' | 'ms' | 'ru' | 'ar' | 'hi' | 'th';

/** 目标语言 */
export type TargetLanguage =
  | 'cn' | 'en' | 'ja' | 'ko' | 'fr' | 'es' | 'it' | 'de'
  | 'pt' | 'vi' | 'id' | 'ms' | 'ru' | 'ar' | 'hi' | 'th';

/** 翻译器状态 */
export type TranslatorState = 'idle' | 'connecting' | 'connected' | 'translating' | 'stopped' | 'error';

/** 翻译错误 */
export interface TranslatorError {
  code: number;
  message: string;
  data?: unknown;
}

/** 翻译结果 */
export interface TranslationResult {
  sourceLanguage: SourceLanguage;
  targetLanguage: TargetLanguage;
  sourceText: string;
  targetText: string;
  isFinal: boolean;
  confidence?: number;
}

/** 翻译事件处理函数 */
export interface TranslatorEventHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onStop?: () => void;
  onResult?: (result: TranslationResult) => void;
  onError?: (error: TranslatorError) => void;
  onStateChange?: (state: TranslatorState) => void;
}

/** 翻译器配置选项 */
export interface XfyunTranslatorOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  type?: TranslatorType;
  from?: SourceLanguage;
  to?: TargetLanguage;
  domain?: 'iner' | 'video' | 'command' | 'doc' | 'phonecall' | 'medical';
  autoStart?: boolean;
  vadEos?: number;
  sampleRate?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// ==================== 离线 ASR 类型 ====================

/**
 * 离线 ASR 配置选项
 * @description 离线识别引擎配置，用于无网络情况下的语音识别
 */
export interface OfflineASROptions {
  /** 引擎类型，固定为 'smsys' */
  engine?: 'smsys';
  /** 语言 */
  language?: 'zh_cn' | 'en_us';
  /** 领域 */
  domain?: 'iat' | 'search' | 'commands';
  /** 采样率 */
  sampleRate?: 8000 | 16000;
  /** 垂直领域（可选） */
  nbest?: number;
  /** 识别结果候选数 */
  wbest?: number;
}

// ==================== 声纹识别类型 ====================

/**
 * 声纹识别配置选项
 * @description 声纹识别（ Speaker Verification / Identification ）
 */
export interface SpeakerVerifyOptions {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 声纹场景: verify=验证, identify=识别 */
  scene: 'verify' | 'identify';
  /** 声纹模型: 21360=一比一验证, 21361=一比N识别 */
  engine_type: '21360' | '21361';
  /** 用户 ID（identify 模式必填） */
  user_id?: string;
  /** 音频格式 */
  audioFormat?: 'wav' | 'pcm' | 'opus';
  /** 采样率 */
  sampleRate?: number;
  /** 日志级别 */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * 声纹识别结果
 */
export interface SpeakerVerifyResult {
  /** 是否验证通过 */
  success: boolean;
  /** 置信度 0-100 */
  score: number;
  /** 识别到的用户 ID（identify 模式） */
  user_id?: string;
  /** 错误信息 */
  message?: string;
}

/**
 * 声纹注册结果
 */
export interface SpeakerRegisterResult {
  success: boolean;
  message: string;
  user_id?: string;
}

// ==================== 工具类型 ====================

/**
 * 检测是否在浏览器环境
 */
export declare function isBrowser(): boolean;

/**
 * 获取 SDK 版本
 */
export declare const SDK_VERSION: string;
