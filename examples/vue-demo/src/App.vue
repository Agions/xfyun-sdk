<template>
  <div class="app">
    <div class="header">
      <h1>🎤 讯飞语音识别</h1>
      <p>Vue 3 + xfyun-sdk 实时语音转文字演示</p>
    </div>

    <SpeechRecognizer
      :app-id="appId"
      :api-key="apiKey"
      :api-secret="apiSecret"
      language="zh_cn"
      accent="mandarin"
      domain="iat"
      :show-volume="true"
      :show-result="true"
      :show-status="true"
    />

    <div class="footer">
      <a href="https://github.com/Agions/xfyun-sdk" target="_blank">
        📦 xfyun-sdk
      </a>
      <span>·</span>
      <a href="https://www.xfyun.cn/" target="_blank">
        科大讯飞开放平台
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import SpeechRecognizer from '@/components/SpeechRecognizer.vue';

const appId = import.meta.env.VITE_XFYUN_APP_ID ?? '';
const apiKey = import.meta.env.VITE_XFYUN_API_KEY ?? '';
const apiSecret = import.meta.env.VITE_XFYUN_API_SECRET ?? '';
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  text-align: center;
  color: white;
}

.header h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 6px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.header p {
  font-size: 14px;
  opacity: 0.85;
}

.footer {
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.footer a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer a:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
