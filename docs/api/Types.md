# Types 类型定义

`src/types.ts`

## ASR 类型

### RecognizerState

```typescript
export type RecognizerState = 'idle' | 'connecting' | 'connected' | 'recording' | 'stopped' | 'error';
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
  data?: unknown;
}
```

---

## TTS 类型

### SynthesizerState

```typescript
export type SynthesizerState = 'idle' | 'connecting' | 'connected' | 'synthesizing' | 'stopped' | 'error';
```

### TTSAudioFormat

```typescript
export type TTSAudioFormat = 'mp3' | 'wav' | 'pcm';
```

### TTSVoiceName

```typescript
export type TTSVoiceName =
  | 'xiaoyan'       // 青年女声-小燕
  | 'aisjiuxu'       // 青年女声-许久
  | 'aisxping'       // 青年女声-小萍
  | 'aisjinger'      // 青年女声-京儿
  | 'aisbabyxu'      // 青年女声-小旭
  | 'aisxiaoyuan'    // 青年女声-小媛
  | 'aisxingchen'    // 青年女声-星辰
  | 'aisdengdeng'    // 青年女声-叮当
  | 'aisyaoyao'      // 青年女声-瑶瑶
  | 'aismall'        // 青年女声-小暖
  | 'aisxiaofeng'    // 青年男声-小峰
  | 'aisnan'         // 青年男声-楠楠
  | 'aisxiaosong'    // 青年男声-小松
  | 'aisxiaoyong'    // 青年男声-小勇
  | 'aisxiaowang'    // 青年男声-小王
  | 'aisxiaole'      // 青年男声-小乐
  | 'aisxiaoy'       // 青年男声-小宇
  | 'aisxiaolin'     // 青年男声-小林
  | 'aisxiaoming'    // 青年男声-小明
  | 'aisxiaogang'    // 青年男声-小刚
  | 'aisdarong'      // 中年男声-大荣
  | 'aisnvpeach'     // 中年女声-青娇
  | 'aisxiaowuma'    // 老年男声-无马
  | 'aisxiaorong'    // 老年男声-小荣
  | 'aischanghong'   // 老年女声-长红
  | 'aisxiaoyaxi'    // 英文女声-雅西
  | 'aisjiuyuan'     // 四川话女声
  | 'aisxiaoxian'    // 陕西话女声-小贤
  | 'aisxiaomao'     // 东北话女声-小矛
  | 'aisxiaoli'      // 东北话女声-小黎
  | 'aisxiaokan'     // 河南话女声-小侃
  | 'aisxiaoning'    // 普通话男声-小宁
  | 'aismary'        // 英中双语女声
  | 'aisxiaowawa'    // 童声
  | 'aisxiaoxue'     // 童声-小学
  | 'aisxiaoyan'     // 粤语女声-小燕
  ;
```

### TTSEventHandlers

```typescript
export interface TTSEventHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onStop?: () => void;
  onAudioData?: (audioData: ArrayBuffer) => void;
  onProgress?: (current: number, total: number) => void;
  onError?: (error: TTSError) => void;
  onStateChange?: (state: SynthesizerState) => void;
}
```

### TTSError

```typescript
export interface TTSError {
  code: number;
  message: string;
  data?: unknown;
}
```

---

## Translator 类型

### TranslatorType

```typescript
export type TranslatorType = 'asr' | 'text';
```

| 类型 | 说明 |
|------|------|
| `asr` | 语音翻译（边说边译） |
| `text` | 文本翻译 |

### SourceLanguage / TargetLanguage

```typescript
export type SourceLanguage =
  | 'cn' | 'en' | 'ja' | 'ko' | 'fr' | 'es' | 'it' | 'de'
  | 'pt' | 'vi' | 'id' | 'ms' | 'ru' | 'ar' | 'hi' | 'th';

export type TargetLanguage =
  | 'cn' | 'en' | 'ja' | 'ko' | 'fr' | 'es' | 'it' | 'de'
  | 'pt' | 'vi' | 'id' | 'ms' | 'ru' | 'ar' | 'hi' | 'th';
```

### TranslatorState

```typescript
export type TranslatorState = 'idle' | 'connecting' | 'connected' | 'translating' | 'stopped' | 'error';
```

### TranslatorEventHandlers

```typescript
export interface TranslatorEventHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onStop?: () => void;
  onResult?: (result: TranslationResult) => void;
  onError?: (error: TranslatorError) => void;
  onStateChange?: (state: TranslatorState) => void;
}
```

### TranslationResult

```typescript
export interface TranslationResult {
  sourceLanguage: SourceLanguage;
  targetLanguage: TargetLanguage;
  sourceText: string;
  targetText: string;
  isFinal: boolean;
  confidence?: number;
}
```

---

## 离线 ASR 类型

### OfflineASROptions

```typescript
export interface OfflineASROptions {
  engine?: 'smsys';
  language?: 'zh_cn' | 'en_us';
  domain?: 'iat' | 'search' | 'commands';
  sampleRate?: 8000 | 16000;
  nbest?: number;
  wbest?: number;
}
```

## 声纹识别类型

### SpeakerVerifyOptions

```typescript
export interface SpeakerVerifyOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  scene: 'verify' | 'identify';
  engine_type: '21360' | '21361';
  user_id?: string;
  audioFormat?: 'wav' | 'pcm' | 'opus';
  sampleRate?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### SpeakerVerifyResult

```typescript
export interface SpeakerVerifyResult {
  success: boolean;
  score: number;
  user_id?: string;
  message?: string;
}
```

### SpeakerRegisterResult

```typescript
export interface SpeakerRegisterResult {
  success: boolean;
  message: string;
  user_id?: string;
}
```
