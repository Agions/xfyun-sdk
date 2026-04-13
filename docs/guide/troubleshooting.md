# 故障排除

## 常见问题

### 1. WebSocket 连接失败

**症状**：`WebSocket connection failed` 错误

**可能原因**：
- 网络代理阻止了 WebSocket 连接
- 讯飞服务暂时不可用
- API 密钥配置错误

**解决方案**：
- 检查 `appId`、`apiKey`、`apiSecret` 是否正确
- 检查浏览器控制台网络标签页
- 确认防火墙/代理允许 WebSocket 连接

### 2. 语音识别无结果

**症状**：启动识别后没有结果返回

**可能原因**：
- 麦克风权限未授予
- 麦克风设备不可用
- 没有音频输入

**解决方案**：
- 确认已授予麦克风权限
- 检查 `navigator.mediaDevices.enumerateDevices()` 确认设备可用
- 尝试使用 `getUserMedia` 测试麦克风是否正常工作

### 3. 语音合成无声音

**症状**：`speak()` 调用后没有声音输出

**可能原因**：
- 浏览器自动播放策略阻止
- AudioContext 被暂停
- 音频输出设备问题

**解决方案**：
- 用户首次交互后才能播放音频（浏览器自动播放策略）
- 调用 `synthesizer.resume()` 恢复 AudioContext
- 检查系统音量设置

### 4. CORS 错误

**症状**：`Access-Control-Allow-Origin` 相关错误

**解决方案**：
- 讯飞 WebSocket API 通常不需要 CORS 配置
- 确认使用的是正确的 API 端点
- 检查是否有代理服务器问题

### 5. 翻译结果为空

**症状**：`translateText()` 返回空字符串

**可能原因**：
- 源文本为空
- 不支持的源语言/目标语言
- API 请求超时

**解决方案**：
- 检查输入文本是否有效
- 确认语言代码正确（如 `'cn'`、``'en'`、``'ja'`）
- 增加超时时间配置

## 调试

开启调试模式查看详细日志：

```typescript
import { setLogLevel } from 'xfyun-sdk';

setLogLevel('debug');
```

## 获取帮助

- 查看 [API 文档](https://github.com/Agions/xfyun-sdk)
- 提交 [Issue](https://github.com/Agions/xfyun-sdk/issues)
