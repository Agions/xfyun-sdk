# 更新日志

所有重要的项目变更都会记录在这个文档中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [未发布]

### 新增
- 在线文档网站（VitePress）
- 错误分类系统（`src/error.ts`）
- 统一错误处理（`handleXfyunError`）
- `forceSetState` 方法
- `cleanupAudioResources` 方法

### 修复
- `sendAudioData` catch 块无限循环 bug
- `autoStart` 功能失效问题
- Logger mock 问题

### 改进
- 测试覆盖率从 64% 提升至 80.87%
- 依赖安全漏洞从 12 个降至 0 个
- ESLint 警告全部修复

---

## [1.5.1] - 2026-05-25

### 新增
- 完整的 TypeScript 类型定义
- 错误分类系统（6 大类、100+ 错误码）
- 资源管理方法（`cleanupAudioResources`）
- 统一错误处理函数（`handleXfyunError`）

### 修复
- `recognizer.ts` 第 671-673 行：`sendAudioData` catch 块缺少 `break` 导致无限循环
- `recognizer.ts` 和 `translator.ts`：`autoStart` 功能未正确实现
- 资源泄漏问题：`destroy()` 方法未完全清理所有资源

### 改进
- 测试覆盖率从 64% 提升至 80.87%
- 新增 434 个测试用例
- 依赖安全漏洞从 12 个降至 0 个
- ESLint 警告全部修复

### 文档
- 新增 VitePress 在线文档
- 完善 API 文档（ASR、TTS、Translator）
- 新增示例代码和故障排除指南

---

## [1.5.0] - 2026-05-20

### 新增
- `translateText` 静态方法（文本翻译）
- WebSocket 自动重连功能（`enableReconnect`）
- 日志级别控制（`logLevel`）

### 改进
- 性能优化：减少 WebSocket 连接开销
- 类型安全性提升

---

## [1.4.0] - 2026-05-15

### 新增
- 翻译模块（`Translator`）
- 支持 15+ 种语言互译
- 语音翻译模式（边说边译）

### 改进
- ASR 模块性能优化
- TTS 模块增加更多发音人

---

## [1.3.0] - 2026-05-10

### 新增
- TTS 模块（`Synthesizer`）
- 30+ 种发音人支持
- 多种音频格式支持（mp3、wav、pcm）

### 改进
- ASR 模块稳定性提升

---

## [1.2.3] - 2026-05-05

### 修复
- 修复内存泄漏问题
- 修复事件监听器未移除问题

---

## [1.2.0] - 2026-05-01

### 新增
- ASR 模块（`Recognizer`）
- 支持中文、英文识别
- 支持多种方言和领域模型

### 改进
- 初始版本发布

---

## 版本说明

### 版本格式

`MAJOR.MINOR.PATCH`（主版本.次版本.修订版本）

- **MAJOR**：不兼容的 API 变更
- **MINOR**：向后兼容的功能新增
- **PATCH**：向后兼容的问题修复

### 变更类型

- **新增**：新功能
- **修复**：Bug 修复
- **改进**：性能优化、代码重构等
- **废弃**：即将移除的功能
- **删除**：已移除的功能
- **安全**：安全修复

---

[查看 GitHub Releases](https://github.com/Agions/xfyun-sdk/releases)
