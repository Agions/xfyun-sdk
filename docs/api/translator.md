---
outline: deep
next: /api/types
---

# Translator 翻译

::tip{icon=🌐 title=语音翻译和文本翻译}
支持 15+ 种语言互译，边说边译
::

## 快速使用

```typescript
import { createTranslator, XfyunTranslator } from 'xfyun-sdk';

// 文本翻译（静态方法）
const result = await XfyunTranslator.translateText({
  text: '你好',
  from: 'cn',
  to: 'en',
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

console.log(result); // 'hello'

// 语音翻译（实例方法）
const translator = createTranslator({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  type: 'asr', // 语音翻译模式
});

translator.on('result', (text) => {
  console.log('翻译结果:', text);
});

translator.start();
```

## 构造函数

```typescript
createTranslator(options: XfyunTranslatorOptions): Translator
```

### 参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|:-----|:-----|:------:|:----:|:-----|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `type` | `'asr' \| 'text'` | `'asr'` | ❌ | 翻译类型 |
| `from` | `SourceLanguage` | `'cn'` | ❌ | 源语言 |
| `to` | `TargetLanguage` | `'en'` | ❌ | 目标语言 |
| `domain` | `string` | `'iner'` | ❌ | 语音翻译场景 |
| `autoStart` | `boolean` | `false` | ❌ | 自动开始 |
| `vadEos` | `number` | `5000` | ❌ | VAD 超时 (ms) |

## 支持的语言

### 源语言 (SourceLanguage)

| 代码 | 语言 |
|------|------|
| `cn` | 中文 |
| `en` | 英文 |
| `ja` | 日语 |
| `ko` | 韩语 |
| `fr` | 法语 |
| `es` | 西班牙语 |
| `it` | 意大利语 |
| `de` | 德语 |
| `pt` | 葡萄牙语 |
| `vi` | 越南语 |
| `id` | 印尼语 |
| `ms` | 马来西亚语 |
| `ru` | 俄语 |
| `ar` | 阿拉伯语 |
| `hi` | 印地语 |
| `th` | 泰语 |

### 目标语言 (TargetLanguage)

支持所有源语言作为目标语言。

## 方法

### start()

开始翻译。

```typescript
translator.start(text?: string): Promise<void>
```

**参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 翻译文本（文本翻译模式必填，语音翻译模式可省略） |

### stop()

停止翻译。

```typescript
translator.stop(): void
```

### destroy()

销毁实例，释放资源。

```typescript
translator.destroy(): void
```

### getState()

获取当前状态。

```typescript
translator.getState(): TranslatorState
```

**返回值**：`'idle' \| 'connecting' \| 'connected' \| 'translating' \| 'stopped' \| 'error'`

### static translateText()

静态方法，文本翻译（无需实例化）。

```typescript
XfyunTranslator.translateText(options: {
  text: string;
  from: SourceLanguage;
  to: TargetLanguage;
  appId: string;
  apiKey: string;
  apiSecret: string;
  domain?: string;
}): Promise<TranslationResult>
```

**返回值**：

```typescript
interface TranslationResult {
  text: string;        // 翻译结果
  from: string;        // 源语言
  to: string;          // 目标语言
  confidence?: number; // 置信度
}
```

## 事件

### result

翻译结果更新时触发。

```typescript
translator.on('result', (text: string, isFinal: boolean) => {
  console.log('翻译结果:', text, '是否最终:', isFinal);
});
```

### start

翻译开始时触发。

```typescript
translator.on('start', () => {
  console.log('翻译开始');
});
```

### end

翻译结束时触发。

```typescript
translator.on('end', () => {
  console.log('翻译结束');
});
```

### error

发生错误时触发。

```typescript
translator.on('error', (error: XfyunError) => {
  console.error('翻译错误:', error);
});
```

## 类型定义

### XfyunTranslatorOptions

```typescript
interface XfyunTranslatorOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  type?: 'asr' | 'text';
  from?: SourceLanguage;
  to?: TargetLanguage;
  domain?: string;
  autoStart?: boolean;
  vadEos?: number;
  sampleRate?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### TranslatorState

```typescript
type TranslatorState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'translating'
  | 'stopped'
  | 'error';
```

### TranslationResult

```typescript
interface TranslationResult {
  text: string;
  from: string;
  to: string;
  confidence?: number;
}
```

## 示例

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

### 语音翻译（边说边译）

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

### 中日翻译

```typescript
const translator = createTranslator({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  from: 'cn',
  to: 'ja',
});

translator.on('result', (text) => {
  console.log('日语翻译:', text);
});

translator.start();
```

### 英法翻译

```typescript
const translator = createTranslator({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  from: 'en',
  to: 'fr',
});

translator.on('result', (text) => {
  console.log('法语翻译:', text);
});

translator.start();
```

## 常见问题

::details
<details>
<summary>翻译结果为空？</summary>

1. 检查源文本是否有效
2. 确认语言代码正确（如 `'cn'`、`'en'`、`'ja'`）
3. 增加超时时间配置

</details>
::

::details
<details>
<summary>语音翻译延迟高？</summary>

1. 检查网络连接
2. 减少背景噪音
3. 使用合适的 `vadEos` 设置

</details>
::

## 下一步

- [📖 类型定义](/api/types)
- [💡 翻译示例代码](/examples/translator-demo)
