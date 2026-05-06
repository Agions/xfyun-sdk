/**
 * 语音合成 React 组件
 * 
 * 基于 xfyun-sdk 的语音合成 UI 组件
 * 使用共享模块减少代码重复
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { XfyunTTS, SynthesizerState } from '../synthesizer';
import type { TTSAudioFormat, TTSVoiceName, TTSError } from '../types';
import {
  baseComponentStyles,
  getButtonStyle,
  synthesizerStateText,
} from './index';

// ============================================================================
// 组件属性类型
// ============================================================================

export interface SpeechSynthesizerProps {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 声音名称 */
  voiceName?: TTSVoiceName;
  /** 语速 */
  speed?: number;
  /** 音调 */
  pitch?: number;
  /** 音量 */
  volume?: number;
  /** 音频格式 */
  audioFormat?: TTSAudioFormat;
  /** 采样率 */
  sampleRate?: number;
  /** 开始回调 */
  onStart?: () => void;
  /** 停止回调 */
  onStop?: () => void;
  /** 错误回调 */
  onError?: (error: unknown) => void;
  /** 组件类名 */
  className?: string;
  /** 按钮类名 */
  buttonClassName?: string;
  /** 输入框类名 */
  inputClassName?: string;
  /** 是否显示进度 */
  showProgress?: boolean;
  /** 是否显示状态 */
  showStatus?: boolean;
}

// ============================================================================
// 组件实现
// ============================================================================

const SpeechSynthesizer: React.FC<SpeechSynthesizerProps> = ({
  appId,
  apiKey,
  apiSecret,
  voiceName = 'xiaoyan',
  speed = 50,
  pitch = 50,
  volume = 50,
  audioFormat = 'mp3',
  sampleRate = 16000,
  onStart,
  onStop,
  onError,
  className = '',
  buttonClassName = '',
  inputClassName = '',
  showProgress = true,
  showStatus = true,
}) => {
  const [text, setText] = useState<string>('你好，欢迎使用讯飞语音合成');
  const [state, setState] = useState<SynthesizerState>('idle');
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const synthesizerRef = useRef<XfyunTTS | null>(null);
  const isDestroyedRef = useRef(false);

  // 初始化语音合成实例
  useEffect(() => {
    if (!appId || !apiKey || !apiSecret) {
      console.error('缺少必要参数: appId, apiKey, apiSecret');
      return;
    }

    isDestroyedRef.current = false;

    const synthesizer = new XfyunTTS({
      appId,
      apiKey,
      apiSecret,
      voice_name: voiceName,
      speed,
      pitch,
      volume,
      audioFormat,
      sampleRate,
    }, {
      onStart: () => {
        if (isDestroyedRef.current) return;
        setState('synthesizing');
        onStart?.();
      },
      onStop: () => {
        if (isDestroyedRef.current) return;
        setState('stopped');
        onStop?.();
      },
      onEnd: () => {
        if (isDestroyedRef.current) return;
        setState('stopped');
        setAudioBlob(synthesizer.exportAudio());
      },
      onProgress: (current: number, total: number) => {
        if (isDestroyedRef.current) return;
        setProgress({ current, total });
      },
      onError: (error: TTSError) => {
        if (isDestroyedRef.current) return;
        setState('error');
        onError?.(error as unknown as Error);
      },
      onStateChange: (newState: SynthesizerState) => {
        if (isDestroyedRef.current) return;
        setState(newState);
      },
    });

    synthesizerRef.current = synthesizer;

    return () => {
      isDestroyedRef.current = true;
      synthesizer.destroy();
      synthesizerRef.current = null;
    };
  }, [appId, apiKey, apiSecret, voiceName, speed, pitch, volume, audioFormat, sampleRate]);

  // 开始合成
  const startSynthesis = useCallback(() => {
    if (synthesizerRef.current && !isDestroyedRef.current) {
      if (!text || text.trim().length === 0) {
        onError?.({ code: 20001, message: '合成文本不能为空' });
        return;
      }
      setAudioBlob(null);
      synthesizerRef.current.start(text);
    }
  }, [text, onError]);

  // 停止合成
  const stopSynthesis = useCallback(() => {
    if (synthesizerRef.current && !isDestroyedRef.current) {
      synthesizerRef.current.stop();
    }
  }, []);

  // 处理输入变化
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  // 下载音频
  const handleDownload = useCallback(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synthesis.${audioFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [audioBlob, audioFormat]);

  // 按钮点击事件
  const handleButtonClick = useCallback(() => {
    if (state === 'synthesizing') {
      stopSynthesis();
    } else {
      startSynthesis();
    }
  }, [state, startSynthesis, stopSynthesis]);

  // 按钮样式（使用共享工具函数）
  const buttonStyle = useMemo(() => 
    getButtonStyle(
      baseComponentStyles.button,
      state === 'synthesizing',
      state === 'connecting' || state === 'error',
      'active'
    ),
    [state]
  );

  // 进度条宽度
  const progressWidth = useMemo(() => {
    if (progress.total === 0) return '0%';
    return `${Math.round((progress.current / progress.total) * 100)}%`;
  }, [progress]);

  const isSynthesizing = state === 'synthesizing';
  const isDisabled = state === 'connecting' || state === 'error';

  return (
    <div style={baseComponentStyles.container} className={className}>
      <textarea
        value={text}
        onChange={handleTextChange}
        style={baseComponentStyles.input}
        className={inputClassName}
        placeholder="请输入要合成的文本"
      />

      <button
        style={buttonStyle}
        className={buttonClassName}
        onClick={handleButtonClick}
        disabled={isDisabled}
      >
        {isSynthesizing ? '停止合成' : '开始合成'}
      </button>

      {showStatus && (
        <div style={baseComponentStyles.status}>
          状态: {synthesizerStateText[state]}
        </div>
      )}

      {showProgress && isSynthesizing && progress.total > 0 && (
        <div style={{ width: '100%', marginTop: '10px' }}>
          <div style={baseComponentStyles.progressBarContainer}>
            <div style={{ ...baseComponentStyles.progressBar, width: progressWidth }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            {Math.round((progress.current / progress.total) * 100)}%
          </div>
        </div>
      )}

      {audioBlob && state === 'stopped' && (
        <button
          style={baseComponentStyles.downloadButton}
          onClick={handleDownload}
        >
          下载音频
        </button>
      )}
    </div>
  );
};

export default SpeechSynthesizer;
