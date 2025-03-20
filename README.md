# 科大讯飞语音识别 SDK

[![npm version](https://img.shields.io/npm/v/xfyun-sdk.svg)](https://www.npmjs.com/package/xfyun-sdk)
[![npm downloads](https://img.shields.io/npm/dm/xfyun-sdk.svg)](https://www.npmjs.com/package/xfyun-sdk)
[![license](https://img.shields.io/npm/l/xfyun-sdk.svg)](https://github.com/agions/xfyun-sdk/blob/main/LICENSE)

科大讯飞语音识别 SDK，支持浏览器中实时语音听写功能。基于科大讯飞开放平台 WebAPI 开发，提供了简单易用的接口和 React 组件。

## 特性

- 🎯 实时语音识别
- ⚡️ 支持 React 组件集成
- 📦 TypeScript 支持
- 🌐 浏览器环境支持
- ⚙️ 自定义配置
- 🔥 热词识别
- 🔊 音量检测
- ⚠️ 错误处理
- 🎧 事件监听

## 安装

```bash
npm install xfyun-sdk
# 或者
yarn add xfyun-sdk
```

## 快速开始

### 基础用法

```typescript
import { XfyunASR } from 'xfyun-sdk';

// 创建识别器实例
const recognizer = new XfyunASR({
  appId: 'your_app_id',
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret',
  language: 'zh_cn',
  accent: 'mandarin',
  vadEos: 3000
}, {
  onRecognitionResult: (text) => {
    console.log('识别结果:', text);
  },
  onError: (error) => {
    console.error('错误:', error);
  }
});

// 开始识别
await recognizer.start();

// 停止识别
recognizer.stop();
```

### React 组件使用

```typescript
import { SpeechRecognizer } from 'xfyun-sdk';

function App() {
  return (
    <SpeechRecognizer
      appId="your_app_id"
      apiKey="your_api_key"
      apiSecret="your_api_secret"
      onResult={(text) => console.log('识别结果:', text)}
      onError={(error) => console.error('错误:', error)}
    />
  );
}
```

## API 文档

### XfyunASR 类

#### 构造函数选项

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| appId | string | 是 | - | 科大讯飞开放平台应用 ID |
| apiKey | string | 是 | - | 科大讯飞开放平台 API Key |
| apiSecret | string | 是 | - | 科大讯飞开放平台 API Secret |
| language | 'zh_cn' \| 'en_us' | 否 | 'zh_cn' | 识别语言 |
| domain | 'iat' \| 'medical' \| 'assistant' | 否 | 'iat' | 识别领域 |
| accent | 'mandarin' \| 'cantonese' | 否 | 'mandarin' | 方言 |
| vadEos | number | 否 | 3000 | 静默检测时间（毫秒） |
| maxAudioSize | number | 否 | 1024 * 1024 | 最大音频大小（字节） |
| autoStart | boolean | 否 | false | 是否自动开始识别 |
| hotWords | string[] | 否 | - | 热词列表 |
| audioFormat | string | 否 | 'audio/L16;rate=16000' | 音频格式 |

#### 方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| start | 开始识别 | - | Promise<void> |
| stop | 停止识别 | - | void |
| getResult | 获取识别结果 | - | string |
| getState | 获取当前状态 | - | RecognizerState |
| clearResult | 清除识别结果 | - | void |

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| start | 开始识别时触发 | - |
| stop | 停止识别时触发 | - |
| result | 识别结果时触发 | text: string |
| error | 发生错误时触发 | error: XfyunError |
| process | 处理中时触发 | volume: number |
| stateChange | 状态改变时触发 | state: RecognizerState |

### SpeechRecognizer 组件

#### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| appId | string | 是 | - | 科大讯飞开放平台应用 ID |
| apiKey | string | 是 | - | 科大讯飞开放平台 API Key |
| apiSecret | string | 是 | - | 科大讯飞开放平台 API Secret |
| onStart | () => void | 否 | - | 开始识别回调 |
| onStop | () => void | 否 | - | 停止识别回调 |
| onResult | (text: string) => void | 否 | - | 识别结果回调 |
| onError | (error: XfyunError) => void | 否 | - | 错误回调 |
| onProcess | (volume: number) => void | 否 | - | 处理中回调 |
| onStateChange | (state: RecognizerState) => void | 否 | - | 状态改变回调 |

## 示例

查看 [examples](./examples) 目录获取更多示例：

- [React 示例](./examples/react-demo)
- [HTML 示例](./examples/html)

## 浏览器兼容性

- Chrome 70+
- Firefox 75+
- Safari 12.1+
- Edge 79+

## 注意事项

1. 首次使用时需要允许浏览器访问麦克风
2. 确保网络连接稳定
3. 建议在安静的环境中使用
4. 需要有效的科大讯飞开放平台账号和 API 密钥

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细更新内容。

## 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 贡献

欢迎提交 Issue 和 Pull Request！

查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与贡献。
