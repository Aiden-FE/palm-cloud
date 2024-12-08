<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { nanoid } from 'nanoid';
import { useContextStore } from '@/stores';
import { Resources } from '@/api';
import DropDown from '@/components/drop-down/drop-down.vue';
import SelectFolder from '@/components/select-folder/select-folder.vue';
import SelectTags from '@/components/select-tags/select-tags.vue';

const { isLogin, context } = storeToRefs(useContextStore());
const list = ref([] as any[]);
const folders = ref([] as any[]);
const imageUrlList = ref<string[]>([]);
const createFolderPopupRef = ref();
const editInfo = ref({
  newName: '',
  item: null as any,
  rules: {
    newName: {
      type: 'string',
      required: true,
      message: '请填写名称',
      trigger: ['blur', 'change'],
    },
  },
});
const editInfoPopupRef = ref();
const editInfoFormRef = ref();
const videoInfo = ref({
  visible: false,
  url: '',
});
const dropForm = ref({
  filetype: '',
  tags: [] as number[],
});
const dropItems = ref([
  {
    label: '按类型搜索',
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
    label: '按标签搜索',
    key: 'tags',
    disabledPopup: true,
  },
]);

const itemOptions = [
  {
    name: '编辑',
    key: 'edit',
    style: {
      backgroundColor: '#3c9cff',
    },
  },
  {
    name: '下载',
    key: 'download',
    style: {
      backgroundColor: '#3c9cff',
    },
  },
  {
    name: '删除',
    key: 'delete',
    style: {
      backgroundColor: '#f56c6c',
    },
  },
];

const folderOptions = [
  {
    name: '编辑',
    key: 'edit',
    style: {
      backgroundColor: '#3c9cff',
    },
  },
  {
    name: '删除',
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
const selectedItems = ref<{ id: number; type: 'folder' | 'file' }[]>([]);

const actionList = ref([
  { name: '选择全部', key: 'selectAll' },
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

const itemActionsRef = ref();
const itemActions = reactive({
  actions: itemOptions,
  currentItem: null as null | any,
});

const selectFolderVisible = ref(false);
const selectTagsVisible = ref(false);

const currentFolder = computed(() => folderStacks.value[folderStacks.value.length - 1]);

function onSelectTags(ids: number[]) {
  dropForm.value.tags = ids;
}

function getList() {
  return Resources.getResourceList({
    filetype: dropForm.value.filetype,
    folderId: currentFolder.value.id,
    isIntranet: context.value.enabledIntranet,
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
    // eslint-disable-next-line no-use-before-define
    onSelecte({
      id: item.id,
      type: item.type === 'folder' ? 'folder' : 'file',
    });
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
      loop: true,
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

function onDropPopupChange({ key }: { key: string }) {
  if (key === 'tags') {
    selectTagsVisible.value = true;
  }
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

function onSelecte(data: { id: number; type: 'folder' | 'file' }) {
  selectedItems.value = selectedItems.value.some((item) => item.id === data.id)
    ? selectedItems.value.filter((item) => item.id !== data.id)
    : [...selectedItems.value, data];
}

function openEdit(item: any) {
  if (isEdit.value) {
    return;
  }
  onSelecte({ id: item.id, type: item.type === 'folder' ? 'folder' : 'file' });
  isEdit.value = true;
}

function onClickBack() {
  if (folderStacks.value.length > 1) {
    folderStacks.value.pop();
  }
}

async function onMoveToFolder({ id }: { id: number; item: any }) {
  if (!selectedItems.value.length) {
    uni.showToast({
      title: '请先选择要移动的资源',
      icon: 'none',
    });
    return;
  }
  if (id === currentFolder.value.id) {
    uni.showToast({
      title: '不能移动到当前文件夹',
      icon: 'none',
    });
    return;
  }
  await Resources.moveResources({
    ids: selectedItems.value.filter((item) => item.type !== 'folder').map((item) => item.id),
    folderIds: selectedItems.value.filter((item) => item.type === 'folder').map((item) => item.id),
    folderId: id,
  });
  getList();
  getFolders();
  selectedItems.value = [];
  isEdit.value = false;
  uni.showToast({
    title: '移动成功',
    icon: 'none',
  });
}

async function onSelectAction({ key }: { key: string }) {
  switch (key) {
    case 'selectAll':
      selectedItems.value = folders.value
        .map((item) => ({ id: item.id, type: 'folder' as 'folder' | 'file' }))
        .concat(list.value.map((item) => ({ id: item.id, type: 'file' })));
      break;
    case 'move':
      selectFolderVisible.value = true;
      break;
    case 'delete':
      // eslint-disable-next-line no-case-declarations
      const ids = selectedItems.value.filter((item) => item.type !== 'folder').map((item) => item.id);
      // eslint-disable-next-line no-case-declarations
      const folderIds = selectedItems.value.filter((item) => item.type === 'folder').map((item) => item.id);
      await Resources.deleteResources({
        ids,
      });
      Resources.deleteFolders({
        ids: folderIds,
      }).then(() => {
        selectedItems.value = [];
        isEdit.value = false;
        getList();
        getFolders();
        uni.showToast({
          title: '批量删除成功',
          icon: 'none',
        });
      });
      break;
    case 'more':
      if (!selectedItems.value.length) {
        uni.showToast({
          title: '请先选择要操作的资源',
          icon: 'none',
        });
        return;
      }
      actionSheet.value.open();
      break;
    case 'cancel':
    default:
      selectedItems.value = [];
      isEdit.value = false;
      break;
  }
}

watch(
  () => currentFolder.value?.id,
  () => {
    getList();
    getFolders();
  },
);

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
        success: async ({ tempFiles }) => {
          uni.showLoading({
            title: '上传中',
          });
          try {
            await Promise.all(
              (tempFiles as File[]).map(async (file) => {
                const filepath = `${folderStacks.value.map((item) => item.id).join('/')}/${nanoid(32)}-${file.name}`;
                const params = {
                  filepath,
                  filename: file.name,
                  folderId: currentFolder.value.id,
                  isIntranet: context.value.enabledIntranet,
                };
                const uploadUrl = await Resources.generateUploadUrl(params);
                await Resources.uploadToMinio({ uploadUrl, file });
                await Resources.finishUpload(params);
              }),
            );
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
              isIntranet: context.value.enabledIntranet,
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
              isIntranet: context.value.enabledIntranet,
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

function openItemActionsPanel(data: any) {
  itemActions.currentItem = data;
  if (data.type === 'folder') {
    itemActions.actions = folderOptions;
  } else {
    itemActions.actions = itemOptions;
  }
  itemActionsRef.value.open();
}

function onSelectedItemAction(selectedOption: any) {
  const item = itemActions.currentItem;
  switch (selectedOption.key) {
    case 'edit':
      editInfo.value.item = item;
      editInfo.value.newName = item.name;
      editInfoPopupRef.value.open();
      break;
    case 'download':
      uni.showLoading({
        title: '下载中...',
      });
      uni.downloadFile({
        url: item.url,
        success: ({ tempFilePath }) => {
          const a = document.createElement('a');
          a.href = tempFilePath;
          a.download = item.name;
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
      if (item.type === 'folder') {
        Resources.deleteFolders({ ids: [item.id] }).then(() => {
          getList();
          getFolders();
          uni.showToast({
            title: '删除成功',
            icon: 'none',
          });
        });
      } else {
        Resources.deleteResources({ ids: [item.id] }).then(() => {
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

async function onEditConfirm() {
  await editInfoFormRef.value.validate();
  if (editInfo.value.newName === editInfo.value.item.name) {
    uni.showToast({
      title: '名称未修改',
      icon: 'none',
    });
    return;
  }
  await Resources.renameResourceOrFolder({
    id: editInfo.value.item.id,
    name: editInfo.value.newName,
    type: editInfo.value.item.type === 'folder' ? 'folder' : 'file',
  });
  uni.showToast({
    title: '修改成功',
    icon: 'none',
  });
  editInfoPopupRef.value.close();
  if (editInfo.value.item.type === 'folder') {
    getFolders();
  } else {
    getList();
  }
  editInfoPopupRef.value.resetFields();
  editInfoPopupRef.value.clearValidate();
  editInfo.value.item = null;
}

onPullDownRefresh(() => {
  getList();
  getFolders();
});

getList();
getFolders();
</script>

<template>
  <div class="resources">
    <uv-navbar placeholder style="z-index: 888" height="64px">
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
        <template v-if="isLogin && isEdit">
          <uv-text text="取消" @click="onSelectAction({ key: 'cancel' })" class="!mr-[16rpx]"></uv-text>
          <uv-text text="操作" @click="onSelectAction({ key: 'more' })"></uv-text>
        </template>
        <uv-icon v-else-if="isLogin" @click="openAddActions" name="plus" size="20" color="#6B7280"></uv-icon>
      </template>
    </uv-navbar>
    <template v-if="isLogin">
      <DropDown
        :z-index="210"
        :items="dropItems"
        mode="left"
        :default-form="dropForm"
        height="40px"
        top="64px"
        @change="onFilterChange"
        @popup-change="onDropPopupChange"
      >
      </DropDown>
      <uv-list @touchmove.stop @touch.stop v-if="folders.concat(list).length">
        <uv-list-item v-for="item in folders.concat(list)" :key="item.id">
          <div class="resources__item" @click="onClickData(item)" @longpress="openEdit(item)">
            <div class="resources__item-prefix">
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
            <div class="resources__item-content">
              <div class="resources__item-content-main">{{ item.name }}</div>
              <div class="resources__item-content-sub" @click.stop>
                <checkbox
                  v-if="isEdit"
                  :checked="
                    selectedItems.some(
                      (data) => data.id === item.id && data.type === (item.type === 'folder' ? 'folder' : 'file'),
                    )
                  "
                  @click="onSelecte({ id: item.id, type: item.type === 'folder' ? 'folder' : 'file' })"
                ></checkbox>
                <uv-icon
                  v-else-if="!isEdit"
                  name="more-dot-fill"
                  size="48rpx"
                  color="rgba(107, 114, 128, 1)"
                  style="transform: rotate(90deg)"
                  @click="openItemActionsPanel(item)"
                ></uv-icon>
              </div>
            </div>
          </div>
        </uv-list-item>
      </uv-list>
      <uv-empty v-else mode="list" style="margin-top: 32rpx" />
    </template>
    <template v-else>
      <uv-empty mode="permission" text="请登录后查看" style="margin-top: 32rpx">
        <navigator url="/pages/login/login">
          <uv-button class="mx-4 mt-8" type="primary" plain text="立即登录"></uv-button>
        </navigator>
      </uv-empty>
    </template>

    <!-- 新增操作菜单 -->
    <uv-action-sheet
      ref="addActionSheetRef"
      :actions="addActions"
      :round="20"
      safe-area-inset-bottom
      cancel-text="取消"
      style="z-index: 1010"
      @select="onSelectedAddAction"
    />

    <!-- 创建文件夹弹窗 -->
    <uv-popup ref="createFolderPopupRef" mode="bottom" :close-on-click-overlay="false" closeable>
      <div class="resources__create-folder-panel">
        <h3 class="font-semibold text-slate-900 text-center">创建文件夹</h3>
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

    <!-- 编辑弹窗 -->
    <uv-popup
      ref="editInfoPopupRef"
      mode="bottom"
      :close-on-click-overlay="false"
      :safe-area-inset-bottom="false"
      closeable
    >
      <div class="resources__create-folder-panel">
        <h3 class="font-semibold text-slate-900 text-center">
          编辑{{ editInfo.item?.type === 'folder' ? '文件夹' : '文件' }}
        </h3>
        <uv-form label-position="left" ref="editInfoFormRef" :model="editInfo" :rules="editInfo.rules">
          <uv-form-item label="姓名" prop="newName" border-bottom>
            <uv-input v-model="editInfo.newName" :maxlength="12" border="none" placeholder="请输入名称" clearable />
          </uv-form-item>
        </uv-form>
        <uv-button
          @click="onEditConfirm"
          type="primary"
          text="提交"
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
    <uv-action-sheet
      @select="onSelectedItemAction"
      ref="itemActionsRef"
      style="z-index: 1010"
      :actions="itemActions.actions"
      cancel-text="取消"
    />
    <SelectFolder
      v-model:visible="selectFolderVisible"
      :disabled-folder-ids="selectedItems.filter((item) => item.type === 'folder').map((item) => item.id)"
      @select="onMoveToFolder"
    />
    <SelectTags v-model:visible="selectTagsVisible" :default-selected-ids="dropForm.tags" @ok="onSelectTags" />
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
  :deep(.drop-down) {
    box-shadow: none;
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
    height: 136rpx;
    &-prefix {
      display: flex;
      align-items: center;
      margin-right: 16rpx;
    }
    &-content {
      display: flex;
      align-items: center;
      flex: 1;
      height: 100%;
      border-bottom: 2rpx solid #f3f4f6;
      &-main {
        word-break: break-all;
        flex: 1;
      }
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
