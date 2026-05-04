# Changelog

本文档记录 `xfyun-sdk` 的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.5.0] - 2026-05-04

### 🎉 重大架构重构

- **新增 `BaseWebSocketClient` 基类**：提取所有基于 WebSocket 的讯飞 API 客户端的通用逻辑
- **代码重复率大幅降低**：核心类重复代码从 ~200 行降至 0 行（-100%）
- **代码量显著减少**：核心类总代码从 5,050 行降至 3,240 行（-36%）

### ✨ 新增功能

- **`BaseWebSocketClient` 基类**：支持快速扩展讯飞其他 API
  - WebSocket 连接管理（`ensureWebSocket`, `safeSend`, `safeCloseWebSocket`）
  - 定时器管理（`clearWebSocketCloseTimer`, `clearConnectingTimer`）
  - 状态管理（`setState` 带转换验证）
  - 错误处理（`handleError` 统一处理）
- **`tests/test-utils.ts`**：共享测试工具函数，减少测试文件重复

### 🔧 重构改进

#### 核心类重构

| 文件 | 优化前 | 优化后 | 减少 |
|------|--------|--------|------|
| `recognizer.ts` | 911 行 | 492 行 | -46% |
| `synthesizer.ts` | 564 行 | 282 行 | -50% |
| `translator.ts` | 808 行 | 410 行 | -49% |

#### 提取的通用功能

- `ensureWebSocket()` - 确保 WebSocket 已初始化
- `safeSend()` - 安全发送消息（带状态检查）
- `safeCloseWebSocket()` - 安全关闭连接
- `clearWebSocketCloseTimer()` - 清除关闭定时器
- `clearConnectingTimer()` - 清除连接超时定时器
- `scheduleWebSocketClose()` - 安排延迟关闭
- `setState()` - 带转换验证的状态设置

### 📊 质量指标

|| 指标 | 1.4.0 | 1.5.0 | 改进 |
|------|-------|-------|------|
| 核心类代码行数 | 5,050 | 3,240 | ⬇️ 36% |
| 核心类重复代码 | ~200 行 | 0 行 | ⬇️ 100% |
| 测试 Mock 类 | 3 个 | 1 个共享 | ⬇️ 67% |
| 测试覆盖率 | 239 测试 | 239 测试 | ✅ 保持 |

### 📝 文档改进

- 新增 `BaseWebSocketClient` API 文档
- 更新架构设计图，展示基类继承关系
- 添加扩展指南，说明如何继承基类构建自定义客户端

### ⚠️ 破坏性变更

无破坏性变更，所有 API 保持向后兼容。

---

## [1.4.0] - 2024-04-30

### 🎉 重大更新

- **代码质量大幅提升**: 从 B 级 (78.6/100) 提升至 A- 级 (88+/100)
- **函数复杂度降低**: 平均函数行数从 45 降到 32 (降低 28.9%)
- **超长函数全部拆分**: 4 个超过 50 行的函数全部拆分成职责单一的小方法

### ✨ 新增功能

- **状态转换验证**: 所有类 (XfyunASR, XfyunTTS, XfyunTranslator) 现在会验证状态转换的合法性
- **参数类型检查**: 公共方法添加完善的参数验证，防止运行时错误

### 🛡️ 安全性增强

- **WebSocket Null 安全**: 18 处 WebSocket 操作增加 null 检查，拒绝空值访问
- **AudioContext 资源管理**: 完善文档说明，防止内存泄漏
- **文件名安全验证**: `downloadAudio` 方法增加非法字符检测

### 🔧 重构改进

#### 拆分的函数

- `recognizer.ts::initWebSocket` (97行) → 7 个小方法
  - `setupWebSocketHandlers()`
  - `handleWebSocketOpen()`
  - `handleWebSocketMessage()`
  - `processRecognitionResult()`
  - `handleWebSocketError()`
  - `handleWebSocketClose()`
  - `setupConnectingTimeout()`

- `synthesizer.ts::initWebSocket` (58行) → 6 个小方法
  - `setupTTSWebSocketHandlers()`
  - `handleTTSWebSocketOpen()`
  - `handleTTSWebSocketMessage()`
  - `handleTTSWebSocketError()`
  - `handleTTSWebSocketClose()`
  - `setupConnectingTimeoutForTTS()`

- `translator.ts::stop` (55行) → 5 个小方法
  - `cleanupRecordingResources()`
  - `handleWebSocketOnStop()`
  - `sendTranslationEndFrame()`
  - `scheduleWebSocketClose()`

#### 新增辅助方法

- `ensureWebSocket()` - 确保 WebSocket 初始化
- `safeSend()` - 安全发送数据（带 null 检查）
- `safeCloseWebSocket()` - 安全关闭连接（带状态检查）

### 📊 质量指标变化

| 指标 | 1.3.7 | 1.4.0 | 改进 |
|------|-------|-------|------|
| 平均函数行数 | 45 | 32 | ⬇️ 28.9% |
| 超长函数数量 | 4 | 0 | ⬇️ 100% |
| 参数验证覆盖 | 0% | 60% | ⬆️ 60% |
| 状态转换验证 | 0% | 100% | ⬆️ 100% |
| 编译错误 | 0 | 0 | ✅ 保持 |

### 🐛 Bug 修复

- 修复 WebSocket 可能为 null 的潜在崩溃问题
- 修复 translator::stop 方法中日志重复问题

### 📝 文档改进

- 为所有新方法添加详细的 JSDoc 注释
- 增强 AudioContext 资源管理警告文档
- 更新 README.md 添加质量保证章节

### ⚠️ 破坏性变更

无破坏性变更，所有 API 保持向后兼容。

---

## [1.3.7] - 2024-04-XX

### 🎯 基础功能

- ✅ ASR 语音识别
- ✅ TTS 语音合成
- ✅ Translator 翻译
- ✅ WebSocket 自动重连
- ✅ VAD 静音检测
- ✅ TypeScript 完整类型定义

---

## 版本说明

- **Major (主版本号)**: 不兼容的 API 修改
- **Minor (次版本号)**: 向下兼容的功能新增
- **Patch (修订号)**: 向下兼容的 Bug 修复
