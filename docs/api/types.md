---
outline: deep
next: /api/utils
---

# 类型定义

::tip{icon=🛡️ title=完整的 TypeScript 类型}
所有公共 API 都有完整的类型定义
::

## ASR 类型

### RecognizerState

```typescript
export type RecognizerState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'recording'
  | 'stopped'
  | 'error';
```

| 状态 | 说明 |
|------|------|
| `idle` | 空闲状态 |
| `connecting` | 正在连接 |
| `connected` | 已连接 |
| `recording` | 录音中 |
| `stopped` | 已停止 |
| `error` | 错误状态 |

### XfyunASROptions

```typescript
export interface XfyunASROptions {
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

### ASREventHandlers

```typescript
export interface ASREventHandlers {
  onStart?: () => void;
  onStop?: () => void;
  onRecognitionResult?: (text: string, isEnd: boolean) => void;
  onProcess?: (volume: number) => void;
  onError?: (error: XfyunError) => void;
  onStateChange?: (state: RecognizerState) => void;
}
```

### XfyunError

```typescript
export interface XfyunError {
  code: number;
  message: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  originalError?: unknown;
  timestamp?: number;
  recoveryHint?: string;
}
```

---

## TTS 类型

### SynthesizerState

```typescript
export type SynthesizerState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'synthesizing'
  | 'stopped'
  | 'error';
```

### TTSAudioFormat

```typescript
export type TTSAudioFormat = 'mp3' | 'wav' | 'pcm';
```

### TTSVoiceName

```typescript
export type TTSVoiceName =
  | 'xiaoyan'      // 青年女声-小燕
  | 'aisjiuxu'     // 青年女声-许久
  | 'aisxping'     // 青年女声-小萍
  | 'aisjinger'    // 青年女声-京儿
  | 'aisbabyxu'    // 青年女声-小旭
  | 'aisxiaoyuan'  // 青年女声-小媛
  | 'aisxingchen'  // 青年女声-星辰
  | 'aisdengdeng'  // 青年女声-叮当
  | 'aisyaoyao'    // 青年女声-瑶瑶
  | 'aismall'      // 青年女声-小暖
  | 'aisxiaofeng'  // 青年男声-小峰
  | 'aisnan'       // 青年男声-楠楠
  | 'aisxiaosong'  // 青年男声-小松
  | 'aisxiaoyong'  // 青年男声-小勇
  | 'aisxiaowang'  // 青年男声-小王
  | 'aisxiaole'    // 青年男声-小乐
  | 'aisxiaoy'     // 青年男声-小宇
  | 'aisxiaolin'   // 青年男声-小林
  | 'aisxiaoming'  // 青年男声-小明
  | 'aisxiaogang'  // 青年男声-小刚
  | 'aisdarong'    // 中年男声-大荣
  | 'aisnvpeach'   // 中年女声-青娇
  | 'aisxiaowuma'  // 老年男声-无马
  | 'aisxiaorong'  // 老年男声-小荣
  | 'aischanghong' // 老年女声-长红
  | 'aisxiaoyaxi'  // 英文女声-雅西
  | 'aisjiuyuan'   // 四川话女声
  | 'aisxiaoxian'  // 陕西话女声-小贤
  | 'aisxiaomao'   // 东北话女声-小矛
  | 'aisxiaoli'    // 东北话女声-小黎
  | 'aisxiaokan'   // 河南话女声-小侃
  | 'aisxiaoning'  // 普通话男声-小宁
  | 'aismary'      // 英中双语女声
  | 'aisxiaowawa'  // 童声
  | 'aisxiao';     // 小...
```

### XfyunTTSOptions

```typescript
export interface XfyunTTSOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  voice_name?: TTSVoiceName | string;
  speed?: number;
  pitch?: number;
  volume?: number;
  accent?: string;
  audioFormat?: TTSAudioFormat;
  sampleRate?: number;
  autoStart?: boolean;
  enableCache?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### TTSEventHandlers

```typescript
export interface TTSEventHandlers {
  onStart?: () => void;
  onComplete?: () => void;
  onAudio?: (audioData: Blob) => void;
  onError?: (error: XfyunError) => void;
  onStateChange?: (state: SynthesizerState) => void;
}
```

---

## Translator 类型

### TranslatorState

```typescript
export type TranslatorState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'translating'
  | 'stopped'
  | 'error';
```

### SourceLanguage

```typescript
export type SourceLanguage = 
  | 'cn'  // 中文
  | 'en'  // 英文
  | 'ja'  // 日语
  | 'ko'  // 韩语
  | 'fr'  // 法语
  | 'es'  // 西班牙语
  | 'it'  // 意大利语
  | 'de'  // 德语
  | 'pt'  // 葡萄牙语
  | 'vi'  // 越南语
  | 'id'  // 印尼语
  | 'ms'  // 马来西亚语
  | 'ru'  // 俄语
  | 'ar'  // 阿拉伯语
  | 'hi'  // 印地语
  | 'th'; // 泰语
```

### TargetLanguage

```typescript
export type TargetLanguage = SourceLanguage;
```

### XfyunTranslatorOptions

```typescript
export interface XfyunTranslatorOptions {
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

### TranslatorEventHandlers

```typescript
export interface TranslatorEventHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: XfyunError) => void;
  onStateChange?: (state: TranslatorState) => void;
}
```

### TranslationResult

```typescript
export interface TranslationResult {
  text: string;
  from: string;
  to: string;
  confidence?: number;
}
```

---

## 通用类型

### LogLevel

```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

### XfyunClientOptions

```typescript
export interface XfyunClientOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  logLevel?: LogLevel;
}
```

---

## 使用示例

### 类型守卫

```typescript
import { RecognizerState, isRecognizerState } from 'xfyun-sdk';

function handleState(state: string) {
  if (isRecognizerState(state)) {
    // state 现在是 RecognizerState 类型
    switch (state) {
      case 'idle':
        // ...
        break;
      case 'connecting':
        // ...
        break;
      // ...
    }
  }
}
```

### 泛型约束

```typescript
import { XfyunASROptions, XfyunTTSOptions } from 'xfyun-sdk';

function createClient<T extends XfyunASROptions | XfyunTTSOptions>(
  options: T
): T extends XfyunASROptions ? Recognizer : Synthesizer {
  // ...
}
```

---

## 下一步

- [📖 工具函数](/api/utils)
- [📖 日志工具](/api/logger)
