---
sidebar_position: 2
---

# 简单的服务

打开控制台

![打开控制台](./open_terminal.png)

输入命令

```
npx http-server
```

![输入命令](./start_http_server.png)

## 关于npx

`npx` 用于执行 npm 包中的可执行文件，不需要全局安装就可以运行一个包。

这里执行 `npx http-server`，npx 会临时下载 `http-server` 包并启动一个静态资源服务器，把当前目录作为网站根目录。
