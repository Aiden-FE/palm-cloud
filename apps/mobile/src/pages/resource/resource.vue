<script lang="ts" setup>
import { onLaunch } from '@dcloudio/uni-app';
import { Resources } from '@/api';

function getDetail(id: number) {
  Resources.getResourceById(id).then((res) => {
    console.log('Debug: ', res);
  });
}

onLaunch((options) => {
  if (!options) {
    return;
  }
  getDetail(Number(options!.id));
});
</script>

<template>Resource info</template>
