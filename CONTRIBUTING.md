# Contributing to xfyun-sdk

首先感谢你考虑为 xfyun-sdk 做出贡献！🎉

## 开发环境设置

### 前置要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发命令

```bash
# 启动开发服务器
npm run docs:dev

# 运行测试
npm run test

# 运行测试并查看覆盖率
npm run test:coverage

# 运行 ESLint
npm run lint

# 构建项目
npm run build
```

## 提交代码

### 分支约定

| 分支类型 | 命名格式 | 用途 |
|----------|----------|------|
| 新功能 | `feature/xxx` | 新增功能 |
| Bug 修复 | `fix/xxx` | 修复 Bug |
| 文档 | `docs/xxx` | 文档更新 |
| 重构 | `refactor/xxx` | 代码重构 |
| 测试 | `test/xxx` | 测试相关 |
| 工具 | `chore/xxx` | 工具/配置 |

### Commit 约定

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
type(scope): description

[optional body]

[optional footer]
```

**Type:**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例:**
```bash
git commit -m "feat(recognizer): 添加 autoStart 功能"
git commit -m "fix(translator): 修复 translateText 参数校验"
git commit -m "docs(api): 更新 ASR API 文档"
```

## 测试要求

- 所有测试必须通过：`npm run test:run`
- 新增功能必须包含测试
- 测试覆盖率不能降低

## 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加 JSDoc 注释
- 保持函数单一职责

## Pull Request 流程

1. Fork 仓库
2. 创建分支
3. 提交代码
4. 推送分支
5. 创建 Pull Request

## 问题反馈

- 使用 GitHub Issues 反馈 Bug
- 使用 GitHub Discussions 讨论功能建议

## 许可证

贡献的代码将遵循 MIT 许可证。