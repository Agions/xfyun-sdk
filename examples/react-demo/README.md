# 科大讯飞语音识别 SDK React 示例

这是一个使用科大讯飞语音识别 SDK 的 React 示例项目，展示了如何在 React 应用中实现实时语音识别功能。

## 功能特点

- 实时语音识别
- 优雅的用户界面
- 错误处理和状态管理
- 支持部署到 GitHub Pages

## 示例截图
<img width="927" alt="image" src="https://github.com/user-attachments/assets/0d2f43c4-12d6-4fc1-a1da-a1581222d493" />


## 开始使用

### 前置条件

- Node.js 14.0.0 或更高版本
- npm 6.0.0 或更高版本
- 科大讯飞开放平台账号和 API 密钥

### 安装

1. 克隆项目：
```bash
git clone https://github.com/agions/xfyun-sdk.git
cd xfyun-sdk/examples/react-demo
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
   - 复制 `.env` 文件为 `.env.local`
   - 填入您的科大讯飞 API 配置：
     ```
     REACT_APP_XFYUN_APP_ID=your_app_id
     REACT_APP_XFYUN_API_KEY=your_api_key
     REACT_APP_XFYUN_API_SECRET=your_api_secret
     ```

### 开发

启动开发服务器：
```bash
npm start
```

### 构建

构建生产版本：
```bash
npm run build
```

### 部署到 GitHub Pages

1. 确保您的仓库已启用 GitHub Pages
2. 运行部署命令：
```bash
npm run deploy
```

## 使用说明

1. 点击"开始识别"按钮开始语音识别
2. 说话时请保持安静的环境
3. 点击"停止识别"按钮结束识别
4. 识别结果会实时显示在结果框中

## 注意事项

- 首次使用时需要允许浏览器访问麦克风
- 建议使用 Chrome 或 Firefox 浏览器
- 确保网络连接稳定
- 请勿在嘈杂的环境中使用

## 许可证

MIT 
