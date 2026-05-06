/**
 * 共享组件样式
 * 
 * 提供所有 xfyun-sdk React 组件共享的 CSS 样式
 * 使用 as const 确保类型安全
 */

import type { CSSProperties } from 'react';

/**
 * 基础组件样式
 */
export const baseComponentStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  } as CSSProperties,

  button: {
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#2196F3',
    color: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s',
    minWidth: '120px',
  } as CSSProperties,

  buttonActive: {
    backgroundColor: '#FF9800',
  } as CSSProperties,

  buttonRecording: {
    backgroundColor: '#F44336',
  } as CSSProperties,

  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    cursor: 'not-allowed' as const,
  } as CSSProperties,

  status: {
    fontSize: '14px',
    color: '#757575',
    marginTop: '10px',
  } as CSSProperties,

  textArea: {
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    resize: 'vertical' as const,
    fontFamily: 'monospace',
  } as CSSProperties,

  input: {
    width: '100%',
    minHeight: '100px',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    resize: 'vertical' as const,
  } as CSSProperties,

  resultContainer: {
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    padding: '15px',
    backgroundColor: '#F5F5F5',
    fontSize: '16px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    maxHeight: '200px',
    overflowY: 'auto' as const,
  } as CSSProperties,

  progressBarContainer: {
    width: '100%',
    height: '20px',
    backgroundColor: '#E0E0E0',
    borderRadius: '10px',
    overflow: 'hidden' as const,
  } as CSSProperties,

  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.3s',
  } as CSSProperties,

  volumeBarContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: '#EEEEEE',
    borderRadius: '5px',
    overflow: 'hidden' as const,
  } as CSSProperties,

  volumeBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.1s',
  } as CSSProperties,

  downloadButton: {
    marginTop: '10px',
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #2196F3',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#2196F3',
    cursor: 'pointer' as const,
    transition: 'all 0.3s',
  } as CSSProperties,

  clearButton: {
    marginTop: '10px',
    padding: '8px 16px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#757575',
    cursor: 'pointer' as const,
  } as CSSProperties,
} as const;

/**
 * 获取按钮样式（根据状态）
 */
export function getButtonStyle(
  base: typeof baseComponentStyles.button,
  isActive: boolean,
  isDisabled: boolean,
  activeVariant: 'active' | 'recording' = 'active'
): CSSProperties {
  if (isDisabled) {
    return { ...base, ...baseComponentStyles.buttonDisabled };
  }
  if (isActive) {
    return { 
      ...base, 
      ...(activeVariant === 'recording' 
        ? baseComponentStyles.buttonRecording 
        : baseComponentStyles.buttonActive) 
    };
  }
  return base;
}
