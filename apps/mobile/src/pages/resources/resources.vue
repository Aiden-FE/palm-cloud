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

function onAfterRead(event: any) {
  console.log('Debug file: ', event);
}

function onClickItem(item: any) {
  console.log('Debug: ', item);
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
        <uv-grid :border="false">
          <uv-grid-item>
            <uv-upload :file-list="[]" name="photo" :max-count="1" @after-read="onAfterRead">
              <uv-icon name="photo" :size="48"></uv-icon>
              <text>上传图片</text>
            </uv-upload>
          </uv-grid-item>
          <uv-grid-item>
            <uv-upload :file-list="[]" name="video" :max-count="1" @after-read="onAfterRead">
              <uv-icon name="camera" :size="48"></uv-icon>
              <text>上传视频</text>
            </uv-upload>
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
