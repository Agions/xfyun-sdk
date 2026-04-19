import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { XfyunTTS, SynthesizerState } from '../synthesizer';
import type { TTSAudioFormat, TTSVoiceName, TTSError } from '../types';

// 组件的属性类型
export interface SpeechSynthesizerProps {
  appId: string;
  apiKey: string;
  apiSecret: string;
  voiceName?: TTSVoiceName;
  speed?: number;
  pitch?: number;
  volume?: number;
  audioFormat?: TTSAudioFormat;
  sampleRate?: number;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
  buttonClassName?: string;
  inputClassName?: string;
  showProgress?: boolean;
  showStatus?: boolean;
}

// CSS 样式
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    gap: '15px',
  } as React.CSSProperties,
  input: {
    width: '100%',
    minHeight: '100px',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    resize: 'vertical' as const,
  } as React.CSSProperties,
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
  } as React.CSSProperties,
  buttonSynthesizing: {
    backgroundColor: '#FF9800',
  } as React.CSSProperties,
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  progress: {
    width: '100%',
    marginTop: '10px',
  } as React.CSSProperties,
  progressBarContainer: {
    width: '100%',
    height: '20px',
    backgroundColor: '#E0E0E0',
    borderRadius: '10px',
    overflow: 'hidden',
  } as React.CSSProperties,
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.3s',
  } as React.CSSProperties,
  status: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#757575',
  } as React.CSSProperties,
  downloadButton: {
    marginTop: '10px',
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #2196F3',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#2196F3',
    cursor: 'pointer',
    transition: 'all 0.3s',
  } as React.CSSProperties,
};

// 状态文本映射
const STATE_TEXT: Record<SynthesizerState, string> = {
  idle: '空闲',
  connecting: '连接中...',
  connected: '已连接',
  synthesizing: '合成中...',
  stopped: '已停止',
  error: '错误',
};

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
  }, [text]);

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

  // 按钮样式
  const buttonStyle = useMemo(() => {
    if (state === 'connecting' || state === 'error') {
      return { ...styles.button, ...styles.buttonDisabled };
    }
    if (state === 'synthesizing') {
      return { ...styles.button, ...styles.buttonSynthesizing };
    }
    return styles.button;
  }, [state]);

  // 进度条宽度
  const progressWidth = useMemo(() => {
    if (progress.total === 0) return '0%';
    return `${Math.round((progress.current / progress.total) * 100)}%`;
  }, [progress]);

  const isSynthesizing = state === 'synthesizing';
  const isDisabled = state === 'connecting' || state === 'error';

  return (
    <div style={styles.container} className={className}>
      <textarea
        value={text}
        onChange={handleTextChange}
        style={styles.input}
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
        <div style={styles.status}>
          状态: {STATE_TEXT[state]}
        </div>
      )}

      {showProgress && isSynthesizing && progress.total > 0 && (
        <div style={styles.progress}>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBar, width: progressWidth }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            {Math.round((progress.current / progress.total) * 100)}%
          </div>
        </div>
      )}

      {audioBlob && state === 'stopped' && (
        <button
          style={styles.downloadButton}
          onClick={handleDownload}
        >
          下载音频
        </button>
      )}
    </div>
  );
};

export default SpeechSynthesizer;