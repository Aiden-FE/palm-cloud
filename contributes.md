# 开发贡献相关

## server 端

> 以下基于 apps/server 目录

1. `pnpm i` 安装依赖
2. 复制`.env.example`文件为`.env`文件,并修改配置
3. `pnpm dev` 启动服务
4. `pnpm build` 编译项目

### 迁移

1. `pnpm migrate:create <migration_name>` 创建迁移文件
2. `pnpm migrate:up` 执行迁移
3. `pnpm migrate:down` 回滚上一次迁移
4. `pnpm migrate:reset` 重置所有迁移
