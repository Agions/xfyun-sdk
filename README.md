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

> 🗣️ 科大讯飞语音识别（ASR）、语音合成（TTS）、翻译 Web SDK — 纯 TypeScript 编写的浏览器端语音解决方案，支持原生 JS、React、Vue 及微信小程序多端接入。

<p align="center">
  <img src="https://img.shields.io/badge/-WebSocket实时通讯-4A90E2?style=for-the-badge" alt="WebSocket"/>
  <img src="https://img.shields.io/badge/-TypeScript_First-3178C6?style=for-the-badge" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/-零依赖-4CAF50?style=for-the-badge" alt="Zero Deps"/>
  <img src="https://img.shields.io/badge/-React_Hooks-61DAFB?style=for-the-badge" alt="React"/>
  <img src="https://img.shields.io/badge/-Vue_Composables-42b883?style=for-the-badge" alt="Vue"/>
  <img src="https://img.shields.io/badge/-语音合成_TTS-FF6B6B?style=for-the-badge" alt="TTS"/>
  <img src="https://img.shields.io/badge/-翻译_Translator-9B59B6?style=for-the-badge" alt="Translator"/>
</p>

---

## 📑 目录

```
· 特性亮点
· 快速开始
· 架构设计
· 核心功能
  · ASR 语音识别
  · TTS 语音合成
  · Translator 翻译
· 完整示例
  · 原生 JavaScript
  · React Hooks
  · Vue 3 Composables
· API 参考
· 高级配置
· 框架集成
· 最佳实践
· 常见问题
· 更新日志
```

---

## ✨ 特性亮点

| 特性 | 说明 |
|------|------|
| 🎤 **ASR 实时识别** | WebSocket 全双工通信，边说边识别，低延迟 |
| 🔊 **TTS 流式合成** | 流式语音合成，支持多种音色、语速调节 |
| 🌐 **翻译支持** | 语音翻译（边说边译）+ 文本翻译，多语言 |
| 🤖 **智能 VAD 检测** | Silence detection，语音结束自动断句 |
| 🔁 **自动重连** | WebSocket 断开自动尝试重连，支持指数退避 |
| 🧩 **多端支持** | 原生 JS / React 组件 / Vue 3 组合式函数 / 微信小程序 |
| 📛 **TypeScript First** | 完整类型定义，无 any 遗漏 |
| 🛡️ **资源安全** | 完善 destroy 机制，组件卸载自动释放麦克风 |
| 📊 **分级日志** | debug / info / warn / error 四级可控 |
| ⚡ **零外部依赖** | 仅依赖 crypto-js，无其他运行时依赖 |
| 🌐 **SSR 兼容** | 自动检测浏览器环境，Next.js / Nuxt 下不报错 |

### 支持的功能矩阵

| 功能 | 语言/方言 | 格式 | 说明 |
|------|-----------|------|------|
| ASR 识别 | 普通话、粤语、英语 | webm/ogg | 实时语音转文字 |
| TTS 合成 | 40+ 音色 | mp3/wav/pcm | 文本转语音 |
| 翻译 | 16 种语言 | text/audio | 语音+文本翻译 |

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

### CDN 引入

```html
<script src="https://cdn.jsdelivr.net/npm/xfyun-sdk/dist/index.umd.js"></script>
<script>
  const { XfyunASR, XfyunTTS, XfyunTranslator } = window.xfyunSdk;
</script>
```

### 讯飞 API 密钥获取

1. 访问 [科大讯飞开放平台](https://www.xfyun.cn/)
2. 注册账号并登录
3. 创建应用 → 选择服务（语音听写 / 语音合成 / 翻译）
4. 在「应用管理」获取 `AppID`、`APIKey`、`APISecret`

> ⚠️ **安全提示**：请勿将密钥直接硬编码在前端代码中。推荐通过环境变量或后端服务中转。

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                        应用层                            │
│   React 组件  │  Vue 3 组合式  │  原生 JS  │  小程序    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                      XfyunSDK Core                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  XfyunASR    │  │  XfyunTTS    │  │ XfyunTranslator │
│  │  语音识别    │  │  语音合成    │  │    翻译      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AudioCapturer │  │ AudioPlayer  │  │ WSManager    │  │
│  │  (麦克风采集) │  │  (音频播放)  │  │ (WebSocket)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   VAD Engine │  │  Reconnector  │  │    Logger    │ │
│  │  (静音检测)  │  │  (自动重连)   │  │   (分级日志)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   讯飞 WebSocket API   │
              │  wss://iat-api.xfyun.cn │
              │  wss://tts-api.xfyun.cn │
              │  wss://itr-api.xfyun.cn │
              └─────────────────────────┘
```

---

## 🎤 ASR 语音识别

### 快速使用

```javascript
import { XfyunASR } from 'xfyun-sdk';

const recognizer = new XfyunASR(
  {
    appId: import.meta.env.VITE_XFYUN_APP_ID,
    apiKey: import.meta.env.VITE_XFYUN_API_KEY,
    apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
    language: 'zh_cn',
    accent: 'mandarin',
    vadEos: 3000,
  },
  {
    onStart: () => console.log('🟢 识别已开始'),
    onStop: () => console.log('🔴 识别已停止'),
    onRecognitionResult: (text, isEnd) => {
      console.log(`📝 ${isEnd ? '[最终]' : '[中间]'} ${text}`);
    },
    onProcess: (volume) => {
      const bar = '█'.repeat(Math.round(volume * 10));
      console.log(`🔊 ${bar}`);
    },
    onError: (error) => console.error('❌ 错误:', error),
  }
);

recognizer.start();
recognizer.stop();
recognizer.destroy();
```

---

## 🔊 TTS 语音合成

### 快速使用

```javascript
import { XfyunTTS } from 'xfyun-sdk';

const synthesizer = new XfyunTTS(
  {
    appId: import.meta.env.VITE_XFYUN_APP_ID,
    apiKey: import.meta.env.VITE_XFYUN_API_KEY,
    apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
    voice_name: 'xiaoyan',  // 青年女声
    speed: 50,               // 语速 0-100
    pitch: 50,               // 音调 0-100
    volume: 50,              // 音量 0-100
    audioFormat: 'mp3',      // mp3/wav/pcm
  },
  {
    onStart: () => console.log('🟢 合成开始'),
    onEnd: () => console.log('🔴 合成结束'),
    onAudioData: (audioData) => {
      // 流式音频数据
      console.log('收到音频:', audioData.byteLength, 'bytes');
    },
    onProgress: (current, total) => {
      console.log(`进度: ${current}/${total}`);
    },
    onError: (error) => console.error('❌ 错误:', error),
  }
);

// 开始合成
synthesizer.start('你好，这是语音合成测试。');

// 停止合成
synthesizer.stop();

// 销毁实例
synthesizer.destroy();
```

### TTS 发音人列表

| 类别 | 发音人 | 说明 |
|------|--------|------|
| 青年女声 | `xiaoyan` | 小燕（默认） |
| 青年女声 | `aisjiuxu` | 许久 |
| 青年女声 | `aisxiaoyuan` | 小媛 |
| 青年男声 | `aisxiaofeng` | 小峰 |
| 青年男声 | `aisnan` | 楠楠 |
| 中年男声 | `aisdarong` | 大荣 |
| 四川话 | `aisjiuyuan` | 四川话女声 |
| 东北话 | `aisxiaomao` | 东北话女声 |
| 童声 | `aisxiaowawa` | 童声 |
| 粤语 | `aisxiaoyan` | 粤语女声 |
| 英文 | `aisxiaoyaxi` | 英文女声-雅西 |

> 更多发音人请参考 [docs/api/TTS.md](./docs/api/TTS.md)

---

## 🌐 Translator 翻译

### 文本翻译

```javascript
import { XfyunTranslator } from 'xfyun-sdk';

// 方式一：静态方法（推荐）
const result = await XfyunTranslator.translateText(
  '你好，世界！',
  {
    appId: import.meta.env.VITE_XFYUN_APP_ID,
    apiKey: import.meta.env.VITE_XFYUN_API_KEY,
    apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
    from: 'cn',
    to: 'en',
  }
);

console.log(result.sourceText); // 你好，世界！
console.log(result.targetText); // Hello, World!

// 方式二：实例方法
const translator = new XfyunTranslator(
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    type: 'text',
    from: 'en',
    to: 'ja',
  },
  {
    onResult: (result) => {
      console.log('翻译结果:', result.targetText);
    },
  }
);

translator.start('Hello, how are you?');
```

### 语音翻译（边说边译）

```javascript
import { XfyunTranslator } from 'xfyun-sdk';

const translator = new XfyunTranslator(
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    type: 'asr',           // 语音翻译模式
    from: 'cn',            // 源语言：中文
    to: 'en',              // 目标语言：英文
    domain: 'iner',        // 场景：日常对话
    vadEos: 5000,          // 静音检测超时
  },
  {
    onStart: () => console.log('翻译开始'),
    onResult: (result) => {
      console.log('源文:', result.sourceText);
      console.log('译文:', result.targetText);
      console.log('是否最终:', result.isFinal);
    },
    onEnd: () => console.log('翻译结束'),
  }
);

// 开始语音翻译
translator.start();

// 停止翻译
translator.stop();

// 销毁实例
translator.destroy();
```

### 支持的语言

| 代码 | 语言 | 代码 | 语言 |
|------|------|------|------|
| `cn` | 中文 | `de` | 德语 |
| `en` | 英文 | `pt` | 葡萄牙语 |
| `ja` | 日语 | `vi` | 越南语 |
| `ko` | 韩语 | `id` | 印尼语 |
| `fr` | 法语 | `ms` | 马来西亚语 |
| `es` | 西班牙语 | `ru` | 俄语 |
| `it` | 意大利语 | `ar` | 阿拉伯语 |
| `hi` | 印地语 | `th` | 泰语 |

---

## 📖 完整示例

### 原生 JavaScript（ASR + TTS + 翻译）

```javascript
import { XfyunASR, XfyunTTS, XfyunTranslator } from 'xfyun-sdk';

// 配置
const config = {
  appId: 'your_app_id',
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret',
};

// ASR 实例
const asr = new XfyunASR(config, {
  onRecognitionResult: (text) => {
    console.log('识别:', text);
  },
});

// TTS 实例
const tts = new XfyunTTS({
  ...config,
  voice_name: 'xiaoyan',
  audioFormat: 'mp3',
}, {
  onAudioData: (data) => playAudio(data),
});

// 翻译实例
const translator = new XfyunTranslator({
  ...config,
  type: 'text',
  from: 'cn',
  to: 'en',
}, {
  onResult: (result) => {
    console.log('翻译:', result.targetText);
    tts.start(result.targetText);
  },
});

// 组合使用：识别 -> 翻译 -> 合成
asr.start();  // 开始识别

// 或者直接翻译文本
translator.start('今天天气真好！');
```

### React Hooks（推荐）

```tsx
import { useEffect, useRef, useState } from 'react';
import { XfyunASR, XfyunTTS, XfyunTranslator, XfyunASROptions } from 'xfyun-sdk';

// 语音识别 Hook
export function useSpeechRecognizer(options: Partial<XfyunASROptions>) {
  const recognizerRef = useRef<XfyunASR | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    recognizerRef.current = new XfyunASR(options as XfyunASROptions, {
      onStart: () => setIsListening(true),
      onStop: () => setIsListening(false),
      onRecognitionResult: (text, isEnd) => {
        setTranscript((prev) => (isEnd ? prev + text + '\n' : prev + text));
      },
    });
    return () => recognizerRef.current?.destroy();
  }, []);

  return {
    isListening,
    transcript,
    start: () => recognizerRef.current?.start(),
    stop: () => recognizerRef.current?.stop(),
  };
}
```

### Vue 3 Composables（推荐）

```typescript
import { ref, onUnmounted } from 'vue';
import { XfyunTTS, type XfyunTTSOptions } from 'xfyun-sdk';

export function useSpeechSynthesizer(options: Partial<XfyunTTSOptions>) {
  const synthesizerRef = ref<XfyunTTS | null>(null);
  const isSynthesizing = ref(false);
  const audioChunks = ref<ArrayBuffer[]>([]);

  const init = () => {
    synthesizerRef.value = new XfyunTTS(
      options as XfyunTTSOptions,
      {
        onStart: () => (isSynthesizing.value = true),
        onEnd: () => (isSynthesizing.value = false),
        onAudioData: (data) => audioChunks.value.push(data),
      }
    );
  };

  const speak = (text: string) => synthesizerRef.value?.start(text);
  const stop = () => synthesizerRef.value?.stop();
  const destroy = () => synthesizerRef.value?.destroy();

  init();
  onUnmounted(destroy);

  return { isSynthesizing, audioChunks, speak, stop, destroy };
}
```

---

## ⚙️ API 参考

### XfyunASROptions

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | `string` | — | 讯飞应用 ID |
| `apiKey` | `string` | — | 讯飞 API Key |
| `apiSecret` | `string` | — | 讯飞 API Secret |
| `language` | `'zh_cn' \| 'en_us'` | `'zh_cn'` | 识别语言 |
| `domain` | `'iat' \| 'medical' \| 'assistant'` | `'iat'` | 领域模型 |
| `accent` | `'mandarin' \| 'cantonese'` | `'mandarin'` | 方言 |
| `vadEos` | `number` | `3000` | 静音超时(ms) |
| `autoStart` | `boolean` | `false` | 自动开始 |
| `enableReconnect` | `boolean` | `false` | 启用重连 |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |

### XfyunTTSOptions

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | `string` | — | 讯飞应用 ID |
| `apiKey` | `string` | — | 讯飞 API Key |
| `apiSecret` | `string` | — | 讯飞 API Secret |
| `voice_name` | `TTSVoiceName` | `'xiaoyan'` | 发音人 |
| `speed` | `number` | `50` | 语速 0-100 |
| `pitch` | `number` | `50` | 音调 0-100 |
| `volume` | `number` | `50` | 音量 0-100 |
| `audioFormat` | `'mp3' \| 'wav' \| 'pcm'` | `'mp3'` | 音频格式 |
| `sampleRate` | `number` | `16000` | 采样率 |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |

### XfyunTranslatorOptions

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | `string` | — | 讯飞应用 ID |
| `apiKey` | `string` | — | 讯飞 API Key |
| `apiSecret` | `string` | — | 讯飞 API Secret |
| `type` | `'asr' \| 'text'` | `'asr'` | 翻译类型 |
| `from` | `SourceLanguage` | `'cn'` | 源语言 |
| `to` | `TargetLanguage` | `'en'` | 目标语言 |
| `domain` | `'iner' \| 'video' \| 'command'` | `'iner'` | 语音翻译场景 |
| `vadEos` | `number` | `5000` | VAD 超时(ms) |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |

### ASREventHandlers

| 回调 | 参数 | 说明 |
|------|------|------|
| `onStart` | `() => void` | 开始识别 |
| `onStop` | `() => void` | 停止识别 |
| `onRecognitionResult` | `(text: string, isEnd: boolean) => void` | 识别结果 |
| `onProcess` | `(volume: number) => void` | 实时音量 |
| `onError` | `(error: XfyunError) => void` | 错误回调 |
| `onStateChange` | `(state: RecognizerState) => void` | 状态变化 |

### RecognizerState 状态机

| 状态 | 说明 |
|------|------|
| `idle` | ⏸️ 空闲 |
| `connecting` | 🔗 连接中 |
| `connected` | ✅ 已连接 |
| `recording` | 🎙️ 录音中 |
| `stopped` | ⏹️ 已停止 |
| `error` | ❌ 错误 |

### XfyunASR 公开方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `start()` | `Promise<void>` | 开始语音识别 |
| `stop()` | `void` | 停止语音识别 |
| `destroy()` | `void` | 销毁实例，释放所有资源 |
| `getState()` | `RecognizerState` | 获取当前状态 |
| `getResult()` | `string` | 获取识别结果文本 |
| `clearResult()` | `void` | 清空识别结果 |
| `isRecording()` | `boolean` | 是否正在录音（新增） |
| `isDestroyed()` | `boolean` | 实例是否已销毁（新增） |

---

## 🔧 高级配置

### 热词识别（ASR）

```javascript
const recognizer = new XfyunASR({
  // ...
  hotWords: ['xfyun-sdk', '科大讯飞', '语音识别'],
}, handlers);
```

### TTS 多种音色

```javascript
// 青年女声
const tts1 = new XfyunTTS({ voice_name: 'xiaoyan' }, handlers);

// 青年男声
const tts2 = new XfyunTTS({ voice_name: 'aisxiaofeng' }, handlers);

// 四川话
const tts3 = new XfyunTTS({ voice_name: 'aisjiuyuan' }, handlers);

// 童声
const tts4 = new XfyunTTS({ voice_name: 'aisxiaowawa' }, handlers);
```

### 指数退避重连

```javascript
const recognizer = new XfyunASR({
  enableReconnect: true,
  reconnectAttempts: 5,
  reconnectInterval: 1000,
}, handlers);
```

---

## 💥 常见问题

### Q: 麦克风权限被拒绝？

在用户交互（点击按钮）后调用 `.start()`，避免浏览器自动播放策略拦截。

### Q: 识别结果为空？

1. 检查控制台日志（`logLevel: 'debug'`）
2. 确认 appId / apiKey / apiSecret 正确
3. 检查网络代理是否拦截 WebSocket
4. 确认讯飞应用已开通对应服务
5. 在 HTTPS 或 localhost 环境下测试

### Q: TTS 音频如何播放？

```javascript
synthesizer.onAudioData = async (audioData) => {
  const blob = new Blob([audioData], { type: synthesizer.getMimeType() });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
};
```

### Q: React/Vue 组件内存泄漏？

```tsx
// React
useEffect(() => {
  const recognizer = new XfyunASR(options, handlers);
  return () => recognizer.destroy();
}, []);
```

```typescript
// Vue 3
import { onUnmounted } from 'vue';
onUnmounted(() => recognizer?.destroy());
```

---

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。

---

## 📝 更新日志

### v1.2.0 (2026-04-20)

**测试覆盖率提升 🎉**

- **recognizer.ts**: 测试覆盖率从38.2%提升至58.1% (+19.9%)
- **translator.ts**: 测试覆盖率从32.94%提升至53.2% (+20.3%)
- **总体覆盖率**: 达到51.8%，超过jest.config.js设置的50%阈值

**关键修复**
- ✅ 资源泄漏修复: connectingTimer清理机制
- ✅ 栈溢出修复: arrayBufferToBase64分块处理优化
- ✅ TTS连接超时回退机制增强
- ✅ WebSocket集成测试完善

**新增测试文件**
- `xfyuws-integration.spec.ts`: WebSocket流程集成测试
- `recognizer-event.spec.ts`: 事件处理回调测试
- `translator-error.spec.ts`: 错误处理测试
- `recognizer-close.spec.ts`: close事件处理测试
- `translator-open.spec.ts`: open事件处理测试
- `recognizer-message.spec.ts`: message条件分支测试
- `translator-close.spec.ts`: close事件处理测试
- `recognizer-state.spec.ts`: 状态管理测试
- `translator-boundary.spec.ts`: 异步边界测试
- `comprehensive-coverage.spec.ts`: 综合测试套件
- `recognizer-remaining-coverage.spec.ts`: 剩余覆盖率覆盖测试
- `translator-remaining-coverage.spec.ts`: 剩余覆盖率覆盖测试
- `resource-leak-prevention.spec.ts`: 资源泄漏预防测试

**质量保证**
- 所有123个测试通过 ✅
- TypeScript编译检查通过 ✅
- ESLint代码规范检查通过 ✅
- 覆盖率阈值: jest.config.js设置50%，实际达到51.8% ✅

### v1.3.0 (2026-03-28)

**新增：**
- ✨ `examples/vue-demo/` 完整 Vue 3 + Vite 示例项目
- ✨ `useSpeechRecognizer` Vue 3 组合式函数（composable）
- ✨ `SpeechRecognizer.vue` 单文件组件（含音量条/状态徽章/动画）
- ✨ `XfyunTTS` 语音合成支持
- ✨ `XfyunTranslator` 翻译功能（文本翻译 + 语音翻译）
- ✨ 多种 TTS 音色（40+ 发音人）
- ✨ TTS 流式音频数据回调
- ✨ 支持 mp3/wav/pcm 音频格式
- ✨ 16 种语言翻译支持

**优化：**
- ⚡️ README 全面专业化设计（架构图、最佳实践、框架集成）
- ⚡️ CI workflow 切换为 pnpm
- ⚡️ 添加 npm 下载量 + CI + 覆盖率 Badge

**文档：**
- 📚 新增 `docs/api/TTS.md` / `Translator.md` API 文档
- 📚 新增 E2E 测试和性能测试

---

<p align="center">
  <a href="https://github.com/Agions/xfyun-sdk">⭐ Star</a>
  ·
  <a href="https://github.com/Agions/xfyun-sdk/issues">Bug Report</a>
  ·
  <a href="https://github.com/Agions/xfyun-sdk/pulls">Pull Request</a>
</p>
