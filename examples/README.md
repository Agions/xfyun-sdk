# 示例代码

本目录包含 xfyun-sdk 的示例代码，展示如何在不同框架中使用 SDK。

## 目录结构

```
examples/
├── html/           # 原生 HTML/JS 示例
├── react-demo/     # React 示例
└── vue-demo/       # Vue 3 示例
```

## 快速开始

### HTML 示例

```bash
cd examples/html
# 直接在浏览器中打开 index.html
```

### React 示例

```bash
cd examples/react-demo
npm install
npm run dev
```

### Vue 示例

```bash
cd examples/vue-demo
npm install
npm run dev
```

## 示例说明

| 示例 | 描述 |
|------|------|
| HTML | 原生 JavaScript 使用 SDK，无需构建工具 |
| React | 使用 React Hooks 集成 SDK |
| Vue | 使用 Vue 3 Composables 集成 SDK |

## 添加新示例

1. 在 `examples/` 下创建新目录
2. 添加 `README.md` 说明如何使用
3. 提交 PR