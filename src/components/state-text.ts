/**
 * 状态文本映射
 * 
 * 提供组件状态到中文文本的映射
 */

import type { ComponentState } from './types';

/**
 * 语音识别专用状态类型（扩展基础状态）
 */
export type RecognizerState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'recording'
  | 'stopped'
  | 'error';

/**
 * 语音合成专用状态类型（扩展基础状态）
 */
export type SynthesizerState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'synthesizing'
  | 'stopped'
  | 'error';

/**
 * 翻译专用状态类型（扩展基础状态）
 */
export type TranslatorState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'translating'
  | 'stopped'
  | 'error';

/**
 * 创建状态文本映射
 * 
 * @param customLabels - 自定义标签（可选）
 * @returns 状态到文本的映射对象
 * 
 * @example
 * ```typescript
 * const stateText = createStateTextMap();
 * console.log(stateText['idle']); // '空闲'
 * ```
 */
export function createStateTextMap<T extends string>(
  customLabels?: Partial<Record<T, string>>
): Record<T, string> {
  const baseLabels: Record<string, string> = {
    idle: '空闲',
    connecting: '连接中...',
    connected: '已连接',
    stopped: '已停止',
    error: '错误',
  };
  
  return {
    ...baseLabels,
    ...customLabels,
  } as Record<T, string>;
}

/**
 * 默认状态文本映射（无自定义标签）
 */
export const defaultStateText = createStateTextMap<ComponentState>();

/**
 * 语音识别专用状态文本映射
 */
export const recognizerStateText = createStateTextMap<RecognizerState>({
  recording: '录音中...',
});

/**
 * 语音合成本专用状态文本映射
 */
export const synthesizerStateText = createStateTextMap<SynthesizerState>({
  synthesizing: '合成中...',
});

/**
 * 翻译专用状态文本映射
 */
export const translatorStateText = createStateTextMap<TranslatorState>({
  translating: '翻译中...',
});
