<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';
import { useContextStore } from '@/stores';

const { isLogin } = storeToRefs(useContextStore());
const { updateContext } = useContextStore();

if (process.env.NODE_ENV === 'development' && !isLogin.value && import.meta.env.VITE_DEV_TOKEN) {
  updateContext({
    token: import.meta.env.VITE_DEV_TOKEN,
  });
}

onLaunch(() => {});
onShow(() => {});
onHide(() => {});
</script>

<style>
@import '@/assets/styles/global.scss';
</style>
