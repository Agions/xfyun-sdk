/**
 * 科大讯飞语音 SDK
 * @description 支持语音识别(ASR)、语音合成(TTS)、翻译等功能
 */

// 核心功能
export { XfyunASR } from './recognizer';
export { XfyunTTS } from './synthesizer';
export { XfyunTranslator } from './translator';

// Logger
export { Logger, LogLevel } from './logger';

// React 组件
export { default as SpeechRecognizer } from './components/SpeechRecognizer';
export type { SpeechRecognizerProps } from './components/SpeechRecognizer';

// ==================== ASR 类型 ====================
export type {
  XfyunASROptions,
  ASREventHandlers,
  RecognizerState,
  XfyunError,
  XfyunWebsocketRequest,
  XfyunWebsocketResponse,
} from './types';

// ==================== TTS 类型 ====================
export type {
  XfyunTTSOptions,
  TTSEventHandlers,
  TTSError,
  TTSAudioFormat,
  TTSVoiceName,
  SynthesizerState,
} from './types';

// ==================== 翻译类型 ====================
export type {
  XfyunTranslatorOptions,
  TranslatorEventHandlers,
  TranslatorError,
  TranslationResult,
  TranslatorType,
  SourceLanguage,
  TargetLanguage,
  TranslatorState,
} from './types';

// ==================== 离线 ASR & 声纹类型 ====================
export type {
  OfflineASROptions,
  SpeakerVerifyOptions,
  SpeakerVerifyResult,
  SpeakerRegisterResult,
} from './types';

// 工具函数
export {
  generateAuthUrl,
  calculateVolume,
  arrayBufferToBase64,
  parseXfyunResult,
} from './utils';

// SDK 版本
export const SDK_VERSION = '1.2.3';
