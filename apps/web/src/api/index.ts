import api from "./core";

export function getVideos() {
  return api.chain()
    .get('/v1/oss/videos')
    .request();
}
