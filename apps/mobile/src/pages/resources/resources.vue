<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { useContextStore } from '@/stores';
import { Resources } from '@/api';
import DropDown from '@/components/drop-down/drop-down.vue';

const { isLogin } = storeToRefs(useContextStore());
const list = ref([] as any[]);
const imageUrlList = ref<string[]>([]);
const keyword = ref('');
const popupRef = ref();
const videoInfo = ref({
  visible: false,
  url: '',
});
const dropForm = ref({
  filetype: '',
  tags: '',
});
const dropItems = ref([
  {
    label: '文件类型',
    key: 'filetype',
    options: [
      {
        label: '全部文件',
        value: '',
      },
      {
        label: '图片',
        value: 'image',
      },
      {
        label: '视频',
        value: 'video',
      },
      {
        label: '其他',
        value: 'other',
      },
    ],
  },
  {
    label: '标签',
    key: 'tags',
    options: [
      {
        label: '全部标签',
        value: '',
      },
      {
        label: '标签1',
        value: '1',
      },
      {
        label: '标签2',
        value: '2',
      },
      {
        label: '标签3',
        value: '3',
      },
    ],
  },
]);

function getList() {
  return Resources.getResourceList({ filetype: dropForm.value.filetype })
    .then((res) => {
      list.value = res || [];
      imageUrlList.value = res
        .filter((item: { filetype: string; url: string }) => item.filetype?.startsWith('image'))
        .map((item: { id: number; url: string }) => item.url);
    })
    .finally(() => uni.stopPullDownRefresh());
}

function openCreatePanel() {
  popupRef.value.open();
}

const blobToArrayBuffer = (blob: any) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsArrayBuffer(blob);
  });

async function sliceChunk(file: File, chunkSize: number) {
  const chunks = [];
  const total = Math.ceil(file.size / chunkSize);
  for (let i = 0; i < total; i += 1) {
    const start = i * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    chunks.push(file.slice(start, end));
  }
  return {
    chunks,
    total,
  };
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
          const file = (tempFiles as File[])[0];
          const { total, chunks } = await sliceChunk(file, 1024 * 1024); // 1MB
          const { taskId, chunkStatus } = await Resources.createUploadTask({
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
            chunkStatus: Array(total).fill(0),
            folderId: 1,
          });
          const taskPromises = [] as Promise<unknown>[];
          const uploadStatus = [...chunkStatus];
          chunks.forEach((chunk, index) => {
            // 已上传的分片则跳过
            if (uploadStatus[index]) {
              return;
            }
            const formData = new FormData();
            formData.append('file', chunk);
            taskPromises.push(
              Resources.uploadResourceChunk(
                {
                  name: 'file',
                  file,
                },
                {
                  taskId,
                  chunkIndex: index,
                  length: chunk.size,
                },
              ).then(() => {
                uploadStatus[index] = 1;
              }),
            );
          });
          await Promise.all(taskPromises).then(async () => {
            await Resources.finishUploadResource({ taskId });
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

function onFilterChange(val: { form: Record<string, any>; key: string; value: any }) {
  dropForm.value[val.key as 'filetype' | 'tags'] = val.value;
  getList();
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
        <DropDown :items="dropItems" :default-form="dropForm" @change="onFilterChange" />
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
    video {
      width: 100%;
    }
  }
  &__add {
    position: fixed;
    right: 32rpx;
    bottom: calc(env(safe-area-inset-bottom) + 128rpx);
    &-panel {
      padding: 32rpx 32rpx 128rpx;
    }
  }
}
</style>
