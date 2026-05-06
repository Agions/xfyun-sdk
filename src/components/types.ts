/**
 * 共享组件类型定义
 * 
 * 提供所有 xfyun-sdk React 组件共享的基础类型
 */

import type { CSSProperties } from 'react';

// ============================================================================
// 基础组件属性
// ============================================================================

/**
 * 所有 xfyun-sdk 组件共享的基础属性
 */
export interface BaseComponentProps {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 组件根容器的 CSS 类名 */
  className?: string;
  /** 按钮的 CSS 类名 */
  buttonClassName?: string;
  /** 输入框的 CSS 类名 */
  inputClassName?: string;
  /** 开始时的回调 */
  onStart?: () => void;
  /** 停止时的回调 */
  onStop?: () => void;
  /** 错误时的回调 */
  onError?: (error: unknown) => void;
}

// ============================================================================
// 状态类型
// ============================================================================

/**
 * 组件状态类型
 */
export type ComponentState = 
  | 'idle'           // 空闲
  | 'connecting'     // 连接中
  | 'connected'      // 已连接
  | 'active'         // 活动中（录音/合成/翻译中）
  | 'stopped'        // 已停止
  | 'error';         // 错误

/**
 * 状态文本映射类型
 */
export type StateTextMap<T extends ComponentState> = Record<T, string>;

// ============================================================================
// 样式类型
// ============================================================================

/**
 * 共享样式对象类型
 */
export interface SharedComponentStyles {
  container: CSSProperties;
  button: CSSProperties;
  buttonActive: CSSProperties;
  buttonDisabled: CSSProperties;
  status: CSSProperties;
}
