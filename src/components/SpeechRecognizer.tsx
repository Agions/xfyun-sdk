/**
 * 语音识别 React 组件
 * 
 * 基于 xfyun-sdk 的语音识别 UI 组件
 * 使用共享模块减少代码重复
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { XfyunASR } from '../recognizer';
import type { RecognizerState } from '../types';
import {
  baseComponentStyles,
  getButtonStyle,
  recognizerStateText,
} from './index';

// ============================================================================
// 组件属性类型
// ============================================================================

export interface SpeechRecognizerProps {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 语言 */
  language?: 'zh_cn' | 'en_us';
  /** 领域 */
  domain?: 'iat' | 'medical' | 'assistant';
  /** 口音 */
  accent?: 'mandarin' | 'cantonese';
  /** 热词 */
  hotWords?: string[];
  /** 是否启用标点 */
  punctuation?: boolean;
  /** 是否自动开始 */
  autoStart?: boolean;
  /** 开始回调 */
  onStart?: () => void;
  /** 停止回调 */
  onStop?: () => void;
  /** 识别结果回调 */
  onResult?: (text: string, isEnd: boolean) => void;
  /** 错误回调 */
  onError?: (error: unknown) => void;
  /** 组件类名 */
  className?: string;
  /** 按钮类名 */
  buttonClassName?: string;
  /** 开始按钮文本 */
  buttonStartText?: string;
  /** 停止按钮文本 */
  buttonStopText?: string;
  /** 是否显示音量条 */
  showVolume?: boolean;
  /** 是否显示状态 */
  showStatus?: boolean;
}

// ============================================================================
// 组件实现
// ============================================================================

const SpeechRecognizer: React.FC<SpeechRecognizerProps> = ({
  appId,
  apiKey,
  apiSecret,
  language = 'zh_cn',
  domain = 'iat',
  accent = 'mandarin',
  hotWords,
  punctuation = true,
  autoStart = false,
  onStart,
  onStop,
  onResult,
  onError,
  className = '',
  buttonClassName = '',
  buttonStartText = '开始录音',
  buttonStopText = '停止录音',
  showVolume = true,
  showStatus = true,
}) => {
  const [recognitionText, setRecognitionText] = useState<string>('');
  const [state, setState] = useState<RecognizerState>('idle');
  const [volume, setVolume] = useState<number>(0);

  const recognizerRef = useRef<XfyunASR | null>(null);
  const stateRef = useRef<RecognizerState>('idle');
  const isDestroyedRef = useRef(false);

  // 保持 stateRef 同步
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 初始化语音识别实例
  useEffect(() => {
    if (!appId || !apiKey || !apiSecret) {
      console.error('缺少必要参数: appId, apiKey, apiSecret');
      return;
    }

    isDestroyedRef.current = false;

    const recognizer = new XfyunASR({
      appId,
      apiKey,
      apiSecret,
      language: language as 'zh_cn' | 'en_us',
      domain: domain as 'iat' | 'medical' | 'assistant',
      accent: accent as 'mandarin' | 'cantonese',
      hotWords,
      punctuation,
      autoStart,
    }, {
      onStart: () => {
        if (isDestroyedRef.current) return;
        setState('recording');
        onStart?.();
      },
      onStop: () => {
        if (isDestroyedRef.current) return;
        setState('stopped');
        onStop?.();
      },
      onRecognitionResult: (text, isEnd) => {
        if (isDestroyedRef.current) return;
        setRecognitionText(prev => prev + text);
        onResult?.(text, isEnd);
      },
      onProcess: (vol) => {
        if (isDestroyedRef.current) return;
        setVolume(vol);
      },
      onError: (error) => {
        if (isDestroyedRef.current) return;
        setState('error');
        onError?.(error);
      },
      onStateChange: (newState) => {
        if (isDestroyedRef.current) return;
        setState(newState);
      }
    });

    recognizerRef.current = recognizer;

    if (autoStart) {
      recognizer.start();
    }

    return () => {
      isDestroyedRef.current = true;
      recognizer.destroy();
      recognizerRef.current = null;
    };
  }, [appId, apiKey, apiSecret, language, domain, accent, hotWords, punctuation, autoStart]);

  // 开始录音
  const startRecognition = useCallback(() => {
    if (recognizerRef.current && !isDestroyedRef.current) {
      setRecognitionText('');
      recognizerRef.current.start();
    }
  }, []);

  // 停止录音
  const stopRecognition = useCallback(() => {
    if (recognizerRef.current && !isDestroyedRef.current) {
      recognizerRef.current.stop();
    }
  }, []);

  // 处理按钮点击事件
  const handleButtonClick = useCallback(() => {
    if (stateRef.current === 'recording') {
      stopRecognition();
    } else {
      startRecognition();
    }
  }, [startRecognition, stopRecognition]);

  // 按钮样式（使用共享工具函数）
  const buttonStyle = useMemo(() => 
    getButtonStyle(
      baseComponentStyles.button,
      state === 'recording',
      state === 'connecting' || state === 'error',
      'recording'
    ),
    [state]
  );

  // 音量条宽度
  const volumeBarWidth = useMemo(() => `${Math.min(100, volume)}%`, [volume]);

  const isRecording = state === 'recording';
  const isDisabled = state === 'connecting' || state === 'error';

  return (
    <div style={baseComponentStyles.container} className={className}>
      <button
        style={buttonStyle}
        className={buttonClassName}
        onClick={handleButtonClick}
        disabled={isDisabled}
      >
        {isRecording ? buttonStopText : buttonStartText}
      </button>

      {showStatus && (
        <div style={baseComponentStyles.status}>
          状态: {recognizerStateText[state]}
        </div>
      )}

      {showVolume && isRecording && (
        <div style={{ width: '100%', margin: '15px 0' }}>
          <div style={baseComponentStyles.volumeBarContainer}>
            <div style={{ ...baseComponentStyles.volumeBar, width: volumeBarWidth }} />
          </div>
        </div>
      )}

      <div style={baseComponentStyles.resultContainer}>
        {recognitionText}
      </div>
    </div>
  );
};

export default SpeechRecognizer;
