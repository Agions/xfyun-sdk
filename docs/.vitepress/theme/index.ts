import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import './styles.css';

// 扩展默认主题
const EnhancedTheme: Theme = {
  ...DefaultTheme,
  Layout: DefaultTheme.Layout,
  enhanceApp({ app, router, siteData }) {
    // 在这里注册全局组件
    // app.component('DemoPlayer', DemoPlayer);
    DefaultTheme.enhanceApp?.({ app, router, siteData });
  },
};

export default EnhancedTheme;
