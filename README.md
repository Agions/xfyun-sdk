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

## 常见问题与解决方案

### 1. 识别结果为空

**问题描述**: 语音识别过程正常，但没有返回识别结果或结果始终为空。

**可能原因**:
- API参数配置错误
- WebSocket连接异常
- 音频数据格式不匹配
- 麦克风权限或设置问题

**解决方案**:
- 确认您的 AppID、APIKey 和 APISecret 正确无误
- 检查浏览器控制台日志，查看是否有连接错误
- 尝试增加 `vadEos` 参数值（例如5000ms），避免过早结束识别
- 确保使用16000Hz采样率的音频
- 在安静环境中测试，减少背景噪音干扰
- 检查麦克风权限是否已授予
- 尝试使用不同的浏览器测试

### 2. 授权错误

**问题描述**: 出现"认证失败"或"签名错误"相关的错误信息。

**可能原因**:
- API密钥信息不正确
- 签名生成算法错误
- URL编码问题

**解决方案**:
- 仔细检查AppID、APIKey和APISecret是否与科大讯飞控制台一致
- 确保密钥没有多余的空格或特殊字符
- 更新SDK到最新版本，修复可能存在的签名问题
- 检查系统时间是否准确，时间差异可能导致签名失效

### 3. 浏览器兼容性问题

**问题描述**: 在某些浏览器中无法正常工作。

**可能原因**:
- 浏览器不支持WebSocket
- 浏览器的麦克风访问机制不同
- MediaRecorder API兼容性问题

**解决方案**:
- 使用推荐的浏览器：Chrome 70+、Firefox 75+、Safari 12.1+、Edge 79+
- 检查浏览器是否启用了HTTPS（某些浏览器需要HTTPS才能访问麦克风）
- 在调用`start()`方法前确保已获得用户授权
- 添加浏览器特性检测逻辑，提供降级处理方案

### 4. WebSocket连接问题

**问题描述**: WebSocket无法连接或频繁断开。

**可能原因**:
- 网络问题
- 防火墙或代理设置
- WebSocket URL格式错误

**解决方案**:
- 检查网络连接稳定性
- 确保防火墙未阻止WebSocket连接
- 检查控制台是否有CORS相关错误
- 增加重连机制，在连接断开后自动重新连接
- 使用开发者工具的Network面板监控WebSocket通信

### 5. 性能与资源问题

**问题描述**: 使用SDK时CPU占用高或出现卡顿。

**可能原因**:
- 音频处理消耗资源
- 数据发送频率过高
- 内存泄漏

**解决方案**:
- 适当调整音频采样率和质量
- 优化数据发送频率，避免过于频繁地发送小数据包
- 在不需要时及时调用`stop()`方法释放资源
- 确保在组件卸载时正确清理资源

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
