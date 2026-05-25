---
outline: deep
next: /api/translator
---

# TTS 语音合成

::tip{icon=🔊 title=文本转语音}
支持 30+ 种发音人，多种音频格式
::

## 快速使用

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

synthesizer.speak('你好，这是一个测试');
```

## 构造函数

```typescript
createSynthesizer(options: XfyunTTSOptions): Synthesizer
```

### 参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|:-----|:-----|:------:|:----:|:-----|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `voice_name` | `string` | `'xiaoyan'` | ❌ | 发音人 |
| `speed` | `number` | `50` | ❌ | 语速 0-100 |
| `pitch` | `number` | `50` | ❌ | 音调 0-100 |
| `volume` | `number` | `50` | ❌ | 音量 0-100 |

::details
<details>
<summary>查看所有参数</summary>

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `accent` | `string` | `'accent=mandarin'` | 方言/口音 |
| `audioFormat` | `'mp3' \| 'wav' \| 'pcm'` | `'mp3'` | 音频格式 |
| `sampleRate` | `number` | `16000` | 采样率 |
| `autoStart` | `boolean` | `false` | 自动开始 |
| `enableCache` | `boolean` | `true` | 启用缓存 |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |

</details>
::

## 发音人列表

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
| `aisxiao` | 小... |

## 方法

### speak()

播放文本。

```typescript
synthesizer.speak(text: string): Promise<void>
```

**参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 要合成的文本 |

**使用示例**：

```typescript
// 基础使用
synthesizer.speak('你好，世界');

// 带配置
await synthesizer.speak('你好', {
  voice_name: 'xiaoyan',
  speed: 60,
});
```

### stop()

停止播放。

```typescript
synthesizer.stop(): void
```

### destroy()

销毁实例，释放资源。

```typescript
synthesizer.destroy(): void
```

### getState()

获取当前状态。

```typescript
synthesizer.getState(): SynthesizerState
```

**返回值**：`'idle' \| 'connecting' \| 'connected' \| 'synthesizing' \| 'stopped' \| 'error'`

### getAudio()

获取音频数据。

```typescript
synthesizer.getAudio(): Blob | null
```

## 事件

### audio

音频数据到达时触发。

```typescript
synthesizer.on('audio', (audioData: Blob) => {
  const url = URL.createObjectURL(audioData);
  // 播放或保存
});
```

### complete

合成完成时触发。

```typescript
synthesizer.on('complete', () => {
  console.log('合成完成');
});
```

### error

发生错误时触发。

```typescript
synthesizer.on('error', (error: XfyunError) => {
  console.error('合成错误:', error);
});
```

### start

合成开始时触发。

```typescript
synthesizer.on('start', () => {
  console.log('合成开始');
});
```

### end

合成结束时触发。

```typescript
synthesizer.on('end', () => {
  console.log('合成结束');
});
```

## 类型定义

### XfyunTTSOptions

```typescript
interface XfyunTTSOptions {
  appId: string;
  apiKey: string;
  apiSecret: string;
  voice_name?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  accent?: string;
  audioFormat?: 'mp3' | 'wav' | 'pcm';
  sampleRate?: number;
  autoStart?: boolean;
  enableCache?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### SynthesizerState

```typescript
type SynthesizerState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'synthesizing'
  | 'stopped'
  | 'error';
```

## 示例

### 基础合成

```typescript
const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

synthesizer.speak('你好，这是一个测试');
```

### 自定义发音人

```typescript
const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  voice_name: 'aisxiaofeng', // 小峰
  speed: 60,
  pitch: 55,
});

synthesizer.speak('你好，我是小峰');
```

### 保存音频文件

```typescript
synthesizer.on('audio', (audioData: Blob) => {
  const url = URL.createObjectURL(audioData);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'speech.mp3';
  a.click();
});

synthesizer.speak('你好，这是要保存的音频');
```

### 流式播放

```typescript
const audioContext = new AudioContext();
const source = audioContext.createBufferSource();

synthesizer.on('audio', async (audioData: Blob) => {
  const arrayBuffer = await audioData.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
});

synthesizer.speak('流式播放测试');
```

## 常见问题

::details
<details>
<summary>没有声音输出？</summary>

1. 检查浏览器自动播放策略（需要用户交互后才能播放）
2. 调用 `synthesizer.resume()` 恢复 AudioContext
3. 检查系统音量设置

</details>
::

::details
<details>
<summary>如何改变语速和音调？</summary>

```typescript
const synthesizer = createSynthesizer({
  speed: 60,  // 语速 0-100，默认 50
  pitch: 55,  // 音调 0-100，默认 50
});
```

</details>
::

## 下一步

- [📖 翻译 API](/api/translator)
- [💡 TTS 示例代码](/examples/tts-demo)
