---
outline: deep
next: /guide/authentication
---

# 快速开始

::: tip
从安装到第一个语音识别应用，只需 3 分钟！
:::

## 安装

::: code-group
```bash [npm]
npm install xfyun-sdk
```

```bash [yarn]
yarn add xfyun-sdk
```

```bash [pnpm]
pnpm add xfyun-sdk
```

:::

## 配置讯飞账号

在使用本 SDK 之前，您需要：

1. 注册 [讯飞开放平台](https://console.xfyun.cn/) 账号
2. 创建应用，获取 **APPID**、**APIKey**、**APISecret**
3. 将凭证安全存储在环境变量中

::: warning
⚠️ **不要将 API 凭证硬编码在代码中！** 建议使用环境变量或密钥管理服务。
:::

### 环境变量配置

**Vite 项目**：
```env
# .env
VITE_XFYUN_APP_ID=your_app_id
VITE_XFYUN_API_KEY=your_api_key
VITE_XFYUN_API_SECRET=your_api_secret
```

**Next.js 项目**：
```env
# .env.local
NEXT_PUBLIC_XFYUN_APP_ID=your_app_id
NEXT_PUBLIC_XFYUN_API_KEY=your_api_key
NEXT_PUBLIC_XFYUN_API_SECRET=your_api_secret
```

## 语音识别 (ASR)

### 浏览器环境

```typescript
import { createRecognizer } from 'xfyun-sdk';

// 创建识别器实例
const recognizer = createRecognizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
  language: 'zh_cn',
  domain: 'iat',
});

// 监听识别结果
recognizer.on('result', (text, isFinal) => {
  console.log('识别结果:', text);
  if (isFinal) {
    console.log('最终结果:', text);
  }
});

// 监听错误
recognizer.on('error', (error) => {
  console.error('识别错误:', error.code, error.message);
});

// 开始识别
async function startRecognition() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recognizer.start();
  } catch (err) {
    console.error('获取麦克风权限失败:', err);
  }
}
```

### Vue 3 示例

```vue
<script setup>
import { ref, onUnmounted } from 'vue';
import { createRecognizer } from 'xfyun-sdk';

const text = ref('');
const isRecording = ref(false);

const recognizer = createRecognizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
});

recognizer.on('result', (result, isFinal) => {
  text.value = result;
});

recognizer.on('error', (error) => {
  console.error('识别错误:', error);
});

async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recognizer.start();
  isRecording.value = true;
}

function stop() {
  recognizer.stop();
  isRecording.value = false;
}

onUnmounted(() => {
  recognizer.destroy();
});
</script>

<template>
  <div class="recognizer">
    <button @click="start" :disabled="isRecording">开始识别</button>
    <button @click="stop" :disabled="!isRecording">停止</button>
    <p class="result">{{ text }}</p>
  </div>
</template>

<style scoped>
.recognizer {
  padding: 1rem;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>
```

### React 示例

```tsx
import { useState, useEffect, useRef } from 'react';
import { createRecognizer } from 'xfyun-sdk';

export function SpeechRecognizer() {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    recognizerRef.current = createRecognizer({
      appId: import.meta.env.VITE_XFYUN_APP_ID,
      apiKey: import.meta.env.VITE_XFYUN_API_KEY,
      apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
    });

    recognizerRef.current.on('result', (result: string) => {
      setText(result);
    });

    return () => {
      recognizerRef.current?.destroy();
    };
  }, []);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recognizerRef.current.start();
    setIsRecording(true);
  };

  const stop = () => {
    recognizerRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="recognizer">
      <button onClick={start} disabled={isRecording}>
        开始识别
      </button>
      <button onClick={stop} disabled={!isRecording}>
        停止
      </button>
      <p className="result">{text}</p>
    </div>
  );
}
```

## 语音合成 (TTS)

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
  voice_name: 'xiaoyan',
  speed: 50,
  pitch: 50,
});

// 播放文本
synthesizer.speak('你好，这是一个测试');

// 监听音频数据
synthesizer.on('audio', (audioData) => {
  // 处理音频数据
});

// 监听完成
synthesizer.on('complete', () => {
  console.log('合成完成');
});
```

## 翻译

```typescript
import { createTranslator } from 'xfyun-sdk';

// 文本翻译（静态方法）
const result = await XfyunTranslator.translateText({
  text: '你好',
  from: 'cn',
  to: 'en',
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
});

console.log(result); // 'hello'

// 语音翻译（实例方法）
const translator = createTranslator({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
  type: 'asr', // 语音翻译模式
  from: 'cn',
  to: 'en',
});

translator.on('result', (text) => {
  console.log('翻译结果:', text);
});

translator.start();
```

## 浏览器兼容性

| 浏览器 | 版本 | 支持情况 |
|--------|------|---------|
| Chrome | 33+ | ✅ 完全支持 |
| Firefox | 25+ | ✅ 完全支持 |
| Safari | 7+ | ✅ 完全支持 |
| Edge | 12+ | ✅ 完全支持 |
| Opera | 20+ | ✅ 完全支持 |

**需要浏览器支持**：
- ✅ WebSocket
- ✅ MediaDevices API (`getUserMedia`)
- ✅ AudioContext / webkitAudioContext
- ✅ Blob / URL.createObjectURL

## 下一步

- [📖 API 文档 - ASR](/api/asr)
- [📖 API 文档 - TTS](/api/tts)
- [📖 API 文档 - Translator](/api/translator)
- [💡 示例代码](/examples/asr-demo)
- [❓ 故障排除](/guide/troubleshooting)
