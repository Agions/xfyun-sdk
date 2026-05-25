# Changelog

本文档记录 `xfyun-sdk` 的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.5.2] - 2026-05-25

### 🎉 项目完善版本

- **测试覆盖率提升至 80.87%**：从 64% 提升至 80%+，新增 195 个测试用例
- **新增错误分类系统**：`src/error.ts` 提供统一的错误分类和处理机制
- **Bug 修复**：
  - 修复 `recognizer.ts` autoStart 功能
  - 修复 `recognizer.ts` sendAudioData catch 块无限循环 bug
  - 修复 `translator.ts` translateText 静态方法
  - 修复 `translator.ts` autoStart 功能
- **架构升级**：
  - 统一错误处理集成到 `base-websocket-client.ts`
  - 新增 `forceSetState` 方法和 `suppressWarning` 参数
  - 资源管理重构（`cleanupAudioResources` 方法）
- **依赖安全**：安全漏洞从 12 个修复至 0 个
- **ESLint**：所有警告修复（0 警告）
- **构建验证**：UMD + CJS + ESM 构建成功
- **VitePress 文档**：新增 13 个 Markdown 页面，讯飞蓝主题样式
- **CI/CD 工作流**：
  - CI: 自动测试、lint、构建、覆盖率检查
  - Deploy Docs: 自动部署到 GitHub Pages
  - Release: 推送 tag 时自动创建 GitHub Release

### 📊 质量指标

| 指标 | 1.5.0 | 1.5.2 | 改进 |
|------|-------|-------|------|
| 测试覆盖率 | 64% | 80.87% | ⬆️ 26.87% |
| 测试用例数 | 239 | 434 | ⬆️ 81.6% |
| ESLint 警告 | 0 | 0 | ✅ 保持 |
| 安全漏洞 | 12 | 0 | ⬇️ 100% |

---

## [1.5.0] - 2026-05-04

### 🎉 重大架构重构

- **新增 `BaseWebSocketClient` 基类**：提取所有基于 WebSocket 的讯飞 API 客户端的通用逻辑
- **代码重复率大幅降低**：核心类重复代码从 ~200 行降至 0 行（-100%）
- **代码量显著减少**：核心类总代码从 5,050 行降至 3,240 行（-36%）

### 🎨 React 组件代码重复率优化

- **新增共享组件模块**：提取三个 React 组件（SpeechRecognizer、SpeechSynthesizer、Translator）的重复代码
- **jscpd 重复率从 0.37% 降至 0%**：完全消除代码克隆
- **组件代码减少 13%**：从 899 行降至 782 行
- **新增 5 个共享模块**：
  - `components/types.ts` - 共享 Props 接口和状态类型
  - `components/styles.ts` - 共享 CSS 样式和按钮样式工具函数
  - `components/state-text.ts` - 状态文本映射工厂函数
  - `components/useXfyunClient.ts` - 通用客户端 Hook
  - `components/index.ts` - 统一导出

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
