# SpeechRecognizer React 组件

`src/components/SpeechRecognizer.tsx`

## 简介

SpeechRecognizer 是一个 React Hooks 组件，封装了 `XfyunASR` 语音识别功能，提供开箱即用的 UI。

## 引入

```tsx
import SpeechRecognizer from 'xfyun-sdk/components/SpeechRecognizer';
// 或
import { SpeechRecognizer } from 'xfyun-sdk/components';
```

## 属性 (Props)

### 必需参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `appId` | `string` | 讯飞应用 ID |
| `apiKey` | `string` | 讯飞 API Key |
| `apiSecret` | `string` | 讯飞 API Secret |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `language` | `'zh_cn' \| 'en_us'` | `'zh_cn'` | 识别语言 |
| `domain` | `'iat' \| 'medical' \| 'assistant'` | `'iat'` | 领域模型 |
| `accent` | `'mandarin' \| 'cantonese'` | `'mandarin'` | 方言 |
| `hotWords` | `string[]` | - | 热词列表 |
| `punctuation` | `boolean` | `true` | 是否启用标点 |
| `autoStart` | `boolean` | `false` | 组件挂载时自动开始 |
| `onStart` | `() => void` | - | 开始识别回调 |
| `onStop` | `() => void` | - | 停止识别回调 |
| `onResult` | `(text: string, isEnd: boolean) => void` | - | 识别结果回调 |
| `onError` | `(error: unknown) => void` | - | 错误回调 |
| `className` | `string` | `''` | 容器 class |
| `buttonClassName` | `string` | `''` | 按钮 class |
| `buttonStartText` | `string` | `'开始录音'` | 开始按钮文字 |
| `buttonStopText` | `string` | `'停止录音'` | 停止按钮文字 |
| `showVolume` | `boolean` | `true` | 是否显示音量条 |
| `showStatus` | `boolean` | `true` | 是否显示状态 |

## 状态

组件内部维护以下状态：
- `idle` - 空闲
- `connecting` - 连接中
- `connected` - 已连接
- `recording` - 录音中
- `stopped` - 已停止
- `error` - 错误

## 使用示例

### 基础用法

```tsx
import React from 'react';
import SpeechRecognizer from 'xfyun-sdk/components/SpeechRecognizer';

function App() {
  return (
    <SpeechRecognizer
      appId="YOUR_APP_ID"
      apiKey="YOUR_API_KEY"
      apiSecret="YOUR_API_SECRET"
      onResult={(text, isEnd) => {
        console.log('识别结果:', text, '是否结束:', isEnd);
      }}
      onError={(error) => {
        console.error('识别错误:', error);
      }}
    />
  );
}
```

### 自定义样式

```tsx
<SpeechRecognizer
  appId="YOUR_APP_ID"
  apiKey="YOUR_API_KEY"
  apiSecret="YOUR_API_SECRET"
  language="en_us"
  domain="medical"
  buttonStartText="Start"
  buttonStopText="Stop"
  showVolume={true}
  showStatus={true}
  buttonClassName="my-custom-button"
  onStart={() => console.log('Started')}
  onStop={() => console.log('Stopped')}
/>
```

### 自动开始

```tsx
<SpeechRecognizer
  appId="YOUR_APP_ID"
  apiKey="YOUR_API_KEY"
  apiSecret="YOUR_API_SECRET"
  autoStart={true}
  onResult={(text, isEnd) => {
    if (isEnd) {
      console.log('最终结果:', text);
    }
  }}
/>
```

## 注意事项

1. **麦克风权限**：使用前需要用户授权麦克风权限
2. **自动播放策略**：浏览器的自动播放策略可能会阻止录音开始，通常需要用户交互后才能启动
3. **清理**：组件卸载时会自动调用 `destroy()` 清理资源
4. **内存泄漏防护**：使用 `isDestroyedRef` 标记防止卸载后 setState
