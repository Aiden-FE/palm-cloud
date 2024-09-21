<script lang="ts" setup>
import { reactive, ref, toRaw } from 'vue';
import { storeToRefs } from 'pinia';
import { useContextStore } from '@/stores';
import { getImageCaptcha, loginByEmail } from '@/api';

const { isLogin } = storeToRefs(useContextStore());
const { updateContext } = useContextStore();

const formState = reactive({
  email: '',
  password: '',
  captcha: '',
  captchaKey: '',
});
const formRef = ref();
const captchaSvg = ref('');

const rules = {
  email: { required: true },
  password: { required: true },
  captcha: { required: true, len: 4 },
};

if (isLogin.value) {
  uni.switchTab({ url: '/pages/index/index' });
}

function getImgCaptcha() {
  getImageCaptcha()
    .then((res) => {
      formState.captchaKey = res.key;
      captchaSvg.value = res.data;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.warn(error);
      uni.showToast({
        title: '验证码获取失败',
      });
    });
}

getImgCaptcha();

async function submit() {
  await formRef.value.validate();
  loginByEmail(toRaw(formState)).then((result) => {
    updateContext({
      token: result.token,
      userInfo: result,
    });
    uni.switchTab({ url: '/pages/index/index' });
  });
}
</script>

<template>
  <div class="login">
    <uv-form label-position="left" :model="formState" :rules="rules" ref="formRef">
      <uv-form-item label="邮箱" prop="email" border-bottom>
        <uv-input v-model="formState.email" border="none" placeholder="请输入邮箱账号" />
      </uv-form-item>
      <uv-form-item label="密码" prop="password" border-bottom>
        <uv-input v-model="formState.password" border="none" placeholder="请输入密码" />
      </uv-form-item>
      <uv-form-item label="验证码" prop="captcha" border-bottom>
        <uv-input v-model="formState.captcha" border="none" placeholder="请输入验证码" />
        <template #right>
          <div @click="getImgCaptcha" v-html="captchaSvg"></div>
        </template>
      </uv-form-item>
      <uv-button type="primary" text="登录" custom-style="margin-top: 10px" @click="submit"></uv-button>
    </uv-form>
  </div>
</template>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  padding: 32rpx;
}
</style>
