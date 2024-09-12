import api from './core';

export function getVideos() {
  return api.chain().get('/api/v1/oss/videos').request();
}

/** 获取登录地址 */
export function getLoginUrl(redirectUri: string) {
  return api.chain().get('/api/v1/open/login-url').searchParams({ redirectUri }).request();
}

/** 获取授权token */
export function getAuthToken(code: string) {
  return api.chain().post('/api/v1/open/auth-token').body({ code }).request<{
    access_token: string;
    refresh_token: string;
  }>();
}

export function getWebsite(targetUrl: string) {
  return api.chain().get('/api/v1/open/website').searchParams({ targetUrl }).request();
}
