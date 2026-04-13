# Utils API 文档

工具函数模块，提供讯飞 SDK 所需的基础工具方法。

## 导入

```typescript
import {
  generateAuthUrl,
  calculateVolume,
  arrayBufferToBase64,
  parseXfyunResult,
} from 'xfyun-sdk';
```

## 函数

### generateAuthUrl

生成讯飞 WebSocket API 请求 URL（带签名认证）。

```typescript
function generateAuthUrl(
  apiKey: string,
  apiSecret: string,
  host?: string,
  path?: string
): string
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `apiKey` | `string` | — | 讯飞 API Key |
| `apiSecret` | `string` | — | 讯飞 API Secret |
| `host` | `string` | `'iat-api.xfyun.cn'` | API 服务器地址 |
| `path` | `string` | `'/v2/iat'` | API 路径 |

**返回值：** 带有签名的完整 WebSocket URL

**示例：**

```typescript
// ASR 识别 URL
const asrUrl = generateAuthUrl(apiKey, apiSecret);

// TTS 合成 URL
const ttsUrl = generateAuthUrl(apiKey, apiSecret, 'tts-api.xfyun.cn', '/v2/tts');

// 翻译 URL
const translatorUrl = generateAuthUrl(apiKey, apiSecret, 'itr-api.xfyun.cn', '/v2/itr');
```

---

### calculateVolume

计算音频音量大小。

```typescript
function calculateVolume(array: Float32Array): number
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `array` | `Float32Array` | 音频采样数据 |

**返回值：** 音量值（0-100）

**算法：** RMS (Root Mean Square) 计算

**示例：**

```typescript
const audioData = new Float32Array([0.1, 0.2, -0.1, 0.3]);
const volume = calculateVolume(audioData);
console.log(`音量: ${volume.toFixed(2)}`);
```

---

### arrayBufferToBase64

将 ArrayBuffer 转换为 Base64 字符串。

```typescript
function arrayBufferToBase64(buffer: ArrayBuffer): string
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `buffer` | `ArrayBuffer` | 音频/二进制数据 |

**返回值：** Base64 编码字符串

**跨平台兼容：** 自动检测浏览器/Node.js 环境，使用对应的编码方法。

**示例：**

```typescript
// 浏览器环境
const base64 = arrayBufferToBase64(audioData);

// 用于 WebSocket 传输
websocket.send(base64);
```

---

### parseXfyunResult

解析讯飞返回的识别/翻译结果。

```typescript
function parseXfyunResult(result: unknown, logger?: Logger): string
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `result` | `unknown` | 讯飞 WebSocket 返回的原始结果 |
| `logger` | `Logger` | 可选的日志记录器 |

**返回值：** 解析后的文本内容

**示例：**

```typescript
import { parseXfyunResult, Logger } from 'xfyun-sdk';

const logger = new Logger('[MyApp]');

// 解析识别结果
websocket.onmessage = (event) => {
  const text = parseXfyunResult(event.data, logger);
  if (text) {
    console.log('识别结果:', text);
  }
};

// 不带日志
const text = parseXfyunResult(rawResult);
```
