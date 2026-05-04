# xfyun-sdk 代码重复率分析报告

## 📊 重复率概览

| 类别 | 重复文件数 | 重复代码行数 | 重复模式 |
|------|-----------|-------------|---------|
| **核心类** | 3 (recognizer/synthesizer/translator) | ~200+ | WebSocket 管理、状态管理、错误处理 |
| **测试文件** | 8+ | ~150+ | Mock 类、测试设置、测试模式 |

---

## 🔍 主要重复模式

### 1. WebSocket 连接管理 (三个核心类)

**重复代码位置:**
- `src/recognizer.ts`: 第 328-376 行 (ensureWebSocket, safeSend, safeCloseWebSocket)
- `src/synthesizer.ts`: 第 182-230 行 (相同方法)
- `src/translator.ts`: 第 650-698 行 (相同方法)

**重复内容:**
```typescript
// 三个类都有几乎完全相同的实现
private ensureWebSocket(): WebSocket {
  if (!this.websocket) {
    this.logger.error('WebSocket 未初始化');
    throw new Error('WebSocket 未初始化');
  }
  return this.websocket;
}

private safeSend(data: string | ArrayBuffer): boolean {
  try {
    const ws = this.ensureWebSocket();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      this.logger.debug('WebSocket 发送数据成功');
      return true;
    } else {
      const stateMap: Record<number, string> = {
        0: 'CONNECTING', 1: 'OPEN', 2: 'CLOSING', 3: 'CLOSED'
      };
      this.logger.warn(`WebSocket 未就绪，当前状态: ${stateMap[ws.readyState]}`);
      return false;
    }
  } catch (error) {
    this.logger.error('WebSocket 发送数据失败:', error);
    return false;
  }
}

private safeCloseWebSocket(): void {
  if (this.websocket) {
    if (this.websocket.readyState === WebSocket.OPEN || 
        this.websocket.readyState === WebSocket.CONNECTING) {
      this.websocket.close(1000, '正常关闭');
    }
    this.websocket = null;
    this.logger.debug('WebSocket 已安全关闭');
  }
}
```

### 2. 状态管理 (三个核心类)

**重复代码位置:**
- `src/recognizer.ts`: 第 69-76 行, 第 875-892 行
- `src/synthesizer.ts`: 第 79-86 行, 第 511-528 行
- `src/translator.ts`: 第 95-102 行, 第 722-739 行

**重复内容:**
```typescript
// STATE_TRANSITIONS - 每个类都有
private static readonly STATE_TRANSITIONS: Record<StateType, StateType[]> = {
  'idle': ['connecting'],
  'connecting': ['connected', 'stopped', 'error'],
  'connected': ['synthesizing/translating', 'stopped', 'error'],
  'synthesizing/translating': ['stopped', 'error'],
  'stopped': ['idle', 'connecting'],
  'error': ['idle', 'connecting']
};

// setState - 每个类都有几乎相同的实现
private setState(state: StateType): void {
  const validTransitions = ThisClass.STATE_TRANSITIONS[this.state] || [];
  if (!validTransitions.includes(state)) {
    this.logger.warn(`⚠️ 非法状态转换: ${this.state} -> ${state}`);
  }
  this.state = state;
  if (this.handlers.onStateChange) {
    this.handlers.onStateChange(state);
  }
  this.logger.debug(`状态变更: ${this.state}`);
}
```

### 3. 定时器管理 (三个核心类)

**重复代码位置:**
- `src/recognizer.ts`: 第 718-727 行 (clearReconnectTimer)
- `src/synthesizer.ts`: 第 546-561 行 (clearWebSocketCloseTimer, clearConnectingTimer)
- `src/translator.ts`: 第 764-769 行 (clearWebSocketCloseTimer)

**重复内容:**
```typescript
// 每个类都有类似的定时器清理方法
private clearWebSocketCloseTimer(): void {
  if (this.websocketCloseTimer) {
    window.clearTimeout(this.websocketCloseTimer);
    this.websocketCloseTimer = null;
  }
}

private clearConnectingTimer(): void {
  if (this.connectingTimer) {
    window.clearTimeout(this.connectingTimer);
    this.connectingTimer = null;
  }
}
```

### 4. 错误处理 (三个核心类)

**重复代码位置:**
- `src/recognizer.ts`: 第 897-910 行
- `src/synthesizer.ts`: 第 533-541 行
- `src/translator.ts`: 第 744-759 行

**重复内容:**
```typescript
private handleError(error: ErrorType): void {
  this.setState('error');
  if (this.handlers.onError) {
    this.handlers.onError(error);
  }
  this.logger.error('讯飞 [模块名] 错误:', error);
}
```

### 5. 测试文件重复

**MockWebSocket 类重复:**
- `tests/recognizer.test.ts`: 第 6-20 行
- `tests/synthesizer.test.ts`: 第 6-20 行
- `tests/translator.test.ts`: 第 6-20 行

**beforeEach/afterEach 设置重复:**
```typescript
// 三个测试文件都有几乎相同的设置
beforeEach(() => {
  vi.clearAllMocks();
  (global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket as unknown as typeof WebSocket;
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

**构造函数测试重复:**
```typescript
describe('constructor', () => {
  it('should throw error when required parameters are missing', () => {
    expect(() => new XfyunXXX({} as XfyunXXOptions)).toThrow('缺少必要参数');
    expect(() => new XfyunXXX({ appId: 'test' } as XfyunXXOptions)).toThrow('缺少必要参数');
    expect(() => new XfyunXXX({ appId: 'test', apiKey: 'test' } as XfyunXXOptions)).toThrow('缺少必要参数');
  });
  
  it('should create instance with valid parameters', () => {
    const options: XfyunXXOptions = { appId: 'test', apiKey: 'test', apiSecret: 'test' };
    const instance = new XfyunXXX(options);
    expect(instance).toBeDefined();
    expect(instance.getState()).toBe('idle');
  });
});
```

---

## 🎯 重构方案

### 方案 A: 基类 + 抽象方法 (推荐)

创建 `BaseWebSocketClient` 基类，提取所有 WebSocket 相关逻辑:

```typescript
// src/base-websocket-client.ts
export abstract class BaseWebSocketClient {
  protected websocket: WebSocket | null = null;
  protected websocketCloseTimer: number | null = null;
  protected connectingTimer: number | null = null;
  protected readonly logger: Logger;
  protected readonly state: StateType;
  
  // 通用方法
  protected ensureWebSocket(): WebSocket { ... }
  protected safeSend(data: string | ArrayBuffer): boolean { ... }
  protected safeCloseWebSocket(): void { ... }
  protected clearWebSocketCloseTimer(): void { ... }
  protected clearConnectingTimer(): void { ... }
  
  // 抽象方法 - 子类实现
  protected abstract get STATE_TRANSITIONS(): Record<StateType, StateType[]>;
  protected abstract parseMessage(data: string | ArrayBuffer): void;
  protected abstract getErrorMessage(): string;
}
```

### 方案 B: Mixin 模式

使用 TypeScript Mixin 模式组合状态管理和 WebSocket 管理:

```typescript
// src/mixins/state-manager.ts
export function StateManager<T extends Constructor>(Base: T) {
  return class extends Base {
    private state: StateType = 'idle';
    protected setState(state: StateType): void { ... }
  };
}

// src/mixins/websocket-client.ts
export function WebSocketClient<T extends Constructor>(Base: T) {
  return class extends Base {
    protected websocket: WebSocket | null = null;
    protected safeSend(data: string): boolean { ... }
  };
}
```

### 方案 C: 工具函数 + 组合 (最灵活)

创建独立的工具函数，通过组合使用:

```typescript
// src/websocket-utils.ts
export function createWebSocketHandlers(client: {
  websocket: WebSocket | null;
  logger: Logger;
  setState: (s: StateType) => void;
  handleError: (e: Error) => void;
}) {
  return {
    onopen: () => { ... },
    onmessage: (event: MessageEvent) => { ... },
    onerror: (error: Event) => { ... },
    onclose: (event: CloseEvent) => { ... }
  };
}

// src/state-utils.ts
export function createStateManager<State extends string>(
  transitions: Record<State, State[]>,
  handlers: { onStateChange?: (s: State) => void },
  logger: Logger
) {
  let state: State = 'idle' as State;
  return {
    getState: () => state,
    setState: (newState: State) => { ... }
  };
}
```

---

## 📈 预期效果

| 指标 | 重构前 | 重构后 | 改善 |
|------|--------|--------|------|
| 核心类重复代码 | ~200 行 | ~50 行 | -75% |
| 测试文件 Mock 类 | 3 个 | 1 个 | -67% |
| 测试设置代码 | ~30 行/文件 | ~5 行/文件 | -83% |
| 总重复代码行数 | ~350+ | ~80 | -77% |

---

## ⚠️ 注意事项

1. **保持 API 兼容性**: 重构后对外暴露的 API 不应改变
2. **测试覆盖**: 重构前后运行完整测试套件验证
3. **类型安全**: 确保 TypeScript 类型推导正确
4. **文档更新**: 更新相关 JSDoc 注释

---

## 🚀 执行步骤

1. ✅ 分析重复模式 (已完成)
2. ⏳ 创建 `BaseWebSocketClient` 基类
3. ⏳ 重构 `XfyunASR` 继承基类
4. ⏳ 重构 `XfyunTTS` 继承基类
5. ⏳ 重构 `XfyunTranslator` 继承基类
6. ⏳ 创建测试工具函数 `tests/test-utils.ts`
7. ⏳ 重构测试文件使用共享工具
8. ⏳ 运行测试验证
9. ⏳ 重新运行 jscpd 确认改善
