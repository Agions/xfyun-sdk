---
outline: deep
---

# TTS 示例

::tip{icon=🔊 title=语音合成实战}
从基础到高级，手把手教你使用 TTS
::

## 基础示例

### 简单文本合成

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

synthesizer.speak('你好，这是一个测试');
```

### 监听音频数据

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

synthesizer.on('audio', (audioData: Blob) => {
  const url = URL.createObjectURL(audioData);
  console.log('音频 URL:', url);
  
  // 可以播放或保存
  const audio = new Audio(url);
  audio.play();
});

synthesizer.speak('这是音频数据');
```

---

## 发音人示例

### 使用不同发音人

```typescript
import { createSynthesizer } from 'xfyun-sdk';

// 小燕（默认）
const synthesizer1 = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  voice_name: 'xiaoyan',
});

// 小峰
const synthesizer2 = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  voice_name: 'aisxiaofeng',
});

// 许久
const synthesizer3 = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  voice_name: 'aisjiuxu',
});
```

### 发音人选择器

```vue
<script setup>
import { ref } from 'vue';
import { createSynthesizer } from 'xfyun-sdk';

const voices = [
  { name: 'xiaoyan', label: '小燕（女声）' },
  { name: 'aisxiaofeng', label: '小峰（男声）' },
  { name: 'aisjiuxu', label: '许久（女声）' },
  { name: 'aisdarong', label: '大荣（男声）' },
];

const selectedVoice = ref('xiaoyan');
const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  voice_name: selectedVoice.value,
});

function speak() {
  synthesizer.speak('你好，我是' + selectedVoice.value);
}
</script>

<template>
  <div>
    <select v-model="selectedVoice">
      <option v-for="voice in voices" :key="voice.name" :value="voice.name">
        {{ voice.label }}
      </option>
    </select>
    <button @click="speak">播放</button>
  </div>
</template>
```

---

## 参数调整

### 语速和音调

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  voice_name: 'xiaoyan',
  speed: 60,   // 语速 0-100，默认 50
  pitch: 55,   // 音调 0-100，默认 50
  volume: 80,  // 音量 0-100，默认 50
});

synthesizer.speak('调整了语速和音调');
```

### 动态调整

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

// 正常速度
synthesizer.speak('正常速度');

// 慢速
synthesizer.speak('慢速', { speed: 30 });

// 快速
synthesizer.speak('快速', { speed: 80 });

// 高音调
synthesizer.speak('高音调', { pitch: 80 });
```

---

## 音频格式

### 不同格式输出

```typescript
import { createSynthesizer } from 'xfyun-sdk';

// MP3 格式
const synthesizer1 = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  audioFormat: 'mp3',
  sampleRate: 16000,
});

// WAV 格式
const synthesizer2 = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  audioFormat: 'wav',
  sampleRate: 22050,
});

// PCM 格式
const synthesizer3 = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  audioFormat: 'pcm',
  sampleRate: 16000,
});
```

---

## 保存音频文件

### 下载音频

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
  a.download = `speech_${Date.now()}.mp3`;
  a.click();
  URL.revokeObjectURL(url);
});

synthesizer.speak('这是要保存的音频');
```

### 批量保存

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const texts = ['你好', '世界', '欢迎使用'];
const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

texts.forEach((text, index) => {
  const synthesizer = createSynthesizer({
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
  });
  
  synthesizer.on('audio', (audioData: Blob) => {
    const url = URL.createObjectURL(audioData);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech_${index + 1}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  });
  
  synthesizer.speak(text);
});
```

---

## 流式播放

### 实时播放

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

const audioQueue: AudioBuffer[] = [];
let isPlaying = false;

synthesizer.on('audio', async (audioData: Blob) => {
  const arrayBuffer = await audioData.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioQueue.push(audioBuffer);
  
  if (!isPlaying) {
    playNext();
  }
});

function playNext() {
  if (audioQueue.length === 0) {
    isPlaying = false;
    return;
  }
  
  isPlaying = true;
  const buffer = audioQueue.shift();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
  source.onended = playNext;
}

synthesizer.speak('流式播放测试');
```

---

## Vue 3 组件

```vue
<script setup>
import { ref } from 'vue';
import { createSynthesizer } from 'xfyun-sdk';

const text = ref('你好，这是一个测试');
const isPlaying = ref(false);
const voices = [
  { name: 'xiaoyan', label: '小燕' },
  { name: 'aisxiaofeng', label: '小峰' },
  { name: 'aisjiuxu', label: '许久' },
];
const selectedVoice = ref('xiaoyan');

const synthesizer = createSynthesizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
  voice_name: selectedVoice.value,
});

synthesizer.on('start', () => {
  isPlaying.value = true;
});

synthesizer.on('complete', () => {
  isPlaying.value = false;
});

function speak() {
  synthesizer.speak(text.value);
}

function stop() {
  synthesizer.stop();
  isPlaying.value = false;
}
</script>

<template>
  <div class="tts-component">
    <textarea v-model="text" placeholder="输入要合成的文本..."></textarea>
    
    <div class="controls">
      <select v-model="selectedVoice">
        <option v-for="voice in voices" :key="voice.name" :value="voice.name">
          {{ voice.label }}
        </option>
      </select>
      
      <button @click="speak" :disabled="isPlaying">
        {{ isPlaying ? '播放中...' : '播放' }}
      </button>
      
      <button @click="stop" :disabled="!isPlaying">
        停止
      </button>
    </div>
  </div>
</template>

<style scoped>
.tts-component {
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
}

textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

select, button {
  padding: 0.5rem 1rem;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:first-of-type {
  background: #0066FF;
  color: white;
  border-color: #0066FF;
}
</style>
```

---

## React 组件

```tsx
import { useState, useRef, useEffect } from 'react';
import { createSynthesizer } from 'xfyun-sdk';

interface TTSSynthesizerProps {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

export function TTSSynthesizer({ appId, apiKey, apiSecret }: TTSSynthesizerProps) {
  const [text, setText] = useState('你好，这是一个测试');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('xiaoyan');
  const synthesizerRef = useRef<any>(null);

  useEffect(() => {
    synthesizerRef.current = createSynthesizer({
      appId,
      apiKey,
      apiSecret,
      voice_name: selectedVoice,
    });

    synthesizerRef.current.on('start', () => setIsPlaying(true));
    synthesizerRef.current.on('complete', () => setIsPlaying(false));

    return () => {
      synthesizerRef.current?.destroy();
    };
  }, [appId, apiKey, apiSecret, selectedVoice]);

  const speak = () => {
    synthesizerRef.current?.speak(text);
  };

  const stop = () => {
    synthesizerRef.current?.stop();
    setIsPlaying(false);
  };

  return (
    <div className="tts-component">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入要合成的文本..."
      />
      
      <div className="controls">
        <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
          <option value="xiaoyan">小燕</option>
          <option value="aisxiaofeng">小峰</option>
          <option value="aisjiuxu">许久</option>
        </select>
        
        <button onClick={speak} disabled={isPlaying}>
          {isPlaying ? '播放中...' : '播放'}
        </button>
        
        <button onClick={stop} disabled={!isPlaying}>
          停止
        </button>
      </div>
    </div>
  );
}
```

---

## 下一步

- [💡 翻译示例](/examples/translator-demo)
- [❓ 故障排除](/guide/troubleshooting)
