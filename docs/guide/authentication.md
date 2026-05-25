---
outline: deep
---

# 身份认证

::tip{icon=🔐 title=安全配置指南}
如何安全地管理 API 凭证
::

## 为什么需要安全配置

讯飞开放平台要求使用 **APPID**、**APIKey**、**APISecret** 进行身份认证。这些凭证相当于你的"数字钥匙"，一旦泄露可能导致：

- ⚠️ 他人使用你的账号消耗配额
- ⚠️ 产生额外费用
- ⚠️ 数据泄露风险

::danger{title=⚠️ 安全警告}
**永远不要将 API 凭证硬编码在代码中！** 特别是不要提交到版本控制系统（如 Git）。
::

---

## 推荐方案

### 方案 1：环境变量（推荐）

#### Vite 项目

**1. 创建环境变量文件**：

```env
# .env
VITE_XFYUN_APP_ID=your_app_id
VITE_XFYUN_API_KEY=your_api_key
VITE_XFYUN_API_SECRET=your_api_secret
```

**2. 在代码中使用**：

```typescript
import { createRecognizer } from 'xfyun-sdk';

const recognizer = createRecognizer({
  appId: import.meta.env.VITE_XFYUN_APP_ID,
  apiKey: import.meta.env.VITE_XFYUN_API_KEY,
  apiSecret: import.meta.env.VITE_XFYUN_API_SECRET,
});
```

**3. 添加 .env 到 .gitignore**：

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

#### Next.js 项目

**1. 创建环境变量文件**：

```env
# .env.local
NEXT_PUBLIC_XFYUN_APP_ID=your_app_id
NEXT_PUBLIC_XFYUN_API_KEY=your_api_key
NEXT_PUBLIC_XFYUN_API_SECRET=your_api_secret
```

**2. 在代码中使用**：

```typescript
const recognizer = createRecognizer({
  appId: process.env.NEXT_PUBLIC_XFYUN_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_XFYUN_API_KEY,
  apiSecret: process.env.NEXT_PUBLIC_XFYUN_API_SECRET,
});
```

#### Webpack 项目

**1. 创建环境变量文件**：

```env
# .env
XFYUN_APP_ID=your_app_id
XFYUN_API_KEY=your_api_key
XFYUN_API_SECRET=your_api_secret
```

**2. 在 webpack.config.js 中配置**：

```javascript
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // ...
  plugins: [
    new webpack.DefinePlugin({
      'process.env.XFYUN_APP_ID': JSON.stringify(process.env.XFYUN_APP_ID),
      'process.env.XFYUN_API_KEY': JSON.stringify(process.env.XFYUN_API_KEY),
      'process.env.XFYUN_API_SECRET': JSON.stringify(process.env.XFYUN_API_SECRET),
    }),
  ],
};
```

---

### 方案 2：后端代理（最安全）

对于生产环境，推荐通过后端代理 API 请求：

```
客户端 → 你的后端 → 讯飞 API
```

**优点**：
- ✅ API 凭证完全隐藏在后端
- ✅ 可以添加额外的安全验证
- ✅ 可以限制访问频率
- ✅ 可以记录审计日志

**后端示例（Node.js + Express）**：

```javascript
// server.js
import express from 'express';
import { createRecognizer } from 'xfyun-sdk';

const app = express();

app.post('/api/recognition', async (req, res) => {
  const recognizer = createRecognizer({
    appId: process.env.XFYUN_APP_ID,
    apiKey: process.env.XFYUN_API_KEY,
    apiSecret: process.env.XFYUN_API_SECRET,
  });

  // 处理识别请求
  // ...

  res.json({ result });
});

app.listen(3000);
```

**前端调用**：

```typescript
const response = await fetch('/api/recognition', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audioData }),
});

const { result } = await response.json();
```

---

### 方案 3：密钥管理服务（企业级）

对于企业应用，推荐使用专业的密钥管理服务：

| 服务 | 适用场景 |
|------|---------|
| AWS Secrets Manager | AWS 生态 |
| Azure Key Vault | Azure 生态 |
| Google Secret Manager | GCP 生态 |
| HashiCorp Vault | 自建方案 |
| 阿里云 KMS | 阿里云生态 |

---

## 开发环境配置

### 本地开发

**1. 创建 `.env.local` 文件**（不会被提交到 Git）：

```env
# .env.local
VITE_XFYUN_APP_ID=your_dev_app_id
VITE_XFYUN_API_KEY=your_dev_api_key
VITE_XFYUN_API_SECRET=your_dev_api_secret
```

**2. 创建 `.env.example` 文件**（提交到 Git，作为模板）：

```env
# .env.example
VITE_XFYUN_APP_ID=your_app_id
VITE_XFYUN_API_KEY=your_api_key
VITE_XFYUN_API_SECRET=your_api_secret
```

**3. 在 `.gitignore` 中添加**：

```gitignore
# 环境变量
.env
.env.local
.env.*.local
!.env.example
```

---

## 生产环境配置

### Vercel

1. 进入项目设置页面
2. 找到 **Environment Variables**
3. 添加变量：
   - `VITE_XFYUN_APP_ID`
   - `VITE_XFYUN_API_KEY`
   - `VITE_XFYUN_API_SECRET`

### Netlify

1. 进入项目设置页面
2. 找到 **Environment variables**
3. 添加变量

### GitHub Actions

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加 Repository secrets：
   - `XFYUN_APP_ID`
   - `XFYUN_API_KEY`
   - `XFYUN_API_SECRET`

3. 在 workflow 中使用：

```yaml
# .github/workflows/deploy.yml
steps:
  - name: Deploy
    env:
      VITE_XFYUN_APP_ID: ${{ secrets.XFYUN_APP_ID }}
      VITE_XFYUN_API_KEY: ${{ secrets.XFYUN_API_KEY }}
      VITE_XFYUN_API_SECRET: ${{ secrets.XFYUN_API_SECRET }}
    run: npm run build
```

---

## 安全检查清单

- [ ] API 凭证已存储在环境变量中
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 没有将凭证硬编码在代码中
- [ ] 没有将凭证提交到版本控制系统
- [ ] 生产环境使用后端代理或密钥管理服务
- [ ] 定期轮换 API 凭证
- [ ] 监控 API 使用量和异常访问

---

## 获取讯飞 API 凭证

1. 访问 [讯飞开放平台](https://console.xfyun.cn/)
2. 注册/登录账号
3. 创建应用
4. 获取 APPID、APIKey、APISecret

---

## 下一步

- [📖 快速开始](/guide/getting-started)
- [📖 最佳实践](/guide/best-practices)
