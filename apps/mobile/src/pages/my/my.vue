<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useContextStore } from '@/stores';

const { isLogin, context } = storeToRefs(useContextStore());
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

function onClickTips() {
  uni.showModal({
    content: '当处于家庭网络下,建议开启内网模式,资源上传,访问及下载都会加快',
    showCancel: false,
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
    <div class="mx-4 pt-[40px]">
      <div v-if="isLogin" class="flex items-center mt-8">
        启用内网模式:
        <uv-switch v-model="context.enabledIntranet" class="ml-4 mr-2"></uv-switch>
        <uv-icon @click="onClickTips" name="question-circle" size="22" />
      </div>
      <uv-button v-if="isLogin" @click="exitLogin" class="mt-8" type="primary" plain text="退出登录"></uv-button>
      <navigator v-else url="/pages/login/login">
        <uv-button class="mx-4 mt-8" type="primary" text="立即登录"></uv-button>
      </navigator>
    </div>
  </div>
</template>
