/**
 * xfyun-sdk Vue 3 Composable
 * 语音翻译组合式函数
 */
import { ref, onUnmounted, type Ref, type ShallowRef } from 'vue';
import {
  XfyunTranslator,
  type XfyunTranslatorOptions,
  type TranslatorEventHandlers,
  type TranslatorState,
  type TranslatorType,
  type SourceLanguage,
  type TargetLanguage,
} from 'xfyun-sdk';

export interface UseTranslatorOptions {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 翻译类型，默认 asr */
  type?: TranslatorType;
  /** 源语言，默认 cn */
  from?: SourceLanguage;
  /** 目标语言，默认 en */
  to?: TargetLanguage;
  /** 是否自动开始，默认 false */
  autoStart?: boolean;
}

export interface UseTranslatorReturn {
  /** 是否正在翻译中 */
  isTranslating: Ref<boolean>;
  /** 原始文本 */
  sourceText: Ref<string>;
  /** 翻译结果 */
  translatedText: Ref<string>;
  /** 最近一次错误信息 */
  error: Ref<string | null>;
  /** 当前状态机状态 */
  state: Ref<TranslatorState>;
  /** 开始翻译 */
  start: (text?: string) => Promise<void>;
  /** 停止翻译 */
  stop: () => void;
  /** 销毁实例 */
  destroy: () => void;
  /** 清除结果 */
  clearResult: () => void;
  /** 获取当前结果 */
  getResult: () => string;
}

export function useTranslator(
  options: UseTranslatorOptions
): UseTranslatorReturn {
  const isTranslating = ref(false);
  const sourceText = ref('');
  const translatedText = ref('');
  const error = ref<string | null>(null);
  const state = ref<TranslatorState>('idle');

  // 使用 shallowRef 避免深层响应式
  const translatorRef: ShallowRef<XfyunTranslator | null> = ref(null) as ShallowRef<XfyunTranslator | null>;

  const handlers: TranslatorEventHandlers = {
    onStart: () => {
      isTranslating.value = true;
      error.value = null;
    },
    onStop: () => {
      isTranslating.value = false;
    },
    onEnd: () => {
      isTranslating.value = false;
    },
    onResult: (result: string, isEnd: boolean) => {
      translatedText.value += result;
      if (isEnd) {
        translatedText.value += '\n';
      }
    },
    onSourceText: (text: string) => {
      sourceText.value += text;
    },
    onError: (err: Error) => {
      error.value = err.message;
      isTranslating.value = false;
    },
    onStateChange: (s: TranslatorState) => {
      state.value = s;
    },
  };

  const initTranslator = () => {
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      error.value = '缺少必要的 API 配置（appId / apiKey / apiSecret）';
      return;
    }

    try {
      translatorRef.value = new XfyunTranslator(
        {
          appId: options.appId,
          apiKey: options.apiKey,
          apiSecret: options.apiSecret,
          type: options.type ?? 'asr',
          from: options.from ?? 'cn',
          to: options.to ?? 'en',
          autoStart: options.autoStart ?? false,
        },
        handlers
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化失败';
    }
  };

  initTranslator();

  const start = async (text?: string) => {
    if (!translatorRef.value) {
      error.value = 'Translator 未初始化';
      return;
    }

    if (options.type === 'text' && text) {
      sourceText.value = text;
      await translatorRef.value.start(text);
    } else if (options.type === 'asr') {
      await translatorRef.value.start();
    }
  };

  const stop = () => {
    translatorRef.value?.stop();
  };

  const destroy = () => {
    translatorRef.value?.destroy();
    translatorRef.value = null;
  };

  const clearResult = () => {
    sourceText.value = '';
    translatedText.value = '';
  };

  const getResult = (): string => {
    return translatorRef.value?.getResult() ?? '';
  };

  // 组件卸载时自动销毁
  onUnmounted(() => {
    destroy();
  });

  return {
    isTranslating,
    sourceText,
    translatedText,
    error,
    state,
    start,
    stop,
    destroy,
    clearResult,
    getResult,
  };
}