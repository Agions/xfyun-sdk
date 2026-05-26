---
outline: deep
---

# 故障排除

::: tip
遇到问题？看看这里有没有解决方案
:::

## WebSocket 连接失败

**症状**：`WebSocket connection failed` 错误

**可能原因**：
- 网络代理阻止了 WebSocket 连接
- 讯飞服务暂时不可用
- API 密钥配置错误

**解决方案**：
1. 检查 `appId`、`apiKey`、`apiSecret` 是否正确
2. 检查浏览器控制台网络标签页
3. 确认防火墙/代理允许 WebSocket 连接
4. 尝试切换网络环境

```typescript
// 启用自动重连
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  enableReconnect: true,
  reconnectAttempts: 3,
  reconnectInterval: 3000,
});
```

## 语音识别无结果

**症状**：启动识别后没有结果返回

**可能原因**：
- 麦克风权限未授予
- 麦克风设备不可用
- 没有音频输入

**解决方案**：
1. 确认已授予麦克风权限
2. 检查 `navigator.mediaDevices.enumerateDevices()` 确认设备可用
3. 尝试使用 `getUserMedia` 测试麦克风是否正常工作

```typescript
// 测试麦克风
async function testMicrophone() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('麦克风可用:', stream);
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    console.error('麦克风不可用:', err);
  }
}
```

## 语音合成无声音

**症状**：`speak()` 调用后没有声音输出

**可能原因**：
- 浏览器自动播放策略阻止
- AudioContext 被暂停
- 音频输出设备问题

**解决方案**：
1. 用户首次交互后才能播放音频（浏览器自动播放策略）
2. 调用 `synthesizer.resume()` 恢复 AudioContext
3. 检查系统音量设置

```typescript
// 在用户交互后调用
button.addEventListener('click', async () => {
  await synthesizer.speak('你好');
});
```

## CORS 错误

**症状**：`Access-Control-Allow-Origin` 相关错误

**解决方案**：
- 讯飞 WebSocket API 通常不需要 CORS 配置
- 确认使用的是正确的 API 端点
- 检查是否有代理服务器问题

## 翻译结果为空

**症状**：`translateText()` 返回空字符串

**可能原因**：
- 源文本为空
- 不支持的源语言/目标语言
- API 请求超时

**解决方案**：
1. 检查输入文本是否有效
2. 确认语言代码正确（如 `'cn'`、`'en'`、`'ja'`）
3. 增加超时时间配置

## 内存泄漏

**症状**：长时间使用后内存持续增长

**可能原因**：
- 未调用 `destroy()` 销毁实例
- WebSocket 连接未关闭
- 事件监听器未移除

**解决方案**：
1. **务必在组件卸载时调用 `destroy()`**

```typescript
// React
useEffect(() => {
  const recognizer = createRecognizer(options);
  return () => recognizer.destroy();
}, []);

// Vue
onUnmounted(() => {
  recognizer.destroy();
});

// 原生 JS
window.addEventListener('beforeunload', () => {
  recognizer.destroy();
});
```

## 识别结果不准确

**症状**：识别结果与说话内容不符

**可能原因**：
- 麦克风质量差
- 背景噪音大
- 未使用热词
- 领域模型不匹配

**解决方案**：
1. 使用高质量麦克风
2. 减少背景噪音
3. 使用热词提高特定词汇识别率
4. 选择合适的领域模型

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  hotWords: ['讯飞', '语音', '识别'],
  domain: 'medical', // 医疗领域
});
```

## 开启调试模式

查看详细日志帮助排查问题：

```typescript
import { setLogLevel } from 'xfyun-sdk';

setLogLevel('debug');
```

## 获取帮助

如果以上方案都无法解决问题，请：

1. 📖 查看 [API 文档](/api/asr)
2. 📖 查看 [示例代码](/examples/asr-demo)
3. 🐛 [提交 Issue](https://github.com/Agions/xfyun-sdk/issues)
4. 💬 [GitHub Discussions](https://github.com/Agions/xfyun-sdk/discussions)

**提交 Issue 时请提供**：
- 浏览器版本
- SDK 版本
- 完整的错误信息
- 最小可复现代码
- 预期行为和实际行为
