<script setup lang="ts">
import { computed, ref, reactive, toRaw, readonly } from 'vue';

interface BIDropDownItem {
  label: string;
  key: string;
  disabled?: boolean;
  disabledPopup?: boolean;
  options?: {
    label: string;
    value: string;
  }[];
}

const props = withDefaults(
  defineProps<{
    items: BIDropDownItem[];
    defaultForm?: Record<string, unknown>;
    height?: string;
    closeOnSelected?: boolean;
    zIndex?: number;
    top?: number | string;
    mode?: 'center' | 'left';
  }>(),
  {
    height: '44px',
    zIndex: 200,
    defaultForm: undefined,
    closeOnSelected: true,
    top: 0,
    mode: 'center',
  },
);

const emits = defineEmits<{
  (e: 'popupChange', val: { key: string; visible: boolean }): void;
  (
    e: 'change',
    val: {
      form: Record<string, any>;
      key: string;
      value: any;
    },
  ): void;
}>();

const popupRef = ref();
const currentActivedItem = ref('');
const isVisiblePopup = ref(false);
const formState = reactive<Record<string, unknown>>({
  ...toRaw(props.defaultForm),
});

const displayItem = computed<BIDropDownItem | undefined>(() => {
  return props.items.find((item) => item.key === currentActivedItem.value);
});

const displayLabels = computed(() => {
  const labels = {} as Record<string, string>;
  Object.keys(formState).forEach((key) => {
    // 根据key获取到filter项
    const options = props.items.find((item) => item.key === key)?.options || [];
    // 根据值获取到option项
    const option = options?.find((opt) => opt.value === formState[key]);
    if (option?.label) {
      labels[key] = option.label;
    }
  });
  return labels;
});

function onClickItem(item: BIDropDownItem) {
  if (item.disabled) {
    return;
  }
  if (item.key === currentActivedItem.value) {
    popupRef.value.close();
    emits('popupChange', { key: item.key, visible: false });
    return;
  }
  if (item.disabledPopup) {
    setTimeout(() => {
      currentActivedItem.value = item.key;
    }, 200);
    popupRef.value.close();
    emits('popupChange', { key: item.key, visible: false });
  } else {
    currentActivedItem.value = item.key;
    popupRef.value.open();
    emits('popupChange', { key: item.key, visible: true });
  }
}

function onClickPopupItem({ key, value }: { key: string; value: string }) {
  formState[key] = value;
  emits('change', {
    form: readonly(formState),
    key,
    value,
  });
  if (props.closeOnSelected) {
    popupRef.value.close();
    emits('popupChange', { key, visible: false });
  }
}

function onChangedPopup({ show }: { show: boolean }) {
  isVisiblePopup.value = show;
  if (!show) {
    setTimeout(() => {
      currentActivedItem.value = '';
    }, 200);
  }
}
</script>

<template>
  <view class="drop-down">
    <slot v-bind="{ items, onClickItem, displayLabels, currentActivedItem, isVisiblePopup }">
      <template v-if="mode === 'center'">
        <view v-for="item in items" :key="item.key" @click="onClickItem(item)" class="drop-down__item">
          <span class="drop-down__item-title">{{ displayLabels[item.key] || item.label }}</span>
          <template v-if="!item.disabled">
            <uv-icon
              v-if="isVisiblePopup && currentActivedItem === item.key"
              name="arrow-up-fill"
              color="#A3A3A3"
              size="24rpx"
            ></uv-icon>
            <uv-icon v-else name="arrow-down-fill" color="#A3A3A3" size="24rpx"></uv-icon>
          </template>
        </view>
      </template>
      <template v-else>
        <div class="flex">
          <!-- 左侧actions -->
          <div class="flex px-[32rpx]">
            <div
              class="text-[#9ca3af] text-[26rpx] flex mr-[32rpx]"
              v-for="item in items"
              :key="item.key"
              @click="onClickItem(item)"
            >
              <span>{{ item.label }}</span>
              <uv-icon
                v-if="isVisiblePopup && currentActivedItem === item.key"
                name="arrow-up-fill"
                color="#A3A3A3"
                size="24rpx"
                class="ml-[8rpx]"
              ></uv-icon>
              <uv-icon v-else name="arrow-down-fill" color="#A3A3A3" size="24rpx" class="ml-[8rpx]"></uv-icon>
            </div>
          </div>
          <!-- 右侧actions -->
          <div></div>
        </div>
      </template>
    </slot>
  </view>
  <uv-popup
    @change="onChangedPopup"
    ref="popupRef"
    mode="top"
    :z-index="zIndex"
    safe-area-inset-top
    :safe-area-inset-bottom="false"
    class="drop-down__popup"
  >
    <template v-if="displayItem?.options?.length">
      <view class="drop-down__popup-list">
        <uv-list>
          <uv-list-item
            v-for="item in displayItem.options"
            :key="item.value"
            :class="{
              'drop-down__popup-list-item_active': item.value === formState[displayItem.key],
            }"
            @click="
              onClickPopupItem({
                key: displayItem.key,
                value: item.value,
              })
            "
            border
            clickable
          >
            <template #body>
              <span class="drop-down__popup-list-item-body">{{ item.label }}</span>
            </template>
            <template #footer>
              <uv-icon
                v-if="item.value === formState[displayItem.key]"
                name="checkbox-mark"
                color="#1989fa"
                size="28rpx"
              ></uv-icon>
            </template>
          </uv-list-item>
        </uv-list>
      </view>
    </template>
    <template v-else>
      <view class="drop-down__popup_empty">
        <uv-empty mode="list" style="margin-top: 32rpx" />
      </view>
    </template>
  </uv-popup>
</template>

<style lang="scss" scoped>
.drop-down {
  position: sticky;
  top: v-bind(top);
  display: flex;
  z-index: calc(v-bind(zIndex) + 10);
  align-items: center;
  height: v-bind(height);
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx 0 #0000000a;
  font-size: 28rpx;
  &__item-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__item {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex: 1;
    color: #000000a6;
    &::after {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      width: 2rpx;
      height: 60rpx;
      background-color: #ebebeb;
      content: '';
    }
    &:last-child {
      &::after {
        display: none;
      }
    }
  }
  &__popup {
    margin-top: calc(v-bind(top) + v-bind(height));
    &-list {
      padding: 0 32rpx;
      &-item {
        $item-selector: &;
        &_active {
          #{$item-selector}-body {
            color: #1989fa;
          }
        }
        &-body {
          flex: 1;
          font-size: 28rpx;
        }
      }
    }
    &_empty {
      padding: 16px 0;
    }
  }
}
</style>
