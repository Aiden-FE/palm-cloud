<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useContextStore } from '@/stores';

const { updateContext, getContext } = useContextStore();

let token = getContext('token') || localStorage.getItem('token') || '';

if (process.env.NODE_ENV === 'development' && !token && import.meta.env.VITE_DEV_TOKEN) {
  token = import.meta.env.VITE_DEV_TOKEN;
}

updateContext({
  token,
});

onLaunch(() => {});
onShow(() => {});
onHide(() => {});
</script>

<style>
@import '@/assets/styles/global.scss';
</style>
