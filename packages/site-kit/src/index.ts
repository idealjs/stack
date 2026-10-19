/** @stack/site-kit —— 宿主站点骨架（唯一定义处）。
 * 从 apps/tutorial/src/lib/ui.tsx 平移而来的通用部分：整页骨架 SitePage（站头装配＋页眉块＋
 * 站点级页脚）与内容小节 Section、页面挂载 mount。包是纯参数化的——导航行数据、品牌、
 * active 语义 key 一律由调用方传入（教程的章节/博客月/设计五册等属于教程内容，留在
 * tutorial 侧装配）；本包不含任何教程内容，故 apps 下的任何站点都能长出同一观感。 */
import '../../../apps/tutorial/src/design-system'

export { SitePage } from './SitePage'
export { Section } from './Section'
export type { SitePageProps, SiteNav } from './SitePage'
