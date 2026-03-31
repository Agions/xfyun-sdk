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

## 事件

### onStart

识别开始时触发。

```typescript
onStart: () => void
```

### onStop

识别停止时触发。

```typescript
onStop: () => void
```

### onRecognitionResult

识别结果返回。

```typescript
onRecognitionResult: (text: string, isEnd: boolean) => void
```

**参数：**
- `text`: 识别文本
- `isEnd`: 是否为最终结果

### onProcess

实时音量回调。

```typescript
onProcess: (volume: number) => void
```

**参数：**
- `volume`: 音量值，范围 0~1

### onError

错误回调。

```typescript
onError: (error: XfyunError) => void
```

### onStateChange

状态变化回调。

```typescript
onStateChange: (state: RecognizerState) => void
```

## RecognizerState 状态机

| 状态 | 说明 |
|------|------|
| `idle` | ⏸️ 初始空闲状态 |
| `connecting` | 🔗 正在建立 WebSocket 连接 |
| `connected` | ✅ 已连接，等待录音 |
| `recording` | 🎙️ 正在录音 |
| `stopped` | ⏹️ 已停止 |
| `error` | ❌ 发生错误 |

## 使用示例

### 原生 JavaScript

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
    onStart: () => console.log('识别开始'),
    onStop: () => console.log('识别停止'),
    onRecognitionResult: (text, isEnd) => {
      console.log(`${isEnd ? '[最终]' : '[中间]'}: ${text}`);
    },
    onProcess: (volume) => {
      console.log(`音量: ${Math.round(volume * 100)}%`);
    },
    onError: (error) => {
      console.error('错误:', error);
    },
  }
);

// 开始识别
recognizer.start();

// 停止识别
recognizer.stop();

// 销毁实例
recognizer.destroy();
```

### React Hooks

```typescript
import { useEffect, useRef, useState } from 'react';
import { XfyunASR, XfyunASROptions, ASREventHandlers } from 'xfyun-sdk';

function useSpeechRecognizer(options: Partial<XfyunASROptions>) {
  const recognizerRef = useRef<XfyunASR | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const handlers: ASREventHandlers = {
      onStart: () => setIsListening(true),
      onStop: () => setIsListening(false),
      onRecognitionResult: (text, isEnd) => {
        setTranscript((prev) => (isEnd ? prev + text + '\n' : prev + text));
      },
    };

    recognizerRef.current = new XfyunASR(options as XfyunASROptions, handlers);

    return () => recognizerRef.current?.destroy();
  }, []);

  const start = () => recognizerRef.current?.start();
  const stop = () => recognizerRef.current?.stop();

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
| 10006 | WebSocket 连接错误 |
| 10007 | 发送音频数据失败 |
| 10008 | 发送开始帧失败 |
| 10009 | 录音出错 |

## 离线 ASR

离线识别引擎配置：

```typescript
interface OfflineASROptions {
  engine?: 'smsys';
  language?: 'zh_cn' | 'en_us';
  domain?: 'iat' | 'search' | 'commands';
  sampleRate?: 8000 | 16000;
  nbest?: number;
  wbest?: number;
}
```

> ⚠️ 离线 ASR 需要额外的离线引擎授权，请在讯飞控制台申请。

## 声纹识别基础接口

声纹识别（Speaker Verification）配置：

```typescript
interface SpeakerVerifyOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  scene: 'verify' | 'identify';
  engine_type: '21360' | '21361';
  user_id?: string;
  audioFormat?: 'wav' | 'pcm' | 'opus';
  sampleRate?: number;
}

interface SpeakerVerifyResult {
  success: boolean;
  score: number;
  user_id?: string;
  message?: string;
}
```

> ⚠️ 声纹识别功能需要单独的授权和集成。
