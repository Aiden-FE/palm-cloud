# server 项目部署
# 构建镜像: docker build -t docker378928518/palm-cloud-server:latest -f deploy/base/server.Dockerfile .
# 运行镜像: docker run --name palm-cloud-server -d -p 8080:8080 -v $PWD/apps/server/.env:/usr/share/app/.env docker378928518/palm-cloud-server:latest
# 停止容器: docker stop palm-cloud-server
# 删除容器: docker rm palm-cloud-server
# 删除镜像: docker rmi docker378928518/palm-cloud-server:latest

FROM node:22.10.0-slim

LABEL Author=Aiden_FE

ENV NODE_ENV production

ARG APP_DIR=/usr/share/app

RUN npm install -g pnpm \
    && pnpm config set registry https://registry.npmmirror.com/ \
    && pnpm -v

WORKDIR ${APP_DIR}

COPY apps/server/dist ${APP_DIR}/dist
COPY apps/server/.npmrc ${APP_DIR}/.npmrc
COPY apps/server/nest-cli.json ${APP_DIR}/nest-cli.json
COPY apps/server/package.json ${APP_DIR}/package.json
COPY apps/server/start.sh ${APP_DIR}/start.sh

EXPOSE 8080

CMD ["pnpm", "start"]
