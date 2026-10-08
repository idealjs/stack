# 教程站构建镜像——CI 用 buildah（无 daemon）执行，本地 docker/podman build 同样可用。
# 基座＝自家阿里云镜像仓（idealjs/node，由官方 node:24.14.0-alpine 转推；私有仓，CI 需 buildah login）。
FROM registry.cn-hangzhou.aliyuncs.com/idealjs/node:24.14.0-alpine

ENV YARN_NPM_REGISTRY_SERVER=https://registry.npmmirror.com
WORKDIR /repo

# monorepo 全量上下文（.dockerignore 瘦身）；依赖与构建同层——lockfile 由 --immutable 锁定
COPY . .
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg \
  && corepack enable \
  && yarn install --immutable \
  && yarn workspace @stack/tutorial build
