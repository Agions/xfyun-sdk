# GitHub Actions 配置指南

## 已完成的工作流

| 工作流 | 文件 | 说明 |
|--------|------|------|
| CI | `.github/workflows/ci.yml` | 自动测试、lint、构建、覆盖率检查 |
| Deploy Docs | `.github/workflows/deploy-docs.yml` | 自动部署 VitePress 到 GitHub Pages |
| Release | `.github/workflows/release.yml` | 推送 tag 时自动创建 GitHub Release |

---

## 需要手动配置的步骤

### 1. 启用 GitHub Pages

1. 访问: https://github.com/Agions/xfyun-sdk/settings/pages
2. 在 **Source** 中选择: `GitHub Actions`
3. 保存设置

### 2. 创建 GitHub Pages 环境

1. 访问: https://github.com/Agions/xfyun-sdk/settings/environments
2. 点击 **New environment**
3. 名称输入: `github-pages`
4. 保存（无需配置部署保护规则）

### 3. 创建 GitHub Release

推送 tag 后 Release 会自动创建：

```bash
git tag -a v1.5.3 -m "v1.5.3 release"
git push origin v1.5.3
```

或者手动创建:
1. 访问: https://github.com/Agions/xfyun-sdk/releases/new
2. Tag version: `v1.5.3`
3. Target: `main`
4. Release title: `Release v1.5.3`
5. 点击 **Publish release**

---

## 工作流触发条件

| 工作流 | 触发条件 |
|--------|----------|
| CI | 推送到 main 分支、PR 到 main |
| Deploy Docs | 推送到 main 分支、手动触发 |
| Release | 推送 tag (v*) |

---

## 验证

配置完成后:
1. 访问: https://github.com/Agions/xfyun-sdk/actions
2. 查看工作流运行状态
3. Deploy Docs 成功后，访问: https://agions.github.io/xfyun-sdk/