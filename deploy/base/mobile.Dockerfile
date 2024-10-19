# mobile 项目部署
# 构建镜像: docker build -t docker378928518/palm-cloud-mobile:latest -f deploy/base/mobile.Dockerfile .
# 运行镜像: docker run --name palm-cloud-mobile -d -p 3000:80 --env-file apps/mobile/.env.local docker378928518/palm-cloud-mobile:latest
# 停止容器: docker stop palm-cloud-mobile
# 删除容器: docker rm palm-cloud-mobile
# 删除镜像: docker rmi docker378928518/palm-cloud-mobile:latest

FROM nginx:1.27.2

LABEL Author=Aiden_FE

ENV NODE_ENV production

# 后端接口地址
ARG VITE_API_HOST=http://localhost:8080

# nginx 配置文件位置
ARG NGINX_CONF_FILE=deploy/base/nginx.conf

# 容器内项目文件地址
ARG APP_DIR=/usr/share/nginx/html

# 将文件复制到镜像
WORKDIR ${APP_DIR}

COPY apps/mobile/dist/build/h5 ${APP_DIR}

WORKDIR /etc/nginx/conf.d

COPY ${NGINX_CONF_FILE} .

EXPOSE 443
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
