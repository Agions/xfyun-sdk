import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { XfyunASR } from '../recognizer';
import { RecognizerState } from '../types';

// 组件的属性类型
export interface SpeechRecognizerProps {
  appId: string;
  apiKey: string;
  apiSecret: string;
  language?: 'zh_cn' | 'en_us';
  domain?: 'iat' | 'medical' | 'assistant';
  accent?: 'mandarin' | 'cantonese';
  hotWords?: string[];
  punctuation?: boolean;
  autoStart?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onResult?: (text: string, isEnd: boolean) => void;
  onError?: (error: unknown) => void;
  className?: string;
  buttonClassName?: string;
  buttonStartText?: string;
  buttonStopText?: string;
  showVolume?: boolean;
  showStatus?: boolean;
}

// CSS 样式 - 放在组件外只创建一次
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '50px',
    backgroundColor: '#2196F3',
    color: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s',
  },
  buttonRecording: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    cursor: 'not-allowed',
  },
  status: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#757575',
  },
  volumeContainer: {
    width: '100%',
    margin: '15px 0',
  },
  volumeBarContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: '#EEEEEE',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  volumeBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.1s',
  },
  result: {
    marginTop: '20px',
    padding: '15px',
    width: '100%',
    minHeight: '100px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    backgroundColor: '#F5F5F5',
    fontSize: '16px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
};

// 状态文本映射 - 放在组件外
const STATE_TEXT: Record<RecognizerState, string> = {
  idle: '空闲',
  connecting: '连接中...',
  connected: '已连接',
  recording: '录音中...',
  stopped: '已停止',
  error: '错误',
};

// 语音识别组件
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

  // 使用 ref 追踪状态，避免闭包问题
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
      // 先标记销毁状态，阻止所有异步回调触发 setState
      isDestroyedRef.current = true;
      // 直接 destroy（destroy 不触发任何回调），不再调 stop 避免 onStop -> setState on unmounted
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

  // 按钮样式 - 用 useMemo 避免每次渲染创建新对象
  const buttonStyle = useMemo(() => {
    if (state === 'connecting' || state === 'error') {
      return { ...styles.button, ...styles.buttonDisabled };
    }
    if (state === 'recording') {
      return { ...styles.button, ...styles.buttonRecording };
    }
    return styles.button;
  }, [state]);

  // 音量条宽度
  const volumeBarWidth = useMemo(() => `${Math.min(100, volume)}%`, [volume]);

  const isRecording = state === 'recording';
  const isDisabled = state === 'connecting' || state === 'error';

  return (
    <div style={styles.container} className={className}>
      <button
        style={buttonStyle}
        className={buttonClassName}
        onClick={handleButtonClick}
        disabled={isDisabled}
      >
        {isRecording ? buttonStopText : buttonStartText}
      </button>

      {showStatus && (
        <div style={styles.status}>
          状态: {STATE_TEXT[state]}
        </div>
      )}

      {showVolume && isRecording && (
        <div style={styles.volumeContainer}>
          <div style={styles.volumeBarContainer}>
            <div style={{ ...styles.volumeBar, width: volumeBarWidth }} />
          </div>
        </div>
      )}

      <div style={styles.result}>
        {recognitionText}
      </div>
    </div>
  );
};

export default SpeechRecognizer;
