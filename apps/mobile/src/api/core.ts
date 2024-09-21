import { useContextStore } from '@/stores';
import RequestSuccessCallbackResult = UniNamespace.RequestSuccessCallbackResult;

export function addRequestInterceptor() {
  uni.addInterceptor('request', {
    invoke(req) {
      const { getContext } = useContextStore();
      const token = getContext('token', '');
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'http://localhost:8080';
      if (req.url.startsWith('/')) {
        req.url = `${baseUrl}${req.url}`;
      }
      if (!req.header) req.header = {};
      // 统一追加鉴权参数
      if (token) {
        req.header.Authorization = token.startsWith('bearer') ? token : `bearer ${token}`;
      }
    },
  });
}

export function addResponseInterceptor() {
  uni.addInterceptor('request', {
    returnValue: (respPromise: Promise<RequestSuccessCallbackResult>) =>
      respPromise.then((resp) => {
        if (resp.statusCode >= 200 && resp.statusCode < 300) {
          const result = resp.data as any;
          if (result.statusCode === 100200) {
            return result.data;
          }
          uni.showToast({
            icon: 'none',
            title: result.message || 'Request failed',
            duration: 3000,
          });
          throw new Error(result.message || 'Request failed');
        }
        // 发生请求级异常
        uni.showToast({
          title: (resp.data as any)?.message || 'Request failed',
          icon: 'none',
          duration: 3000,
        });
        throw new Error((resp.data as any)?.message || 'Request failed');
      }),
  });
}
