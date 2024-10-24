import { createSSRApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import VConsole from 'vconsole';
import { addRequestInterceptor, addResponseInterceptor } from '@/api/core';
import localeMessages from '@/locale';
import App from './App.vue';

// eslint-disable-next-line import/prefer-default-export
export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());

  if (import.meta.env.VITE_DEV_ENV === 'development') {
    // eslint-disable-next-line no-new
    new VConsole();
  }

  const i18n = createI18n({
    legacy: false,
    locale: uni.getLocale(),
    messages: localeMessages,
    fallbackLocale: 'zh-Hans',
  });
  app.use(i18n);
  addRequestInterceptor();
  addResponseInterceptor();
  return {
    app,
  };
}
