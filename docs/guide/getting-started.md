# 快速开始

## 安装

\`\`\`bash
npm install xfyun-sdk
# 或
yarn add xfyun-sdk
# 或
pnpm add xfyun-sdk
\`\`\`

## 配置讯飞账号

在使用本 SDK 之前，您需要：
1. 注册讯飞开放平台账号：https://console.xfyun.cn/
2. 创建应用，获取 APPID、APIKey、APISecret

## 语音识别 (ASR)

### 浏览器环境

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

recognizer.on('result', (text) => {
  console.log('识别结果:', text);
});

recognizer.start();

navigator.mediaDevices.getUserMedia({ audio: true })
  .then((stream) => {
    // 将音频流传递给 recognizer
  });
```

## 语音合成 (TTS)

```typescript
import { createSynthesizer } from 'xfyun-sdk';

const synthesizer = createSynthesizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

synthesizer.speak('你好，这是一个测试');
```

## 翻译

```typescript
import { createTranslator } from 'xfyun-sdk';

const translator = createTranslator({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

const result = await translator.translateText('你好', 'cn', 'en');
console.log(result); // 'hello'
```

## 浏览器兼容性

- Chrome 33+
- Firefox 25+
- Safari 7+
- Edge 12+

需要浏览器支持：
- WebSocket
- MediaDevices API
- AudioContext / webkitAudioContext
