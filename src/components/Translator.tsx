import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { XfyunTranslator, type TranslatorState, type TranslatorType, type SourceLanguage, type TargetLanguage, type TranslationResult, type TranslatorError } from '../translator';
import type { TTSError } from '../types';

// 组件属性类型
export interface TranslatorProps {
  appId: string;
  apiKey: string;
  apiSecret: string;
  type?: TranslatorType;
  from?: SourceLanguage;
  to?: TargetLanguage;
  domain?: string;
  vadEos?: number;
  className?: string;
  buttonClassName?: string;
  inputClassName?: string;
  resultClassName?: string;
  showSourceText?: boolean;
  showTargetText?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: TTSError) => void;
}

// CSS 样式
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,
  textArea: {
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    resize: 'vertical' as const,
    fontFamily: 'monospace',
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
  buttonTranslating: {
    backgroundColor: '#FF9800',
  } as React.CSSProperties,
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  resultContainer: {
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    padding: '15px',
    backgroundColor: '#FAFAFA',
  } as React.CSSProperties,
  sourceText: {
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '10px',
    color: '#333',
  } as React.CSSProperties,
  targetText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#2196F3',
    fontWeight: 'bold' as const,
  } as React.CSSProperties,
  status: {
    fontSize: '12px',
    color: '#757575',
    marginTop: '5px',
  } as React.CSSProperties,
};

// 状态文本映射
const STATE_TEXT: Record<TranslatorState, string> = {
  idle: '空闲',
  connecting: '连接中...',
  connected: '已连接',
  translating: '翻译中...',
  stopped: '已停止',
  error: '错误',
};

const Translator: React.FC<TranslatorProps> = ({
  appId,
  apiKey,
  apiSecret,
  type = 'text',
  from = 'cn',
  to = 'en',
  domain = 'iner',
  vadEos = 5000,
  className = '',
  buttonClassName = '',
  inputClassName = '',
  resultClassName = '',
  showSourceText = true,
  showTargetText = true,
  onStart,
  onStop,
  onError,
}) => {
  const [sourceText, setSourceText] = useState<string>('');
  const [targetText, setTargetText] = useState<string>('');
  const [state, setState] = useState<TranslatorState>('idle');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const translatorRef = useRef<XfyunTranslator | null>(null);
  const isDestroyedRef = useRef(false);

  // 初始化翻译实例
  useEffect(() => {
    if (!appId || !apiKey || !apiSecret) {
      console.error('缺少必要参数: appId, apiKey, apiSecret');
      return;
    }

    isDestroyedRef.current = false;

    const translator = new XfyunTranslator(
      {
        appId,
        apiKey,
        apiSecret,
        type,
        from,
        to,
        domain: (domain || 'iner') as any,
      },
      {
        onStart: () => {
          if (isDestroyedRef.current) return;
          setIsTranslating(true);
          setState('translating');
          onStart?.();
        },
        onStop: () => {
          if (isDestroyedRef.current) return;
          setIsTranslating(false);
          setState('stopped');
          onStop?.();
        },
        onEnd: () => {
          if (isDestroyedRef.current) return;
          setIsTranslating(false);
          setState('stopped');
        },
        onResult: (result: TranslationResult) => {
          if (isDestroyedRef.current) return;
          setTargetText(result.targetText);
          if (result.isFinal) {
            setTargetText(prev => prev + '\n');
          }
        },
        onError: (error: TranslatorError) => {
          if (isDestroyedRef.current) return;
          setState('error');
          onError?.(error);
        },
        onStateChange: (newState: TranslatorState) => {
          if (isDestroyedRef.current) return;
          setState(newState);
        },
      }
    );

    translatorRef.current = translator;

    return () => {
      isDestroyedRef.current = true;
      translator.destroy();
      translatorRef.current = null;
    };
  }, [appId, apiKey, apiSecret, type, from, to, domain, vadEos]);

  // 开始翻译
  const startTranslation = useCallback(async (text?: string) => {
    if (!translatorRef.current || isDestroyedRef.current) {
      onError?.({ code: 20001, message: 'Translator 未初始化' } as TTSError);
      return;
    }

    if (type === 'text') {
      if (!text || text.trim().length === 0) {
        onError?.({ code: 20001, message: '翻译文本不能为空' } as TTSError);
        return;
      }
      setSourceText(text);
      setTargetText('');
      await translatorRef.current.start(text);
    } else if (type === 'asr') {
      setSourceText('');
      setTargetText('');
      await translatorRef.current.start();
    }
  }, [type]);

  // 停止翻译
  const stopTranslation = useCallback(() => {
    translatorRef.current?.stop();
  }, []);

  // 处理输入变化
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value);
  }, []);

  // 清空结果
  const clearResults = useCallback(() => {
    setSourceText('');
    setTargetText('');
  }, []);

  // 按钮点击事件
  const handleButtonClick = useCallback(() => {
    if (isTranslating) {
      stopTranslation();
    } else {
      if (type === 'text') {
        startTranslation(sourceText);
      } else {
        startTranslation();
      }
    }
  }, [isTranslating, type, sourceText, startTranslation, stopTranslation]);

  // 按钮样式
  const buttonStyle = useMemo(() => {
    if (state === 'connecting' || state === 'error') {
      return { ...styles.button, ...styles.buttonDisabled };
    }
    if (isTranslating) {
      return { ...styles.button, ...styles.buttonTranslating };
    }
    return styles.button;
  }, [state, isTranslating]);

  const isDisabled = state === 'connecting' || state === 'error';

  return (
    <div style={styles.container} className={className}>
      <textarea
        value={sourceText}
        onChange={handleTextChange}
        style={styles.textArea}
        className={inputClassName}
        placeholder={type === 'text' ? '请输入要翻译的文本' : '点击开始语音翻译'}
        disabled={isTranslating}
      />

      <button
        style={buttonStyle}
        className={buttonClassName}
        onClick={handleButtonClick}
        disabled={isDisabled}
      >
        {isTranslating ? '停止翻译' : '开始翻译'}
      </button>

      {(showSourceText || showTargetText) && targetText && (
        <div style={styles.resultContainer} className={resultClassName}>
          {showSourceText && sourceText && (
            <div style={styles.sourceText}>
              <strong>原文：</strong>
              <br />
              {sourceText}
            </div>
          )}
          {showTargetText && (
            <div style={styles.targetText}>
              <strong>译文：</strong>
              <br />
              {targetText}
            </div>
          )}
        </div>
      )}

      <div style={styles.status}>
        状态: {STATE_TEXT[state]}
      </div>

      <button
        style={{
          ...styles.button,
          backgroundColor: 'transparent',
          color: '#757575',
        }}
        onClick={clearResults}
      >
        清空
      </button>
    </div>
  );
};

export default Translator;

