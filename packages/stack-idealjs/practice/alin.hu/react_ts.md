---
sidebar_position: 4
---

# 使用vite创建react ts工程
React 应用程序是由组件组成的。一个组件是 UI（用户界面）的一部分，它拥有自己的逻辑和外观。组件可以小到一个按钮，也可以大到整个页面。

## 项目初始化
### 1. 创建react+ts项目
按下快捷键`Ctrl + ~`,打开终端，运行以下命令
```
npm create vite@latest
```

根据提示，输入项目名字并选择react，再选择TypeScript

### 2. 打开项目
运行以下命令，进入项目
```
cd react-ts-test1
```

### 3. 安装依赖
运行以下命令，安装依赖
```
npm install
```

### 4. 运行项目
输入以下命令,运行项目
```
npm run dev
```

## 按步引入react包

除了直接用脚手架创建react工程，也可以在一个已有的vanilla工程中，按步引入react包。这个过程可以帮助理解react工程的最小组成。

### 1. 安装依赖

在vanilla工程目录下，运行以下命令

```
npm install react react-dom
npm install -D @types/react @types/react-dom @vitejs/plugin-react
```

### 2. 配置vite

修改`vite.config.ts`，添加react插件

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### 3. 修改入口文件

把`index.html`中的入口指向react组件文件

```html
<script type="module" src="/src/main.tsx"></script>
```

编写`src/main.tsx`

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  return <h1>Hello React</h1>
}

createRoot(document.getElementById('app')!).render(<App />)
```

同时在`index.html`的`body`中添加挂载点

```html
<div id="app"></div>
```

### 4. 运行项目

```
npm run dev
```

看到页面输出`Hello React`，说明react已经成功引入。
