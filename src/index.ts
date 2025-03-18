// 导出核心功能
export { XfyunASR } from './recognizer';

// 导出 React 组件
export { default as SpeechRecognizer } from './components/SpeechRecognizer';
export type { SpeechRecognizerProps } from './components/SpeechRecognizer';

// 导出类型定义
export type {
  XfyunASROptions,
  ASREventHandlers,
  RecognizerState,
  XfyunError,
  XfyunWebsocketRequest,
  XfyunWebsocketResponse
} from './types';

// 导出工具函数
export {
  generateAuthUrl,
  calculateVolume,
  arrayBufferToBase64,
  parseXfyunResult
} from './utils'; 