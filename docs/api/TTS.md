# XfyunTTS API 文档

科大讯飞 TTS 语音合成 Web SDK，提供流式文本转语音功能。

## 导入

```typescript
import { XfyunTTS } from 'xfyun-sdk';
```

## 构造函数

```typescript
new XfyunTTS(options: XfyunTTSOptions, handlers?: TTSEventHandlers)
```

### XfyunTTSOptions

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `voice_name` | `TTSVoiceName \| string` | `'xiaoyan'` | ❌ | 发音人 |
| `speed` | `number` | `50` | ❌ | 语速 0-100 |
| `pitch` | `number` | `50` | ❌ | 音调 0-100 |
| `volume` | `number` | `50` | ❌ | 音量 0-100 |
| `accent` | `string` | `'accent=mandarin'` | ❌ | 方言/口音 |
| `audioFormat` | `'mp3' \| 'wav' \| 'pcm'` | `'mp3'` | ❌ | 音频格式 |
| `sampleRate` | `number` | `16000` | ❌ | 采样率 |
| `autoStart` | `boolean` | `false` | ❌ | 自动开始合成 |
| `enableCache` | `boolean` | `true` | ❌ | 启用缓存 |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | ❌ | 日志级别 |

## TTSVoiceName 发音人列表

### 青年女声

| 名称 | 说明 |
|------|------|
| `xiaoyan` | 小燕（默认） |
| `aisjiuxu` | 许久 |
| `aisxping` | 小萍 |
| `aisjinger` | 京儿 |
| `aisbabyxu` | 小旭 |
| `aisxiaoyuan` | 小媛 |
| `aisxingchen` | 星辰 |
| `aisdengdeng` | 叮当 |
| `aisyaoyao` | 瑶瑶 |
| `aismall` | 小暖 |

### 青年男声

| 名称 | 说明 |
|------|------|
| `aisxiaofeng` | 小峰 |
| `aisnan` | 楠楠 |
| `aisxiaosong` | 小松 |
| `aisxiaoyong` | 小勇 |
| `aisxiaowang` | 小王 |
| `aisxiaole` | 小乐 |
| `aisxiaoy` | 小宇 |
| `aisxiaolin` | 小林 |
| `aisxiaoming` | 小明 |
| `aisxiaogang` | 小刚 |

### 中年/老年

| 名称 | 说明 |
|------|------|
| `aisdarong` | 中年男声-大荣 |
| `aisnvpeach` | 中年女声-青娇 |
| `aisxiaowuma` | 老年男声-无马 |
| `aisxiaorong` | 老年男声-小荣 |
| `aischanghong` | 老年女声-长红 |

### 方言/外语

| 名称 | 说明 |
|------|------|
| `aisxiaoyaxi` | 英文女声-雅西 |
| `aisjiuyuan` | 四川话女声 |
| `aisxiaoxian` | 陕西话女声-小贤 |
| `aisxiaomao` | 东北话女声-小矛 |
| `aisxiaoli` | 东北话女声-小黎 |
| `aisxiaokan` | 河南话女声-小侃 |
| `aisxiaoning` | 普通话男声-小宁 |
| `aismary` | 英中双语女声 |
| `aisxiaowawa` | 童声 |
| `aisxiaoxue` | 童声-小学 |
| `aisxiaoyan` | 粤语女声-小燕 |

## 方法

### start(text)

开始语音合成。

```typescript
public start(text: string): void
```

**参数：**
- `text`: 要合成的文本内容

### stop()

停止合成。

```typescript
public stop(): void
```

### destroy()

销毁实例，释放资源。

```typescript
public destroy(): void
```

### getState()

获取当前合成状态。

```typescript
public getState(): SynthesizerState
```

**返回值：** `'idle' | 'connecting' | 'connected' | 'synthesizing' | 'stopped' | 'error'`

### getAudioData()

获取累积的完整音频数据。

```typescript
public getAudioData(): ArrayBuffer | null
```

### getMimeType()

获取当前音频格式的 MIME 类型。

```typescript
public getMimeType(): string
```

**返回值示例：** `'audio/mpeg'` (mp3), `'audio/wav'` (wav), `'audio/pcm'` (pcm)

### exportAudio()

导出累积的完整音频数据为 Blob 对象。

```typescript
public exportAudio(): Blob | null
```

**返回值：** 返回音频数据的 Blob 对象，如果没有音频数据则返回 `null`

**示例：**

```typescript
synthesizer.onEnd = () => {
  const blob = synthesizer.exportAudio();
  if (blob) {
    console.log('音频大小:', blob.size, 'bytes');
    console.log('音频类型:', blob.type);
  }
};
```

### downloadAudio(filename?)

触发浏览器下载合成的音频文件。

```typescript
public downloadAudio(filename?: string): void
```

**参数：**
- `filename`: 下载文件名（不含扩展名），默认值为 `'synthesis'`

**示例：**

```typescript
synthesizer.onEnd = () => {
  // 下载为 "hello.mp3"
  synthesizer.downloadAudio('hello');
};

// 或者使用默认文件名 "synthesis.mp3"
synthesizer.onEnd = () => {
  synthesizer.downloadAudio();
};
```

> ⚠️ 注意：`downloadAudio()` 仅在浏览器环境中可用。

## 事件

### onStart

合成开始时触发。

```typescript
onStart: () => void
```

### onEnd

合成结束时触发。

```typescript
onEnd: () => void
```

### onStop

手动停止时触发。

```typescript
onStop: () => void
```

### onAudioData

音频数据返回（流式）。

```typescript
onAudioData: (audioData: ArrayBuffer) => void
```

### onProgress

文本进度回调。

```typescript
onProgress: (current: number, total: number) => void
```

**参数：**
- `current`: 当前已合成的字符数
- `total`: 总字符数

### onError

错误回调。

```typescript
onError: (error: TTSError) => void
```

### onStateChange

状态变化回调。

```typescript
onStateChange: (state: SynthesizerState) => void
```

## SynthesizerState 状态机

| 状态 | 说明 |
|------|------|
| `idle` | ⏸️ 空闲状态 |
| `connecting` | 🔗 正在连接 |
| `connected` | ✅ 已连接 |
| `synthesizing` | 🔊 合成中 |
| `stopped` | ⏹️ 已停止 |
| `error` | ❌ 错误 |

## 使用示例

### 基础用法

```typescript
import { XfyunTTS } from 'xfyun-sdk';

const synthesizer = new XfyunTTS(
  {
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    voice_name: 'xiaoyan',
    speed: 50,
    pitch: 50,
    volume: 50,
    audioFormat: 'mp3',
  },
  {
    onStart: () => console.log('合成开始'),
    onEnd: () => console.log('合成结束'),
    onAudioData: (audioData) => {
      // 处理流式音频数据
      console.log('收到音频数据:', audioData.byteLength, 'bytes');
    },
    onProgress: (current, total) => {
      console.log(`进度: ${current}/${total}`);
    },
    onError: (error) => {
      console.error('合成错误:', error);
    },
  }
);

// 开始合成
synthesizer.start('你好，这是语音合成测试。');

// 停止合成
synthesizer.stop();

// 销毁实例
synthesizer.destroy();
```

### 播放合成的音频

```typescript
import { XfyunTTS } from 'xfyun-sdk';

const synthesizer = new XfyunTTS(options, handlers);
let audioContext: AudioContext | null = null;
let audioSource: AudioBufferSourceNode | null = null;

synthesizer.start('你好，欢迎使用讯飞语音合成。');

synthesizer.onAudioData = async (audioData) => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  
  // 解码音频数据
  const audioBuffer = await audioContext.decodeAudioData(audioData);
  
  // 播放
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(audioContext.destination);
  audioSource.start();
};
```

### 保存音频文件

```typescript
import { XfyunTTS } from 'xfyun-sdk';

const synthesizer = new XfyunTTS(options, handlers);

// 方式1: 使用 downloadAudio 方法（推荐）
synthesizer.onEnd = () => {
  synthesizer.downloadAudio('my-audio');
};

// 方式2: 使用 exportAudio 获取 Blob
synthesizer.onEnd = () => {
  const blob = synthesizer.exportAudio();
  if (blob) {
    // 自定义处理
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.mp3';
    a.click();
    URL.revokeObjectURL(url);
  }
};

synthesizer.start('这是一段要保存的语音。');
```

### 更改发音人

```typescript
// 青年女声
const tts1 = new XfyunTTS({ voice_name: 'xiaoyan', ... }, handlers);

// 中年男声
const tts2 = new XfyunTTS({ voice_name: 'aisdarong', ... }, handlers);

// 四川话
const tts3 = new XfyunTTS({ voice_name: 'aisjiuyuan', ... }, handlers);

// 童声
const tts4 = new XfyunTTS({ voice_name: 'aisxiaowawa', ... }, handlers);
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 20001 | 合成文本不能为空 |
| 20002 | WebSocket 连接错误 |
| 20003 | 初始化 WebSocket 失败 |
| 20004 | 发送开始帧失败 |

## 音频格式说明

| 格式 | MIME 类型 | 说明 |
|------|-----------|------|
| `mp3` | `audio/mpeg` | MP3 编码，通用性好 |
| `wav` | `audio/wav` | WAV 格式，无损 |
| `pcm` | `audio/pcm` | PCM 原始音频 |

## 采样率

| 采样率 | 说明 |
|--------|------|
| 8000 | 8kHz |
| 16000 | 16kHz（默认） |
| 24000 | 24kHz |
| 48000 | 48kHz |
