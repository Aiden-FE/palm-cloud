<script lang="ts" setup>
import { ref, toRaw, watch } from 'vue';
import { Resources } from '@/api';

const visible = defineModel<boolean>('visible', { default: false });
const props = defineProps<{
  defaultSelectedIds?: number[];
}>();

const emit = defineEmits<{
  (e: 'ok', val: number[]): void;
}>();

const popupRef = ref();
const tags = ref<{ id: number; name: string; color?: string }[]>([]);
const selectedIds = ref<number[]>([...toRaw(props.defaultSelectedIds || [])]);

function getTags() {
  return Resources.getTags().then((data) => {
    tags.value = data;
  });
}

function createNewTag() {
  uni.showModal({
    title: '创建标签',
    placeholderText: '标签名称,长度不超过12',
    editable: true,
    success: async (res) => {
      if (res.confirm) {
        if (!res.content) {
          uni.showToast({
            title: '标签名称不能为空',
            icon: 'none',
          });
        } else if (res.content.length > 12) {
          uni.showToast({
            title: '标签名称长度不能超过 12 个字符',
            icon: 'none',
          });
        } else {
          await Resources.createTag({ name: res.content });
          getTags();
        }
      }
    },
  });
}

function onDeleteTagConfirm(item: { id: number; name: string; color?: string }) {
  uni.showModal({
    title: '删除标签',
    content: `确定删除标签 ${item.name}？`,
    success: async (res) => {
      if (res.confirm) {
        await Resources.deleteTags({ ids: [item.id] });
        getTags();
        uni.showToast({
          title: '删除成功',
          icon: 'none',
        });
      }
    },
  });
}

function onSelectTag(data: { id: number; name: string; color?: string }) {
  selectedIds.value = selectedIds.value.includes(data.id)
    ? selectedIds.value.filter((item) => item !== data.id)
    : [...selectedIds.value, data.id];
}

function onSubmit() {
  emit('ok', selectedIds.value);
  visible.value = false;
}

watch(
  () => visible.value,
  (val) => {
    if (val) {
      popupRef.value?.open();
      selectedIds.value = [...toRaw(props.defaultSelectedIds || [])];
      getTags();
    } else {
      popupRef.value?.close();
      tags.value = [];
      selectedIds.value = [];
    }
  },
);
</script>

<template>
  <uv-popup ref="popupRef" mode="right" @mask-click="visible = false">
    <div class="select-tags flex flex-col">
      <h3 class="font-semibold text-lg flex">
        <span class="flex-1">标签选择</span>
        <uv-button v-if="selectedIds.length" class="mr-1" icon="close-circle" size="mini" @click="selectedIds = []"
          >清空选择</uv-button
        >
        <uv-button icon="plus" size="mini" type="primary" icon-color="#fff" @click="createNewTag">新建标签</uv-button>
      </h3>
      <div class="flex flex-wrap gap-2 mt-4 flex-1 overflow-y-auto">
        <template v-if="tags.length">
          <uv-tags
            v-for="tag in tags"
            :key="tag.id"
            :text="tag.name"
            closable
            :color="selectedIds.includes(tag.id) ? '#fff' : tag.color || '#3c9cff'"
            :plain="!selectedIds.includes(tag.id)"
            @click="onSelectTag(tag)"
            @close="onDeleteTagConfirm(tag)"
          ></uv-tags>
        </template>
        <div v-else class="flex items-center justify-center w-full">
          <uv-empty class="mt-16" text="暂无可用标签"></uv-empty>
        </div>
      </div>
      <div>
        <uv-button class="mt-4" type="primary" @click="onSubmit">确定</uv-button>
        <uv-button class="mt-4" @click="visible = false">取消</uv-button>
      </div>
    </div>
  </uv-popup>
</template>

<style scoped lang="scss">
.select-tags {
  padding: 32rpx;
  width: 70vw;
  height: 100%;
}
</style>
