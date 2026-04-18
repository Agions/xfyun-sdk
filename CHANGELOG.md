# 更新日志

## [1.3.3] (2026-04-18)

### 新增

- ✨ `XfyunTTS.exportAudio()` — 导出音频为 Blob 对象
- ✨ `XfyunTTS.downloadAudio()` — 一键下载音频文件到本地
- ✨ `XfyunTTS.getFileExtension()` — 获取文件扩展名（内部方法）

### 测试

- ✅ 新增 exportAudio 和 downloadAudio 单元测试

## [1.3.2] (2026-04-13)

### 修复

- 🐛 `generateAuthUrl` 三处重复实现 → 统一使用 `utils.ts` 公共实现
- 🐛 `toBase64` Unicode 字符处理问题 → 使用 `encodeURIComponent` 方案修复
- 🐛 `synthesizer.ts` `autoStart` 逻辑矛盾（空文本时仍启动）
- 🐛 `translator.ts` 空字符串参数未校验

### 优化

- ⚡️ 提取 `detectSupportedMimeType()` 统一 MIME 类型检测
- ⚡️ 提取 `createAudioContext()` 兼容 webkit 前缀
- ⚡️ 移除未使用的 `CryptoJS` 导入
- ⚡️ 移除 `translator.ts` 中冗余的 `arrayBufferToBase64Local` 包装器

### 文档

- 📝 补全所有 API 文档（ASR、TTS、Translator、Utils、Types、Logger、SpeechRecognizer）
- 📝 新增 `docs/guide/getting-started.md` 快速开始指南
- 📝 新增 `docs/guide/troubleshooting.md` 故障排除指南

# 更新日志

## [1.3.1] (2026-04-02)

### 修复

- 🐛 AudioContext 去掉非标准 `{sampleRate:16000}` 构造参数，兼容所有浏览器
- 🐛 `releaseMicrophone()` 增加 `audioSource.disconnect()` / `analyser.disconnect()`，修复音频节点泄漏
- 🐛 `sendAudioData()` 后续帧不再带冗余 business params，节省带宽
- 🐛 `handleError()` 增加 `onStop` 回调通知，调用方可感知识别已结束
- 🐛 `initWebSocket()` 增加 10s connecting 超时兜底（部分浏览器 WebSocket 失败不触发 onerror）
- 🐛 `handleReconnect()` 补充 'connecting' 状态卡死的重试覆盖

### 新增

- ✨ `XfyunASR.isRecording()` — 判断是否正在录音
- ✨ `XfyunASR.isDestroyed()` — 判断实例是否已销毁

### 优化

- React SpeechRecognizer cleanup 优化，避免 unmount 后触发 setState

## [1.3.0] (2026-03-28)

### 新增

- ✨ `examples/vue-demo/` 完整 Vue 3 + Vite 示例项目
- ✨ `useSpeechRecognizer` Vue 3 组合式函数（composable）
- ✨ `SpeechRecognizer.vue` 单文件组件（含音量条/状态徽章/动画）

### 优化

- ⚡️ README.md 全面专业化设计（架构图、最佳实践、框架集成）
- ⚡️ CI workflow 切换为 pnpm（`pnpm/action-setup@v4`）
- ⚡️ 所有 workflow 添加 `cache-dependency-path` 指向 `pnpm-lock.yaml`
- ⚡️ 添加 npm 下载量 + CI + 覆盖率 Badge

### 修复

- 🐛 修复 `pnpm-lock.yaml` 与 `package.json` 版本不同步问题
- 🐛 修复 CI `Setup Node.js` 因缓存 key 不稳定导致的失败
- 🐛 修复 npm-publish / Release workflow `pnpm publish` detached HEAD 报错

## [1.2.1] (2026-03-27)

### 优化

- ⚡️ 提取 Logger 为独立模块 `src/logger.ts`，统一日志输出
- ⚡️ `parseXfyunResult` 支持注入 Logger，日志一致
- ⚡️ 缓存 businessParams，每帧不再重复分配对象
- ⚡️ React 组件 styles/STATE_TEXT 提到组件外，useMemo 缓存按钮样式
- ⚡️ 重连改为指数退避（2ⁿ × baseInterval，上限 30s）

### 修复

- 🐛 移除无用的 `audioChunks` 数组，修复 maxAudioSize 限制从未生效问题
- 🐛 `destroy()` 立即关闭 WebSocket，不再等待 stop() 的 1s 延迟
- 🐛 保留 `audioSource` 引用防止 GC 回收
- 🐛 `initMicrophone()` 中途失败时正确释放已申请资源
- 🐛 修复 React 组件 `onError` 类型 `any→unknown`

## [1.2.0] (2026-03-24)

### 新增

- ✨ Vitest 测试框架配置和测试用例（24个测试）
- ✨ GitHub Actions CI/CD 工作流
- ✨ GitHub Actions Release 工作流（支持 npm 自动发布）
- ✨ SSR 兼容性支持（`isBrowser()` 检查）

### 优化

- ⚡️ 升级 rollup 4.x 和相关插件
- ⚡️ 升级 TypeScript 5.x
- ⚡️ 升级 crypto-js 4.x
- ⚡️ 移除废弃的 `rollup-plugin-terser`，使用 `@rollup/plugin-terser`
- 📝 完善类型定义，`parseXfyunResult` 添加类型守卫

### 修复

- 🐛 修复 `utils.ts` 中的 SSR 兼容性问题（使用 `window.btoa` 前检查）

## [1.1.0] (2026-03-23)

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

## [1.0.2] (2023-07-28)

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

## [1.0.1] (2023-06-15)

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
