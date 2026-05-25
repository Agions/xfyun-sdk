---
layout: home

hero:
  name: xfyun-sdk
  text: 科大讯飞语音 Web SDK
  tagline: 让语音交互更简单
  image:
    src: /logo.svg
    alt: xfyun-sdk Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 文档
      link: /api/asr

features:
  - icon: 🎤
    title: 语音识别
    details: 实时语音转文字，支持中文、英文，多种方言和领域模型
    link: /api/asr

  - icon: 🔊
    title: 语音合成
    details: 文本转语音，支持 30+ 种发音人和多种音频格式
    link: /api/tts

  - icon: 🌐
    title: 语音翻译
    details: 边说边译，支持 15+ 种语言互译
    link: /api/translator

  - icon: ⚡
    title: 零依赖
    details: 仅依赖 crypto-js，轻量级设计，包体积 < 50KB
    link: /guide/best-practices

  - icon: 🛡️
    title: 类型安全
    details: 完整的 TypeScript 类型定义，智能提示
    link: /api/types

  - icon: 📦
    title: 模块化
    details: ASR/TTS/Translator 独立模块，按需引入
    link: /guide/getting-started
---

## 快速上手

```bash
npm install xfyun-sdk
```

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
```

## 社区与支持

- 📖 [完整文档](/guide/getting-started)
- 💬 [GitHub Discussions](https://github.com/Agions/xfyun-sdk/discussions)
- 🐛 [提交 Issue](https://github.com/Agions/xfyun-sdk/issues)
- 💡 [功能建议](https://github.com/Agions/xfyun-sdk/discussions/categories/ideas)
