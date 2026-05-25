# 🎨 在线文档设计方案

## 项目：xfyun-sdk 在线文档

**设计时间**: 2026-05-25  
**目标**: 打造专业、易用、美观的开发者文档网站

---

## 📋 方案选型

### 推荐方案：VitePress

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **VitePress** | ⭐ 极速构建、Vue 生态、主题丰富、支持 Markdown | 需要学习 Vite 配置 | ⭐⭐⭐⭐⭐ |
| Docusaurus | ⭐ 功能完整、插件丰富、React 生态 | 构建较慢、配置复杂 | ⭐⭐⭐⭐ |
| Docsify | ⭐ 无需构建、简单易用 | 性能较差、SEO 不友好 | ⭐⭐⭐ |
| Mintlify | ⭐ 现代化 UI、API 文档友好 | 需要付费高级功能 | ⭐⭐⭐ |

**推荐理由**:
- ✅ 构建速度极快（Vite 驱动）
- ✅ 优秀的开发者体验
- ✅ 丰富的主题和插件生态
- ✅ 原生支持 TypeScript
- ✅ 出色的 SEO 优化
- ✅ 免费开源

---

## 🏗️ 文档结构设计

### 优化后的目录结构

```
docs/
├── .vitepress/
│   ├── config.ts           # VitePress 配置
│   ├── theme/
│   │   ├── index.ts        # 自定义主题
│   │   ├── Layout.vue      # 自定义布局
│   │   └── styles.css      # 自定义样式
│   └── components/
│       ├── DemoPlayer.vue  # 在线演示播放器
│       ├── CodeBlock.vue   # 增强代码块
│       └── ApiTable.vue    # API 表格组件
│
├── index.md                # 首页
├── guide/
│   ├── index.md            # 指南索引
│   ├── getting-started.md  # 快速开始
│   ├── authentication.md   # 身份认证
│   ├── best-practices.md   # 最佳实践
│   └── troubleshooting.md  # 故障排除
│
├── api/
│   ├── index.md            # API 索引
│   ├── asr.md              # 语音识别
│   ├── tts.md              # 语音合成
│   ├── translator.md       # 翻译
│   ├── types.md            # 类型定义
│   └── utils.md            # 工具函数
│
├── examples/
│   ├── asr-demo.md         # ASR 示例
│   ├── tts-demo.md         # TTS 示例
│   └── translator-demo.md  # 翻译示例
│
└── changelog.md            # 更新日志
```

---

## 🎨 视觉设计

### 主题配色

```css
:root {
  /* 主色调 - 讯飞蓝 */
  --vp-c-brand-1: #0066FF;
  --vp-c-brand-2: #0052CC;
  --vp-c-brand-3: #003D99;
  
  /* 辅助色 */
  --vp-c-success: #00C896;
  --vp-c-warning: #FFB800;
  --vp-c-danger: #FF4D4F;
  --vp-c-info: #0066FF;
  
  /* 背景色 */
  --vp-c-bg: #FFFFFF;
  --vp-c-bg-alt: #F8F9FA;
  --vp-c-bg-elv: #FFFFFF;
  
  /* 文字色 */
  --vp-c-text-1: #1A1A1A;
  --vp-c-text-2: #595959;
  --vp-c-text-3: #8C8C8C;
  
  /* 边框色 */
  --vp-c-divider: #E8E8E8;
}

/* 暗色模式 */
.dark {
  --vp-c-bg: #1A1A1A;
  --vp-c-bg-alt: #242424;
  --vp-c-bg-elv: #2D2D2D;
  --vp-c-text-1: #FFFFFF;
  --vp-c-text-2: #B3B3B3;
  --vp-c-text-3: #808080;
  --vp-c-divider: #3D3D3D;
}
```

### 字体设计

```css
:root {
  --vp-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --vp-font-family-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', 
    'Source Code Pro', monospace;
}
```

---

## 📑 页面设计

### 1. 首页设计

```markdown
---
layout: home
title: xfyun-sdk
titleTemplate: 科大讯飞语音 Web SDK

hero:
  name: xfyun-sdk
  text: 科大讯飞语音 Web SDK
  tagline: 让语音交互更简单
  image:
    src: /logo.svg
    alt: xfyun-sdk Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 文档
      link: /api/asr
    - theme: alt
      text: GitHub
      link: https://github.com/Agions/xfyun-sdk

features:
  - icon: 🎤
    title: 语音识别
    details: 实时语音转文字，支持多种语言和方言
  - icon: 🔊
    title: 语音合成
    details: 文本转语音，支持多种发音人和音频格式
  - icon: 🌐
    title: 语音翻译
    details: 边说边译，支持 15+ 种语言互译
  - icon: ⚡
    title: 零依赖
    details: 仅依赖 crypto-js，轻量级设计
  - icon: 🛡️
    title: 类型安全
    details: 完整的 TypeScript 类型定义
  - icon: 📦
    title: 模块化
    details: ASR/TTS/Translator 独立模块，按需引入
---
```

### 2. 快速开始页面

```markdown
---
outline: deep
next: /api/asr
---

# 快速开始

::tip{icon=🚀 title=3 分钟上手}
从安装到第一个语音识别应用，只需 3 分钟！
::

## 安装

::code-group

```bash [npm]
npm install xfyun-sdk
```

```bash [yarn]
yarn add xfyun-sdk
```

```bash [pnpm]
pnpm add xfyun-sdk
```

::

## 配置讯飞账号

在使用本 SDK 之前，请完成以下步骤：

1. 注册 [讯飞开放平台](https://console.xfyun.cn/) 账号
2. 创建应用，获取 **APPID**、**APIKey**、**APISecret**
3. 将凭证安全存储在环境变量中

::warning{title=安全提示}
⚠️ 不要将 API 凭证硬编码在代码中！建议使用环境变量或密钥管理服务。
::

## 第一个语音识别应用

::code-group

```typescript [浏览器]
import { createRecognizer } from 'xfyun-sdk';

// 创建识别器实例
const recognizer = createRecognizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
  language: 'zh_cn',
});

// 监听识别结果
recognizer.on('result', (text) => {
  console.log('识别结果:', text);
});

// 监听错误
recognizer.on('error', (error) => {
  console.error('识别错误:', error);
});

// 开始识别
async function startRecognition() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recognizer.start();
}
```

```vue [Vue 3]
<script setup>
import { ref, onUnmounted } from 'vue';
import { createRecognizer } from 'xfyun-sdk';

const text = ref('');
const recognizer = createRecognizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
});

recognizer.on('result', (result) => {
  text.value = result;
});

onUnmounted(() => {
  recognizer.destroy();
});
</script>

<template>
  <div class="recognizer">
    <button @click="recognizer.start()">开始识别</button>
    <p>{{ text }}</p>
  </div>
</template>
```

::

## 下一步

- [📖 API 文档 - ASR](/api/asr)
- [📖 API 文档 - TTS](/api/tts)
- [📖 API 文档 - Translator](/api/translator)
- [💡 示例代码](/examples/asr-demo)
```

### 3. API 文档页面设计

```markdown
---
outline: deep
next: /api/tts
---

# ASR 语音识别

::tip{icon=🎤 title=实时语音转文字}
支持中文、英文，多种方言和领域模型
::

## 快速使用

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
});

recognizer.on('result', (text) => {
  console.log(text);
});

recognizer.start();
```

## 构造函数

```typescript
createRecognizer(options: XfyunASROptions): Recognizer
```

### 参数

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|:-----|:-----|:------:|:----:|:-----|
| `appId` | `string` | — | ✅ | 讯飞应用 ID |
| `apiKey` | `string` | — | ✅ | 讯飞 API Key |
| `apiSecret` | `string` | — | ✅ | 讯飞 API Secret |
| `language` | `'zh_cn' \| 'en_us'` | `'zh_cn'` | ❌ | 识别语言 |
| `domain` | `'iat' \| 'medical' \| 'assistant'` | `'iat'` | ❌ | 领域模型 |
| `accent` | `'mandarin' \| 'cantonese'` | `'mandarin'` | ❌ | 方言 |
| `vadEos` | `number` | `3000` | ❌ | 静音超时 (ms) |
| `autoStart` | `boolean` | `false` | ❌ | 自动开始 |

::details
<details>
<summary>查看所有参数</summary>

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxAudioSize` | `number` | `1048576` | 最大音频字节数 |
| `hotWords` | `string[]` | `[]` | 热词列表 |
| `punctuation` | `boolean` | `true` | 自动标点 |
| `audioFormat` | `string` | `'audio/L16;rate=16000'` | 音频格式 |
| `enableReconnect` | `boolean` | `false` | 启用自动重连 |
| `reconnectAttempts` | `number` | `3` | 重连次数 |
| `reconnectInterval` | `number` | `3000` | 重连间隔 (ms) |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |

</details>
::

## 方法

### start()

开始语音识别。

```typescript
recognizer.start(): Promise<void>
```

::warning
需要先获取麦克风权限，建议在用户交互后调用。
::

### stop()

停止语音识别。

```typescript
recognizer.stop(): void
```

### destroy()

销毁实例，释放所有资源。

```typescript
recognizer.destroy(): void
```

::tip
**务必在组件卸载时调用**，避免资源泄漏。
::

## 事件

### result

识别结果更新时触发。

```typescript
recognizer.on('result', (text: string, isFinal: boolean) => {
  console.log('结果:', text, '是否最终:', isFinal);
});
```

### error

发生错误时触发。

```typescript
recognizer.on('error', (error: XfyunError) => {
  console.error('错误:', error.code, error.message);
});
```

## 类型定义

<ApiTable :types="['XfyunASROptions', 'RecognizerState', 'XfyunError']" />

## 示例

- [基础示例](/examples/asr-demo#basic)
- [带热词识别](/examples/asr-demo#hotwords)
- [医疗领域识别](/examples/asr-demo#medical)
```

---

## 🔧 功能增强

### 1. 在线演示播放器

```vue
<!-- .vitepress/components/DemoPlayer.vue -->
<template>
  <div class="demo-player">
    <div class="demo-header">
      <span class="demo-icon">🎤</span>
      <span class="demo-title">在线演示</span>
      <button @click="toggleRecording" :class="{ recording }">
        {{ recording ? '停止录音' : '开始录音' }}
      </button>
    </div>
    <div class="demo-output">
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const recording = ref(false);
const result = ref('');

const toggleRecording = async () => {
  if (recording.value) {
    // 停止录音
    recording.value = false;
  } else {
    // 开始录音
    recording.value = true;
    result.value = '正在识别...';
  }
};
</script>

<style scoped>
.demo-player {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5em 0;
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.recording {
  background: var(--vp-c-danger);
  color: white;
}

.demo-output {
  padding: 1rem;
  min-height: 100px;
}

.demo-output pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
```

### 2. 增强代码块

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import DemoPlayer from '../components/DemoPlayer.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoPlayer', DemoPlayer);
  }
};
```

```markdown
::: demo
<DemoPlayer />
:::
```

### 3. API 表格组件

```vue
<!-- .vitepress/components/ApiTable.vue -->
<script setup>
import { computed } from 'vue';

const props = defineProps({
  types: { type: Array, required: true }
});

// 从 TypeScript 文件解析类型定义
const typeDefinitions = computed(() => {
  // 解析 src/types.ts 获取类型信息
  return props.types.map(type => ({
    name: type,
    properties: [], // 从类型定义中提取
  }));
});
</script>

<template>
  <div class="api-table">
    <table v-for="type in typeDefinitions" :key="type.name">
      <thead>
        <tr>
          <th>属性</th>
          <th>类型</th>
          <th>默认值</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prop in type.properties" :key="prop.name">
          <td><code>{{ prop.name }}</code></td>
          <td><code>{{ prop.type }}</code></td>
          <td>{{ prop.default }}</td>
          <td>{{ prop.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

---

## 📱 响应式设计

### 断点设计

```css
/* 移动端 */
@media (max-width: 767px) {
  :root {
    --vp-sidebar-width: 0;
    --vp-nav-height: 48px;
  }
}

/* 平板 */
@media (min-width: 768px) and (max-width: 959px) {
  :root {
    --vp-sidebar-width: 240px;
  }
}

/* 桌面 */
@media (min-width: 960px) {
  :root {
    --vp-sidebar-width: 280px;
    --vp-content-width: 768px;
  }
}

/* 大屏 */
@media (min-width: 1440px) {
  :root {
    --vp-content-width: 960px;
  }
}
```

---

## 🔍 搜索功能

### Algolia DocSearch 配置

```typescript
// .vitepress/config.ts
export default defineConfig({
  themeConfig: {
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      indexName: 'xfyun-sdk',
      locales: {
        root: {
          translations: {
            button: {
              buttonText: '搜索',
              buttonAriaLabel: '搜索文档'
            },
            modal: {
              searchBox: {
                resetButtonTitle: '清除查询',
                resetButtonAriaLabel: '清除查询',
                cancelButtonText: '取消',
                cancelButtonAriaLabel: '取消'
              },
              startScreen: {
                recentSearchesTitle: '搜索历史',
                noRecentSearchesText: '没有搜索历史',
                saveRecentSearchButtonTitle: '保存此搜索',
                removeRecentSearchButtonTitle: '从历史中移除',
                favoriteSearchesTitle: '收藏',
                removeFavoriteSearchButtonTitle: '从收藏中移除'
              },
              errorScreen: {
                titleText: '无法获取结果',
                helpText: '请检查网络连接'
              },
              footer: {
                selectText: '选择',
                navigateText: '导航',
                closeText: '关闭',
                searchByText: '搜索提供者'
              },
              noResultsScreen: {
                noResultsText: '无法找到相关结果',
                suggestedQueryText: '尝试搜索',
                reportMissingResultsText: '认为此查询应该有结果？',
                reportMissingResultsLinkText: '反馈'
              }
            }
          }
        }
      }
    }
  }
});
```

---

## 🚀 部署方案

### GitHub Pages + VitePress

```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Docs

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build docs
        run: pnpm docs:build
        env:
          VITE_XFYUN_APP_ID: ${{ secrets.XFYUN_APP_ID }}
          VITE_XFYUN_API_KEY: ${{ secrets.XFYUN_API_KEY }}
          VITE_XFYUN_API_SECRET: ${{ secrets.XFYUN_API_SECRET }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

### 部署命令

```json
// package.json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

---

## 📊 文档指标

### 建议跟踪的指标

| 指标 | 说明 | 目标 |
|------|------|------|
| 页面浏览量 | 各页面访问次数 | 持续增长 |
| 搜索成功率 | 搜索后有点击的比例 | > 60% |
| 平均停留时间 | 用户平均阅读时长 | > 2 分钟 |
| 跳出率 | 单页访问后离开的比例 | < 40% |
| 文档覆盖率 | 有文档的 API 比例 | 100% |

---

## ✅ 实施清单

### 第一阶段：基础搭建

- [ ] 初始化 VitePress 项目
- [ ] 配置主题和样式
- [ ] 迁移现有文档
- [ ] 配置导航和侧边栏
- [ ] 部署到 GitHub Pages

### 第二阶段：功能增强

- [ ] 添加在线演示组件
- [ ] 实现 API 表格组件
- [ ] 配置 Algolia 搜索
- [ ] 添加代码示例运行功能
- [ ] 优化移动端体验

### 第三阶段：内容完善

- [ ] 补充缺失的 API 文档
- [ ] 添加更多示例代码
- [ ] 编写最佳实践指南
- [ ] 添加视频教程链接
- [ ] 建立文档反馈机制

---

**设计完成**: 2026-05-25
