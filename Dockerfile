# 教程站构建镜像——CI 用 buildah（无 daemon）执行，本地 docker/podman build 同样可用。
# 基座＝自家阿里云镜像仓（idealjs/node，由官方 node:24.21.0-bookworm-slim 转推；私有仓，需 login）。
# 默认公网端点（本地可用）；阿里云同 region 的 CI 传 --build-arg BASE_REGISTRY=registry-vpc.cn-hangzhou.aliyuncs.com 走内网。
ARG BASE_REGISTRY=registry.cn-hangzhou.aliyuncs.com
FROM ${BASE_REGISTRY}/idealjs/node:24.21.0-bookworm-slim

ENV YARN_NPM_REGISTRY_SERVER=https://registry.npmmirror.com
WORKDIR /workspace

# ① 依赖配置——只拷贝清单/锁文件/yarn 运行时，源码变更不失效依赖层
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/releases/yarn-4.9.2.cjs .yarn/releases/
COPY apps/tutorial/package.json apps/tutorial/
COPY packages/design-system/package.json packages/design-system/
COPY packages/stack-idealjs/package.json packages/stack-idealjs/

# ② 安装依赖——yarn 4.9.2 由 yarnPath（.yarn/releases）提供，node 直调脚本，不依赖 corepack/全局 yarn
RUN node .yarn/releases/yarn-4.9.2.cjs install --immutable

# ③ 打包——monorepo 全量源码（.dockerignore 瘦身，无 node_modules/dist）；产物在 /workspace/apps/tutorial/dist
COPY . .
RUN node .yarn/releases/yarn-4.9.2.cjs workspace @stack/tutorial build
