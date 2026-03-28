/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_XFYUN_APP_ID: string;
  readonly VITE_XFYUN_API_KEY: string;
  readonly VITE_XFYUN_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
