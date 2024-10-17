<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { onShow } from '@dcloudio/uni-app';
import { useContextStore } from '@/stores';
import { Resources } from '@/api';
import DropDown from '@/components/drop-down/drop-down.vue';

const { isLogin } = storeToRefs(useContextStore());
const list = ref([] as any[]);
const folders = ref([] as any[]);
const imageUrlList = ref<string[]>([]);
const keyword = ref('');
const createFolderPopupRef = ref();
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

const itemOptions = [
  {
    text: '下载',
    key: 'download',
    style: {
      backgroundColor: '#3c9cff',
    },
  },
  {
    text: '删除',
    key: 'delete',
    style: {
      backgroundColor: '#f56c6c',
    },
  },
];

const folderOptions = [
  {
    text: '编辑',
    key: 'edit',
    style: {
      backgroundColor: '#3c9cff',
    },
  },
  {
    text: '删除',
    key: 'delete',
    style: {
      backgroundColor: '#f56c6c',
    },
  },
];

const folderStacks = ref([
  {
    title: '我的文件',
    id: -1,
  },
]);

const folderName = ref('');

const isEdit = ref(false);
const selectedItems = ref<string[]>([]);

const actionList = ref([
  { name: '批量移动', key: 'move' },
  { name: '批量删除', key: 'delete' },
  { name: '取消编辑', key: 'cancel' },
]);
const actionSheet = ref();

const addActionSheetRef = ref();
const addActions = [
  {
    name: '创建文件夹',
    key: 'createFolder',
    color: '#000000',
    fontSize: '28rpx',
  },
  {
    name: '上传图片',
    key: 'uploadImage',
    color: '#000000',
    fontSize: '28rpx',
  },
  {
    name: '上传视频',
    key: 'uploadVideo',
    color: '#000000',
    fontSize: '28rpx',
  },
  {
    name: '上传文件',
    key: 'uploadFile',
    color: '#000000',
    fontSize: '28rpx',
  },
];

const currentFolder = computed(() => folderStacks.value[folderStacks.value.length - 1]);

function getList() {
  return Resources.getResourceList({
    filetype: dropForm.value.filetype,
    folderId: currentFolder.value.id,
  })
    .then((res) => {
      list.value = res || [];
      imageUrlList.value = res
        .filter((item: { fileType: string; url: string }) => item.fileType?.startsWith('image'))
        .map((item: { id: number; url: string }) => item.url);
    })
    .finally(() => uni.stopPullDownRefresh());
}

async function sliceChunk(file: File, chunkSize: number) {
  const chunks = [];
  const total = Math.ceil(file.size / chunkSize);
  for (let i = 0; i < total; i += 1) {
    const start = i * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, end);
    chunks.push(chunk);
  }
  return {
    chunks,
    total,
  };
}

function onClickData(item: any) {
  if (isEdit.value) {
    return;
  }
  if (item.fileType?.startsWith('image')) {
    const startIndex = imageUrlList.value.indexOf(item.url);
    let endIndex = startIndex + 12;
    endIndex = endIndex > imageUrlList.value.length ? imageUrlList.value.length : endIndex;
    const previewUrls = imageUrlList.value.slice(startIndex, endIndex);
    uni.previewImage({
      current: item.url,
      urls: previewUrls,
    });
  } else if (item.fileType?.startsWith('video')) {
    videoInfo.value.url = item.url;
    videoInfo.value.visible = true;
  } else if (item.type === 'folder') {
    folderStacks.value.push({
      title: item.name,
      id: item.id,
    });
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

async function getFolders() {
  const result = await Resources.getFolders({
    folderId: currentFolder.value.id,
  });
  folders.value =
    result?.map((item: any) => ({
      ...item,
      type: 'folder',
    })) || [];
}

async function submitCreateFolder() {
  if (!folderName.value) {
    uni.showToast({
      title: '请输入文件夹名称',
      icon: 'none',
    });
    return;
  }
  await Resources.createFolder({ name: folderName.value, parentId: currentFolder.value.id });
  uni.showToast({
    title: '创建成功',
    icon: 'none',
  });
  getFolders();
  createFolderPopupRef.value.close();
  folderName.value = '';
}

function onSelecte(id: string) {
  selectedItems.value = selectedItems.value.includes(id)
    ? selectedItems.value.filter((item) => item !== id)
    : [...selectedItems.value, id];
}

function onClickBack() {
  if (folderStacks.value.length > 1) {
    folderStacks.value.pop();
  }
}

function onClickActions() {
  actionSheet.value.open();
}

function onSelectAction({ key }: { key: string }) {
  switch (key) {
    case 'cancel':
    default:
      selectedItems.value = [];
      isEdit.value = false;
      break;
  }
}

function onClickBatchActions() {
  isEdit.value = true;
}

watch(
  () => currentFolder.value?.id,
  () => {
    getList();
    getFolders();
  },
);

function onClickSwipeAction(data: {
  eventData: {
    index: number;
    name: number;
  };
  item: any;
  options: { text: string; key: string }[];
}) {
  const selectedIndex = data.eventData.index;
  const selectedOption = data.options[selectedIndex];
  switch (selectedOption.key) {
    case 'download':
      uni.showLoading({
        title: '下载中...',
      });
      uni.downloadFile({
        url: data.item.url,
        success: ({ tempFilePath }) => {
          const a = document.createElement('a');
          a.href = tempFilePath;
          a.download = data.item.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        complete() {
          uni.hideLoading();
        },
      });
      break;
    case 'delete':
      if (data.item.type === 'folder') {
        Resources.deleteFolders({ ids: [data.item.id] }).then(() => {
          getList();
          getFolders();
          uni.showToast({
            title: '删除成功',
            icon: 'none',
          });
        });
      } else {
        Resources.deleteResources({ ids: [data.item.id] }).then(() => {
          getList();
          getFolders();
          uni.showToast({
            title: '删除成功',
            icon: 'none',
          });
        });
      }
      break;
    default:
      uni.showToast({
        title: '暂不支持该操作',
        icon: 'none',
      });
      break;
  }
}

function openAddActions() {
  addActionSheetRef.value.open();
}

function onSelectedAddAction(data: any) {
  switch (data.key) {
    case 'createFolder':
      createFolderPopupRef.value.open();
      break;
    case 'uploadImage':
      uni.chooseImage({
        sizeType: 'original',
        count: 1,
        success: async ({ tempFiles }) => {
          uni.showLoading({
            title: '上传中',
          });
          try {
            const file = (tempFiles as File[])[0];
            const filepath = `${folderStacks.value.map((item) => item.id).join('/')}/${file.name}`;
            const params = {
              filepath,
              filename: file.name,
              folderId: currentFolder.value.id,
            };
            const uploadUrl = await Resources.generateUploadUrl(params);
            await Resources.uploadToMinio({ uploadUrl, file });
            await Resources.finishUpload(params);
            getList();
          } finally {
            uni.hideLoading();
          }
          // const { total, chunks } = await sliceChunk(file, 1024 * 1024); // 1MB
          // const { taskId, chunkStatus } = await Resources.createUploadTask({
          //   filename: file.name,
          //   filesize: file.size,
          //   filetype: file.type,
          //   chunkStatus: Array(total).fill(0),
          //   folderId: 1,
          // });
          // const taskPromises = [] as Promise<unknown>[];
          // const uploadStatus = [...chunkStatus];
          // chunks.forEach((chunk, index) => {
          //   // 已上传的分片则跳过
          //   if (uploadStatus[index]) {
          //     return;
          //   }
          //   taskPromises.push(
          //     Resources.uploadResourceChunk(
          //       {
          //         name: file.name,
          //         file: chunk,
          //       },
          //       {
          //         taskId,
          //         chunkIndex: index,
          //       },
          //     ).then(() => {
          //       uploadStatus[index] = 1;
          //     }),
          //   );
          // });
          // await Promise.all(taskPromises).then(async () => {
          //   await Resources.finishUploadResource({ taskId });
          // });
        },
      });
      break;
    case 'uploadVideo':
      uni.chooseVideo({
        compressed: false,
        success: async ({ tempFile }) => {
          uni.showLoading({
            title: '上传中',
          });
          try {
            const file = tempFile;
            const filepath = `${folderStacks.value.map((item) => item.id).join('/')}/${file.name}`;
            const params = {
              filepath,
              filename: file.name,
              folderId: currentFolder.value.id,
            };
            const uploadUrl = await Resources.generateUploadUrl(params);
            await Resources.uploadToMinio({ uploadUrl, file });
            await Resources.finishUpload(params);
            getList();
          } finally {
            uni.hideLoading();
          }
        },
      });
      break;
    case 'uploadFile':
      uni.chooseFile({
        count: 1,
        success: async ({ tempFiles }) => {
          uni.showLoading({
            title: '上传中',
          });
          try {
            const file = (tempFiles as File[])[0];
            const filepath = `${folderStacks.value.map((item) => item.id).join('/')}/${file.name}`;
            const params = {
              filepath,
              filename: file.name,
              folderId: currentFolder.value.id,
            };
            const uploadUrl = await Resources.generateUploadUrl(params);
            await Resources.uploadToMinio({ uploadUrl, file });
            await Resources.finishUpload(params);
            getList();
          } finally {
            uni.hideLoading();
          }
        },
      });
      break;
    default:
      break;
  }
}

onShow(() => {
  getList();
  getFolders();
});
</script>

<template>
  <div class="resources">
    <uv-navbar title="" placeholder style="z-index: 9999" height="64px">
      <template #left>
        <view class="resources__navbar-left">
          <uv-icon
            v-if="currentFolder?.id !== -1"
            @click="onClickBack"
            name="arrow-left"
            size="20"
            style="margin-right: 16rpx"
          ></uv-icon>
          <h3>{{ currentFolder?.title }}</h3>
        </view>
      </template>
      <template #right>
        <uv-icon @click="openAddActions" name="plus" size="20" color="#6B7280" style="margin-right: 36rpx"></uv-icon>
        <uv-icon v-if="isEdit" @click="onClickActions" name="setting" size="20"></uv-icon>
        <span v-else @click="onClickBatchActions">批量操作</span>
      </template>
    </uv-navbar>
    <template v-if="isLogin">
      <div>
        <DropDown :z-index="2000" :items="dropItems" :default-form="dropForm" top="84rpx" @change="onFilterChange" />
        <uv-search
          style="position: sticky; top: 168rpx; z-index: 100"
          placeholder="可根据关键字筛选"
          v-model="keyword"
          :show-action="false"
        ></uv-search>
        <uv-swipe-action v-if="folders.concat(list).length">
          <uv-swipe-action-item
            v-for="item in folders.concat(list)"
            :key="item.id"
            :name="item.id"
            :options="item.type === 'folder' ? folderOptions : itemOptions"
            @click="
              (ev: any) =>
                onClickSwipeAction({
                  eventData: ev,
                  item,
                  options: item.type === 'folder' ? folderOptions : itemOptions,
                })
            "
          >
            <div class="resources__item" @click="onClickData(item)">
              <div class="resources__item-prefix">
                <checkbox
                  v-if="isEdit && item.type !== 'folder'"
                  :checked="selectedItems.includes(item.id)"
                  @click="onSelecte(item.id)"
                ></checkbox>
                <uv-icon v-if="item.type === 'folder'" name="folder" color="#fad870" size="80rpx"></uv-icon>
                <uv-icon
                  v-else-if="item.fileType?.startsWith('video')"
                  name="camera"
                  color="#40a9ff"
                  size="80rpx"
                ></uv-icon>
                <uv-image
                  v-else-if="item.fileType?.startsWith('image')"
                  :src="item.url"
                  width="80rpx"
                  height="80rpx"
                  observe-lazy-load
                  mode="aspectFill"
                >
                  <template #loading>
                    <uv-loading-icon color="red"></uv-loading-icon>
                  </template>
                </uv-image>
                <uv-icon v-else name="file-text" size="80rpx"></uv-icon>
              </div>
              <div class="resources__item-content">{{ item.name }}</div>
            </div>
          </uv-swipe-action-item>
        </uv-swipe-action>
        <uv-empty v-else mode="list" style="margin-top: 32rpx" />
      </div>
    </template>
    <template v-else>
      <navigator url="/pages/login/login">
        <button type="button">登录后可用,点击登录</button>
      </navigator>
    </template>

    <!-- 新增操作菜单 -->
    <uv-action-sheet
      ref="addActionSheetRef"
      :actions="addActions"
      :round="20"
      safe-area-inset-bottom
      cancel-text="取消"
      style="z-index: 999"
      @select="onSelectedAddAction"
    />

    <!-- 创建文件夹弹窗 -->
    <uv-popup ref="createFolderPopupRef" mode="bottom" :close-on-click-overlay="false" closeable>
      <div class="resources__create-folder-panel">
        <h3>创建文件夹</h3>
        <uv-input
          v-model="folderName"
          :maxlength="12"
          placeholder="请输入文件夹名称"
          border="surround"
          clearable
        ></uv-input>
        <uv-button
          @click="submitCreateFolder"
          type="primary"
          text="确定"
          :throttle-time="200"
          style="margin-top: 16rpx"
        ></uv-button>
      </div>
    </uv-popup>

    <!-- 视频播放弹窗 -->
    <uv-overlay :show="videoInfo.visible" @click="videoInfo.visible = false">
      <view class="warp">
        <view class="rect" @tap.stop>
          <video v-if="videoInfo.visible" :src="videoInfo.url"></video>
        </view>
      </view>
    </uv-overlay>

    <uv-action-sheet @select="onSelectAction" ref="actionSheet" :actions="actionList" title="操作" />
  </div>
</template>

<style lang="scss" scoped>
.resources {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  :deep(.uv-navbar__content__left) {
    width: 70%;
  }
  &__navbar-left {
    display: flex;
    align-items: center;
    overflow: hidden;
    h3 {
      display: inline-block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 24px;
      font-weight: 500;
    }
  }
  &__create-folder-panel {
    padding: 20rpx 32rpx;
    padding-bottom: calc(env(safe-area-inset-bottom) + 112rpx);
    h3 {
      margin-bottom: 32rpx;
    }
  }
  &__item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 16rpx 32rpx;
    border-bottom: 2rpx solid #e5e5e5;
    &-prefix {
      display: flex;
      align-items: center;
      margin-right: 16rpx;
    }
    &-content {
      flex: 1;
    }
    &-suffix {
      margin-left: 16rpx;
    }
  }
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
}
</style>
