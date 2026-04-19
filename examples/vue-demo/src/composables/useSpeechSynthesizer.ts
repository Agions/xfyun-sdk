/**
 * xfyun-sdk Vue 3 Composable
 * 语音合成组合式函数
 */
import { ref, onUnmounted, type Ref, type ShallowRef } from 'vue';
import {
  XfyunTTS,
  type XfyunTTSOptions,
  type TTSEventHandlers,
  type SynthesizerState,
  type TTSVoiceName,
  type TTSAudioFormat,
} from 'xfyun-sdk';

export interface UseSpeechSynthesizerOptions {
  /** 讯飞应用 ID */
  appId: string;
  /** 讯飞 API Key */
  apiKey: string;
  /** 讯飞 API Secret */
  apiSecret: string;
  /** 音色名称，默认 xiaoyan */
  voiceName?: TTSVoiceName;
  /** 语速 0-100，默认 50 */
  speed?: number;
  /** 音调 0-100，默认 50 */
  pitch?: number;
  /** 音量 0-100，默认 50 */
  volume?: number;
  /** 音频格式，默认 mp3 */
  audioFormat?: TTSAudioFormat;
  /** 采样率，默认 16000 */
  sampleRate?: number;
}

export interface UseSpeechSynthesizerReturn {
  /** 是否正在合成中 */
  isSynthesizing: Ref<boolean>;
  /** 累积的音频数据 */
  audioData: Ref<ArrayBuffer | null>;
  /** 当前进度 */
  progress: Ref<{ current: number; total: number }>;
  /** 最近一次错误信息 */
  error: Ref<string | null>;
  /** 当前状态机状态 */
  state: Ref<SynthesizerState>;
  /** 开始合成 */
  start: (text: string) => void;
  /** 停止合成 */
  stop: () => void;
  /** 销毁实例 */
  destroy: () => void;
  /** 获取音频 Blob */
  getAudioBlob: () => Blob | null;
  /** 下载音频文件 */
  downloadAudio: (filename?: string) => void;
  /** 获取 MIME 类型 */
  getMimeType: () => string;
}

export function useSpeechSynthesizer(
  options: UseSpeechSynthesizerOptions
): UseSpeechSynthesizerReturn {
  const isSynthesizing = ref(false);
  const audioData = ref<ArrayBuffer | null>(null);
  const progress = ref({ current: 0, total: 0 });
  const error = ref<string | null>(null);
  const state = ref<SynthesizerState>('idle');

  // 使用 shallowRef 避免深层响应式
  const synthesizerRef: ShallowRef<XfyunTTS | null> = ref(null) as ShallowRef<XfyunTTS | null>;

  const handlers: TTSEventHandlers = {
    onStart: () => {
      isSynthesizing.value = true;
      error.value = null;
      audioData.value = null;
      progress.value = { current: 0, total: 0 };
    },
    onStop: () => {
      isSynthesizing.value = false;
    },
    onEnd: () => {
      isSynthesizing.value = false;
      // 获取累积的音频数据
      if (synthesizerRef.value) {
        audioData.value = synthesizerRef.value.getAudioData();
      }
    },
    onProgress: (current: number, total: number) => {
      progress.value = { current, total };
    },
    onAudioData: (data: ArrayBuffer) => {
      // 音频数据会累积在 synthesizer 内部
    },
    onError: (err: Error) => {
      error.value = err.message;
      isSynthesizing.value = false;
    },
    onStateChange: (s: SynthesizerState) => {
      state.value = s;
    },
  };

  const initSynthesizer = () => {
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      error.value = '缺少必要的 API 配置（appId / apiKey / apiSecret）';
      return;
    }

    try {
      synthesizerRef.value = new XfyunTTS(
        {
          appId: options.appId,
          apiKey: options.apiKey,
          apiSecret: options.apiSecret,
          voice_name: options.voiceName ?? 'xiaoyan',
          speed: options.speed ?? 50,
          pitch: options.pitch ?? 50,
          volume: options.volume ?? 50,
          audioFormat: options.audioFormat ?? 'mp3',
          sampleRate: options.sampleRate ?? 16000,
        },
        handlers
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化失败';
    }
  };

  initSynthesizer();

  const start = (text: string) => {
    if (!synthesizerRef.value) {
      error.value = 'Synthesizer 未初始化';
      return;
    }
    
    if (!text || text.trim().length === 0) {
      error.value = '合成文本不能为空';
      return;
    }

    error.value = null;
    audioData.value = null;
    synthesizerRef.value.start(text);
  };

  const stop = () => {
    synthesizerRef.value?.stop();
  };

  const destroy = () => {
    synthesizerRef.value?.destroy();
    synthesizerRef.value = null;
  };

  const getAudioBlob = (): Blob | null => {
    return synthesizerRef.value?.exportAudio() ?? null;
  };

  const downloadAudio = (filename: string = 'synthesis') => {
    synthesizerRef.value?.downloadAudio(filename);
  };

  const getMimeType = (): string => {
    return synthesizerRef.value?.getMimeType() ?? 'audio/mpeg';
  };

  // 组件卸载时自动销毁
  onUnmounted(() => {
    destroy();
  });

  return {
    isSynthesizing,
    audioData,
    progress,
    error,
    state,
    start,
    stop,
    destroy,
    getAudioBlob,
    downloadAudio,
    getMimeType,
  };
}
