import Telegram from '@compass-aiden/telegram';

const api = new Telegram({
  baseURL: 'http://192.168.31.151:8080/api',
  interceptors: {
    response: (res) => {
      if (res.statusCode === 100200) {
        return res.data;
      }
      throw new Error(res.message);
    }
  }
});

export default api;
