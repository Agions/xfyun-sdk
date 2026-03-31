# XfyunTranslator API 文档

科大讯飞翻译 Web SDK，支持语音翻译（边说边译）和文本翻译两种模式。

## 导入

```typescript
import { XfyunTranslator } from 'xfyun-sdk';
```

## 构造函数

```typescript
new XfyunTranslator(options: XfyunTranslatorOptions, handlers?: TranslatorEventHandlers)
```

### XfyunTranslatorOptions

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `type` | `'asr' \| 'text'` | `'asr'` | ❌ | 翻译类型 |
| `from` | `SourceLanguage` | `'cn'` | ❌ | 源语言 |
| `to` | `TargetLanguage` | `'en'` | ❌ | 目标语言 |
| `domain` | `'iner' \| 'video' \| 'command' \| 'doc' \| 'phonecall' \| 'medical'` | `'iner'` | ❌ | 语音翻译场景 |
| `autoStart` | `boolean` | `false` | ❌ | 自动开始 |
| `vadEos` | `number` | `5000` | ❌ | VAD 超时(ms) |
| `sampleRate` | `number` | `16000` | ❌ | 采样率 |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | ❌ | 日志级别 |

## 语言类型

### SourceLanguage / TargetLanguage

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

## 方法

### start(text?)

开始翻译。

```typescript
public async start(text?: string): Promise<void>
```

**参数：**
- `text`: 翻译文本（文本翻译模式必填，语音翻译模式可省略）

### stop()

停止翻译。

```typescript
public stop(): void
```

### destroy()

销毁实例，释放资源。

```typescript
public destroy(): void
```

### getState()

获取当前状态。

```typescript
public getState(): TranslatorState
```

**返回值：** `'idle' | 'connecting' | 'connected' | 'translating' | 'stopped' | 'error'`

### static translateText()

静态方法，文本翻译（无需实例化）。

```typescript
public static async translateText(
  text: string,
  options: XfyunTranslatorOptions
): Promise<TranslationResult>
```

## 事件

### onStart

翻译开始时触发。

```typescript
onStart: () => void
```

### onEnd

翻译结束时触发。

```typescript
onEnd: () => void
```

### onStop

手动停止时触发。

```typescript
onStop: () => void
```

### onResult

翻译结果返回。

```typescript
onResult: (result: TranslationResult) => void
```

### onError

错误回调。

```typescript
onError: (error: TranslatorError) => void
```

### onStateChange

状态变化回调。

```typescript
onStateChange: (state: TranslatorState) => void
```

## TranslationResult

翻译结果对象：

```typescript
interface TranslationResult {
  /** 源语言 */
  sourceLanguage: SourceLanguage;
  /** 目标语言 */
  targetLanguage: TargetLanguage;
  /** 源文本 */
  sourceText: string;
  /** 翻译结果 */
  targetText: string;
  /** 是否为最终结果 */
  isFinal: boolean;
  /** 置信度 */
  confidence?: number;
}
```

## TranslatorState 状态机

| 状态 | 说明 |
|------|------|
| `idle` | ⏸️ 空闲状态 |
| `connecting` | 🔗 正在连接 |
| `connected` | ✅ 已连接 |
| `translating` | 🔊 翻译中 |
| `stopped` | ⏹️ 已停止 |
| `error` | ❌ 错误 |

## 使用示例

### 文本翻译

```typescript
import { XfyunTranslator } from 'xfyun-sdk';

// 方式一：使用静态方法
const result = await XfyunTranslator.translateText(
  '你好，世界！',
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    from: 'cn',
    to: 'en',
  }
);

console.log(result.sourceText); // 你好，世界！
console.log(result.targetText); // Hello, World!

// 方式二：使用实例
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
    onError: (error) => {
      console.error('翻译错误:', error);
    },
  }
);

translator.start('Hello, how are you?');
```

### 语音翻译（边说边译）

```typescript
import { XfyunTranslator } from 'xfyun-sdk';

const translator = new XfyunTranslator(
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    type: 'asr',
    from: 'cn',
    to: 'en',
    domain: 'iner',
    vadEos: 5000,
  },
  {
    onStart: () => console.log('翻译开始'),
    onResult: (result) => {
      console.log('源文:', result.sourceText);
      console.log('译文:', result.targetText);
      console.log('是否最终:', result.isFinal);
    },
    onEnd: () => console.log('翻译结束'),
    onError: (error) => {
      console.error('翻译错误:', error);
    },
  }
);

// 开始语音翻译
translator.start();

// 停止翻译
translator.stop();

// 销毁实例
translator.destroy();
```

### 多语言翻译

```typescript
// 中文 -> 英文
const cn2en = new XfyunTranslator({ from: 'cn', to: 'en' }, handlers);

// 英文 -> 日文
const en2ja = new XfyunTranslator({ from: 'en', to: 'ja' }, handlers);

// 日文 -> 韩文
const ja2ko = new XfyunTranslator({ from: 'ja', to: 'ko' }, handlers);

// 中文 -> 法文
const cn2fr = new XfyunTranslator({ from: 'cn', to: 'fr' }, handlers);
```

### 语音翻译场景

```typescript
// 日常对话
const iner = new XfyunTranslator({ domain: 'iner' }, handlers);

// 视频场景
const video = new XfyunTranslator({ domain: 'video' }, handlers);

// 命令控制
const command = new XfyunTranslator({ domain: 'command' }, handlers);

// 文档阅读
const doc = new XfyunTranslator({ domain: 'doc' }, handlers);

// 电话通话
const phonecall = new XfyunTranslator({ domain: 'phonecall' }, handlers);

// 医疗场景
const medical = new XfyunTranslator({ domain: 'medical' }, handlers);
```

### React Hooks 封装

```typescript
import { useState, useEffect, useRef } from 'react';
import { XfyunTranslator, XfyunTranslatorOptions, TranslationResult } from 'xfyun-sdk';

function useTranslator(options: Partial<XfyunTranslatorOptions>) {
  const translatorRef = useRef<XfyunTranslator | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    translatorRef.current = new XfyunTranslator(
      options as XfyunTranslatorOptions,
      {
        onStart: () => setIsTranslating(true),
        onEnd: () => setIsTranslating(false),
        onResult: (r) => setResult(r),
        onError: (e) => setError(e.message),
      }
    );

    return () => translatorRef.current?.destroy();
  }, []);

  const start = (text?: string) => translatorRef.current?.start(text);
  const stop = () => translatorRef.current?.stop();

  return { isTranslating, result, error, start, stop };
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 30001 | 翻译文本不能为空 |
| 30002 | WebSocket 连接错误 |
| 30003 | 文本翻译失败 |
| 30004 | 语音翻译 WebSocket 错误 |
| 30005 | 初始化失败 |

## 注意事项

1. **语音翻译需要麦克风权限**，确保在用户交互后调用 `start()`
2. **VAD（语音活动检测）** 通过 `vadEos` 参数控制说话停顿时自动结束的时间
3. **文本翻译** 可以直接调用静态方法 `translateText()`，无需手动管理实例
4. **多语言支持**，讯飞翻译支持 16 种语言的相互翻译
5. **语音翻译场景** 不同场景的识别率和翻译效果可能有差异，请根据实际场景选择

## 与 ASR + TTS 的组合使用

```typescript
import { XfyunASR } from './recognizer';
import { XfyunTranslator } from './translator';
import { XfyunTTS } from './synthesizer';

// 三者组合：语音识别 -> 翻译 -> 语音合成
const asr = new XfyunASR(asrOptions, {
  onRecognitionResult: (text) => {
    // 翻译
    translator.start(text);
  },
});

const translator = new XfyunTranslator(translatorOptions, {
  onResult: (result) => {
    // 合成语音
    tts.start(result.targetText);
  },
});

const tts = new XfyunTTS(ttsOptions, {
  onAudioData: (audioData) => {
    // 播放音频
    playAudio(audioData);
  },
});
```
