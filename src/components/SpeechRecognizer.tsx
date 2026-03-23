import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XfyunASR } from '../recognizer';
import { XfyunASROptions, RecognizerState } from '../types';

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
  onError?: (error: any) => void;
  className?: string;
  buttonClassName?: string;
  buttonStartText?: string;
  buttonStopText?: string;
  showVolume?: boolean;
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
  buttonHover: {
    backgroundColor: '#1976D2',
  },
  buttonRecording: {
    backgroundColor: '#F44336',
  },
  buttonRecordingHover: {
    backgroundColor: '#D32F2F',
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
  volumeBar: (width: string) => ({
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.1s',
    width,
  }),
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
    // 检查必填参数
    if (!appId || !apiKey || !apiSecret) {
      console.error('缺少必要参数: appId, apiKey, apiSecret');
      return;
    }
    
    // 标记为未销毁
    isDestroyedRef.current = false;
    
    const options: XfyunASROptions = {
      appId,
      apiKey,
      apiSecret,
      language: language as 'zh_cn' | 'en_us',
      domain: domain as 'iat' | 'medical' | 'assistant',
      accent: accent as 'mandarin' | 'cantonese',
      hotWords,
      punctuation,
      autoStart,
    };
    
    // 创建讯飞语音识别实例
    recognizerRef.current = new XfyunASR(options, {
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
      onProcess: (volumeValue) => {
        if (isDestroyedRef.current) return;
        setVolume(volumeValue);
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
    
    // 如果设置了自动开始，则启动
    if (autoStart) {
      recognizerRef.current.start();
    }
    
    // 组件卸载时清理资源
    return () => {
      isDestroyedRef.current = true;
      if (recognizerRef.current) {
        // 使用 ref 中的状态而不是闭包中的 state
        const currentState = stateRef.current;
        if (currentState === 'recording' || currentState === 'connected') {
          recognizerRef.current.stop();
        }
        recognizerRef.current.destroy();
        recognizerRef.current = null;
      }
    };
  }, [appId, apiKey, apiSecret, language, domain, accent, hotWords, punctuation, autoStart, onStart, onStop, onResult, onError]);
  
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
  
  // 计算音量条宽度
  const getVolumeBarWidth = () => {
    return `${Math.min(100, volume)}%`;
  };
  
  // 获取状态文本
  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return '空闲';
      case 'connecting':
        return '连接中...';
      case 'connected':
        return '已连接';
      case 'recording':
        return '录音中...';
      case 'stopped':
        return '已停止';
      case 'error':
        return '错误';
      default:
        return '未知状态';
    }
  };
  
  // 获取按钮样式
  const getButtonStyle = () => {
    if (state === 'connecting' || state === 'error') {
      return { ...styles.button, ...styles.buttonDisabled };
    }
    
    if (state === 'recording') {
      return { ...styles.button, ...styles.buttonRecording };
    }
    
    return styles.button;
  };
  
  return (
    <div style={styles.container} className={className}>
      {/* 控制按钮 */}
      <button
        style={getButtonStyle()}
        className={buttonClassName}
        onClick={handleButtonClick}
        disabled={state === 'connecting' || state === 'error'}
      >
        {state === 'recording' ? buttonStopText : buttonStartText}
      </button>
      
      {/* 状态显示 */}
      {showStatus && (
        <div style={styles.status}>
          状态: {getStatusText()}
        </div>
      )}
      
      {/* 音量条 */}
      {showVolume && state === 'recording' && (
        <div style={styles.volumeContainer}>
          <div style={styles.volumeBarContainer}>
            <div
              style={styles.volumeBar(getVolumeBarWidth())}
            ></div>
          </div>
        </div>
      )}
      
      {/* 识别结果 */}
      <div style={styles.result}>
        {recognitionText}
      </div>
    </div>
  );
};

export default SpeechRecognizer;
