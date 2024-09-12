import Telegram from '@compass-aiden/telegram';

const api = new Telegram({
  baseURL: process.env.NEXT_PUBLIC_API_HOST || 'http://192.168.31.151:8080',
  interceptors: {
    response: (res) => {
      if (res.statusCode === 100200) {
        return res.data;
      }
      throw new Error(res.message);
    },
  },
});

export default api;
