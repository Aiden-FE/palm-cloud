<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useContextStore } from '@/stores';

const { isLogin } = storeToRefs(useContextStore());
</script>

<template>
  <div class="resources">
    <template v-if="isLogin">
      <div>
        <uv-input
          placeholder="可根据关键字筛选"
          suffix-icon="search"
          prefix-icon-style="font-size: 22px;color: #909399"
        />
        <uv-list>
          <uv-list-item title="列表文字"></uv-list-item>
          <uv-list-item :disabled="true" title="列表禁用状态"></uv-list-item>
        </uv-list>
      </div>
    </template>
    <template v-else>
      <navigator url="/pages/login/login">
        <button type="default">登录后可用,点击登录</button>
      </navigator>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.resources {
  width: 100%;
  height: 100%;
}
</style>
