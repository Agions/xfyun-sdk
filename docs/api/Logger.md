# Logger API

`src/logger.ts`

## LogLevel 枚举

```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
```

| 级别 | 值 | 说明 |
|------|-----|------|
| `DEBUG` | 0 | 调试信息 |
| `INFO` | 1 | 一般信息 |
| `WARN` | 2 | 警告 |
| `ERROR` | 3 | 错误 |

## Logger 类

### 构造函数

```typescript
constructor(prefix?: string)
```

创建一个新的 Logger 实例。

**参数：**
- `prefix` (string, 可选): 日志前缀，默认为 `'[XfyunASR]'`

### 方法

#### setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void

设置日志级别。

```typescript
const logger = new Logger('[MyApp]');
logger.setLevel('debug');
```

#### debug(...args: any[]): void

输出调试日志（仅当级别为 DEBUG 时）。

```typescript
logger.debug('Variable:', someValue);
```

#### info(...args: any[]): void

输出信息日志。

```typescript
logger.info('Application started');
```

#### warn(...args: any[]): void

输出警告日志。

```typescript
logger.warn('Deprecated API used');
```

#### error(...args: any[]): void

输出错误日志。

```typescript
logger.error('Failed to connect', error);
```

## 使用示例

```typescript
import { Logger, LogLevel } from 'xfyun-sdk';

const logger = new Logger('[MyApp]');

// 设置日志级别
logger.setLevel('debug');

// 使用不同级别的日志
logger.debug('Debug info');
logger.info('Info message');
logger.warn('Warning');
logger.error('Error occurred');
```
