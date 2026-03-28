# xfyun-sdk Vue 3 Demo

科大讯飞语音识别 SDK 的 Vue 3 演示项目。

## 前置要求

1. 拥有科大讯飞开放平台账号
2. 创建应用并开通「语音听写 (iat)」服务
3. 获取 `AppID`、`APIKey`、`APISecret`

👉 [前往讯飞开放平台](https://www.xfyun.cn/)

## 快速开始

### 1. 安装依赖

```bash
cd examples/vue-demo
npm install
```

### 2. 配置 API 密钥

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的讯飞 API 密钥：

```env
VITE_XFYUN_APP_ID=your_app_id
VITE_XFYUN_API_KEY=your_api_key
VITE_XFYUN_API_SECRET=your_api_secret
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:5173 即可体验。

## 项目结构

```
vue-demo/
├── src/
│   ├── components/
│   │   └── SpeechRecognizer.vue   # 语音识别组件
│   ├── composables/
│   │   └── useSpeechRecognizer.ts # 组合式函数
│   ├── App.vue
│   ├── main.ts
│   ├── style.css
│   └── env.d.ts
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 在项目中使用

### 方式一：使用组合式函数（推荐）

```typescript
import { useSpeechRecognizer } from '@/composables/useSpeechRecognizer';

const { isListening, transcript, error, volume, state, start, stop } =
  useSpeechRecognizer({
    appId: 'your_app_id',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    language: 'zh_cn',
    accent: 'mandarin',
  });

// 开始识别
await start();

// 停止识别
stop();
```

### 方式二：使用组件

```vue
<template>
  <SpeechRecognizer
    :app-id="appId"
    :api-key="apiKey"
    :api-secret="apiSecret"
    language="zh_cn"
    accent="mandarin"
    :show-volume="true"
    :show-result="true"
    :show-status="true"
  />
</template>

<script setup lang="ts">
import SpeechRecognizer from '@/components/SpeechRecognizer.vue';

const appId = import.meta.env.VITE_XFYUN_APP_ID ?? '';
const apiKey = import.meta.env.VITE_XFYUN_API_KEY ?? '';
const apiSecret = import.meta.env.VITE_XFYUN_API_SECRET ?? '';
</script>
```

## 浏览器兼容性

需要浏览器支持以下 API：

- **WebSocket** — 建立与讯飞服务器的实时连接
- **MediaRecorder** — 采集麦克风音频
- **getUserMedia** — 申请麦克风权限

推荐使用 Chrome、Edge、Firefox、Safari 的最新版本。

> ⚠️ 必须在 **HTTPS** 环境或 **localhost** 下运行，否则麦克风权限无法获取。

## License

MIT
