---
outline: deep
---

# 翻译示例

::: tip
文本翻译和语音翻译的完整示例
:::

## 文本翻译

### 基础翻译

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

### 批量翻译

```typescript
import { XfyunTranslator } from 'xfyun-sdk';

const texts = ['你好', '世界', '欢迎', '使用'];

const results = await Promise.all(
  texts.map(text =>
    XfyunTranslator.translateText({
      text,
      from: 'cn',
      to: 'en',
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      apiSecret: 'YOUR_API_SECRET',
    })
  )
);

results.forEach((result, index) => {
  console.log(`${texts[index]} → ${result.text}`);
});
```

### 翻译器类

```vue
<script setup>
import { ref } from 'vue';
import { XfyunTranslator } from 'xfyun-sdk';

const inputText = ref('你好，世界');
const translatedText = ref('');
const fromLang = ref('cn');
const toLang = ref('en');
const isTranslating = ref(false);

const languages = [
  { code: 'cn', name: '中文' },
  { code: 'en', name: '英文' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '韩语' },
  { code: 'fr', name: '法语' },
  { code: 'es', name: '西班牙语' },
];

async function translate() {
  isTranslating.value = true;
  
  try {
    const result = await XfyunTranslator.translateText({
      text: inputText.value,
      from: fromLang.value,
      to: toLang.value,
      appId: import.meta.env.VITE_XFYUN_APP_ID,
      apiKey: import.meta.env.VITE_XFYUN_API_KEY,
      apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
    });
    
    translatedText.value = result.text;
  } catch (error) {
    console.error('翻译失败:', error);
  } finally {
    isTranslating.value = false;
  }
}

function swapLanguages() {
  [fromLang.value, toLang.value] = [toLang.value, fromLang.value];
  inputText.value = translatedText.value;
  translatedText.value = '';
}
</script>

<template>
  <div class="translator">
    <div class="language-selector">
      <select v-model="fromLang">
        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
      
      <button @click="swapLanguages" class="swap-btn">⇄</button>
      
      <select v-model="toLang">
        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>
    
    <div class="translation-area">
      <div class="input-section">
        <textarea
          v-model="inputText"
          placeholder="输入要翻译的文本..."
          :disabled="isTranslating"
        ></textarea>
      </div>
      
      <div class="output-section">
        <div class="output-text">
          {{ translatedText || '翻译结果将显示在这里' }}
        </div>
      </div>
    </div>
    
    <button @click="translate" :disabled="isTranslating || !inputText">
      {{ isTranslating ? '翻译中...' : '翻译' }}
    </button>
  </div>
</template>

<style scoped>
.translator {
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

select {
  padding: 0.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.swap-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e8e8e8;
  border-radius: 50%;
  background: #f8f9fa;
  cursor: pointer;
}

.translation-area {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-section, .output-section {
  flex: 1;
}

textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
}

.output-text {
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  min-height: 150px;
  white-space: pre-wrap;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #0066FF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
```

---

## 语音翻译

### 基础语音翻译

```typescript
import { createTranslator } from 'xfyun-sdk';

const translator = createTranslator({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  type: 'asr', // 语音翻译模式
  from: 'cn',
  to: 'en',
});

translator.on('result', (text, isFinal) => {
  console.log('翻译结果:', text);
  if (isFinal) {
    console.log('最终翻译:', text);
  }
});

translator.on('error', (error) => {
  console.error('翻译错误:', error);
});

async function startTranslation() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  translator.start();
}
```

### 语音翻译组件

```vue
<script setup>
import { ref, onUnmounted } from 'vue';
import { createTranslator } from 'xfyun-sdk';

const isTranslating = ref(false);
const translatedText = ref('');
const fromLang = ref('cn');
const toLang = ref('en');

const translator = createTranslator({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
  type: 'asr',
  from: fromLang.value,
  to: toLang.value,
});

translator.on('result', (text, isFinal) => {
  translatedText.value = text;
});

translator.on('error', (error) => {
  console.error('翻译错误:', error);
  isTranslating.value = false;
});

async function start() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    translator.start();
    isTranslating.value = true;
    translatedText.value = '';
  } catch (err) {
    console.error('无法获取麦克风:', err);
  }
}

function stop() {
  translator.stop();
  isTranslating.value = false;
}

onUnmounted(() => {
  translator.destroy();
});
</script>

<template>
  <div class="voice-translator">
    <div class="language-selector">
      <select v-model="fromLang">
        <option value="cn">中文</option>
        <option value="en">英文</option>
        <option value="ja">日语</option>
      </select>
      
      <span>→</span>
      
      <select v-model="toLang">
        <option value="en">英文</option>
        <option value="cn">中文</option>
        <option value="ja">日语</option>
      </select>
    </div>
    
    <div class="status">
      <div v-if="isTranslating" class="recording">
        <span class="pulse"></span>
        正在翻译...
      </div>
      <div v-else class="idle">
        点击开始翻译
      </div>
    </div>
    
    <div class="result">
      {{ translatedText || '翻译结果将显示在这里' }}
    </div>
    
    <div class="controls">
      <button @click="start" :disabled="isTranslating">
        🎤 开始翻译
      </button>
      <button @click="stop" :disabled="!isTranslating">
        ⏹ 停止
      </button>
    </div>
  </div>
</template>

<style scoped>
.voice-translator {
  padding: 1.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

select {
  padding: 0.5rem;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.status {
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
  border-radius: 6px;
}

.recording {
  color: #0066FF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pulse {
  width: 12px;
  height: 12px;
  background: #0066FF;
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.idle {
  color: #8c8c8c;
}

.result {
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  min-height: 100px;
  white-space: pre-wrap;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 0.75rem;
}

button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
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
</style>
```

---

## 多语言翻译

### 支持的语言列表

```typescript
import { XfyunTranslator } from 'xfyun-sdk';

const SUPPORTED_LANGUAGES = {
  cn: '中文',
  en: '英文',
  ja: '日语',
  ko: '韩语',
  fr: '法语',
  es: '西班牙语',
  it: '意大利语',
  de: '德语',
  pt: '葡萄牙语',
  vi: '越南语',
  id: '印尼语',
  ms: '马来西亚语',
  ru: '俄语',
  ar: '阿拉伯语',
  hi: '印地语',
  th: '泰语',
};

// 翻译所有语言
async function translateToAll(text: string) {
  const results: Record<string, string> = {};
  
  for (const [code, name] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (code !== 'cn') {
      const result = await XfyunTranslator.translateText({
        text,
        from: 'cn',
        to: code as any,
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_API_KEY',
        apiSecret: 'YOUR_API_SECRET',
      });
      
      results[code] = result.text;
    }
  }
  
  return results;
}
```

---

## 翻译历史

```typescript
import { createTranslator } from 'xfyun-sdk';

interface TranslationRecord {
  id: string;
  from: string;
  to: string;
  source: string;
  target: string;
  timestamp: number;
}

const history: TranslationRecord[] = [];

const translator = createTranslator({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  type: 'asr',
});

translator.on('result', (text, isFinal) => {
  if (isFinal) {
    const record: TranslationRecord = {
      id: Date.now().toString(),
      from: 'cn',
      to: 'en',
      source: text,
      target: text, // 实际翻译结果
      timestamp: Date.now(),
    };
    
    history.push(record);
    
    // 保存到本地存储
    localStorage.setItem('translation_history', JSON.stringify(history));
  }
});

// 加载历史
const savedHistory = localStorage.getItem('translation_history');
if (savedHistory) {
  history.push(...JSON.parse(savedHistory));
}
```

---

## 下一步

- [❓ 故障排除](/guide/troubleshooting)
- [📖 完整 API 文档](/api/translator)
