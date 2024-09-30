<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useContextStore } from '@/stores';
import { Resources } from '@/api';

const { isLogin } = storeToRefs(useContextStore());
const list = ref([] as any[]);
const keyword = ref('');
const popupRef = ref();

function getList() {
  return Resources.getResourceList()
    .then((res) => {
      list.value = res || [];
    })
    .finally(() => uni.stopPullDownRefresh());
}

function openCreatePanel() {
  popupRef.value.open();
}

function onClickItem(item: string) {
  switch (item) {
    case 'folder':
      break;
    case 'uploadImage':
      uni.chooseImage({
        sizeType: 'original',
        success: ({ tempFiles }) => {
          const formData = new FormData();
          (tempFiles as File[]).forEach((file: File, index) => formData.append(`files[${index}]`, file));
          Resources.uploadResources(formData);
        },
      });
      break;
    case 'uploadVideo':
      break;
    default:
      break;
  }
}

onPullDownRefresh(() => {
  getList();
});

getList();
</script>

<template>
  <div class="resources">
    <template v-if="isLogin">
      <div>
        <uv-search placeholder="可根据关键字筛选" v-model="keyword" :show-action="false"></uv-search>
        <uv-list v-if="list.length">
          <uv-list-item
            v-for="item in list"
            :key="item.id"
            clickable
            :to="`/pages/resource/resource?id=${item.id}`"
            :title="item.name"
          />
        </uv-list>
        <uv-empty v-else mode="list" style="margin-top: 32rpx" />
      </div>
      <div class="resources__add">
        <uv-button type="primary" shape="circle" @click="openCreatePanel"
          ><uv-icon name="plus" color="#fff"></uv-icon
        ></uv-button>
      </div>
    </template>
    <template v-else>
      <navigator url="/pages/login/login">
        <button type="button">登录后可用,点击登录</button>
      </navigator>
    </template>
    <uv-popup ref="popupRef" mode="bottom">
      <div class="resources__add-panel">
        <uv-grid @click="onClickItem" :border="false">
          <uv-grid-item name="folder">
            <uv-icon name="folder" :size="36"></uv-icon>
            <text>创建文件夹</text>
          </uv-grid-item>
          <uv-grid-item name="uploadImage">
            <uv-icon name="photo" :size="36"></uv-icon>
            <text>上传图片</text>
          </uv-grid-item>
          <uv-grid-item name="uploadVideo">
            <uv-icon name="camera" :size="36"></uv-icon>
            <text>上传视频</text>
          </uv-grid-item>
        </uv-grid>
      </div>
    </uv-popup>
  </div>
</template>

<style lang="scss" scoped>
.resources {
  width: 100%;
  height: 100%;
  &__add {
    position: fixed;
    right: 32rpx;
    bottom: 128rpx;
    &-panel {
      padding: 32rpx 32rpx 128rpx;
    }
  }
}
</style>
