---
outline: deep
next: /api/asr
---

# ASR 语音识别

::: tip
支持中文、英文，多种方言和领域模型
:::

## 快速使用

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

recognizer.on('result', (text) => {
  console.log(text);
});

recognizer.start();
```

## 构造函数

```typescript
createRecognizer(options: XfyunASROptions): Recognizer
```

### 参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|:-----|:-----|:------:|:----:|:-----|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `language` | `'zh_cn' \| 'en_us'` | `'zh_cn'` | ❌ | 识别语言 |
| `domain` | `'iat' \| 'medical' \| 'assistant'` | `'iat'` | ❌ | 领域模型 |
| `accent` | `'mandarin' \| 'cantonese'` | `'mandarin'` | ❌ | 方言 |
| `vadEos` | `number` | `3000` | ❌ | 静音超时 (ms) |
| `autoStart` | `boolean` | `false` | ❌ | 自动开始 |

::: details
<details>
<summary>查看所有参数</summary>

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxAudioSize` | `number` | `1048576` | 最大音频字节数 |
| `hotWords` | `string[]` | `[]` | 热词列表 |
| `punctuation` | `boolean` | `true` | 自动标点 |
| `audioFormat` | `string` | `'audio/L16;rate=16000'` | 音频格式 |
| `enableReconnect` | `boolean` | `false` | 启用自动重连 |
| `reconnectAttempts` | `number` | `3` | 重连次数 |
| `reconnectInterval` | `number` | `3000` | 重连间隔 (ms) |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |

</details>
:::

## 方法

### start()

开始语音识别。

```typescript
recognizer.start(): Promise<void>
```

::: warning
需要先获取麦克风权限，建议在用户交互后调用。
:::

**使用示例**：

```typescript
async function startRecognition() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recognizer.start();
  } catch (err) {
    console.error('获取麦克风权限失败:', err);
  }
}
```

### stop()

停止语音识别。

```typescript
recognizer.stop(): void
```

停止后，WebSocket 连接会保持，可以再次调用 `start()` 继续识别。

### destroy()

销毁实例，释放所有资源。

```typescript
recognizer.destroy(): void
```

::: tip
**务必在组件卸载时调用**，避免资源泄漏。
:::

```typescript
// React
useEffect(() => {
  const recognizer = createRecognizer(options);
  return () => recognizer.destroy();
}, []);

// Vue
onUnmounted(() => {
  recognizer.destroy();
});
```

### getState()

获取当前识别状态。

```typescript
recognizer.getState(): RecognizerState
```

**返回值**：

| 状态 | 说明 |
|------|------|
| `'idle'` | 空闲状态 |
| `'connecting'` | 正在连接 |
| `'connected'` | 已连接 |
| `'recording'` | 录音中 |
| `'stopped'` | 已停止 |
| `'error'` | 错误状态 |

### getResult()

获取当前累积的识别结果。

```typescript
recognizer.getResult(): string
```

### clearResult()

清除当前识别结果。

```typescript
recognizer.clearResult(): void
```

### isRecording()

判断是否正在录音。

```typescript
recognizer.isRecording(): boolean
```

## 事件

### result

识别结果更新时触发。

```typescript
recognizer.on('result', (text: string, isFinal: boolean) => {
  console.log('结果:', text, '是否最终:', isFinal);
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 识别结果文本 |
| `isFinal` | `boolean` | 是否为最终结果 |

### error

发生错误时触发。

```typescript
recognizer.on('error', (error: XfyunError) => {
  console.error('错误:', error.code, error.message);
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `error` | `XfyunError` | 错误对象 |

### start

识别开始时触发。

```typescript
recognizer.on('start', () => {
  console.log('识别开始');
});
```

### end

识别结束时触发。

```typescript
recognizer.on('end', () => {
  console.log('识别结束');
});
```

### state-change

状态变化时触发。

```typescript
recognizer.on('state-change', (state: RecognizerState) => {
  console.log('状态变化:', state);
});
```

## 类型定义

### XfyunASROptions

```typescript
interface XfyunASROptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  language?: 'zh_cn' | 'en_us';
  domain?: 'iat' | 'medical' | 'assistant';
  accent?: 'mandarin' | 'cantonese';
  vadEos?: number;
  maxAudioSize?: number;
  autoStart?: boolean;
  hotWords?: string[];
  punctuation?: boolean | string;
  audioFormat?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  enableReconnect?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### RecognizerState

```typescript
type RecognizerState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'recording'
  | 'stopped'
  | 'error';
```

### XfyunError

```typescript
interface XfyunError {
  code: number;
  message: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  originalError?: unknown;
}
```

## 示例

### 基础识别

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

recognizer.on('result', (text) => {
  console.log(text);
});

recognizer.start();
```

### 带热词识别

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  hotWords: ['讯飞', '语音', '识别'],
});
```

### 医疗领域识别

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  domain: 'medical',
  language: 'zh_cn',
});
```

### 粤语识别

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  accent: 'cantonese',
});
```

## 常见问题

::: details
<details>
<summary>识别结果不准确怎么办？</summary>

1. 检查麦克风质量
2. 减少背景噪音
3. 使用热词提高特定词汇识别率
4. 选择合适的领域模型（如 `medical`、`assistant`）

</details>
:::

::: details
<details>
<summary>如何优化识别速度？</summary>

1. 启用 `enableReconnect` 保持连接
2. 合理设置 `vadEos` 静音超时时间
3. 使用 WebSocket 持久连接

</details>
:::

## 下一步

- [📖 TTS 语音合成](/api/tts)
- [📖 翻译 API](/api/translator)
- [💡 ASR 示例代码](/examples/asr-demo)
