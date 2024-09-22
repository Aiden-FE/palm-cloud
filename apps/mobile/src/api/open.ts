export function getImageCaptcha(params?: { width?: number; height?: number }): Promise<any> {
  return uni.request({
    method: 'GET',
    url: '/api/v1/open/captcha/image',
    data: params,
  });
}

export function loginByEmail(params: {
  email: string;
  password: string;
  captcha: string;
  captchaKey: string;
}): Promise<any> {
  return uni.request({
    method: 'POST',
    url: '/api/v1/open/login/email',
    data: params,
  });
}
