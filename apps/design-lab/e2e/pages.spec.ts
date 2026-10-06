import { expect, test } from '@playwright/test'

/**
 * 设计系统结构契约断言——规格级防回归。
 * 布局微调不误报，但破坏设计规格（描边/投影/比例/半嵌/裁切）必红。
 */

const PAGES = ['index', 'colors', 'symbols', 'components', 'shelf'] as const

test.describe('全局画布', () => {
  for (const p of PAGES) {
    test(`${p}.html 渲染且有内容`, async ({ page }) => {
      await page.goto(`/${p}.html`)
      await expect(page.locator('#root')).not.toBeEmpty()
      await expect(page.locator('main')).toBeVisible()
    })
  }

  test('body 大底为纸色 #FFF9F0', async ({ page }) => {
    await page.goto('/index.html')
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe('rgb(255, 249, 240)')
  })

  test('全站无色彩渐变', async ({ page }) => {
    await page.goto('/shelf.html')
    const gradients = await page.evaluate(() => {
      const bad: string[] = []
      document.querySelectorAll<HTMLElement>('*').forEach((el) => {
        if (getComputedStyle(el).backgroundImage.includes('gradient')) bad.push(el.tagName)
      })
      return bad
    })
    expect(gradients, gradients.join(',')).toEqual([])
  })
})

test.describe('CourseCard 规格契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/components.html'))

  test('2px ink 描边 + 统一硬投影（单层 ink，无纸叠）', async ({ page }) => {
    const card = page.locator('a[href="#ch1"]').first()
    await expect(card).toBeVisible()
    const s = await card.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { bw: cs.borderTopWidth, bc: cs.borderTopColor, shadow: cs.boxShadow }
    })
    expect(s.bw).toBe('2px')
    expect(s.bc).toBe('rgb(17, 17, 17)')
    // 唯一配方 --shadow-hard：恰好一层 ink 硬投影（tw 变体层均为透明占位），无纸叠多层
    expect(s.shadow.split('rgb(17, 17, 17)').length - 1).toBe(1)
    expect(s.shadow).toContain('rgb(17, 17, 17) 5px 5px 0px 0px')
  })

  test('基础组件投影统一：同一配方复用，不得各写各的', async ({ page }) => {
    const { kinds, recipes } = await page.evaluate(() => {
      const els = [...document.querySelectorAll('[data-comp]')]
      // 两种机制同一配方：box-shadow（常规卡）与 filter: drop-shadow（票券——跟随挖空轮廓）
      const recipe = (cs: CSSStyleDeclaration) => (cs.filter !== 'none' ? cs.filter : cs.boxShadow)
      return {
        kinds: [...new Set(els.map((el) => el.dataset.comp))].sort(),
        recipes: els.map((el) => recipe(getComputedStyle(el))),
      }
    })
    expect(kinds).toEqual(['assign', 'course-card', 'entry-card', 'ticket']) // 四类基础组件都有钩子
    expect(recipes.length).toBeGreaterThanOrEqual(6)
    recipes.forEach((r) => expect(r).toContain('rgb(17, 17, 17) 5px 5px')) // 唯一配方 --shadow-hard / --drop-shadow-hard
    recipes.forEach((r) => expect(r.split('rgb(17, 17, 17)').length - 1).toBe(1)) // 每卡只出一份阴影
  })

  test('16:9 相框：比例、3px 黑边、内阴影、章节撞色', async ({ page }) => {
    const zone = page.locator('a[href="#ch1"] .aspect-video').first()
    const s = await zone.evaluate((el) => {
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return { ratio: r.width / r.height, bw: cs.borderTopWidth, shadow: cs.boxShadow, bg: cs.backgroundColor }
    })
    expect(Math.abs(s.ratio - 16 / 9)).toBeLessThan(0.02)
    expect(s.bw).toBe('3px')
    expect(s.shadow).toContain('inset')
    expect(s.bg).toBe('rgb(255, 107, 107)') // ch1 coral 只进相框
  })

  test('卡头三件套：▲ + 标题 + 积木点（实心=已学）', async ({ page }) => {
    const card = page.locator('a[href="#ch2"]').first()
    const dots = card.locator('span[aria-label^="积木"] i')
    expect(await dots.count()).toBe(4)
    const filled = await dots.evaluateAll((ns) => ns.filter((n) => getComputedStyle(n).backgroundColor === 'rgb(17, 17, 17)').length)
    expect(filled).toBe(2) // ch2 已学 2/4
    // ▲ 在卡头（相框 ○ 环之后）：用 evaluate 通道断言，规避 toBeVisible 协议偶发崩溃
    const hasTri = await card.evaluate((el) => !!el.querySelector('.mt-2 svg'))
    expect(hasTri).toBeTruthy()
  })

  test('入口徽章 ①②（推荐起点，非强制）', async ({ page }) => {
    await expect(page.locator('span[aria-label="推荐入口 1"]')).toBeVisible()
    await expect(page.locator('span[aria-label="推荐入口 2"]')).toBeVisible()
  })
})

test.describe('RouteLine 规格契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/shelf.html'))

  test('线形：实线先后 2.5px 无 dash；点线同族 0.1/6 圆帽', async ({ page }) => {
    const specs = await page.locator('svg path').evaluateAll((ns) =>
      ns.map((n) => ({ w: n.getAttribute('stroke-width'), dash: n.getAttribute('stroke-dasharray'), cap: n.getAttribute('stroke-linecap') })),
    )
    expect(specs.some((s) => s.w === '2.5' && !s.dash)).toBeTruthy()
    expect(specs.some((s) => s.dash === '0.1 6' && s.cap === 'round')).toBeTruthy()
  })

  test('虚线相关 4:2（symbols 页线形样张）', async ({ page }) => {
    await page.goto('/symbols.html')
    const specs = await page.locator('svg path').evaluateAll((ns) => ns.map((n) => n.getAttribute('stroke-dasharray')))
    expect(specs).toContain('4 2')
  })

  test('站点 r6 半嵌：源骑卡右黑影外缘、目标贴左描边', async ({ page }) => {
    const c1 = await page.locator('a[href="#ch1"]').first().boundingBox()
    const c2 = await page.locator('a[href="#ch2"]').first().boundingBox()
    const wrap = await page.locator('main div.relative').first().boundingBox()
    expect(c1 && c2 && wrap).toBeTruthy()

    const stations = await page.locator('svg circle').evaluateAll((ns) =>
      ns.map((n) => ({ cx: +(n.getAttribute('cx') ?? 0), r: +(n.getAttribute('r') ?? 0) })).filter((s) => s.r === 6), // 排除散落 ○ 预期环
    )
    expect(stations.length).toBeGreaterThanOrEqual(4)

    const c1ShadowEdge = c1!.x - wrap!.x + c1!.width + 7 // 描边外 + 7px 黑影
    const c2Border = c2!.x - wrap!.x
    expect(stations.some((s) => Math.abs(s.cx - c1ShadowEdge) <= 3), `源站点应骑黑影外缘 x≈${c1ShadowEdge}`).toBeTruthy()
    expect(stations.some((s) => Math.abs(s.cx - c2Border) <= 3), `目标站点应贴左描边 x≈${c2Border}`).toBeTruthy()
  })

  test('实线端点落在水平端口（M x y H 起、H x 止）', async ({ page }) => {
    const d = await page.locator('svg path[stroke-width="2.5"]').first().getAttribute('d')
    expect(d).toMatch(/^M [\d.]+ [\d.]+ H/)
    expect(d).toMatch(/H [\d.]+$/)
  })
})

test.describe('散落形状摆放契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/shelf.html'))

  test('卡片附近空当＋随机：不压卡、都在卡附近、不出容器、旋转各异', async ({ page }) => {
    const r = await page.evaluate(() => {
      const layer = document.querySelector('[data-scatter-layer]') as HTMLElement | null
      if (!layer) return null
      const host = layer.parentElement as HTMLElement
      const hb = host.getBoundingClientRect()
      const shapes = [...layer.querySelectorAll('[data-scatter]')] as HTMLElement[]
      const comps = [...host.querySelectorAll('[data-comp]')].map((el) => el.getBoundingClientRect())
      const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
      return {
        n: shapes.length,
        inHost: shapes.every((s) => {
          const r = s.getBoundingClientRect()
          return r.left >= hb.left - 1 && r.right <= hb.right + 1 && r.top >= hb.top - 1 && r.bottom <= hb.bottom + 1
        }),
        onComp: shapes.filter((s) => comps.some((c) => hit(s.getBoundingClientRect(), c))).length,
        nearAll: shapes.every((s) => {
          const r = s.getBoundingClientRect()
          const cx = (r.left + r.right) / 2
          const cy = (r.top + r.bottom) / 2
          return comps.some((c) => cx >= c.left - 200 && cx <= c.right + 200 && cy >= c.top - 200 && cy <= c.bottom + 200)
        }),
        transforms: shapes.map((s) => s.style.transform),
      }
    })
    expect(r).not.toBeNull()
    expect(r!.n).toBeGreaterThanOrEqual(5)
    expect(r!.inHost).toBeTruthy() // 不出场景容器
    expect(r!.onComp).toBe(0) // 空当＝不压任何内容盒
    expect(r!.nearAll).toBeTruthy() // 只散在卡片附近，不胡乱撒
    expect(new Set(r!.transforms).size).toBe(r!.n) // 落点/旋转各不相同
    r!.transforms.forEach((t) => expect(t).toMatch(/^translate\(-50%, -50%\) rotate\(-?\d+deg\)$/))
  })
})

test.describe('票券规格契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/symbols.html'))

  test('裁切式：overflow hidden + 单一 2px 描边 + 头部色块无独立边框', async ({ page }) => {
    const done = page.locator('.ticket-pk').first()
    await expect(done).toBeVisible()
    const s = await done.evaluate((el) => {
      const cs = getComputedStyle(el)
      const head = el.firstElementChild as HTMLElement
      const hcs = getComputedStyle(head)
      return { ov: cs.overflow, bw: cs.borderTopWidth, headBorder: hcs.borderTopWidth, headBg: hcs.backgroundColor }
    })
    expect(s.ov).toBe('hidden')
    expect(s.bw).toBe('2px')
    expect(s.headBorder).toBe('0px') // 头部色块永不自带描边
    expect(s.headBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('打孔三件套：mask 差集挖空 + 孔缘弧线 + 阴影跟随轮廓', async ({ page }) => {
    const done = page.locator('.ticket-pk').first()
    const mask = await done.evaluate((el) => {
      const cs = getComputedStyle(el)
      return cs.maskImage || cs.webkitMaskImage || 'none'
    })
    expect(mask).toContain('radial-gradient')
    expect(mask.split('radial-gradient').length - 1).toBe(2) // 上下各一孔
    // 阴影在 wrapper 以 drop-shadow 生效——跟随挖空后的 alpha 轮廓（box-shadow 会被 mask 裁掉）
    const f = await done.evaluate((el) => {
      const w = el.parentElement as HTMLElement
      return { filter: getComputedStyle(w).filter, innerShadow: getComputedStyle(el).boxShadow }
    })
    expect(f.filter).toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
    expect(f.innerShadow).toBe('none')
    // 孔缘弧线：2px ink 半圆环，clip 只留票内一半，圆心骑撕线两端（hole-x=172.75）
    const arcs = await page.evaluate(() => {
      const done = document.querySelector('.ticket-pk') as HTMLElement
      const w = done.parentElement as HTMLElement
      const wx = w.getBoundingClientRect().x
      return [...w.querySelectorAll('.pk-arc')].map((a) => {
        const cs = getComputedStyle(a)
        const r = a.getBoundingClientRect()
        return { clip: cs.clipPath, bw: cs.borderTopWidth, bc: cs.borderTopColor, cx: r.x + r.width / 2 - wx }
      })
    })
    expect(arcs).toHaveLength(2)
    arcs.forEach((a) => {
      expect(a.bw).toBe('2px')
      expect(a.bc).toBe('rgb(17, 17, 17)')
      expect(Math.abs(a.cx - 172.75)).toBeLessThan(0.5)
    })
    expect(arcs[0].clip).toBe('inset(50% 0px 0px)')
    expect(arcs[1].clip).toBe('inset(0px 0px 50%)')
    // 未开始票不带 mask
    const plain = await page.evaluate(() => {
      const t = [...document.querySelectorAll('div')].filter((d) => String(d.className).includes('w-[216px]') && !String(d.className).includes('ticket-pk'))[0]
      return t ? getComputedStyle(t).maskImage : 'none'
    })
    expect(plain === 'none' || plain === '').toBeTruthy()
  })

  test('撕线：完成=虚线、未开始=实线', async ({ page }) => {
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll('div')]
        .filter((el) => String(el.className).includes('w-[216px]'))
        .map((el) => getComputedStyle(el.lastElementChild as HTMLElement).borderLeftStyle),
    )
    expect(styles).toContain('dashed')
    expect(styles).toContain('solid')
  })
})
