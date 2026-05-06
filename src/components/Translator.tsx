/**
 * 翻译 React 组件
 * 
 * 基于 xfyun-sdk 的翻译 UI 组件
 * 使用共享模块减少代码重复
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  XfyunTranslator, 
  type TranslatorState, 
  type TranslatorType, 
  type SourceLanguage, 
  type TargetLanguage, 
  type TranslationResult, 
  type TranslatorError 
} from '../translator';
import type { TTSError } from '../types';
import {
  baseComponentStyles,
  getButtonStyle,
  translatorStateText,
} from './index';

// ============================================================================
// 组件属性类型
// ============================================================================

export interface TranslatorProps {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 翻译类型 */
  type?: TranslatorType;
  /** 源语言 */
  from?: SourceLanguage;
  /** 目标语言 */
  to?: TargetLanguage;
  /** 领域 */
  domain?: string;
  /** VAD 结束阈值 */
  vadEos?: number;
  /** 组件类名 */
  className?: string;
  /** 按钮类名 */
  buttonClassName?: string;
  /** 输入框类名 */
  inputClassName?: string;
  /** 结果容器类名 */
  resultClassName?: string;
  /** 是否显示原文 */
  showSourceText?: boolean;
  /** 是否显示译文 */
  showTargetText?: boolean;
  /** 开始回调 */
  onStart?: () => void;
  /** 停止回调 */
  onStop?: () => void;
  /** 错误回调 */
  onError?: (error: TTSError) => void;
}

// ============================================================================
// 组件实现
// ============================================================================

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
  }, [type, onError]);

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

  // 按钮样式（使用共享工具函数）
  const buttonStyle = useMemo(() => 
    getButtonStyle(
      baseComponentStyles.button,
      isTranslating,
      state === 'connecting' || state === 'error',
      'active'
    ),
    [state, isTranslating]
  );

  const isDisabled = state === 'connecting' || state === 'error';

  return (
    <div style={baseComponentStyles.container} className={className}>
      <textarea
        value={sourceText}
        onChange={handleTextChange}
        style={baseComponentStyles.textArea}
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
        <div style={baseComponentStyles.resultContainer} className={resultClassName}>
          {showSourceText && sourceText && (
            <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '10px', color: '#333' }}>
              <strong>原文：</strong>
              <br />
              {sourceText}
            </div>
          )}
          {showTargetText && (
            <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#2196F3', fontWeight: 'bold' as const }}>
              <strong>译文：</strong>
              <br />
              {targetText}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#757575', marginTop: '5px' }}>
        状态: {translatorStateText[state]}
      </div>

      <button
        style={{
          ...baseComponentStyles.button,
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
