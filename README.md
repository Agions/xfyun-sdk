# 🎤 xfyun-sdk

<p align="center">
  <a href="https://www.npmjs.com/package/xfyun-sdk"><img src="https://img.shields.io/npm/v/xfyun-sdk.svg" alt="npm"/></a>
  <a href="https://www.npmjs.com/package/xfyun-sdk"><img src="https://img.shields.io/npm/dm/xfyun-sdk.svg" alt="npm downloads"/></a>
  <a href="https://github.com/Agions/xfyun-sdk/actions"><img src="https://img.shields.io/github/actions/workflow/status/Agions/xfyun-sdk/ci.yml" alt="CI"/></a>
  <a href="https://codecov.io/gh/Agions/xfyun-sdk"><img src="https://img.shields.io/codecov/c/github/Agions/xfyun-sdk" alt="Coverage"/></a>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-18.x-blue.svg" alt="React"/>
  <img src="https://img.shields.io/badge/Vue-3.x-42b883.svg" alt="Vue"/>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/xfyun-sdk.svg" alt="License: MIT"/></a>
</p>

> 🗣️ 科大讯飞语音识别（ASR）Web SDK — 纯 TypeScript 编写的浏览器端实时语音转文字解决方案，支持原生 JS、React、Vue 及微信小程序多端接入。

<p align="center">
  <img src="https://img.shields.io/badge/-WebSocket实时通讯-4A90E2?style=for-the-badge" alt="WebSocket"/>
  <img src="https://img.shields.io/badge/-TypeScript_First-3178C6?style=for-the-badge" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/-零依赖-4CAF50?style=for-the-badge" alt="Zero Deps"/>
  <img src="https://img.shields.io/badge/-React_Hooks-61DAFB?style=for-the-badge" alt="React"/>
  <img src="https://img.shields.io/badge/-Vue_Composables-42b883?style=for-the-badge" alt="Vue"/>
</p>

---

## 📑 目录

```
· 特性亮点
· 快速开始
· 架构设计
· 完整示例
  · 原生 JavaScript
  · React Hooks
  · Vue 3 Composables  ← 新增
  · Vue 3 组件          ← 新增
· API 参考
· 高级配置
· 框架集成
  · React 组件
  · Vue 3 组件          ← 新增
· 最佳实践
· 常见问题
· 更新日志
· 相关项目
```

---

## ✨ 特性亮点

| 特性 | 说明 |
|------|------|
| 🔄 **实时流式识别** | WebSocket 全双工通信，边说边识别，低延迟 |
| 🤖 **智能 VAD 检测** | Silence detection，语音结束自动断句 |
| 🔁 **自动重连** | WebSocket 断开自动尝试重连，支持指数退避 |
| 🧩 **多端支持** | 原生 JS / React 组件 / Vue 3 组合式函数 / 微信小程序 |
| 📛 **TypeScript First** | 完整类型定义，无 any 遗漏 |
| 🛡️ **资源安全** | 完善 destroy 机制，组件卸载自动释放麦克风 |
| 📊 **分级日志** | debug / info / warn / error 四级可控 |
| ⚡ **零外部依赖** | 仅依赖 crypto-js，无其他运行时依赖 |
| 🌐 **SSR 兼容** | 自动检测浏览器环境，Next.js / Nuxt 下不报错 |

### 支持的语言与场景

| 语言 | 方言/模式 | 适用场景 |
|------|-----------|---------|
| 中文 | 普通话、粤语 | 日常对话、聊天输入 |
| 英文 | 美式/英式 | 跨国沟通、外语学习 |
| 领域模式 | 医疗 (`medical`) | 病历录入、处方识别 |
| 领域模式 | 口语助手 (`assistant`) | 智能问答、语音交互 |

---

## 🚀 快速开始

### 安装

```bash
# npm
npm install xfyun-sdk

# pnpm
pnpm add xfyun-sdk

# yarn
yarn add xfyun-sdk
```

### CDN 引入（原型开发 / HTML 单文件）

```html
<script src="https://cdn.jsdelivr.net/npm/xfyun-sdk/dist/index.umd.js"></script>
<script>
  const { XfyunASR } = window.xfyunSdk;
  // ...
</script>
```

### 讯飞 API 密钥获取

1. 访问 [科大讯飞开放平台](https://www.xfyun.cn/)
2. 注册账号并登录
3. 创建应用 → 选择「语音听写 (iat)」服务
4. 在「应用管理」获取 `AppID`、`APIKey`、`APISecret`

> ⚠️ **安全提示**：请勿将 `AppID` / `APIKey` / `APISecret` 直接硬编码在前端代码中。推荐通过环境变量或自己的后端服务中转。

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                        应用层                            │
│   React 组件  │  Vue 3 组合式  │  原生 JS  │  小程序    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                     XfyunASR Core                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AudioCapturer │  │  WSManager   │  │  ResultParser │ │
│  │  (麦克风采集) │  │ (WebSocket)  │  │  (结果解析)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   VAD Engine │  │  Reconnector  │  │    Logger    │ │
│  │  (静音检测)  │  │  (自动重连)   │  │   (分级日志)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   讯飞 WebSocket API    │
              │  wss://iat-api.xfyun.cn │
              └─────────────────────────┘
```

### 识别流程

```
用户按下"开始"
      │
      ▼
申请麦克风权限
      │
      ▼
生成讯飞签名 ──► 建立 WebSocket 连接
      │              │
      │              ▼
      │         发送业务参数
      │              │
      ▼              ▼
浏览器录音 ◄───── 实时音频流
( MediaRecorder)      │
      │               ▼
      │         讯飞实时返回识别结果
      │               │
      ▼               ▼
回调 onResult() ◄── 回调 onResult()
      │
      ▼
用户按下"停止"
      │
      ▼
关闭 WebSocket + 释放麦克风
```

---

## 📖 完整示例

### 原生 JavaScript

```javascript
import { XfyunASR } from 'xfyun-sdk';

const recognizer = new XfyunASR(
  {
    appId: import.meta.env.VITE_XFYUN_APP_ID,
    apiKey: import.meta.env.VITE_XFYUN_API_KEY,
    apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
    language: 'zh_cn',
    domain: 'iat',
    accent: 'mandarin',
    vadEos: 3000,
    autoStart: false,
  },
  {
    onStart: () => console.log('🟢 识别已开始'),
    onStop: () => console.log('🔴 识别已停止'),
    onRecognitionResult: (text, isEnd) => {
      console.log(`📝 ${isEnd ? '[最终]' : '[中间]'} ${text}`);
    },
    onProcess: (volume) => {
      const bar = '█'.repeat(Math.round(volume * 10)) + '░'.repeat(10 - Math.round(volume * 10));
      console.log(`🔊 ${bar} ${Math.round(volume * 100)}%`);
    },
    onError: (error) => console.error('❌ 错误:', error),
  }
);

recognizer.start();
recognizer.stop();
recognizer.destroy();
```

### React Hooks（推荐）

```tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { XfyunASR, XfyunASROptions, ASREventHandlers } from 'xfyun-sdk';

export function useSpeechRecognizer(options: Partial<XfyunASROptions>) {
  const recognizerRef = useRef<XfyunASR | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlers: ASREventHandlers = {
    onStart: () => setIsListening(true),
    onStop: () => setIsListening(false),
    onRecognitionResult: (text, isEnd) => {
      setTranscript((prev) => (isEnd ? prev + text + '\n' : prev + text));
    },
    onError: (err) => setError(err.message),
  };

  useEffect(() => {
    recognizerRef.current = new XfyunASR(
      {
        appId: options.appId!,
        apiKey: options.apiKey!,
        apiSecret: options.apiSecret!,
        language: options.language ?? 'zh_cn',
        accent: options.accent ?? 'mandarin',
        vadEos: options.vadEos ?? 3000,
      },
      handlers
    );

    return () => recognizerRef.current?.destroy();
  }, []);

  const start = useCallback(() => recognizerRef.current?.start(), []);
  const stop = useCallback(() => recognizerRef.current?.stop(), []);

  return { isListening, transcript, error, start, stop };
}
```

### Vue 3 Composables（推荐）

```typescript
// composables/useSpeechRecognizer.ts
import { ref, onUnmounted, type Ref } from 'vue';
import { XfyunASR, type XfyunASROptions, type ASREventHandlers } from 'xfyun-sdk';

export interface UseSpeechRecognizerReturn {
  isListening: Ref<boolean>;
  transcript: Ref<string>;
  error: Ref<string | null>;
  volume: Ref<number>;
  state: Ref<string>;
  start: () => Promise<void>;
  stop: () => void;
  destroy: () => void;
}

export function useSpeechRecognizer(
  options: Partial<XfyunASROptions>
): UseSpeechRecognizerReturn {
  const isListening = ref(false);
  const transcript = ref('');
  const error = ref<string | null>(null);
  const volume = ref(0);
  const state = ref<'idle' | 'connecting' | 'connected' | 'recording' | 'stopped' | 'error'>('idle');

  let recognizer: XfyunASR | null = null;

  const handlers: ASREventHandlers = {
    onStart: () => {
      isListening.value = true;
    },
    onStop: () => {
      isListening.value = false;
    },
    onRecognitionResult: (text, isEnd) => {
      transcript.value += text;
      if (isEnd) transcript.value += '\n';
    },
    onProcess: (v) => {
      volume.value = v;
    },
    onError: (err) => {
      error.value = err.message;
      isListening.value = false;
    },
    onStateChange: (s) => {
      state.value = s;
    },
  };

  const initRecognizer = () => {
    if (!options.appId || !options.apiKey || !options.apiSecret) {
      error.value = '缺少必要的 API 配置（appId / apiKey / apiSecret）';
      return;
    }

    recognizer = new XfyunASR(
      {
        appId: options.appId,
        apiKey: options.apiKey,
        apiSecret: options.apiSecret,
        language: options.language ?? 'zh_cn',
        domain: options.domain ?? 'iat',
        accent: options.accent ?? 'mandarin',
        vadEos: options.vadEos ?? 3000,
        autoStart: false,
        ...options,
      },
      handlers
    );
  };

  initRecognizer();

  const start = async () => {
    if (!recognizer) {
      error.value = 'Recognizer 未初始化';
      return;
    }
    transcript.value = '';
    error.value = null;
    await recognizer.start();
  };

  const stop = () => {
    recognizer?.stop();
  };

  const destroy = () => {
    recognizer?.destroy();
    recognizer = null;
  };

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
  };
}
```

### Vue 3 SFC 组件

```vue
<!-- components/SpeechRecognizer.vue -->
<template>
  <div class="speech-recognizer">
    <!-- 状态指示器 -->
    <div class="status-bar">
      <span :class="['status-badge', state]">
        {{ STATE_TEXT[state] }}
      </span>
      <span v-if="error" class="error-text">{{ error }}</span>
    </div>

    <!-- 音量可视化 -->
    <div v-if="showVolume" class="volume-bar">
      <div class="volume-fill" :style="{ width: `${volume * 100}%` }" />
    </div>

    <!-- 转写结果 -->
    <div v-if="showResult" class="transcript-box">
      <pre>{{ transcript || '等待说话...' }}</pre>
    </div>

    <!-- 控制按钮 -->
    <button
      :class="['control-btn', { listening: isListening }]"
      :disabled="!appId || !apiKey || !apiSecret"
      @click="isListening ? stop() : start()"
    >
      {{ isListening ? '⏹ 停止' : '🎤 开始识别' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSpeechRecognizer } from './composables/useSpeechRecognizer';

const props = withDefaults(
  defineProps<{
    appId: string;
    apiKey: string;
    apiSecret: string;
    language?: 'zh_cn' | 'en_us';
    domain?: 'iat' | 'medical' | 'assistant';
    accent?: 'mandarin' | 'cantonese';
    vadEos?: number;
    autoStart?: boolean;
    showVolume?: boolean;
    showResult?: boolean;
    showStatus?: boolean;
  }>(),
  {
    language: 'zh_cn',
    domain: 'iat',
    accent: 'mandarin',
    vadEos: 3000,
    autoStart: false,
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

const { isListening, transcript, error, volume, state, start, stop } =
  useSpeechRecognizer({
    appId: props.appId,
    apiKey: props.apiKey,
    apiSecret: props.apiSecret,
    language: props.language,
    domain: props.domain,
    accent: props.accent,
    vadEos: props.vadEos,
    autoStart: props.autoStart,
  });

const STATE_TEXT: Record<string, string> = {
  idle: '⏸ 空闲',
  connecting: '🔗 连接中...',
  connected: '✅ 已连接',
  recording: '🎙 录音中',
  stopped: '⏹ 已停止',
  error: '❌ 错误',
};
</script>

<style scoped>
.speech-recognizer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  max-width: 480px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}
.status-badge.idle    { background: #f0f0f0; color: #666; }
.status-badge.connecting { background: #e3f2fd; color: #1565c0; }
.status-badge.connected  { background: #e8f5e9; color: #2e7d32; }
.status-badge.recording  { background: #fff3e0; color: #e65100; animation: pulse 1.5s infinite; }
.status-badge.stopped    { background: #f5f5f5; color: #9e9e9e; }
.status-badge.error       { background: #ffebee; color: #c62828; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.volume-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.volume-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.1s ease;
  border-radius: 4px;
}

.transcript-box {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  min-height: 80px;
  max-height: 200px;
  overflow-y: auto;
}
.transcript-box pre {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.control-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #4caf50;
  color: white;
  transition: all 0.2s;
}
.control-btn:hover:not(:disabled) {
  background: #43a047;
  transform: translateY(-1px);
}
.control-btn.listening {
  background: #f44336;
}
.control-btn.listening:hover {
  background: #e53935;
}
.control-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
```

### Vue 3 使用示例

```vue
<template>
  <div id="app">
    <SpeechRecognizer
      :app-id="appId"
      :api-key="apiKey"
      :api-secret="apiSecret"
      language="zh_cn"
      accent="mandarin"
      :show-volume="true"
      :show-result="true"
      :show-status="true"
      @result="onResult"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SpeechRecognizer from './components/SpeechRecognizer.vue';

const appId = import.meta.env.VITE_XFYUN_APP_ID;
const apiKey = import.meta.env.VITE_XFYUN_API_KEY;
const apiSecret = import.meta.env.VITE_XFYUN_API_SECRET;

const onResult = (text: string, isEnd: boolean) => {
  console.log(`识别结果 [${isEnd ? '最终' : '中间'}]:`, text);
};

const onError = (err: Error) => {
  console.error('识别错误:', err.message);
};
</script>
```

---

## ⚙️ API 参考

### XfyunASROptions

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `language` | `'zh_cn' \| 'en_us'` | `'zh_cn'` | ❌ | 识别语言 |
| `domain` | `'iat' \| 'medical' \| 'assistant'` | `'iat'` | ❌ | 领域模型 |
| `accent` | `'mandarin' \| 'cantonese'` | `'mandarin'` | ❌ | 方言 |
| `vadEos` | `number` | `3000` | ❌ | 静音超时(ms)，超时自动停止 |
| `maxAudioSize` | `number` | `1048576` | ❌ | 最大音频字节数 |
| `autoStart` | `boolean` | `false` | ❌ | 初始化后自动开始 |
| `hotWords` | `string[]` | `[]` | ❌ | 热词列表，提高特定词识别率 |
| `punctuation` | `boolean \| string` | `true` | ❌ | 自动加标点 |
| `audioFormat` | `string` | `'audio/L16;rate=16000'` | ❌ | 音频格式 |
| `enableReconnect` | `boolean` | `false` | ❌ | 启用自动重连 |
| `reconnectAttempts` | `number` | `3` | ❌ | 重连次数 |
| `reconnectInterval` | `number` | `3000` | ❌ | 重连间隔(ms)，支持指数退避 |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | ❌ | 日志级别 |

### ASREventHandlers

| 回调 | 参数 | 说明 |
|------|------|------|
| `onStart` | `() => void` | 开始识别时触发 |
| `onStop` | `() => void` | 停止识别时触发 |
| `onRecognitionResult` | `(text: string, isEnd: boolean) => void` | 识别结果，`isEnd=true` 表示最终结果 |
| `onProcess` | `(volume: number) => void` | 实时音量，0~1 |
| `onError` | `(error: Error) => void` | 错误回调 |
| `onStateChange` | `(state: RecognizerState) => void` | 状态变化 |

### RecognizerState 状态机

| 状态 | 说明 |
|------|------|
| `idle` | ⏸️ 初始空闲状态 |
| `connecting` | 🔗 正在建立 WebSocket 连接 |
| `connected` | ✅ 已连接，等待录音 |
| `recording` | 🎙️ 正在录音 |
| `stopped` | ⏹️ 已停止 |
| `error` | ❌ 发生错误 |

### 实例方法

```typescript
.start()           // 开始识别（申请麦克风 + 建立连接）
.stop()             // 停止识别（断开连接 + 释放麦克风）
.destroy()          // 销毁实例，释放所有资源（必须调用！）
.getResult()        // 获取当前累积的识别结果
.getState()         // 获取当前状态机状态
.clearResult()      // 清除当前识别结果（不清除状态）
.reset()            // 重置到 idle 状态
```

---

## 🔧 高级配置

### 热词识别

```javascript
const recognizer = new XfyunASR({
  // ...
  hotWords: ['xfyun-sdk', '科大讯飞', '语音识别'],
}, handlers);
```

### 自定义日志

```javascript
// 运行时修改日志级别
recognizer.logger.setLevel('debug');

// 禁用日志输出
recognizer.logger.setLevel('error');

// 获取原始 Logger 实例进行自定义
import { Logger, LogLevel } from 'xfyun-sdk';
const log = new Logger(LogLevel.DEBUG);
log.debug('Custom debug message');
```

### 指数退避重连

```javascript
const recognizer = new XfyunASR({
  // ...
  enableReconnect: true,
  reconnectAttempts: 5,
  reconnectInterval: 1000,  // 基础间隔 1s，实际按 2ⁿ 倍增长，上限 30s
}, handlers);
```

### SSR 环境使用

```javascript
import { isBrowser } from 'xfyun-sdk';

if (isBrowser()) {
  const recognizer = new XfyunASR(options, handlers);
  // ...
}
```

---

## 🧩 框架集成

### React 组件

```tsx
import { SpeechRecognizer } from 'xfyun-sdk';

function App() {
  return (
    <SpeechRecognizer
      appId="your_app_id"
      apiKey="your_api_key"
      apiSecret="your_api_secret"
      language="zh_cn"
      domain="iat"
      accent="mandarin"
      autoStart={false}
      showVolume={true}
      showStatus={true}
      onStart={() => console.log('开始识别')}
      onStop={() => console.log('停止识别')}
      onResult={(text, isEnd) => console.log('结果:', text, isEnd)}
      onError={(error) => console.error('错误:', error)}
    />
  );
}
```

> 📂 完整 React 示例：[examples/react-demo](./examples/react-demo/)

### Vue 3 组件

```vue
<template>
  <SpeechRecognizer
    :app-id="appId"
    :api-key="apiKey"
    :api-secret="apiSecret"
    language="zh_cn"
    accent="mandarin"
    :show-volume="true"
    :show-status="true"
    @result="(text, isEnd) => console.log('结果:', text, isEnd)"
    @error="(err) => console.error('错误:', err)"
  />
</template>

<script setup lang="ts">
import SpeechRecognizer from '@/components/SpeechRecognizer.vue';

const appId = import.meta.env.VITE_XFYUN_APP_ID;
const apiKey = import.meta.env.VITE_XFYUN_API_KEY;
const apiSecret = import.meta.env.VITE_XFYUN_API_SECRET;
</script>
```

> 📂 完整 Vue 示例：[examples/vue-demo/](./examples/vue-demo/)（规划中）

### 原生 HTML 示例

> 📂 完整 HTML 示例：[examples/html/](./examples/html/)

---

## 🎯 最佳实践

### ✅ 推荐做法

```javascript
// 1. 使用环境变量管理密钥
const options = {
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
};

// 2. 组件卸载时务必销毁
onUnmounted(() => recognizer.destroy()); // Vue
useEffect(() => { return () => recognizer.destroy(); }, []); // React

// 3. 捕获错误并上报
onError: (error) => {
  console.error(error);
  reportError(error);  // 上报到监控系统
};

// 4. Vue 中使用 onUnmounted 确保清理
import { onUnmounted } from 'vue';
onUnmounted(() => {
  recognizer?.destroy();
});
```

### ❌ 避免做法

```javascript
// ❌ 不要硬编码密钥
const options = {
  appId: '1234567',  // 危险！
  apiKey: 'abc123',
  apiSecret: 'secret',
};

// ❌ 不要忽略 destroy
const recognizer = new XfyunASR(options, handlers);
recognizer.start();
// 组件卸载时没有 destroy → 麦克风持续占用，内存泄漏

// ❌ 不要在 setup 外部创建 recognizer（Vue SFC）
// 错误：在 script setup 顶层创建，组件卸载时无法精准清理
const recognizer = new XfyunASR(options, handlers); // ❌
```

---

## 💥 常见问题

### Q: 麦克风权限被拒绝？

浏览器需要用户主动授权麦克风权限。建议在用户交互（如点击按钮）后调用 `.start()`，避免自动播放策略拦截。

```javascript
const btn = document.getElementById('start-btn');
btn.addEventListener('click', () => {
  // 用户点击后再调用，权限申请成功率更高
  recognizer.start();
});
```

### Q: 识别结果为空？

1. 检查控制台错误日志（`logLevel: 'debug'`）
2. 确认 `appId` / `apiKey` / `apiSecret` 完全正确
3. 检查网络代理是否拦截了 WebSocket 请求
4. 确认讯飞应用已开通「语音听写」服务
5. 尝试在 **HTTPS** 或 **localhost** 环境下运行

### Q: React/Vue 组件内存泄漏？

**React：**

```tsx
useEffect(() => {
  const recognizer = new XfyunASR(options, handlers);
  return () => recognizer.destroy(); // ✅ 正确
}, []);
```

**Vue 3：**

```typescript
import { onUnmounted } from 'vue';

onUnmounted(() => {
  recognizer?.destroy(); // ✅ 正确
});
```

### Q: CORS 跨域错误？

讯飞 WebSocket API 可能需要配置 CORS 白名单。请在讯飞控制台「应用管理」中添加你的前端域名。

---

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源，包含科大讯飞 [语音识别 API](https://www.xfyun.cn/) 的接口封装。

---

## 🙏 致谢

- [科大讯飞开放平台](https://www.xfyun.cn/) — 语音识别 API
- [Agions](https://github.com/Agions) — 核心开发

---

<p align="center">
  <a href="https://github.com/Agions/xfyun-sdk">⭐ Star</a>
  ·
  <a href="https://github.com/Agions/xfyun-sdk/issues">Bug Report</a>
  ·
  <a href="https://github.com/Agions/xfyun-sdk/pulls">Pull Request</a>
</p>
