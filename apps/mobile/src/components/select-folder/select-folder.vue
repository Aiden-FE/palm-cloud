<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Resources } from '@/api';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    selectText?: string;
    titleFormat?: (params: { title: string; id: number }) => string;
    disabledFolderIds?: number[];
  }>(),
  {
    visible: false,
    selectText: '选择当前',
    titleFormat: undefined,
    disabledFolderIds: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'select', val: { id: number; item: any }): void;
}>();

const popupRef = ref();

const folders = ref<any[]>([]);

const folderStacks = ref([
  {
    title: '我的文件',
    id: -1,
  },
]);

const currentFolder = computed(() => folderStacks.value[folderStacks.value.length - 1]);

async function getFolders() {
  const result = await Resources.getFolders({
    folderId: currentFolder.value.id,
  });
  folders.value = result || [];
}

function onSelect() {
  emit('select', {
    id: currentFolder.value.id,
    item: currentFolder.value,
  });
  emit('update:visible', false);
}

function onFolderClick(item: any) {
  if (props.disabledFolderIds?.includes(item.id)) {
    return;
  }
  folderStacks.value.push({
    title: item.name,
    id: item.id,
  });
}

function onClickBack() {
  if (folderStacks.value.length > 1) {
    folderStacks.value.pop();
  }
}

watch(
  () => currentFolder.value?.id,
  () => {
    getFolders();
  },
);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      popupRef.value?.open();
      getFolders();
    } else {
      popupRef.value?.close();
    }
  },
);
</script>

<template>
  <uv-popup ref="popupRef" mode="bottom" :round="20" @mask-click="emit('update:visible', false)">
    <div class="h-[70vh]">
      <div>
        <h3 class="text-base flex items-center p-4">
          <uv-icon
            v-if="currentFolder?.id !== -1"
            @click="onClickBack"
            name="arrow-left"
            size="20"
            style="margin-right: 16rpx"
          ></uv-icon>
          <div class="flex-1 text-center truncate">
            {{
              titleFormat
                ? titleFormat({
                    title: currentFolder.title,
                    id: currentFolder.id,
                  })
                : currentFolder.title
            }}
          </div>
          <uv-button @click="onSelect" type="primary" size="small">{{ selectText }}</uv-button>
        </h3>
      </div>
      <uv-list class="select-folder">
        <uv-list-item v-for="item in folders" :key="item.id" :disabled="disabledFolderIds?.includes(item.id)">
          <div @click="onFolderClick(item)" class="select-folder__item">
            <div class="select-folder__item-prefix">
              <uv-icon name="folder" color="#fad870" size="80rpx"></uv-icon>
            </div>
            <div class="select-folder__item-content">{{ item.name }}</div>
          </div>
        </uv-list-item>
      </uv-list>
    </div>
  </uv-popup>
</template>

<style lang="scss" scoped>
.select-folder {
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
    }
    &-suffix {
      margin-left: 16rpx;
    }
  }
}
</style>
