---
outline: deep
next: /guide/troubleshooting
---

# 最佳实践

::tip{icon=✅ title=生产环境建议}
让你的应用更稳定、更高效、更安全
::

## 资源管理

### 始终调用 destroy()

::danger{title=⚠️ 重要}
**务必在组件卸载时调用 `destroy()`**，避免资源泄漏！
::

```typescript
// React
import { useEffect } from 'react';
import { createRecognizer } from 'xfyun-sdk';

function MyComponent() {
  useEffect(() => {
    const recognizer = createRecognizer(options);
    
    return () => {
      recognizer.destroy(); // 组件卸载时清理
    };
  }, []);
}

// Vue
import { onUnmounted } from 'vue';
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer(options);

onUnmounted(() => {
  recognizer.destroy(); // 组件卸载时清理
});
```

### 避免重复创建实例

```typescript
// ❌ 不推荐：每次渲染都创建新实例
function BadComponent() {
  const recognizer = createRecognizer(options); // 每次渲染都创建
  return <div>...</div>;
}

// ✅ 推荐：使用 useRef 或 onMounted 创建一次
function GoodComponent() {
  const recognizerRef = useRef(null);
  
  useEffect(() => {
    recognizerRef.current = createRecognizer(options);
    return () => recognizerRef.current.destroy();
  }, []);
  
  return <div>...</div>;
}
```

---

## 错误处理

### 统一错误处理

```typescript
import { createRecognizer, XfyunError } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

recognizer.on('error', (error: XfyunError) => {
  // 根据错误码处理
  switch (error.code) {
    case 10001:
      // API 调用失败
      showError('服务暂时不可用，请稍后重试');
      break;
    case 20001:
      // 网络连接失败
      showError('网络连接失败，请检查网络');
      break;
    case 30001:
      // 音频设备错误
      showError('无法访问麦克风，请检查权限');
      break;
    default:
      showError(`错误: ${error.message}`);
  }
  
  // 记录到错误追踪服务
  errorTrackingService.report(error);
});
```

### 启用自动重连

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  enableReconnect: true,
  reconnectAttempts: 3,
  reconnectInterval: 3000,
});
```

---

## 性能优化

### 启用 WebSocket 持久连接

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  enableReconnect: true, // 启用自动重连
});

// 多次识别复用同一个实例
recognizer.start();
// ... 识别完成
recognizer.stop();

// 再次识别（复用连接）
recognizer.start();
```

### 合理设置 VAD 超时

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  vadEos: 2000, // 静音超时 2 秒（默认 3000ms）
});
```

### 使用热词提高识别率

```typescript
const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  hotWords: ['讯飞', '语音', '识别', '人工智能', '机器学习'],
});
```

---

## 用户体验

### 显示识别状态

```typescript
const [status, setStatus] = useState<'idle' | 'connecting' | 'recording' | 'error'>('idle');

const recognizer = createRecognizer(options);

recognizer.on('state-change', (state) => {
  setStatus(state);
});

// UI 显示
{status === 'connecting' && <Spinner />}
{status === 'recording' && <RecordingIndicator />}
{status === 'error' && <ErrorMessage />}
```

### 提供清晰的错误提示

```typescript
const ERROR_MESSAGES = {
  10001: '服务暂时不可用，请稍后重试',
  20001: '网络连接失败，请检查网络',
  30001: '无法访问麦克风，请检查权限',
  40001: 'WebSocket 连接失败',
  50001: '权限被拒绝',
};

recognizer.on('error', (error) => {
  const message = ERROR_MESSAGES[error.code] || error.message;
  toast.error(message);
});
```

### 支持中断和恢复

```typescript
const recognizer = createRecognizer(options);

// 暂停
function pause() {
  recognizer.stop();
}

// 恢复
function resume() {
  recognizer.start();
}

// 清除结果
function clear() {
  recognizer.clearResult();
}
```

---

## 安全实践

### 使用环境变量

```typescript
// ✅ 推荐
const recognizer = createRecognizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
});

// ❌ 不推荐
const recognizer = createRecognizer({
  appId: '12345678', // 硬编码！
  apiKey: 'abcdefg',
  apiSecret: 'hijklmn',
});
```

### 限制 API 使用

```typescript
// 添加使用限制
const MAX_RECOGNITION_TIME = 60000; // 60 秒
const startTime = Date.now();

recognizer.on('result', (text) => {
  if (Date.now() - startTime > MAX_RECOGNITION_TIME) {
    recognizer.stop();
    toast.warning('识别时间过长，已自动停止');
  }
});
```

---

## 测试建议

### 单元测试

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createRecognizer } from 'xfyun-sdk';

describe('Recognizer', () => {
  it('应该正确初始化', () => {
    const recognizer = createRecognizer({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });
    
    expect(recognizer.getState()).toBe('idle');
  });

  it('应该正确处理错误', () => {
    const onError = vi.fn();
    const recognizer = createRecognizer({
      appId: 'test',
      apiKey: 'test',
      apiSecret: 'test',
    });
    
    recognizer.on('error', onError);
    
    // 模拟错误
    // ...
    
    expect(onError).toHaveBeenCalled();
  });
});
```

### 集成测试

```typescript
describe('完整识别流程', () => {
  it('应该完成一次完整的识别', async () => {
    const recognizer = createRecognizer(options);
    const results: string[] = [];
    
    recognizer.on('result', (text) => {
      results.push(text);
    });
    
    await recognizer.start();
    await sleep(1000);
    recognizer.stop();
    
    expect(results.length).toBeGreaterThan(0);
    recognizer.destroy();
  });
});
```

---

## 监控和日志

### 启用调试日志

```typescript
import { setLogLevel } from 'xfyun-sdk';

// 开发环境
setLogLevel('debug');

// 生产环境
setLogLevel('error');
```

### 记录关键事件

```typescript
import { Analytics } from '@/services/analytics';

recognizer.on('start', () => {
  Analytics.track('recognition_started');
});

recognizer.on('result', (text) => {
  Analytics.track('recognition_result', { length: text.length });
});

recognizer.on('error', (error) => {
  Analytics.track('recognition_error', { code: error.code });
});
```

---

## 检查清单

### 开发阶段

- [ ] 使用环境变量管理 API 凭证
- [ ] 启用调试日志
- [ ] 编写单元测试
- [ ] 测试错误处理

### 生产阶段

- [ ] 禁用调试日志
- [ ] 启用自动重连
- [ ] 实现错误追踪
- [ ] 添加使用监控
- [ ] 确保所有实例都调用 `destroy()`

---

## 下一步

- [❓ 故障排除](/guide/troubleshooting)
- [💡 示例代码](/examples/asr-demo)
