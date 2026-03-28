<template>
  <div class="speech-recognizer">
    <!-- 状态栏 -->
    <div v-if="showStatus" class="status-bar">
      <span :class="['status-badge', state]">
        {{ STATE_TEXT[state] }}
      </span>
      <span v-if="error" class="error-text">❌ {{ error }}</span>
    </div>

    <!-- 音量可视化 -->
    <div v-if="showVolume" class="volume-section">
      <div class="volume-label">音量</div>
      <div class="volume-bar">
        <div
          class="volume-fill"
          :class="{ active: isListening }"
          :style="{ width: `${volume * 100}%` }"
        />
      </div>
    </div>

    <!-- 转写结果 -->
    <div v-if="showResult" class="transcript-section">
      <div class="transcript-header">
        <span>识别结果</span>
        <button class="clear-btn" @click="clearTranscript" :disabled="!transcript">
          🗑 清空
        </button>
      </div>
      <div class="transcript-box">
        <pre v-if="transcript">{{ transcript || '等待说话...' }}</pre>
        <pre v-else class="placeholder">等待说话...</pre>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="control-section">
      <button
        :class="['control-btn', { listening: isListening }]"
        :disabled="!appId || !apiKey || !apiSecret || !!error"
        @click="isListening ? stop() : start()"
      >
        <span class="btn-icon">{{ isListening ? '⏹' : '🎤' }}</span>
        <span class="btn-text">{{ isListening ? '停止识别' : '开始识别' }}</span>
      </button>

      <p v-if="!appId || !apiKey || !apiSecret" class="config-hint">
        ⚠️ 请在 <code>.env</code> 中配置讯飞 API 密钥
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpeechRecognizer } from '@/composables/useSpeechRecognizer';

const props = withDefaults(
  defineProps<{
    /** 讯飞应用 ID */
    appId: string;
    /** 讯飞 API Key */
    apiKey: string;
    /** 讯飞 API Secret */
    apiSecret: string;
    /** 识别语言 */
    language?: 'zh_cn' | 'en_us';
    /** 领域模型 */
    domain?: 'iat' | 'medical' | 'assistant';
    /** 方言 */
    accent?: 'mandarin' | 'cantonese';
    /** 静音检测超时 */
    vadEos?: number;
    /** 是否显示音量条 */
    showVolume?: boolean;
    /** 是否显示转写结果 */
    showResult?: boolean;
    /** 是否显示状态 */
    showStatus?: boolean;
  }>(),
  {
    language: 'zh_cn',
    domain: 'iat',
    accent: 'mandarin',
    vadEos: 3000,
    showVolume: true,
    showResult: true,
    showStatus: true,
  }
);

const emit = defineEmits<{
  start: [];
  stop: [];
  result: [text: string, isEnd: boolean];
  error: [error: Error];
}>();

const { isListening, transcript, error, volume, state, start, stop, clearTranscript } =
  useSpeechRecognizer({
    appId: props.appId,
    apiKey: props.apiKey,
    apiSecret: props.apiSecret,
    language: props.language,
    domain: props.domain,
    accent: props.accent,
    vadEos: props.vadEos,
  });

const STATE_TEXT: Record<string, string> = {
  idle: '⏸ 空闲',
  connecting: '🔗 连接中...',
  connected: '✅ 就绪',
  recording: '🎙 录音中',
  stopped: '⏹ 已停止',
  error: '❌ 错误',
};
</script>

<style scoped>
.speech-recognizer {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 28px;
}

.status-badge {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.status-badge.idle       { background: #f0f0f0; color: #888; }
.status-badge.connecting { background: #e3f2fd; color: #1565c0; }
.status-badge.connected  { background: #e8f5e9; color: #2e7d32; }
.status-badge.recording  {
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: white;
  animation: pulse-badge 1.5s ease-in-out infinite;
}
.status-badge.stopped    { background: #f5f5f5; color: #9e9e9e; }
.status-badge.error       { background: #ffebee; color: #c62828; }

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(255, 87, 34, 0); }
}

.error-text {
  font-size: 13px;
  color: #c62828;
}

/* 音量 */
.volume-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.volume-label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.volume-bar {
  height: 10px;
  background: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.volume-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 5px;
  transition: width 0.08s ease-out;
  width: 0%;
}

.volume-fill.active {
  background: linear-gradient(90deg, #ff9800, #ff5722);
}

/* 转写区域 */
.transcript-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.clear-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.transcript-box {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 14px;
  min-height: 100px;
  max-height: 220px;
  overflow-y: auto;
}

.transcript-box pre {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}

.transcript-box pre.placeholder {
  color: #bbb;
  font-style: italic;
}

/* 控制按钮 */
.control-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  background: linear-gradient(135deg, #4caf50, #43a047);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
  transition: all 0.25s ease;
  min-width: 180px;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.control-btn.listening {
  background: linear-gradient(135deg, #f44336, #e53935);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
  animation: pulse-btn 2s ease-in-out infinite;
}

.control-btn.listening:hover {
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
}

@keyframes pulse-btn {
  0%, 100% { box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4); }
  50% { box-shadow: 0 4px 25px rgba(244, 67, 54, 0.7); }
}

.control-btn:disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 18px;
}

.config-hint {
  font-size: 12px;
  color: #f44336;
  text-align: center;
}

.config-hint code {
  background: #fff3f3;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}
</style>
