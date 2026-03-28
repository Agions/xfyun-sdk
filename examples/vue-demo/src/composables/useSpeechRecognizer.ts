/**
 * xfyun-sdk Vue 3 Composable
 * 语音识别组合式函数
 */
import { ref, onUnmounted, type Ref, type ShallowRef } from 'vue';
import {
  XfyunASR,
  type XfyunASROptions,
  type ASREventHandlers,
  type RecognizerState,
} from 'xfyun-sdk';

export interface UseSpeechRecognizerOptions {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 识别语言，默认 zh_cn */
  language?: 'zh_cn' | 'en_us';
  /** 领域模型，默认 iat */
  domain?: 'iat' | 'medical' | 'assistant';
  /** 方言，默认 mandarin */
  accent?: 'mandarin' | 'cantonese';
  /** 静音检测超时(ms)，默认 3000 */
  vadEos?: number;
  /** 是否自动开始，默认 false */
  autoStart?: boolean;
}

export interface UseSpeechRecognizerReturn {
  /** 是否正在聆听 */
  isListening: Ref<boolean>;
  /** 累积的识别文本 */
  transcript: Ref<string>;
  /** 最近一次错误信息 */
  error: Ref<string | null>;
  /** 当前音量 0~1 */
  volume: Ref<number>;
  /** 当前状态机状态 */
  state: Ref<RecognizerState>;
  /** 开始识别 */
  start: () => Promise<void>;
  /** 停止识别 */
  stop: () => void;
  /** 销毁实例 */
  destroy: () => void;
  /** 清除转写文本 */
  clearTranscript: () => void;
  /** 获取当前识别结果 */
  getResult: () => string;
}

export function useSpeechRecognizer(
  options: UseSpeechRecognizerOptions
): UseSpeechRecognizerReturn {
  const isListening = ref(false);
  const transcript = ref('');
  const error = ref<string | null>(null);
  const volume = ref(0);
  const state = ref<RecognizerState>('idle');

  // 使用 shallowRef 避免深层响应式
  const recognizerRef: ShallowRef<XfyunASR | null> = ref(null) as ShallowRef<XfyunASR | null>;

  const handlers: ASREventHandlers = {
    onStart: () => {
      isListening.value = true;
      error.value = null;
    },
    onStop: () => {
      isListening.value = false;
    },
    onRecognitionResult: (text: string, isEnd: boolean) => {
      transcript.value += text;
      if (isEnd) {
        transcript.value += '\n';
      }
    },
    onProcess: (v: number) => {
      volume.value = v;
    },
    onError: (err: Error) => {
      error.value = err.message;
      isListening.value = false;
    },
    onStateChange: (s: RecognizerState) => {
      state.value = s;
    },
  };

  const initRecognizer = () => {
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      error.value = '缺少必要的 API 配置（appId / apiKey / apiSecret）';
      return;
    }

    try {
      recognizerRef.value = new XfyunASR(
        {
          appId: options.appId,
          apiKey: options.apiKey,
          apiSecret: options.apiSecret,
          language: options.language ?? 'zh_cn',
          domain: options.domain ?? 'iat',
          accent: options.accent ?? 'mandarin',
          vadEos: options.vadEos ?? 3000,
          autoStart: options.autoStart ?? false,
        },
        handlers
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化失败';
    }
  };

  initRecognizer();

  const start = async () => {
    if (!recognizerRef.value) {
      error.value = 'Recognizer 未初始化';
      return;
    }
    transcript.value = '';
    error.value = null;
    volume.value = 0;
    await recognizerRef.value.start();
  };

  const stop = () => {
    recognizerRef.value?.stop();
  };

  const destroy = () => {
    recognizerRef.value?.destroy();
    recognizerRef.value = null;
  };

  const clearTranscript = () => {
    transcript.value = '';
  };

  const getResult = (): string => {
    return recognizerRef.value?.getResult() ?? '';
  };

  // 组件卸载时自动销毁
  onUnmounted(() => {
    destroy();
  });

  return {
    isListening,
    transcript,
    error,
    volume,
    state,
    start,
    stop,
    destroy,
    clearTranscript,
    getResult,
  };
}
