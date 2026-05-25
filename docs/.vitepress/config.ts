import { defineConfig } from 'vitepress';

export default defineConfig({
  // 基础配置
  title: 'xfyun-sdk',
  description: '科大讯飞语音 Web SDK - 让语音交互更简单',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  // 主题配置
  themeConfig: {
    // 站点信息
    logo: '/logo.svg',
    // siteTitle 改为 title
    title: 'xfyun-sdk',
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2026 Agions',
    },

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'API', link: '/api/asr', activeMatch: '/api/' },
      { text: '示例', link: '/examples/asr-demo', activeMatch: '/examples/' },
      { text: '更新日志', link: '/changelog.md' },
      {
        text: 'GitHub',
        link: 'https://github.com/Agions/xfyun-sdk',
        target: '_blank',
      },
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '身份认证', link: '/guide/authentication' },
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '故障排除', link: '/guide/troubleshooting' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: '概览', link: '/api/' },
            { text: '语音识别 (ASR)', link: '/api/asr' },
            { text: '语音合成 (TTS)', link: '/api/tts' },
            { text: '翻译 (Translator)', link: '/api/translator' },
            { text: '类型定义', link: '/api/types' },
            { text: '工具函数', link: '/api/utils' },
            { text: '日志工具', link: '/api/logger' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例代码',
          items: [
            { text: 'ASR 示例', link: '/examples/asr-demo' },
            { text: 'TTS 示例', link: '/examples/tts-demo' },
            { text: '翻译示例', link: '/examples/translator-demo' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Agions/xfyun-sdk' },
    ],

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/Agions/xfyun-sdk/edit/main/docs/:path',
      text: '编辑此页面',
    },

    // 文档信息
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    // 返回顶部的按钮
    returnToTopLabel: '回到顶部',

    // 语言选择器
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },

  // Markdown 配置
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    lineNumbers: true,
    math: true,
  },

  // Vite 配置
  vite: {
    resolve: {
      alias: {
        '@': '/docs',
      },
    },
  },
});
