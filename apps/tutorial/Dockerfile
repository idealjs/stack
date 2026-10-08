# 教程站构建镜像——CI 用 buildah（无 daemon）执行，本地 docker/podman build 同样可用。
# 基座走 daocloud 公共镜像（国内快、免登录）；与阿里云 idealjs/node:24.14.0-alpine 同源。
FROM docker.m.daocloud.io/library/node:24.14.0-alpine

ENV YARN_NPM_REGISTRY_SERVER=https://registry.npmmirror.com
WORKDIR /repo

# monorepo 全量上下文（.dockerignore 瘦身）；依赖与构建同层——lockfile 由 --immutable 锁定
COPY . .
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg \
  && corepack enable \
  && yarn install --immutable \
  && yarn workspace @stack/tutorial build
