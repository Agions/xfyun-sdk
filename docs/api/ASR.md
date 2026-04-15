# XfyunASR API 文档

科大讯飞语音识别（ASR）Web SDK，提供实时语音转文字功能。

## 导入

```typescript
import { XfyunASR } from 'xfyun-sdk';
```

## 构造函数

```typescript
new XfyunASR(options: XfyunASROptions, handlers?: ASREventHandlers)
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| options | `XfyunASROptions` | ✅ | 配置选项 |
| handlers | `ASREventHandlers` | ❌ | 事件处理函数 |

### XfyunASROptions

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `language` | `'zh_cn' \| 'en_us'` | `'zh_cn'` | ❌ | 识别语言 |
| `domain` | `'iat' \| 'medical' \| 'assistant'` | `'iat'` | ❌ | 领域模型 |
| `accent` | `'mandarin' \| 'cantonese'` | `'mandarin'` | ❌ | 方言 |
| `vadEos` | `number` | `3000` | ❌ | 静音超时(ms) |
| `maxAudioSize` | `number` | `1048576` | ❌ | 最大音频字节数 |
| `autoStart` | `boolean` | `false` | ❌ | 初始化后自动开始 |
| `hotWords` | `string[]` | `[]` | ❌ | 热词列表 |
| `punctuation` | `boolean \| string` | `true` | ❌ | 自动标点 |
| `audioFormat` | `string` | `'audio/L16;rate=16000'` | ❌ | 音频格式 |
| `enableReconnect` | `boolean` | `false` | ❌ | 启用自动重连 |
| `reconnectAttempts` | `number` | `3` | ❌ | 重连次数 |
| `reconnectInterval` | `number` | `3000` | ❌ | 重连间隔(ms) |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | ❌ | 日志级别 |

## 方法

### start()

开始语音识别。申请麦克风权限并建立 WebSocket 连接。

```typescript
public async start(): Promise<void>
```

### stop()

停止语音识别。关闭 WebSocket 连接并释放麦克风。

```typescript
public stop(): void
```

### destroy()

销毁实例，释放所有资源。**必须在组件卸载时调用**。

```typescript
public destroy(): void
```

### getState()

获取当前识别状态。

```typescript
public getState(): RecognizerState
```

**返回值：** `'idle' | 'connecting' | 'connected' | 'recording' | 'stopped' | 'error'`

### getResult()

获取当前累积的识别结果。

```typescript
public getResult(): string
```

### clearResult()

清除当前识别结果。

```typescript
public clearResult(): void
```

### isRecording()

判断是否正在录音。

```typescript
public isRecording(): boolean
```

### isDestroyed()

判断实例是否已销毁。

```typescript
public isDestroyed(): boolean
```

## 事件

### ASREventHandlers

| 事件 | 类型 | 说明 |
|------|------|------|
| `onStart` | `() => void` | 识别开始时触发 |
| `onStop` | `() => void` | 识别停止时触发 |
| `onRecognitionResult` | `(text: string, isEnd: boolean) => void` | 识别结果回调 |
| `onProcess` | `(volume: number) => void` | 音量进程回调 |
| `onError` | `(error: XfyunError) => void` | 错误回调 |
| `onStateChange` | `(state: RecognizerState) => void` | 状态变化回调 |

## RecognizerState 状态机

| 状态 | 说明 |
|------|------|
| `idle` | ⏸️ 空闲状态 |
| `connecting` | 🔗 正在连接 |
| `connected` | ✅ 已连接 |
| `recording` | 🎤 录音中 |
| `stopped` | ⏹️ 已停止 |
| `error` | ❌ 错误 |

## 使用示例

### 基础用法

```typescript
import { XfyunASR } from 'xfyun-sdk';

const recognizer = new XfyunASR(
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
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

// 开始识别
recognizer.start();

// 停止识别
recognizer.stop();

// 销毁实例
recognizer.destroy();
```

### 自动重连

```typescript
const recognizer = new XfyunASR(
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    enableReconnect: true,
    reconnectAttempts: 3,
    reconnectInterval: 3000,
  },
  handlers
);
```

### 热词识别

```typescript
const recognizer = new XfyunASR(
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    hotWords: ['讯飞', '语音识别', '人工智能'],
    punctuation: true,
  },
  handlers
);
```

### React Hooks 使用

```typescript
import { useEffect, useRef, useState } from 'react';
import { XfyunASR, XfyunASROptions } from 'xfyun-sdk';

export function useSpeechRecognizer(options: XfyunASROptions) {
  const recognizerRef = useRef<XfyunASR | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    recognizerRef.current = new XfyunASR(options, {
      onStart: () => setIsListening(true),
      onStop: () => setIsListening(false),
      onRecognitionResult: (text, isEnd) => {
        setTranscript((prev) => (isEnd ? prev + text + '\n' : prev + text));
      },
    });

    return () => recognizerRef.current?.destroy();
  }, [options]);

  return {
    isListening,
    transcript,
    start: () => recognizerRef.current?.start(),
    stop: () => recognizerRef.current?.stop(),
  };
}

// 使用
function App() {
  const { isListening, transcript, start, stop } = useSpeechRecognizer({
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
  });

  return (
    <div>
      <button onClick={start} disabled={isListening}>开始</button>
      <button onClick={stop} disabled={!isListening}>停止</button>
      <div>{transcript}</div>
    </div>
  );
}
```

### Vue 3 Composables 使用

```typescript
import { ref, onUnmounted } from 'vue';
import { XfyunASR, XfyunASROptions } from 'xfyun-sdk';

export function useSpeechRecognizer(options: XfyunASROptions) {
  const recognizer = ref<XfyunASR | null>(null);
  const isListening = ref(false);
  const transcript = ref('');

  const init = () => {
    recognizer.value = new XfyunASR(options, {
      onStart: () => (isListening.value = true),
      onStop: () => (isListening.value = false),
      onRecognitionResult: (text, isEnd) => {
        transcript.value += isEnd ? text + '\n' : text;
      },
    });
  };

  const start = () => recognizer.value?.start();
  const stop = () => recognizer.value?.stop();

  init();
  onUnmounted(() => recognizer.value?.destroy());

  return { isListening, transcript, start, stop };
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 10001 | 浏览器不支持语音识别功能 |
| 10003 | 启动语音识别失败 |
| 10004 | 停止语音识别失败 |
| 10005 | 解析消息失败 |
| 10009 | 录音出错 |

## 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 33+ |
| Firefox | 25+ |
| Safari | 7+ |
| Edge | 12+ |

需要浏览器支持：
- WebSocket
- MediaDevices API
- AudioContext / webkitAudioContext
