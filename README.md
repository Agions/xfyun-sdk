# XfyunSDK - 科大讯飞语音识别 SDK

<div align="center">

[![npm version](https://img.shields.io/npm/v/xfyun-sdk.svg)](https://www.npmjs.com/package/xfyun-sdk)
[![license](https://img.shields.io/npm/l/xfyun-sdk.svg)](https://github.com/agions/xfyun-sdk/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/agions/xfyun-sdk/pulls)

</div>

XfyunSDK 是一个基于科大讯飞语音识别 WebAPI 的 JavaScript/TypeScript SDK，提供了简单易用的接口，方便开发者在 Web 应用中集成语音识别功能。

## 📋 目录

- [功能特点](#-功能特点)
- [安装](#-安装)
- [快速开始](#-快速开始)
- [基本用法](#-基本用法)
- [API 文档](#-api-文档)
- [工作原理](#-工作原理)
- [浏览器兼容性](#-浏览器兼容性)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [更新日志](#-更新日志)
- [相关项目](#-相关项目)
- [开源许可](#-开源许可)

## ✨ 功能特点

- 支持实时语音听写
- 自动处理 WebSocket 连接和认证
- 支持调整语言、方言、领域等参数
- 内置音量监测功能
- 完整的 TypeScript 类型支持
- 提供 React 组件，易于集成
- 优雅的错误处理机制
- 自动重连和会话恢复

## 📦 安装

### NPM

```bash
npm install xfyun-sdk
```

### Yarn

```bash
yarn add xfyun-sdk
```

### 直接通过 CDN 引入

```html
<script src="https://unpkg.com/xfyun-sdk/dist/index.umd.js"></script>
```

## 🚀 快速开始

在使用 XfyunSDK 之前，您需要：

1. 在[科大讯飞开放平台](https://www.xfyun.cn/)注册账号
2. 创建一个语音听写应用，获取 APPID、APIKey 和 APISecret
3. 阅读[讯飞开放平台 WebAPI 文档](https://www.xfyun.cn/doc/asr/voicedictation/API.html)了解基本概念

然后，您可以按照以下步骤快速集成语音识别功能：

```javascript
// 1. 引入 SDK
import { XfyunASR } from "xfyun-sdk"

// 2. 创建实例
const recognizer = new XfyunASR({
  appId: "YOUR_APP_ID",
  apiKey: "YOUR_API_KEY",
  apiSecret: "YOUR_API_SECRET",
})

// 3. 绑定事件
recognizer.addEventListener("result", (text, isEnd) => {
  console.log("识别结果:", text)
  document.getElementById("result").textContent += text
})

// 4. 开始/停止识别
document.getElementById("startBtn").addEventListener("click", () => {
  recognizer.start()
})

document.getElementById("stopBtn").addEventListener("click", () => {
  recognizer.stop()
})
```

## 🔍 基本用法

### 直接使用 XfyunASR 类

```javascript
import { XfyunASR } from "xfyun-sdk"

// 创建语音识别实例
const recognizer = new XfyunASR(
  {
    appId: "你的应用 APPID",
    apiKey: "你的 API Key",
    apiSecret: "你的 API Secret",
    language: "zh_cn", // 可选，默认为中文
    domain: "iat", // 可选，领域
    accent: "mandarin", // 可选，方言，默认普通话
  },
  {
    // 事件处理
    onStart: () => {
      console.log("语音识别已开始")
    },
    onStop: () => {
      console.log("语音识别已停止")
    },
    onRecognitionResult: (text, isEnd) => {
      console.log("识别结果:", text, isEnd ? "(最终结果)" : "")
      document.getElementById("result").textContent += text
    },
    onProcess: (volume) => {
      console.log("当前音量:", volume)
    },
    onError: (error) => {
      console.error("识别错误:", error)
    },
    onStateChange: (state) => {
      console.log("状态变更:", state)
    },
  }
)

// 开始识别
document.getElementById("startBtn").addEventListener("click", () => {
  recognizer.start()
})

// 停止识别
document.getElementById("stopBtn").addEventListener("click", () => {
  recognizer.stop()
})
```

### 使用 React 组件

```jsx
import React, { useState } from "react"
import { SpeechRecognizer } from "xfyun-sdk"

function App() {
  const [result, setResult] = useState("")

  const handleResult = (text, isEnd) => {
    setResult((prev) => prev + text)
  }

  return (
    <div className='App'>
      <h1>科大讯飞语音识别示例</h1>

      <SpeechRecognizer
        appId='你的应用 APPID'
        apiKey='你的 API Key'
        apiSecret='你的 API Secret'
        onResult={handleResult}
        buttonStartText='开始录音'
        buttonStopText='停止录音'
        showVolume={true}
        showStatus={true}
      />

      <div className='result-container'>
        <h2>完整识别结果:</h2>
        <div className='result-text'>{result}</div>
      </div>
    </div>
  )
}

export default App
```

## 📚 API 文档

### XfyunASR 类

#### 配置选项

| 参数         | 类型               | 必填 | 默认值                 | 说明                   |
| ------------ | ------------------ | ---- | ---------------------- | ---------------------- |
| appId        | string             | 是   | -                      | 科大讯飞应用 APPID     |
| apiKey       | string             | 是   | -                      | 科大讯飞 API Key       |
| apiSecret    | string             | 是   | -                      | 科大讯飞 API Secret    |
| language     | 'zh_cn' \| 'en_us' | 否   | 'zh_cn'                | 识别语言               |
| domain       | string             | 否   | 'iat'                  | 领域                   |
| accent       | string             | 否   | 'mandarin'             | 方言                   |
| vadEos       | number             | 否   | 3000                   | 静默检测，单位毫秒     |
| maxAudioSize | number             | 否   | 1048576                | 最大音频大小，单位字节 |
| autoStart    | boolean            | 否   | false                  | 是否自动开始           |
| hotWords     | string[]           | 否   | -                      | 热词列表               |
| punctuation  | boolean            | 否   | true                   | 是否包含标点符号       |
| audioFormat  | string             | 否   | 'audio/L16;rate=16000' | 音频格式               |

#### 事件处理器

| 事件                | 类型                                   | 说明               |
| ------------------- | -------------------------------------- | ------------------ |
| onStart             | () => void                             | 录音开始时触发     |
| onStop              | () => void                             | 录音停止时触发     |
| onRecognitionResult | (text: string, isEnd: boolean) => void | 有识别结果时触发   |
| onProcess           | (volume: number) => void               | 处理音量信息时触发 |
| onError             | (error: XfyunError) => void            | 发生错误时触发     |
| onStateChange       | (state: RecognizerState) => void       | 状态变更时触发     |

#### 方法

| 方法        | 参数 | 返回值          | 说明             |
| ----------- | ---- | --------------- | ---------------- |
| start       | -    | Promise<void>   | 开始语音识别     |
| stop        | -    | void            | 停止语音识别     |
| getResult   | -    | string          | 获取当前识别结果 |
| getState    | -    | RecognizerState | 获取当前状态     |
| clearResult | -    | void            | 清除识别结果     |

### SpeechRecognizer 组件

#### 属性

组件支持所有 XfyunASR 的配置选项，另外还包括：

| 属性            | 类型    | 必填 | 默认值     | 说明                 |
| --------------- | ------- | ---- | ---------- | -------------------- |
| className       | string  | 否   | ''         | 组件容器的自定义类名 |
| buttonClassName | string  | 否   | ''         | 按钮的自定义类名     |
| buttonStartText | string  | 否   | '开始录音' | 开始按钮文案         |
| buttonStopText  | string  | 否   | '停止录音' | 停止按钮文案         |
| showVolume      | boolean | 否   | true       | 是否显示音量条       |
| showStatus      | boolean | 否   | true       | 是否显示状态文案     |

## 🔄 工作原理

XfyunSDK 的工作流程如下：

1. **初始化**: 创建 XfyunASR 实例，配置参数
2. **开始识别**:
   - 申请麦克风权限
   - 初始化 AudioContext 和 MediaRecorder
   - 生成带签名的 WebSocket URL
   - 建立 WebSocket 连接
3. **数据传输**:
   - 麦克风采集音频数据
   - 将音频数据转换为 Base64 格式
   - 通过 WebSocket 发送到科大讯飞服务器
4. **结果处理**:
   - 接收服务器返回的识别结果
   - 解析结果并触发回调
5. **结束识别**:
   - 发送结束帧
   - 关闭 WebSocket 连接
   - 释放资源

### 架构图

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ 用户界面      │     │ XfyunASR 类    │     │ WebSocket    │
│ (浏览器)      │────>│               │────>│ 连接          │
└──────────────┘     └───────────────┘     └──────────────┘
        │                    │                     │
        │                    │                     │
        ▼                    ▼                     ▼
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ 音频采集      │     │ 数据处理        │     │ 科大讯飞      │
│ (麦克风)      │────>│ (Base64编码)   │────>│ 服务器        │
└──────────────┘     └───────────────┘     └──────────────┘
                                                   │
                                                   │
                                                   ▼
                                           ┌──────────────┐
                                           │ 识别结果       │
                                           │ 处理和展示     │
                                           └──────────────┘
```

## 🌐 浏览器兼容性

XfyunSDK 支持以下浏览器版本：

- Chrome 47+
- Firefox 44+
- Edge 79+
- Safari 11+
- Opera 34+

iOS Safari 和 老版 Android WebView 可能不完全支持所有功能。

## ❓ 常见问题

**Q: 为什么需要在 HTTPS 环境下使用？**

A: 由于安全限制，现代浏览器要求通过 HTTPS 访问 getUserMedia API（麦克风权限）。在开发环境中，您可以使用 localhost 而无需 HTTPS。

**Q: API Key 和 Secret 暴露在前端是否安全？**

A: 不安全。生产环境中应该通过后端接口转发请求，避免泄露密钥。可以设计一个中间服务器来处理认证和请求转发。

**Q: 如何提高识别准确率？**

A: 可以通过以下方式提高准确率：

1. 使用高质量麦克风
2. 在安静环境下录音
3. 配置合适的领域参数
4. 添加特定场景的热词列表

**Q: 如何处理长时间不说话的情况？**

A: 可以调整 vadEos 参数（静默检测时间），如果需要更长时间的静默，可以增加此值。

**Q: 支持哪些语言？**

A: 目前主要支持中文和英文，具体请参考科大讯飞官方文档。

## 🤝 贡献指南

我们非常欢迎并感谢您的贡献！

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/agions/xfyun-sdk.git
cd xfyun-sdk

# 安装依赖
npm install

# 构建项目
npm run build

# 运行示例
cd examples
npm install
npm start
```

### 提交代码

1. Fork 仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

### 代码规范

- 使用 TypeScript 开发
- 遵循 ESLint 规则
- 提交前运行测试
- 文档与代码保持同步

## 📝 更新日志

### 1.0.0

- 初始版本发布
- 实现基本语音识别功能
- 添加 React 组件支持

## 🔗 相关项目

- [科大讯飞开放平台](https://www.xfyun.cn/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 📄 开源许可

[MIT License](LICENSE) © Agions
