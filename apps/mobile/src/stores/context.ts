import { defineStore } from 'pinia';
import { toRaw, ref, computed, watch } from 'vue';
import type { UserInfo } from '@/interfaces';

interface Context {
  token: string;
  userInfo?: UserInfo;
  enabledIntranet?: boolean;
}

const useContextStore = defineStore('context', () => {
  const context = ref<Context>({
    token: '',
    userInfo: undefined,
    enabledIntranet: false,
  });

  const isLogin = computed(() => !!context.value.token);

  watch(
    () => context.value.token,
    (token) => {
      localStorage.setItem('token', token);
    },
  );

  watch(
    () => context.value.enabledIntranet,
    (enabledIntranet) => {
      if (enabledIntranet) {
        localStorage.setItem('enabledIntranet', 'true');
      } else {
        localStorage.removeItem('enabledIntranet');
      }
    },
  );

  // 更新用户信息
  function updateContext(info: Context) {
    context.value = {
      ...context.value,
      ...info,
    };
  }

  /**
   * @description 根据key来获取上下文
   * @param [key]
   * @param [defaultValue]
   * @example
   * getContext(); // 获取所有 context
   * getContext('token'); // 获取 token
   * getContext('token', 'Not found'); // 获取 token，未找到则返回 Not found
   */
  // eslint-disable-next-line no-redeclare
  function getContext(): Context;
  // eslint-disable-next-line no-redeclare
  function getContext<Key extends keyof Context>(key: Key): Context[Key];
  // eslint-disable-next-line no-redeclare
  function getContext<Key extends keyof Context, DefaultValue = unknown>(
    key: Key,
    defaultValue: DefaultValue,
  ): Context[Key] | DefaultValue;
  // eslint-disable-next-line no-redeclare
  function getContext<Key extends keyof Context, DefaultValue = unknown>(key?: Key, defaultValue?: DefaultValue) {
    if (!key) {
      return context.value;
    }
    return context.value[key] === undefined ? defaultValue! : toRaw(context.value[key]);
  }

  return {
    context,
    isLogin,
    updateContext,
    getContext,
  };
});

export default useContextStore;
