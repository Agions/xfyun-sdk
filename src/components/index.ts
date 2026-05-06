/**
 * xfyun-sdk React 组件共享模块
 * 
 * 导出所有共享的类型、样式、工具函数和 Hooks
 */

// 类型
export type {
  BaseComponentProps,
  ComponentState,
  StateTextMap,
  SharedComponentStyles,
} from './types';

// 状态类型（各组件专用）
export type {
  RecognizerState,
  SynthesizerState,
  TranslatorState,
} from './state-text';

// 样式
export {
  baseComponentStyles,
  getButtonStyle,
} from './styles';

// 状态文本
export {
  createStateTextMap,
  defaultStateText,
  recognizerStateText,
  synthesizerStateText,
  translatorStateText,
} from './state-text';

// Hooks
export {
  useXfyunClient,
  type XfyunClientOptions,
  type UseXfyunClientReturn,
} from './useXfyunClient';
