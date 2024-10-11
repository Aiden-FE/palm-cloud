<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useContextStore } from '@/stores';
import { Resources } from '@/api';

const { isLogin } = storeToRefs(useContextStore());
const list = ref([] as any[]);
const imageUrlList = ref<string[]>([]);
const keyword = ref('');
const popupRef = ref();
const videoInfo = ref({
  visible: false,
  url: '',
});

function getList() {
  return Resources.getResourceList()
    .then((res) => {
      list.value = res || [];
      imageUrlList.value = res
        .filter((item: { fileType: string; url: string }) => item.fileType?.startsWith('image'))
        .map((item: { id: number; url: string }) => item.url);
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
        count: 1,
        success: async ({ tempFiles }) => {
          const file = (tempFiles as any)[0];
          const taskId = await Resources.createUploadTask({
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
          });
          console.log('Upload task id is: ', taskId);
          await Resources.uploadResources({
            name: file.name,
            filePath: file.path,
            file,
          });
        },
      });
      break;
    case 'uploadVideo':
      break;
    default:
      break;
  }
}

function onClickData(item: any) {
  if (item.fileType?.startsWith('image')) {
    uni.previewImage({
      current: item.url,
      urls: [item.url],
    });
  } else if (item.fileType?.startsWith('video')) {
    videoInfo.value.url = item.url;
    videoInfo.value.visible = true;
  } else {
    uni.showToast({
      title: '暂不支持预览',
      icon: 'none',
    });
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
          <uv-list-item v-for="item in list" :key="item.id" clickable @click="onClickData(item)" :title="item.name" />
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
    <uv-overlay :show="videoInfo.visible" @click="videoInfo.visible = false">
      <view class="warp">
        <view class="rect" @tap.stop>
          <video v-if="videoInfo.visible" :src="videoInfo.url"></video>
        </view>
      </view>
    </uv-overlay>
  </div>
</template>

<style lang="scss" scoped>
.resources {
  width: 100%;
  height: 100%;
  .warp {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .rect {
    width: 100%;
    max-height: 70vh;
    background-color: #fff;
  }
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
