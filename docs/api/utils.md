---
outline: deep
next: /api/logger
---

# Utils 工具函数

::: tip
简化 SDK 使用的辅助工具
:::

## 日志级别控制

### setLogLevel()

设置全局日志级别。

```typescript
import { setLogLevel } from 'xfyun-sdk';

setLogLevel('debug');
```

**参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `level` | `'debug' \| 'info' \| 'warn' \| 'error'` | 日志级别 |

**日志级别说明**：

| 级别 | 说明 | 使用场景 |
|------|------|---------|
| `debug` | 调试信息 | 开发调试 |
| `info` | 一般信息 | 生产环境默认 |
| `warn` | 警告信息 | 生产环境 |
| `error` | 错误信息 | 仅记录错误 |

### getLogLevel()

获取当前日志级别。

```typescript
import { getLogLevel } from 'xfyun-sdk';

const level = getLogLevel();
console.log(level); // 'info'
```

---

## 语言代码工具

### getLanguageCode()

获取语言代码。

```typescript
import { getLanguageCode } from 'xfyun-sdk';

const code = getLanguageCode('中文');
console.log(code); // 'zh_cn'
```

### getLanguageName()

获取语言名称。

```typescript
import { getLanguageName } from 'xfyun-sdk';

const name = getLanguageName('zh_cn');
console.log(name); // '中文'
```

### SUPPORTED_LANGUAGES

支持的语言列表。

```typescript
import { SUPPORTED_LANGUAGES } from 'xfyun-sdk';

console.log(SUPPORTED_LANGUAGES);
// {
//   zh_cn: '中文',
//   en_us: '英文',
//   ja: '日语',
//   ko: '韩语',
//   // ...
// }
```

---

## 音频工具

### isAudioFormatSupported()

检查音频格式是否支持。

```typescript
import { isAudioFormatSupported } from 'xfyun-sdk';

const supported = isAudioFormatSupported('audio/L16;rate=16000');
console.log(supported); // true
```

### getSupportedAudioFormats()

获取支持的音频格式列表。

```typescript
import { getSupportedAudioFormats } from 'xfyun-sdk';

const formats = getSupportedAudioFormats();
console.log(formats);
// ['audio/L16;rate=16000', 'audio/L16;rate=8000', ...]
```

### createAudioContext()

创建 AudioContext。

```typescript
import { createAudioContext } from 'xfyun-sdk';

const context = createAudioContext();
// 等价于：
// const context = new (window.AudioContext || window.webkitAudioContext)();
```

---

## WebSocket 工具

### isWebSocketSupported()

检查 WebSocket 是否支持。

```typescript
import { isWebSocketSupported } from 'xfyun-sdk';

const supported = isWebSocketSupported();
console.log(supported); // true
```

### createWebSocket()

创建 WebSocket 连接。

```typescript
import { createWebSocket } from 'xfyun-sdk';

const ws = createWebSocket('wss://example.com', {
  protocols: ['protocol1'],
  headers: {
    'Authorization': 'Bearer token',
  },
});
```

---

## 错误处理

### isXfyunError()

检查是否为讯飞错误。

```typescript
import { isXfyunError } from 'xfyun-sdk';

if (isXfyunError(error)) {
  console.log('错误码:', error.code);
  console.log('错误信息:', error.message);
}
```

### formatXfyunError()

格式化讯飞错误。

```typescript
import { formatXfyunError } from 'xfyun-sdk';

const message = formatXfyunError(error);
console.log(message); // '[10001] API 调用失败: ...'
```

### getErrorDescription()

获取错误描述。

```typescript
import { getErrorDescription } from 'xfyun-sdk';

const desc = getErrorDescription(10001);
console.log(desc); // 'API 调用失败'
```

---

## 类型守卫

### isRecognizerState()

检查是否为有效的识别器状态。

```typescript
import { isRecognizerState } from 'xfyun-sdk';

if (isRecognizerState(state)) {
  // state 现在是 RecognizerState 类型
}
```

### isSynthesizerState()

检查是否为有效的合成器状态。

```typescript
import { isSynthesizerState } from 'xfyun-sdk';

if (isSynthesizerState(state)) {
  // state 现在是 SynthesizerState 类型
}
```

### isTranslatorState()

检查是否为有效的翻译器状态。

```typescript
import { isTranslatorState } from 'xfyun-sdk';

if (isTranslatorState(state)) {
  // state 现在是 TranslatorState 类型
}
```

---

## 示例

### 完整工具使用

```typescript
import {
  setLogLevel,
  isWebSocketSupported,
  isAudioFormatSupported,
  isXfyunError,
  formatXfyunError,
} from 'xfyun-sdk';

// 设置日志级别
setLogLevel('debug');

// 检查环境支持
if (!isWebSocketSupported()) {
  console.error('WebSocket 不支持');
  return;
}

// 检查音频格式
if (!isAudioFormatSupported('audio/L16;rate=16000')) {
  console.warn('音频格式不支持');
}

// 错误处理
try {
  // 调用 SDK
} catch (error) {
  if (isXfyunError(error)) {
    console.error(formatXfyunError(error));
  } else {
    console.error('未知错误:', error);
  }
}
```

---

## 下一步

- [📖 日志工具](/api/logger)
- [💡 示例代码](/examples/asr-demo)
