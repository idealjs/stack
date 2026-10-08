# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages.spec.ts >> RouteLine 规格契约 >> hover 卡片：线与站点跟随浮起（-3px 同步，直线变斜线）
- Location: e2e/pages.spec.ts:159:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "0px -3px"
Received: "none"
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: <Components />
    - heading "组件 · 入口载体与状态" [level=1] [ref=e6]
    - paragraph [ref=e7]: CourseCard（入口）· 票券（状态）· 指派块＋脱靶标记（任务与警示）· 入口画像。线条的形式规格见 02 符号形状，与卡片的实际组合见 04 样例。
  - generic [ref=e8]:
    - generic [ref=e9]:
      - heading "CourseCard卡头三件套＝靶子；hover 拿起播放 GIF，8000ms 翻转；末张＝价值区标记用法" [level=2] [ref=e10]
      - generic [ref=e11]:
        - link "快速开始：本地跑起一个可交互的页面" [ref=e13] [cursor=pointer]:
          - /url: "#ch1"
          - generic "推荐入口 1" [ref=e14]: ①
          - generic [ref=e15]:
            - generic [ref=e16]: 🌐
            - generic [ref=e17]: 预期结果
          - generic [ref=e21]:
            - generic [ref=e24]: 快速开始
            - generic "积木 3/4" [ref=e25]
        - link "React：用组件拼出一个可维护的界面" [ref=e31] [cursor=pointer]:
          - /url: "#ch2"
          - generic "推荐入口 2" [ref=e32]: ②
          - generic [ref=e33]:
            - generic [ref=e34]: ⚛️
            - generic [ref=e35]: 预期结果
          - generic [ref=e39]:
            - generic [ref=e42]: React
            - generic "积木 2/4" [ref=e43]
        - link "全栈基础：把前端连上真实服务并部署上线" [ref=e49] [cursor=pointer]:
          - /url: "#ch5"
          - generic [ref=e50]:
            - generic [ref=e51]: 🔗
            - generic [ref=e52]: 预期结果
          - generic [ref=e56]: 全栈基础
        - link "更多：把示例扩展成自己的第一个完整小站" [ref=e61] [cursor=pointer]:
          - /url: "#ch4"
          - generic [ref=e62]:
            - generic [ref=e63]:
              - text: 这一步过程就地写清：
              - mark [ref=e64]: 环境与依赖如何咬合
            - generic [ref=e65]: 预期结果
          - generic [ref=e69]:
            - generic [ref=e72]: 更多
            - generic "积木 0/1" [ref=e73]
    - generic [ref=e75]:
      - heading "RouteLine实=先后 虚=相关 点=同族；hover 卡片，线与站点自动跟随（组件自带）" [level=2] [ref=e76]
      - generic [ref=e77]:
        - link "快速开始：本地跑起一个可交互的页面" [ref=e79] [cursor=pointer]:
          - /url: "#ch1"
          - generic [ref=e80]:
            - generic [ref=e81]: 🌐
            - generic [ref=e82]: 预期结果
          - generic [ref=e86]:
            - generic [ref=e89]: 快速开始
            - generic "积木 3/4" [ref=e90]
        - link "React：用组件拼出一个可维护的界面" [ref=e96] [cursor=pointer]:
          - /url: "#ch2"
          - generic [ref=e97]:
            - generic [ref=e98]: ⚛️
            - generic [ref=e99]: 预期结果
          - generic [ref=e103]:
            - generic [ref=e106]: React
            - generic "积木 2/4" [ref=e107]
        - link "全栈基础：把前端连上真实服务并部署上线" [ref=e113] [cursor=pointer]:
          - /url: "#ch5"
          - generic [ref=e114]:
            - generic [ref=e115]: 🔗
            - generic [ref=e116]: 预期结果
          - generic [ref=e120]: 全栈基础
    - generic [ref=e124]:
      - heading "票券 ＆ 指派学习块票=完成状态；块=位置/预期/场景＋脱靶标记" [level=2] [ref=e125]
      - generic [ref=e126]:
        - generic [ref=e128]:
          - generic [ref=e129]: 🌐
          - generic [ref=e130]:
            - text: 快速开始
            - generic [ref=e131]: No. 001 · 已完成（打孔）
          - generic [ref=e132]: №01
        - generic [ref=e134]:
          - generic [ref=e135]: 🔗
          - generic [ref=e136]:
            - text: 全栈基础
            - generic [ref=e137]: No. 005 · 未开始（无孔）
          - generic [ref=e138]: №05
        - generic [ref=e139]:
          - generic [ref=e140]: 指派学习 · npm
          - generic [ref=e145]:
            - generic [ref=e146]: 位置：包管理家族——npm 的坐标与邻居
            - generic [ref=e147]: 预期：能说清 lockfile 锁住了什么
            - generic [ref=e148]: 场景：加一个依赖 / 换源重装
          - generic [ref=e153]:
            - generic [ref=e154]: 脱靶 · 装了但没跑
            - paragraph [ref=e155]: 命令成功、页面空白——缺「真机验收」这块积木
    - generic [ref=e156]:
      - heading "入口梳理推荐不是强制——无锁" [level=2] [ref=e157]
      - generic [ref=e158]:
        - generic [ref=e159]:
          - generic [ref=e160]:
            - generic [ref=e161]: 🌱
            - generic [ref=e162]: 零基础入门
          - generic [ref=e163]:
            - generic [ref=e164]: ① 快速开始
            - generic [ref=e166]:
              - generic [ref=e167]: →
              - generic [ref=e168]: React
            - generic [ref=e169]:
              - generic [ref=e170]: →
              - generic [ref=e171]: 更多示例
            - generic [ref=e172]:
              - generic [ref=e173]: →
              - generic [ref=e174]: 全栈基础
          - paragraph [ref=e175]: 完整链按序走；每步先核对预期再前进。
        - generic [ref=e176]:
          - generic [ref=e177]:
            - generic [ref=e178]: ⚡
            - generic [ref=e179]: 写过页面的人
          - generic [ref=e180]:
            - generic [ref=e181]: ② React
            - generic [ref=e183]:
              - generic [ref=e184]: →
              - generic [ref=e185]: 更多示例
            - generic [ref=e186]:
              - generic [ref=e187]: →
              - generic [ref=e188]: 高级教程
          - paragraph [ref=e189]: 跳过装环境；从组件拼接进入。
        - generic [ref=e190]:
          - generic [ref=e191]:
            - generic [ref=e192]: 🧠
            - generic [ref=e193]: 重度 AI 依赖
          - generic [ref=e194]:
            - generic [ref=e195]: ③ 高级教程
            - generic [ref=e197]:
              - generic [ref=e198]: →
              - generic [ref=e199]: 全栈基础
          - paragraph [ref=e200]: 从指挥 agent 做整件事切入，回头补认知基础。
  - generic [ref=e201]:
    - text: design-lab · 孟菲斯 × 拟物卡 · stack idealjs ·
    - link "返回目录" [ref=e202] [cursor=pointer]:
      - /url: /index.html
```

# Test source

```ts
  77  |       return { bg: cs.backgroundColor, rot: cs.rotate, inZone: !!card.querySelector('.aspect-video mark'), txt: mark.textContent }
  78  |     })
  79  |     expect(m).not.toBeNull()
  80  |     expect(m!.inZone).toBeTruthy() // 标记骑在相框内的过程文字上
  81  |     expect(m!.bg).toBe('rgb(255, 217, 61)') // 荧光笔 mustard
  82  |     expect(m!.rot).toContain('deg')
  83  |     expect(m!.txt).toContain('咬合')
  84  |   })
  85  | 
  86  |   test('16:9 相框：比例、3px 黑边、内阴影、章节撞色', async ({ page }) => {
  87  |     const zone = page.locator('a[href="#ch1"] .aspect-video').first()
  88  |     const s = await zone.evaluate((el) => {
  89  |       const cs = getComputedStyle(el)
  90  |       const r = el.getBoundingClientRect()
  91  |       return { ratio: r.width / r.height, bw: cs.borderTopWidth, shadow: cs.boxShadow, bg: cs.backgroundColor }
  92  |     })
  93  |     expect(Math.abs(s.ratio - 16 / 9)).toBeLessThan(0.02)
  94  |     expect(s.bw).toBe('3px')
  95  |     expect(s.shadow).toContain('inset')
  96  |     expect(s.bg).toBe('rgb(255, 107, 107)') // ch1 coral 只进相框
  97  |   })
  98  | 
  99  |   test('卡头三件套：▲ + 标题 + 积木点（实心=已学）', async ({ page }) => {
  100 |     const card = page.locator('a[href="#ch2"]').first()
  101 |     const dots = card.locator('span[aria-label^="积木"] i')
  102 |     expect(await dots.count()).toBe(4)
  103 |     const filled = await dots.evaluateAll((ns) => ns.filter((n) => getComputedStyle(n).backgroundColor === 'rgb(17, 17, 17)').length)
  104 |     expect(filled).toBe(2) // ch2 已学 2/4
  105 |     // ▲ 在卡头（相框 ○ 环之后）：用 evaluate 通道断言，规避 toBeVisible 协议偶发崩溃
  106 |     const hasTri = await card.evaluate((el) => !!el.querySelector('.mt-2 svg'))
  107 |     expect(hasTri).toBeTruthy()
  108 |   })
  109 | 
  110 |   test('入口徽章 ①②（推荐起点，非强制）', async ({ page }) => {
  111 |     await expect(page.locator('span[aria-label="推荐入口 1"]')).toBeVisible()
  112 |     await expect(page.locator('span[aria-label="推荐入口 2"]')).toBeVisible()
  113 |   })
  114 | })
  115 | 
  116 | test.describe('RouteLine 规格契约', () => {
  117 |   test.beforeEach(async ({ page }) => await page.goto('/components.html'))
  118 | 
  119 |   test('线形：实线先后 2.5px 无 dash；点线同族 0.1/6 圆帽', async ({ page }) => {
  120 |     const specs = await page.locator('svg path').evaluateAll((ns) =>
  121 |       ns.map((n) => ({ w: n.getAttribute('stroke-width'), dash: n.getAttribute('stroke-dasharray'), cap: n.getAttribute('stroke-linecap') })),
  122 |     )
  123 |     expect(specs.some((s) => s.w === '2.5' && !s.dash)).toBeTruthy()
  124 |     expect(specs.some((s) => s.dash === '0.1 6' && s.cap === 'round')).toBeTruthy()
  125 |   })
  126 | 
  127 |   test('虚线相关 4:2（symbols 页线形样张）', async ({ page }) => {
  128 |     await page.goto('/symbols.html')
  129 |     const specs = await page.locator('svg path').evaluateAll((ns) => ns.map((n) => n.getAttribute('stroke-dasharray')))
  130 |     expect(specs).toContain('4 2')
  131 |   })
  132 | 
  133 |   test('站点 r6 半嵌：源/目标圆心都骑卡描边（各半在卡上），线层在卡之上', async ({ page }) => {
  134 |     const r = await page.evaluate(() => {
  135 |       const svg = [...document.querySelectorAll('svg')].find((s) => s.getAttribute('width') === '1160')
  136 |       if (!svg) return null
  137 |       const wrap = svg.parentElement
  138 |       const wb = wrap.getBoundingClientRect()
  139 |       const c1 = wrap.querySelector('a[href="#ch1"]').getBoundingClientRect()
  140 |       const c2 = wrap.querySelector('a[href="#ch2"]').getBoundingClientRect()
  141 |       const stations = [...svg.querySelectorAll('circle')]
  142 |         .map((n) => ({ cx: +(n.getAttribute('cx') ?? 0), r: +(n.getAttribute('r') ?? 0) }))
  143 |         .filter((s) => s.r === 6) // 排除散落 ○ 预期环
  144 |       return {
  145 |         n: stations.length,
  146 |         cxs: stations.map((s) => s.cx),
  147 |         c1Right: c1.x - wb.x + c1.width, // 卡右描边（不接阴影）
  148 |         c2Border: c2.x - wb.x,
  149 |         z: getComputedStyle(svg).zIndex,
  150 |       }
  151 |     })
  152 |     expect(r).not.toBeNull()
  153 |     expect(r!.n).toBeGreaterThanOrEqual(4)
  154 |     expect(r!.cxs.some((cx) => Math.abs(cx - r!.c1Right) <= 3), `源站点圆心应骑卡右描边 x≈${r!.c1Right}`).toBeTruthy()
  155 |     expect(r!.cxs.some((cx) => Math.abs(cx - r!.c2Border) <= 3), `目标站点圆心应骑左描边 x≈${r!.c2Border}`).toBeTruthy()
  156 |     expect(r!.z).toBe('10') // 线层置于卡之上——否则半嵌站点被卡盖住
  157 |   })
  158 | 
  159 |   test('hover 卡片：线与站点跟随浮起（-3px 同步，直线变斜线）', async ({ page }) => {
  160 |     const get = () =>
  161 |       page.evaluate(() => {
  162 |         const svg = [...document.querySelectorAll('svg')].find((s) => s.getAttribute('width') === '1160')
  163 |         return {
  164 |           stations: [...svg.querySelectorAll('g[style]')].map((g) => (g as HTMLElement).style.transform),
  165 |           d25: [...svg.querySelectorAll('path')].map((el) => el.getAttribute('d') || '').find((d) => d.startsWith('M 630')),
  166 |           cardTranslate: getComputedStyle(document.querySelector('a[data-comp="course-card"][href="#ch2"]')).translate,
  167 |         }
  168 |       })
  169 |     const before = await get()
  170 |     await page.locator('div.absolute.left-\\[380px\\]').hover()
  171 |     await page.waitForTimeout(250)
  172 |     const after = await get()
  173 |     expect(before.d25).toBe('M 630 108 L 700 108') // 静置：几何水平（L 结构可平滑插值）
  174 |     expect(after.d25).toBe('M 630 105 L 700 108') // hover 卡2：源端随站点抬升，直线变斜线
  175 |     expect(before.stations.every((t) => t === 'translateY(0px)')).toBeTruthy()
  176 |     expect(after.stations.filter((t) => t === 'translateY(-3px)').length).toBe(2) // 源+目标站点跟随
> 177 |     expect(after.cardTranslate).toBe('0px -3px') // 卡片本体同步浮起
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  178 |   })
  179 | 
  180 |   test('实线端点落在水平端口（M x y H 起、H x 止）', async ({ page }) => {
  181 |     const d = await page.locator('svg path[stroke-width="2.5"]').first().getAttribute('d')
  182 |     expect(d).toMatch(/^M [\d.]+ [\d.]+ H/)
  183 |     expect(d).toMatch(/H [\d.]+$/)
  184 |   })
  185 | })
  186 | 
  187 | test.describe('散落形状摆放契约', () => {
  188 |   test.beforeEach(async ({ page }) => await page.goto('/shelf.html'))
  189 | 
  190 |   test('卡片附近空当＋随机：不压卡、都在卡附近、不出容器、旋转各异', async ({ page }) => {
  191 |     const r = await page.evaluate(() => {
  192 |       const layer = document.querySelector('[data-scatter-layer]') as HTMLElement | null
  193 |       if (!layer) return null
  194 |       const host = layer.parentElement as HTMLElement
  195 |       const hb = host.getBoundingClientRect()
  196 |       const shapes = [...layer.querySelectorAll('[data-scatter]')] as HTMLElement[]
  197 |       const comps = [...host.querySelectorAll('[data-comp]')].map((el) => el.getBoundingClientRect())
  198 |       const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  199 |       return {
  200 |         n: shapes.length,
  201 |         inHost: shapes.every((s) => {
  202 |           const r = s.getBoundingClientRect()
  203 |           return r.left >= hb.left - 1 && r.right <= hb.right + 1 && r.top >= hb.top - 1 && r.bottom <= hb.bottom + 1
  204 |         }),
  205 |         onComp: shapes.filter((s) => comps.some((c) => hit(s.getBoundingClientRect(), c))).length,
  206 |         nearAll: shapes.every((s) => {
  207 |           const r = s.getBoundingClientRect()
  208 |           const cx = (r.left + r.right) / 2
  209 |           const cy = (r.top + r.bottom) / 2
  210 |           return comps.some((c) => cx >= c.left - 200 && cx <= c.right + 200 && cy >= c.top - 200 && cy <= c.bottom + 200)
  211 |         }),
  212 |         transforms: shapes.map((s) => s.style.transform),
  213 |       }
  214 |     })
  215 |     expect(r).not.toBeNull()
  216 |     expect(r!.n).toBeGreaterThanOrEqual(5)
  217 |     expect(r!.inHost).toBeTruthy() // 不出场景容器
  218 |     expect(r!.onComp).toBe(0) // 空当＝不压任何内容盒
  219 |     expect(r!.nearAll).toBeTruthy() // 只散在卡片附近，不胡乱撒
  220 |     expect(new Set(r!.transforms).size).toBe(r!.n) // 落点/旋转各不相同
  221 |     r!.transforms.forEach((t) => expect(t).toMatch(/^translate\(-50%, -50%\) rotate\(-?\d+deg\)$/))
  222 |   })
  223 | })
  224 | 
  225 | test.describe('价值区荧光标记契约', () => {
  226 |   test.beforeEach(async ({ page }) => await page.goto('/symbols.html'))
  227 | 
  228 |   test('荧光笔标记文字：mustard 底、无描边、微斜——是标记不是形状', async ({ page }) => {
  229 |     const s = await page.evaluate(() => {
  230 |       const m = document.querySelector('mark')
  231 |       if (!m) return null
  232 |       const cs = getComputedStyle(m)
  233 |       const r = m.getBoundingClientRect()
  234 |       return { bg: cs.backgroundColor, bw: cs.borderTopWidth, rot: cs.rotate, h: r.height }
  235 |     })
  236 |     expect(s).not.toBeNull()
  237 |     expect(s!.bg).toBe('rgb(255, 217, 61)') // clash2a mustard——荧光笔
  238 |     expect(s!.bw).toBe('0px') // 标记无描边：2px ink 是形状的规则，标记划在文字上
  239 |     expect(s!.rot).toContain('deg') // 微斜（rotate 属性生效，手划手感）
  240 |     expect(s!.h).toBeGreaterThan(14) // 骑在文字上，有字高
  241 |   })
  242 | })
  243 | 
  244 | test.describe('票券规格契约', () => {
  245 |   test.beforeEach(async ({ page }) => await page.goto('/symbols.html'))
  246 | 
  247 |   test('裁切式：overflow hidden + 单一 2px 描边 + 头部色块无独立边框', async ({ page }) => {
  248 |     const done = page.locator('.ticket-pk').first()
  249 |     await expect(done).toBeVisible()
  250 |     const s = await done.evaluate((el) => {
  251 |       const cs = getComputedStyle(el)
  252 |       const head = el.firstElementChild as HTMLElement
  253 |       const hcs = getComputedStyle(head)
  254 |       return { ov: cs.overflow, bw: cs.borderTopWidth, headBorder: hcs.borderTopWidth, headBg: hcs.backgroundColor }
  255 |     })
  256 |     expect(s.ov).toBe('hidden')
  257 |     expect(s.bw).toBe('2px')
  258 |     expect(s.headBorder).toBe('0px') // 头部色块永不自带描边
  259 |     expect(s.headBg).not.toBe('rgba(0, 0, 0, 0)')
  260 |   })
  261 | 
  262 |   test('打孔三件套：mask 差集挖空 + 孔缘弧线 + 阴影跟随轮廓', async ({ page }) => {
  263 |     const done = page.locator('.ticket-pk').first()
  264 |     const mask = await done.evaluate((el) => {
  265 |       const cs = getComputedStyle(el)
  266 |       return cs.maskImage || cs.webkitMaskImage || 'none'
  267 |     })
  268 |     expect(mask).toContain('radial-gradient')
  269 |     expect(mask.split('radial-gradient').length - 1).toBe(2) // 上下各一孔
  270 |     // 阴影在 wrapper 以 drop-shadow 生效——跟随挖空后的 alpha 轮廓（box-shadow 会被 mask 裁掉）
  271 |     const f = await done.evaluate((el) => {
  272 |       const w = el.parentElement as HTMLElement
  273 |       return { filter: getComputedStyle(w).filter, innerShadow: getComputedStyle(el).boxShadow }
  274 |     })
  275 |     expect(f.filter).toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
  276 |     expect(f.innerShadow).toBe('none')
  277 |     // 孔缘弧线：2px ink 半圆环，clip 只留票内一半，圆心骑撕线两端（hole-x=172.75）
```