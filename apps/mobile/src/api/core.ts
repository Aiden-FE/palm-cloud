import { useContextStore } from '@/stores';
import RequestSuccessCallbackResult = UniNamespace.RequestSuccessCallbackResult;

export const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

export function getRequestConfig(): any {
  const { getContext } = useContextStore();
  const token = getContext('token', '');
  return {
    apiHost: API_HOST,
    headers: {
      Authorization: token,
    },
  };
}

export function addRequestInterceptor() {
  uni.addInterceptor('request', {
    invoke(req) {
      const { apiHost, headers } = getRequestConfig();
      if (req.url.startsWith('/')) {
        req.url = `${apiHost}${req.url}`;
      }
      if (!req.header) req.header = {};
      // 统一追加鉴权参数
      if (headers.Authorization) {
        req.header.Authorization = headers.Authorization;
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
