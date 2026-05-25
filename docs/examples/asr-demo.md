---
outline: deep
---

# 示例代码

::tip{icon=💡 title=实战示例}
从简单到复杂，手把手教你使用 xfyun-sdk
::

## ASR 语音识别示例

### 基础识别

```typescript
import { createRecognizer } from 'xfyun-sdk';

// 创建识别器
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

// 监听结果
recognizer.on('result', (text, isFinal) => {
  console.log('识别结果:', text);
  if (isFinal) {
    console.log('最终结果:', text);
  }
});

// 开始识别
async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recognizer.start();
}

// 停止识别
function stop() {
  recognizer.stop();
}

// 销毁实例
function destroy() {
  recognizer.destroy();
}
```

### 带热词识别

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  hotWords: ['讯飞', '语音', '识别', '人工智能'],
});

recognizer.on('result', (text) => {
  console.log(text);
});

recognizer.start();
```

### 医疗领域识别

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  domain: 'medical',
  language: 'zh_cn',
});

recognizer.on('result', (text) => {
  console.log('医疗识别结果:', text);
});

recognizer.start();
```

### 粤语识别

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  accent: 'cantonese',
});

recognizer.on('result', (text) => {
  console.log('粤语识别结果:', text);
});

recognizer.start();
```

### 英文识别

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  language: 'en_us',
});

recognizer.on('result', (text) => {
  console.log('英文识别结果:', text);
});

recognizer.start();
```

### Vue 3 组件

```vue
<script setup>
import { ref, onUnmounted } from 'vue';
import { createRecognizer } from 'xfyun-sdk';

const text = ref('');
const isRecording = ref(false);
const error = ref('');

const recognizer = createRecognizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
});

recognizer.on('result', (result, isFinal) => {
  text.value = result;
});

recognizer.on('error', (err) => {
  error.value = err.message;
  isRecording.value = false;
});

async function start() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recognizer.start();
    isRecording.value = true;
    error.value = '';
  } catch (err) {
    error.value = '无法获取麦克风权限';
  }
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
  <div class="asr-component">
    <div class="controls">
      <button @click="start" :disabled="isRecording">
        🎤 开始识别
      </button>
      <button @click="stop" :disabled="!isRecording">
        ⏹ 停止
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="result">
      <p v-if="!text" class="placeholder">点击开始识别...</p>
      <p v-else>{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
.asr-component {
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:first-child {
  background: #0066FF;
  color: white;
}

button:last-child {
  background: #f0f0f0;
}

.error {
  color: #ff4d4f;
  padding: 0.75rem;
  background: #fff2f0;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.result {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 100px;
}

.placeholder {
  color: #8c8c8c;
  margin: 0;
}
</style>
```

### React 组件

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { createRecognizer } from 'xfyun-sdk';

interface SpeechRecognizerProps {
  appId: string;
  apiKey: string;
  apiSecret: string;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
}

export function SpeechRecognizer({
  appId,
  apiKey,
  apiSecret,
  onResult,
  onError,
}: SpeechRecognizerProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    recognizerRef.current = createRecognizer({
      appId,
      apiKey,
      apiSecret,
    });

    const cleanup = recognizerRef.current.on('result', (result: string, isFinal: boolean) => {
      setText(result);
      onResult?.(result, isFinal);
    });

    recognizerRef.current.on('error', (err: Error) => {
      setError(err.message);
      setIsRecording(false);
      onError?.(err);
    });

    return () => {
      recognizerRef.current?.destroy();
      cleanup();
    };
  }, [appId, apiKey, apiSecret, onResult, onError]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recognizerRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('无法获取麦克风权限');
    }
  }, []);

  const stop = useCallback(() => {
    recognizerRef.current.stop();
    setIsRecording(false);
  }, []);

  return (
    <div className="asr-component">
      <div className="controls">
        <button onClick={start} disabled={isRecording}>
          🎤 开始识别
        </button>
        <button onClick={stop} disabled={!isRecording}>
          ⏹ 停止
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="result">
        {text ? <p>{text}</p> : <p className="placeholder">点击开始识别...</p>}
      </div>
    </div>
  );
}
```

---

## TTS 语音合成示例

### 基础合成

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

synthesizer.speak('你好，这是一个测试');
```

### 自定义发音人

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  voice_name: 'aisxiaofeng', // 小峰
  speed: 60,
  pitch: 55,
});

synthesizer.speak('你好，我是小峰');
```

### 保存音频文件

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

synthesizer.on('audio', (audioData: Blob) => {
  const url = URL.createObjectURL(audioData);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'speech.mp3';
  a.click();
  URL.revokeObjectURL(url);
});

synthesizer.speak('这是要保存的音频');
```

---

## 翻译示例

### 文本翻译

```typescript
import { XfyunTranslator } from 'xfyun-sdk';

const result = await XfyunTranslator.translateText({
  text: '你好，世界',
  from: 'cn',
  to: 'en',
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

console.log(result.text); // 'Hello, world'
```

### 语音翻译

```typescript
import { createTranslator } from 'xfyun-sdk';

const translator = createTranslator({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  type: 'asr',
  from: 'cn',
  to: 'en',
});

translator.on('result', (text, isFinal) => {
  console.log('翻译结果:', text);
});

translator.start();
```

---

## 下一步

- [❓ 故障排除](/guide/troubleshooting)
- [📖 完整 API 文档](/api/asr)
