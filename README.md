# 🎤 xfyun-sdk

科大讯飞语音识别（ASR）SDK，支持浏览器端实时语音转文字。

[![npm version](https://img.shields.io/npm/v/xfyun-sdk.svg)](https://www.npmjs.com/package/xfyun-sdk)
[![License](https://img.shields.io/npm/l/xfyun-sdk.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)

## ✨ 特性

- 🎯 **实时识别** - 支持浏览器端实时语音转文字
- 🔄 **自动重连** - WebSocket 断开自动重连，保持连接
- 📦 **多端支持** - 原生 JS / React 组件 / Vue / 小程序
- 🔧 **配置灵活** - 语言、领域、方言、热词等参数可调
- 📝 **完整类型** - TypeScript 类型定义完备
- 🛡️ **资源管理** - 完善的 destroy 机制，防止内存泄漏
- 📊 **日志系统** - 可配置的日志级别，方便调试

## 📦 安装

```bash
npm install xfyun-sdk
```

或使用 CDN：

```html
<script src="https://cdn.jsdelivr.net/npm/xfyun-sdk/dist/index.umd.js"></script>
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import { XfyunASR } from 'xfyun-sdk';

const recognizer = new XfyunASR({
  appId: 'your_app_id',
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret',
  language: 'zh_cn',      // 语言：zh_cn | en_us
  domain: 'iat',          // 领域：iat | medical | assistant
  accent: 'mandarin',     // 方言：mandarin | cantonese
  vadEos: 3000,          // 静音检测时长(ms)
  autoStart: false,       // 是否自动开始
}, {
  onStart: () => console.log('开始识别'),
  onStop: () => console.log('停止识别'),
  onRecognitionResult: (text, isEnd) => {
    console.log('识别结果:', text, '是否最终:', isEnd);
  },
  onProcess: (volume) => console.log('音量:', volume),
  onError: (error) => console.error('错误:', error),
});

// 开始录音
recognizer.start();

// 停止录音
recognizer.stop();

// 销毁实例
recognizer.destroy();
```

### React 组件

```tsx
import { SpeechRecognizer } from 'xfyun-sdk';

function App() {
  return (
    <SpeechRecognizer
      appId="your_app_id"
      apiKey="your_api_key"
      apiSecret="your_api_secret"
      language="zh_cn"
      domain="iat"
      accent="mandarin"
      autoStart={false}
      onStart={() => console.log('开始识别')}
      onStop={() => console.log('停止识别')}
      onResult={(text, isEnd) => console.log('结果:', text, isEnd)}
      onError={(error) => console.error('错误:', error)}
      showVolume={true}
      showStatus={true}
    />
  );
}
```

## ⚙️ 配置选项

### XfyunASROptions

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | `string` | **必填** | 讯飞应用 ID |
| `apiKey` | `string` | **必填** | 讯飞 API Key |
| `apiSecret` | `string` | **必填** | 讯飞 API Secret |
| `language` | `'zh_cn' \| 'en_us'` | `'zh_cn'` | 识别语言 |
| `domain` | `'iat' \| 'medical' \| 'assistant'` | `'iat'` | 领域 |
| `accent` | `'mandarin' \| 'cantonese'` | `'mandarin'` | 方言 |
| `vadEos` | `number` | `3000` | 静音检测时长(ms) |
| `maxAudioSize` | `number` | `1048576` | 最大音频大小(bytes) |
| `autoStart` | `boolean` | `false` | 是否自动开始 |
| `hotWords` | `string[]` | `[]` | 热词列表 |
| `punctuation` | `boolean \| string` | `true` | 是否包含标点 |
| `audioFormat` | `string` | `'audio/L16;rate=16000'` | 音频格式 |
| `enableReconnect` | `boolean` | `false` | 是否启用自动重连 |
| `reconnectAttempts` | `number` | `3` | 重连次数 |
| `reconnectInterval` | `number` | `3000` | 重连间隔(ms) |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |

### ASREventHandlers

| 回调 | 说明 |
|------|------|
| `onStart` | 开始识别时触发 |
| `onStop` | 停止识别时触发 |
| `onRecognitionResult(text, isEnd)` | 识别结果返回，`isEnd` 表示是否最终结果 |
| `onProcess(volume)` | 音量变化回调，0-1 之间 |
| `onError(error)` | 发生错误时触发 |
| `onStateChange(state)` | 状态变化时触发 |

## 🔌 接口方法

### XfyunASR 类

```typescript
// 构造函数
new XfyunASR(options: XfyunASROptions, handlers: ASREventHandlers)

// 方法
.start()           // 开始识别
.stop()            // 停止识别
.destroy()         // 销毁实例，释放所有资源
.getResult()      // 获取当前识别结果
.getState()        // 获取当前状态
.clearResult()     // 清除识别结果

// 属性
.logger           // Logger 实例，可配置日志级别
```

### RecognizerState 状态

| 状态 | 说明 |
|------|------|
| `'idle'` | 空闲状态 |
| `'connecting'` | 连接中 |
| `'connected'` | 已连接 |
| `'recording'` | 录音中 |
| `'stopped'` | 已停止 |
| `'error'` | 错误状态 |

## 🛡️ 资源管理

组件使用完成后请调用 `destroy()` 方法释放资源：

```javascript
const recognizer = new XfyunASR(options, handlers);

// 使用完成后
recognizer.destroy(); // 释放麦克风、WebSocket 等资源
```

React 组件在卸载时会自动调用 `destroy()`。

## 🔄 自动重连

启用自动重连功能：

```javascript
const recognizer = new XfyunASR({
  // ... 其他配置
  enableReconnect: true,      // 启用重连
  reconnectAttempts: 3,       // 重连次数
  reconnectInterval: 3000,    // 重连间隔(ms)
}, handlers);
```

当 WebSocket 连接断开时，会自动尝试重连。

## 📝 日志配置

```javascript
const recognizer = new XfyunASR({
  // ...
  logLevel: 'debug',  // debug | info | warn | error
}, handlers);

// 运行时修改日志级别
recognizer.logger.setLevel('error');
```

## 🐛 常见问题

### 1. 麦克风权限被拒绝

浏览器需要用户授权麦克风权限。首次使用时会有权限提示，请选择允许。

### 2. 语音识别结果为空

- 检查控制台是否有错误信息
- 确认 `appId`、`apiKey`、`apiSecret` 是否正确
- 检查网络连接是否正常
- 尝试在安静环境说话

### 3. React 组件内存泄漏

确保在组件卸载时调用了 `destroy()`。React 组件会自动处理，无需手动调用。

### 4. CORS 跨域问题

确保讯飞 API 配置了正确的 CORS 域名。

## 📚 更多示例

- [React 示例](./examples/react-demo/)
- [HTML 原生示例](./examples/html/)

## 📄 许可证

[MIT License](./LICENSE)

## 🙏 致谢

基于[科大讯飞语音识别 API](https://www.xfyun.cn/)开发。
