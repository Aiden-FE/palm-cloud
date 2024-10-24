<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useContextStore } from '@/stores';

const { isLogin } = storeToRefs(useContextStore());
const { updateContext } = useContextStore();

function exitLogin() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录？',
    success: (res) => {
      if (res.confirm) {
        updateContext({ token: '', userInfo: undefined });
      }
    },
  });
}
</script>

<template>
  <div>
    <div class="bg-slate-600 h-[200px] relative">
      <uv-avatar
        class="absolute left-0 right-0 m-auto bottom-[-40px]"
        :size="80"
        :font-size="48"
        icon="account"
      ></uv-avatar>
    </div>
    <div class="pt-[40px]">
      <uv-button v-if="isLogin" @click="exitLogin" class="mx-4 mt-8" type="primary" plain text="退出登录"></uv-button>
      <navigator v-else url="/pages/login/login">
        <uv-button class="mx-4 mt-8" type="primary" text="立即登录"></uv-button>
      </navigator>
    </div>
  </div>
</template>
