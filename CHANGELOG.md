# 更新日志

## 1.1.0 (2026-03-23)

### 新增

- ✨ WebSocket 自动重连机制（`enableReconnect`、`reconnectAttempts`、`reconnectInterval`）
- ✨ 可配置日志级别（`logLevel`：`debug` | `info` | `warn` | `error`）
- ✨ `Logger` 类，支持统一日志管理
- ✨ `destroy()` 方法，彻底释放资源

### 修复

- 🐛 修复 React 组件内存泄漏问题（使用 `stateRef` 避免闭包陷阱）
- 🐛 修复 cleanup 函数中 state 闭包过期问题
- 🐛 修复组件销毁后仍执行回调的问题（`isDestroyedRef`）
- 🔧 抽取重复的 `business` 参数构建逻辑

### 改进

- ⚡️ 优化 `buildBusinessParams()` 减少重复代码
- 📦 导出 `Logger` 类和 `LogLevel` 枚举

## 1.0.2 (2023-07-28)

### 修复

- 🐛 修复语音识别结果为空的问题
- 🔒 修复URL编码安全问题，从encodeURI改为encodeURIComponent
- 🔧 优化WebSocket连接处理逻辑
- 🔊 增强错误日志记录，便于排查问题

### 改进

- ⚡️ 改进音频处理流程，提高识别准确率
- 📝 添加常见问题解决方案文档
- 🎨 优化示例代码UI/UX设计
- 📊 改进音量监测算法
- 🌐 增强浏览器兼容性

## 1.0.1 (2023-06-15)

### 新增

- ✨ 首次发布
- 🚀 支持浏览器中实时语音识别
- 📦 支持React组件集成
- 📝 完善文档和示例

## [1.0.0] 

### 新增
- 初始版本发布
- 支持实时语音识别功能
- 支持 React 组件集成
- 支持 TypeScript
- 支持浏览器环境
- 支持自定义配置
- 支持热词识别
- 支持音量检测
- 支持错误处理
- 支持事件监听 