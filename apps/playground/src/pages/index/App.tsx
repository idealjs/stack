/** Playground 宿主页：site-kit 骨架（与教程站同一观感）＋沙箱执行面板。
 * 导航数据在本应用侧自行装配——site-kit 是参数化骨架，不携带任何应用的导航内容；
 * 分块链接指向同一站点的静态页（生产部署后同域可达；单应用 dev 下不追求可点）。 */
import { SitePage } from '@stack/site-kit'
import { Playground } from '../../playground/Playground'

export function App() {
  return (
    <SitePage
      nav={{
        brand: { key: 'index', label: 'idealjs stack', href: '/' },
        sections: [
          { key: 'tutorial', label: '全栈教程', href: '/learn.html' },
          { key: 'blog', label: '博客', href: '/blog.html' },
          { key: 'design', label: '设计系统', href: '/design.html' },
          { key: 'practice', label: '在线练习', href: '/practice.html' },
          { key: 'playground', label: 'Playground', href: '/index.html' },
        ],
        rows: [], // 独立工具页：只要分块行，不带内容行
      }}
      active="playground"
      viewTransitionName="site-header"
      title="Playground"
      subtitle="浏览器里的代码沙箱"
      desc={
        '写一段 ESM 模块，点「运行」送进隔离 iframe 执行：代码以 Blob URL 动态 import，' +
        'console 输出与异常经 postMessage 回传。沙箱只有 allow-scripts——拿不到宿主任何数据。'
      }
    >
      <Playground />
    </SitePage>
  )
}
