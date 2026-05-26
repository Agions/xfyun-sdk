---
outline: deep
next: /examples/asr-demo
---

# Logger 日志工具

::: tip
统一的日志记录和调试工具
:::

## 日志级别

| 级别 | 值 | 说明 |
|------|-----|------|
| `debug` | 0 | 调试信息，最详细 |
| `info` | 1 | 一般信息，默认级别 |
| `warn` | 2 | 警告信息 |
| `error` | 3 | 错误信息，最简洁 |

## Logger 类

### 构造函数

```typescript
import { Logger, LogLevel } from 'xfyun-sdk';

const logger = new Logger('MyApp', LogLevel.INFO);
```

**参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prefix` | `string` | `''` | 日志前缀 |
| `level` | `LogLevel` | `LogLevel.INFO` | 日志级别 |

### 方法

#### debug()

记录调试信息。

```typescript
logger.debug('调试信息', { data: 123 });
// 输出: [MyApp] debug: 调试信息 { data: 123 }
```

#### info()

记录一般信息。

```typescript
logger.info('一般信息', { data: 123 });
// 输出: [MyApp] info: 一般信息 { data: 123 }
```

#### warn()

记录警告信息。

```typescript
logger.warn('警告信息', { data: 123 });
// 输出: [MyApp] warn: 警告信息 { data: 123 }
```

#### error()

记录错误信息。

```typescript
logger.error('错误信息', { data: 123 });
// 输出: [MyApp] error: 错误信息 { data: 123 }
```

#### setLevel()

设置日志级别。

```typescript
logger.setLevel(LogLevel.DEBUG);
```

#### getLevel()

获取当前日志级别。

```typescript
const level = logger.getLevel();
console.log(level); // LogLevel.DEBUG
```

## 全局日志工具

### setLogLevel()

设置全局日志级别。

```typescript
import { setLogLevel, LogLevel } from 'xfyun-sdk';

setLogLevel(LogLevel.DEBUG);
```

### getLogLevel()

获取全局日志级别。

```typescript
import { getLogLevel } from 'xfyun-sdk';

const level = getLogLevel();
console.log(level); // LogLevel.DEBUG
```

### createLogger()

创建带前缀的日志实例。

```typescript
import { createLogger } from 'xfyun-sdk';

const asrLogger = createLogger('ASR');
asrLogger.info('识别开始');
```

## 使用示例

### 基础使用

```typescript
import { Logger, LogLevel } from 'xfyun-sdk';

const logger = new Logger('xfyun-sdk');

logger.info('SDK 初始化');
logger.debug('配置:', { appId: 'xxx', language: 'zh_cn' });

// 设置级别
logger.setLevel(LogLevel.WARN);

// 以下不会输出
logger.debug('调试信息');
logger.info('一般信息');

// 以下会输出
logger.warn('警告信息');
logger.error('错误信息');
```

### 与 SDK 集成

```typescript
import { createRecognizer, Logger } from 'xfyun-sdk';

const logger = new Logger('ASR');

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  logLevel: 'debug', // SDK 内置日志级别
});

recognizer.on('start', () => {
  logger.info('识别开始');
});

recognizer.on('result', (text) => {
  logger.debug('识别结果:', text);
});

recognizer.on('error', (error) => {
  logger.error('识别错误:', error.message);
});
```

### 自定义日志输出

```typescript
import { Logger } from 'xfyun-sdk';

class CustomLogger extends Logger {
  error(message: string, ...args: any[]) {
    // 发送到错误追踪服务
    errorTrackingService.report(message, args);
    super.error(message, ...args);
  }

  info(message: string, ...args: any[]) {
    // 记录到分析服务
    analyticsService.log(message, args);
    super.info(message, ...args);
  }
}

const logger = new CustomLogger('MyApp');
```

## 日志格式

### 默认格式

```
[前缀] 级别: 消息 附加数据
```

**示例**：

```
[xfyun-sdk] info: SDK 初始化
[ASR] debug: 识别结果: 你好世界
[TTS] warn: 音频格式不支持，使用默认格式
[Translator] error: 翻译失败: 网络超时
```

### 带时间戳格式

```typescript
import { Logger } from 'xfyun-sdk';

const logger = new Logger('MyApp');
logger.enableTimestamps();

logger.info('带时间戳的日志');
// 输出: [MyApp] 2026-05-25T10:30:00.000Z info: 带时间戳的日志
```

## 性能提示

::: tip
**日志性能优化**：

1. 生产环境使用 `info` 或 `warn` 级别
2. 避免在循环中记录 `debug` 日志
3. 使用日志级别过滤，避免不必要的字符串拼接
:::

```typescript
// ❌ 不推荐
logger.debug('结果:', JSON.stringify(largeData));

// ✅ 推荐
if (logger.getLevel() <= LogLevel.DEBUG) {
  logger.debug('结果:', JSON.stringify(largeData));
}
```

## 下一步

- [💡 ASR 示例代码](/examples/asr-demo)
- [💡 TTS 示例代码](/examples/tts-demo)
