# API 文档

xfyun-sdk 提供了完整的科大讯飞语音服务 API，包括语音识别、语音合成、翻译等功能。

## 核心模块

| 模块 | 说明 | 文档链接 |
|------|------|----------|
| 🎤 **SpeechRecognizer** | 语音识别 (ASR) - 实时语音转文字 | [查看文档](/api/asr) |
| 🔊 **SpeechSynthesizer** | 语音合成 (TTS) - 文本转语音 | [查看文档](/api/tts) |
| 🌐 **Translator** | 翻译 - 语音翻译和文本翻译 | [查看文档](/api/translator) |

## 辅助模块

| 模块 | 说明 | 文档链接 |
|------|------|----------|
| 📦 **Types** | TypeScript 类型定义 | [查看文档](/api/types) |
| 🔧 **Utils** | 工具函数 | [查看文档](/api/utils) |
| 📝 **Logger** | 日志工具 | [查看文档](/api/logger) |

## 快速开始

```typescript
import { SpeechRecognizer, SpeechSynthesizer, Translator } from 'xfyun-sdk';

// 语音识别
const recognizer = new SpeechRecognizer({
  appId: 'your-app-id',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});

// 语音合成
const synthesizer = new SpeechSynthesizer({
  appId: 'your-app-id',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});

// 翻译
const translator = new Translator({
  appId: 'your-app-id',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  from: 'cn',
  to: 'en',
});
```

## 错误处理

所有模块都使用统一的错误分类系统，详见 [错误处理](/api/types#错误处理) 部分。

## 配置选项

每个模块都支持以下通用配置选项：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `appId` | `string` | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | ✅ | 讯飞 API Secret |
| `logLevel` | `string` | ❌ | 日志级别：`debug` / `info` / `warn` / `error` |
