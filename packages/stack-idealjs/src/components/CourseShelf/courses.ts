/**
 * 全栈工程师教程 · 课程数据源
 *
 * 卡片书架的唯一数据入口：改卡片内容、完成度、关系，只动这个文件。
 * GIF 换片：替换 static/gifs/<id>.gif 即可，无需改代码。
 */

export type CourseSection = {
  /** 章节短 id，同时是占位 GIF 的文件名（static/gifs/<id>.gif） */
  id: string;
  /** 卡片标题（对应 docs 里 _category_.json 的 label） */
  title: string;
  /** 一句话预期结果：学完这一部分，读者能做出什么 */
  description: string;
  /** 写作完成度 */
  done: boolean;
  /** 与其他部分的关系（前置/依赖等）。TODO: 关系列出后填充，元素为对方 id */
  relations: string[];
  /** 章节首页路由（generated-index） */
  href: string;
  /** 卡片主题色（书脊/角标），来自设计稿 00 的多彩课程卡 */
  color: string;
};

// "垃圾桶"（docs/web/archive）是旧文归档，不进书架。
export const courseSections: CourseSection[] = [
  {
    id: "hello-world",
    title: "快速开始",
    description: "写出第一个网页并在浏览器打开，跑起你的第一个 HTTP 服务器。",
    done: true,
    relations: [], // TODO: 列出与其他部分的关系
    href: "/docs/category/快速开始",
    color: "#6366f1",
  },
  {
    id: "hello-react",
    title: "快速开始 React",
    description: "用脚手架创建 React 应用，亲手拼出第一个 Todo List。",
    done: true,
    relations: [], // TODO
    href: "/docs/category/快速开始-react",
    color: "#ec4899",
  },
  {
    id: "more-example",
    title: "更多示例",
    description: "浮动布局等补充示例，巩固前面攒下的积木。",
    done: true,
    relations: [], // TODO
    href: "/docs/category/更多示例",
    color: "#f59e0b",
  },
  {
    id: "more",
    title: "更多",
    description: "把示例工程构建为可发布产物，看清 build 到底做了什么。",
    done: true,
    relations: [], // TODO
    href: "/docs/category/更多",
    color: "#10b981",
  },
  {
    id: "full-stack",
    title: "全栈基础",
    description: "从网页到服务与数据库，串起完整的最小全栈闭环。",
    done: false,
    relations: [], // TODO
    href: "/docs", // TODO: 全栈基础暂无页面，落笔后改为其分类路由
    color: "#0ea5e9",
  },
  {
    id: "advance",
    title: "高级教程",
    description: "数据流、纯函数、CAP——工程上的心智模型。",
    done: true,
    relations: [], // TODO
    href: "/docs/category/高级教程",
    color: "#8b5cf6",
  },
];
