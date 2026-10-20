import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import type { TicketProps } from '../../../packages/design-system/src/components/Ticket'

const PAGES = ['design', 'design-colors', 'design-symbols', 'design-components'] as const

async function mountTicket(page: Page, props: TicketProps = {}) {
  await page.goto('/design-components.html')
  const preview = page.getByTestId('ticket-preview')
  await preview.getByLabel('孔位', { exact: true }).fill(String(props.holePosition ?? '50%'))
  await preview.getByLabel('孔径').fill(String(props.holeSize ?? 12))
  await preview.getByLabel('打孔', { exact: true }).setChecked(props.punched ?? true)
  await preview.getByLabel('hover 动效', { exact: true }).setChecked(props.hover ?? true)
  await preview.getByTestId('ticket-preview-canvas').evaluate((el) => {
    ;(el as HTMLElement).style.backgroundColor = 'rgb(78,205,196)'
  })
  const ticket = preview.locator('[data-comp="ticket"]')
  await ticket.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await expect
    .poll(() =>
      ticket
        .locator('div')
        .first()
        .evaluate((el) => getComputedStyle(el).filter),
    )
    .toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
  return ticket
}

test.describe('全局画布', () => {
  for (const p of PAGES) {
    test(`${p}.html 渲染且有内容`, async ({ page }) => {
      await page.goto(`/${p}.html`)
      await expect(page.locator('#root')).not.toBeEmpty()
      await expect(page.locator('main')).toBeVisible()
    })
  }

  test('body 大底为纸色 #FFF9F0', async ({ page }) => {
    await page.goto('/design.html')
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bg).toBe('rgb(255, 249, 240)')
  })

  test('全站无色彩渐变', async ({ page }) => {
    await page.goto('/design-colors.html')
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
  test.beforeEach(async ({ page }) => await page.goto('/design-components.html'))

  test('2px ink 描边 + 统一硬投影（单层 ink，无纸叠）', async ({ page }) => {
    const card = page.locator('a[href="#ch1"]').first()
    await expect(card).toBeVisible()
    const s = await card.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { bw: cs.borderTopWidth, bc: cs.borderTopColor, shadow: cs.boxShadow }
    })
    expect(s.bw).toBe('2px')
    expect(s.bc).toBe('rgb(17, 17, 17)')

    expect(s.shadow.split('rgb(17, 17, 17)').length - 1).toBe(1)
    expect(s.shadow).toContain('rgb(17, 17, 17) 5px 5px 0px 0px')
  })

  test('基础组件投影统一：同一配方复用，不得各写各的', async ({ page }) => {
    const { kinds, recipes } = await page.evaluate(() => {
      const els = [
        ...document.querySelectorAll(
          '[data-comp="course-card"], [data-comp="entry-card"], [data-comp="ticket"]',
        ),
      ]

      const recipe = (el: Element) => {
        const target = el.dataset.comp === 'ticket' ? el.querySelector('.ticket-shadow')! : el
        const cs = getComputedStyle(target)
        return cs.filter !== 'none' ? cs.filter : cs.boxShadow
      }
      return {
        kinds: [...new Set(els.map((el) => el.dataset.comp))].sort(),
        recipes: els.map(recipe),
      }
    })
    expect(kinds).toEqual(['course-card', 'entry-card', 'ticket'])
    expect(recipes.length).toBeGreaterThanOrEqual(6)
    recipes.forEach((r) => expect(r).toContain('rgb(17, 17, 17) 5px 5px'))
    recipes.forEach((r) => expect(r.split('rgb(17, 17, 17)').length - 1).toBe(1))
  })

  test('价值区标记用法卡：相框静置态过程文字带荧光 Mark', async ({ page }) => {
    const m = await page.evaluate(() => {
      const card = document.querySelector('a[href="#ch4"]')
      const mark = card?.querySelector('mark')
      if (!card || !mark) return null
      const cs = getComputedStyle(mark)
      return {
        bg: cs.backgroundColor,
        rot: cs.rotate,
        inZone: !!card.querySelector('.aspect-video mark'),
        txt: mark.textContent,
      }
    })
    expect(m).not.toBeNull()
    expect(m!.inZone).toBeTruthy()
    expect(m!.bg).toBe('rgb(255, 217, 61)')
    expect(m!.rot).toContain('deg')
    expect(m!.txt).toContain('咬合')
  })

  test('16:9 相框：比例、3px 黑边、内阴影、章节撞色', async ({ page }) => {
    const zone = page.locator('a[href="#ch1"] .aspect-video').first()
    const s = await zone.evaluate((el) => {
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return {
        ratio: r.width / r.height,
        bw: cs.borderTopWidth,
        shadow: cs.boxShadow,
        bg: cs.backgroundColor,
      }
    })
    expect(Math.abs(s.ratio - 16 / 9)).toBeLessThan(0.02)
    expect(s.bw).toBe('3px')
    expect(s.shadow).toContain('inset')
    expect(s.bg).toBe('rgb(255, 107, 107)')
  })

  test('卡头三件套：▲ + 标题 + 积木点（实心=已学）', async ({ page }) => {
    const card = page.locator('a[href="#ch2"]').first()
    const dots = card.locator('span[aria-label^="积木"] i')
    expect(await dots.count()).toBe(4)
    const filled = await dots.evaluateAll(
      (ns) => ns.filter((n) => getComputedStyle(n).backgroundColor === 'rgb(17, 17, 17)').length,
    )
    expect(filled).toBe(2)

    const hasTri = await card.evaluate((el) => !!el.querySelector('.mt-2 svg'))
    expect(hasTri).toBeTruthy()
  })

  test('入口徽章 ①②（推荐起点，非强制）', async ({ page }) => {
    await expect(page.locator('span[aria-label="推荐入口 1"]')).toBeVisible()
    await expect(page.locator('span[aria-label="推荐入口 2"]')).toBeVisible()
  })
})

test.describe('RouteLine 规格契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/design-components.html'))

  test('线形：实线先后 2.5px 无 dash；点线同族 0.1/6 圆帽', async ({ page }) => {
    const specs = await page.locator('svg path').evaluateAll((ns) =>
      ns.map((n) => ({
        w: n.getAttribute('stroke-width'),
        dash: n.getAttribute('stroke-dasharray'),
        cap: n.getAttribute('stroke-linecap'),
      })),
    )
    expect(specs.some((s) => s.w === '2.5' && !s.dash)).toBeTruthy()
    expect(specs.some((s) => s.dash === '0.1 6' && s.cap === 'round')).toBeTruthy()
  })

  test('虚线相关 4:2（组件页线形样张）', async ({ page }) => {
    const specs = await page
      .locator('svg path')
      .evaluateAll((ns) => ns.map((n) => n.getAttribute('stroke-dasharray')))
    expect(specs).toContain('4 2')
  })

  test('站点 r6 半嵌：源/目标圆心都骑卡描边（各半在卡上），线层在卡之上', async ({ page }) => {
    const r = await page.evaluate(() => {
      const svg = [...document.querySelectorAll('svg')].find(
        (s) => s.getAttribute('width') === '1160',
      )
      if (!svg) return null
      const wrap = svg.parentElement
      const wb = wrap.getBoundingClientRect()
      const c1 = wrap.querySelector('a[href="/ch1.html"]').getBoundingClientRect()
      const c2 = wrap.querySelector('a[href="/ch2.html"]').getBoundingClientRect()
      const stations = [...svg.querySelectorAll('circle')]
        .map((n) => ({ cx: +(n.getAttribute('cx') ?? 0), r: +(n.getAttribute('r') ?? 0) }))
        .filter((s) => s.r === 6)
      return {
        n: stations.length,
        cxs: stations.map((s) => s.cx),
        c1Right: c1.x - wb.x + c1.width, // 卡右描边（不接阴影）
        c2Border: c2.x - wb.x,
        z: getComputedStyle(svg).zIndex,
      }
    })
    expect(r).not.toBeNull()
    expect(r!.n).toBeGreaterThanOrEqual(4)
    expect(
      r!.cxs.some((cx) => Math.abs(cx - r!.c1Right) <= 3),
      `源站点圆心应骑卡右描边 x≈${r!.c1Right}`,
    ).toBeTruthy()
    expect(
      r!.cxs.some((cx) => Math.abs(cx - r!.c2Border) <= 3),
      `目标站点圆心应骑左描边 x≈${r!.c2Border}`,
    ).toBeTruthy()
    expect(r!.z).toBe('10')
  })

  test('hover 卡片：线与站点跟随浮起（-3px 同步，直线变斜线）', async ({ page }) => {
    const get = () =>
      page.evaluate(() => {
        const svg = [...document.querySelectorAll('svg')].find(
          (s) => s.getAttribute('width') === '1160',
        )
        return {
          stations: [...svg.querySelectorAll('g[style]')].map(
            (g) => (g as HTMLElement).style.transform,
          ),
          d25: [...svg.querySelectorAll('path')]
            .map((el) => el.getAttribute('d') || '')
            .find((d) => d.startsWith('M 600')),

          cardTranslate: getComputedStyle(
            svg.parentElement.querySelector('a[data-comp="course-card"][href="/ch2.html"]'),
          ).translate,
        }
      })
    const before = await get()
    await page.locator('div.absolute.left-\\[420px\\]').hover()
    await page.waitForTimeout(250)
    const after = await get()
    expect(before.d25).toBe('M 600 94 L 780 94')
    expect(after.d25).toBe('M 600 91 L 780 94')
    expect(before.stations.every((t) => t === 'translateY(0px)')).toBeTruthy()
    expect(after.stations.filter((t) => t === 'translateY(-3px)').length).toBe(2)
    expect(after.cardTranslate).toBe('0px -3px')
  })

  test('实线端点落在水平端口（M x y H 起、H x 止）', async ({ page }) => {
    const d = await page
      .locator('svg[width="1160"] path[stroke-width="2.5"]')
      .first()
      .getAttribute('d')
    expect(d).toMatch(/^M [\d.]+ [\d.]+ H/)
    expect(d).toMatch(/H [\d.]+$/)
  })
})

test.describe('价值区荧光标记契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/design-symbols.html'))

  test('荧光笔标记文字：mustard 底、无描边、微斜——是标记不是形状', async ({ page }) => {
    const s = await page.evaluate(() => {
      const m = document.querySelector('mark')
      if (!m) return null
      const cs = getComputedStyle(m)
      const r = m.getBoundingClientRect()
      return { bg: cs.backgroundColor, bw: cs.borderTopWidth, rot: cs.rotate, h: r.height }
    })
    expect(s).not.toBeNull()
    expect(s!.bg).toBe('rgb(255, 217, 61)')
    expect(s!.bw).toBe('0px')
    expect(s!.rot).toContain('deg')
    expect(s!.h).toBeGreaterThan(14)
  })
})

test.describe('票券规格契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/design-symbols.html'))

  test('裁切式：overflow hidden + 单一 2px 描边 + 头部色块无独立边框', async ({ page }) => {
    const done = page.locator('.ticket-pk').first()
    await expect(done).toBeVisible()
    const s = await done.evaluate((el) => {
      const cs = getComputedStyle(el)
      const head = el.firstElementChild as HTMLElement
      const hcs = getComputedStyle(head)
      return {
        ov: cs.overflow,
        bw: cs.borderTopWidth,
        headBorder: hcs.borderTopWidth,
        headBg: hcs.backgroundColor,
      }
    })
    expect(s.ov).toBe('hidden')
    expect(s.bw).toBe('2px')
    expect(s.headBorder).toBe('0px')
    expect(s.headBg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('票面 mask 打孔，内层包裹 drop-shadow 跟随轮廓，孔缘对齐撕线', async ({ page }) => {
    const done = page.locator('.ticket-pk').first()
    const mask = await done.evaluate((el) => {
      const cs = getComputedStyle(el)
      return cs.maskImage || cs.webkitMaskImage || 'none'
    })
    expect(mask).toContain('radial-gradient')
    expect(mask.split('radial-gradient').length - 1).toBe(2)

    const f = await done.evaluate((el) => {
      const w = el.parentElement as HTMLElement
      return {
        filter: getComputedStyle(w).filter,
        wrapperMask: getComputedStyle(w).maskImage,
        pseudoContent: getComputedStyle(w, '::before').content,
        innerShadow: getComputedStyle(el).boxShadow,
      }
    })

    expect(f.filter).toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
    expect(f.wrapperMask).toBe('none')
    expect(f.pseudoContent).toBe('none')
    expect(f.innerShadow).toBe('none')

    const arcs = await page.evaluate(() => {
      const done = document.querySelector('.ticket-pk') as HTMLElement
      const shell = done.closest('.ticket-shell') as HTMLElement
      const stub = shell.querySelector('.ticket-stub') as HTMLElement
      const tearX =
        stub.getBoundingClientRect().x + parseFloat(getComputedStyle(stub).borderLeftWidth) / 2
      return [...shell.querySelectorAll('.pk-arc')].map((a) => {
        const cs = getComputedStyle(a)
        const r = a.getBoundingClientRect()
        return {
          clip: cs.clipPath,
          bw: cs.borderTopWidth,
          bc: cs.borderTopColor,
          dx: r.x + r.width / 2 - tearX,
        }
      })
    })
    expect(arcs).toHaveLength(2)
    arcs.forEach((a) => {
      expect(a.bw).toBe('2px')
      expect(a.bc).toBe('rgb(17, 17, 17)')
      expect(Math.abs(a.dx)).toBeLessThan(0.5)
    })
    expect(arcs[0].clip).toBe('inset(50% 0px 0px)')
    expect(arcs[1].clip).toBe('inset(0px 0px 50%)')

    const plain = await page.evaluate(() => {
      const t = document.querySelector('[data-comp="ticket"]:not(.tk-pk)')!
      return [
        getComputedStyle(t.querySelector('.ticket-face')!).maskImage,
        getComputedStyle(t, '::before').maskImage,
      ]
    })
    expect(plain).toEqual(['none', 'none'])
  })

  test('撕线：完成=虚线、未开始=实线', async ({ page }) => {
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll('[data-comp="ticket"] .ticket-stub')].map(
        (el) => getComputedStyle(el).borderLeftStyle,
      ),
    )
    expect(styles).toContain('dashed')
    expect(styles).toContain('solid')
  })

  for (const width of [1280, 375]) {
    test(`真实像素：票面打孔驱动阴影缺口，阴影孔随投影偏移（${width}px）`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      const ticket = page.locator('[data-comp="ticket"].tk-pk').first()
      if (width === 375) {
        await ticket.locator('b').evaluate((el) => {
          el.textContent = 'ChapterWithAnUnbrokenLongTitle'
        })
      }

      await ticket.evaluate((el) => el.scrollIntoView({ block: 'center' }))

      for (const background of [
        [78, 205, 196],
        [167, 139, 250],
      ]) {
        await ticket.evaluate((el, rgb) => {
          const section = el.closest('section')!
          section.style.backgroundColor = `rgb(${rgb.join(',')})`
          section.style.paddingBottom = '10px'
        }, background)
        const geometry = await ticket.evaluate((el) => {
          const rect = el.getBoundingClientRect()
          const stub = el.querySelector('.ticket-stub')!
          const tearX =
            stub.getBoundingClientRect().x + parseFloat(getComputedStyle(stub).borderLeftWidth) / 2
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, tearX }
        })
        const clip = {
          x: Math.floor(geometry.x),
          y: Math.floor(geometry.y),
          width: Math.ceil(geometry.width) + 10,
          height: Math.ceil(geometry.height) + 10,
        }
        const png = await page.screenshot({ clip })
        const points = [
          [geometry.tearX, geometry.y + 3],

          [geometry.tearX + 8, geometry.y + geometry.height + 4],
          [geometry.tearX - 4, geometry.y + geometry.height + 3],
        ].map(([x, y]) => [Math.floor(x - clip.x), Math.floor(y - clip.y)])
        const readPixels = async (png: Buffer) =>
          page.evaluate(
            async ({ base64, points }) => {
              const img = new Image()
              img.src = `data:image/png;base64,${base64}`
              await img.decode()
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')!
              ctx.drawImage(img, 0, 0)
              return points.map(([x, y]) => [...ctx.getImageData(x, y, 1, 1).data])
            },
            { base64: png.toString('base64'), points },
          )
        const pixels = await readPixels(png)
        expect(pixels.slice(0, 2)).toEqual(Array.from({ length: 2 }, () => [...background, 255]))
        expect(pixels[2]).toEqual([17, 17, 17, 255])

        const face = ticket.locator('.ticket-face')
        await face.evaluate((el) => {
          ;(el as HTMLElement).style.maskImage = 'none'
        })
        const unpunched = await readPixels(await page.screenshot({ clip }))
        expect(unpunched[1]).toEqual([17, 17, 17, 255])
        await face.evaluate((el) => {
          ;(el as HTMLElement).style.removeProperty('mask-image')
        })
      }
    })
  }

  for (const config of [
    { position: 64, size: 12, expectedX: (_width: number) => 64 },
    { position: '50%', size: 20, expectedX: (width: number) => width / 2 },
    { position: 'calc(100% - 40px)', size: 16, expectedX: (width: number) => width - 40 },
  ]) {
    test(`独立 Ticket props：孔位 ${config.position}，孔径 ${config.size}px`, async ({ page }) => {
      const ticket = await mountTicket(page, {
        holePosition: config.position,
        holeSize: config.size,
      })
      const geometry = await ticket.evaluate((el) => {
        const rect = el.getBoundingClientRect()
        const arcs = [...el.querySelectorAll('.pk-arc')].map((arc) => {
          const r = arc.getBoundingClientRect()
          return { x: r.x + r.width / 2 - rect.x, width: r.width }
        })
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, arcs }
      })
      const holeX = config.expectedX(geometry.width)
      expect(geometry.arcs).toHaveLength(2)
      for (const arc of geometry.arcs) {
        expect(arc.x).toBeCloseTo(holeX, 1)
        expect(arc.width).toBe(config.size + 4)
      }
      const clip = {
        x: geometry.x,
        y: geometry.y,
        width: geometry.width + 10,
        height: geometry.height + 10,
      }
      const png = await page.screenshot({ clip })
      const pixels = await page.evaluate(
        async ({ base64, points }) => {
          const img = new Image()
          img.src = `data:image/png;base64,${base64}`
          await img.decode()
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          return points.map(([x, y]) => [
            ...ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data,
          ])
        },
        {
          base64: png.toString('base64'),
          points: [
            [holeX + config.size / 2 - 3, 2],
            [holeX + config.size / 2 + 3, 3],
            [holeX + 5, geometry.height + 3],
          ],
        },
      )
      expect(pixels).toEqual([
        [78, 205, 196, 255],
        [255, 249, 240, 255],
        [78, 205, 196, 255],
      ])
    })
  }

  test('punched=false 或孔径为 0 时不打孔', async ({ page }) => {
    for (const props of [{ punched: false }, { holeSize: 0 }]) {
      const ticket = await mountTicket(page, props)
      await expect(ticket.locator('.pk-arc')).toHaveCount(0)
      expect(
        await ticket.locator('.ticket-face').evaluate((el) => getComputedStyle(el).maskImage),
      ).toBe('none')
    }
  })

  for (const punched of [true, false]) {
    test(`默认 hover：浮起 3px，阴影 5→8px，再回到静置状态（打孔=${punched}）`, async ({
      page,
    }) => {
      const ticket = await mountTicket(page, { punched })
      const initial = (await ticket.boundingBox())!
      await ticket.hover()
      await expect
        .poll(() => ticket.locator('.ticket-shadow').evaluate((el) => getComputedStyle(el).filter))
        .toBe('drop-shadow(rgb(17, 17, 17) 8px 8px 0px)')
      expect((await ticket.boundingBox())!.y).toBeCloseTo(initial.y - 3, 1)
      await page.mouse.move(0, 0)
      await expect
        .poll(() => ticket.locator('.ticket-shadow').evaluate((el) => getComputedStyle(el).filter))
        .toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
      expect((await ticket.boundingBox())!.y).toBeCloseTo(initial.y, 1)
    })
  }

  test('hover=false 关闭拿起动效', async ({ page }) => {
    const ticket = await mountTicket(page, { hover: false })
    const initial = (await ticket.boundingBox())!
    await ticket.hover()
    await page.waitForTimeout(200)
    expect(
      await ticket
        .locator('div')
        .first()
        .evaluate((el) => getComputedStyle(el).filter),
    ).toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
    expect((await ticket.boundingBox())!.y).toBe(initial.y)
  })
})

test.describe('ShadowButton 按压契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/design-components.html'))

  test('多态渲染：有 href=a、无 href=button[type=button]、disabled=虚线占位', async ({ page }) => {
    const buttons = page.locator('[data-comp="shadow-button"]:visible')
    await expect(buttons.first()).toBeVisible()

    const tags = await buttons.evaluateAll((ns) => ns.map((n) => n.tagName))
    expect(tags).toEqual(expect.arrayContaining(['BUTTON', 'A', 'SPAN']))
    await expect(page.locator('a[data-comp="shadow-button"]:visible').first()).toHaveAttribute(
      'href',
      /\/(learn|design-components)\.html/,
    )
    await expect(page.locator('button[data-comp="shadow-button"]').first()).toHaveAttribute(
      'type',
      'button',
    )

    const placeholder = page.locator('span[data-comp="shadow-button"]')
    const s = await placeholder.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        aria: el.getAttribute('aria-disabled'),
        style: cs.borderTopStyle,
        shadow: cs.boxShadow,
      }
    })
    expect(s.aria).toBe('true')
    expect(s.style).toBe('dashed')
    expect(s.shadow).toBe('none')
  })

  test('按压三部曲：静置 3px → hover 浮 2px/投影 5px → 按住 translate(2px,2px)/投影收 1px', async ({
    page,
  }) => {
    const btn = page.locator('button[data-comp="shadow-button"]:visible').first()
    await btn.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const state = () =>
      btn.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { shadow: cs.boxShadow, translate: cs.translate }
      })

    expect((await state()).shadow).toContain('rgb(17, 17, 17) 3px 3px 0px 0px')
    expect((await state()).translate).toBe('none')

    await btn.hover()
    await expect
      .poll(async () => (await state()).shadow)
      .toContain('rgb(17, 17, 17) 5px 5px 0px 0px')
    expect((await state()).translate).toBe('0px -2px')

    await page.mouse.down()
    await expect
      .poll(async () => (await state()).shadow)
      .toContain('rgb(17, 17, 17) 1px 1px 0px 0px')
    expect((await state()).translate).toBe('2px 2px')

    await page.mouse.up()
    await page.mouse.move(0, 0)
    await expect
      .poll(async () => (await state()).shadow)
      .toContain('rgb(17, 17, 17) 3px 3px 0px 0px')
    expect((await state()).translate).toBe('none')
  })
})

test.describe('ShadowCard · 四部曲契约', () => {
  test.beforeEach(async ({ page }) => await page.goto('/design-components.html'))

  const specimens = (page: Page) =>
    page
      .locator('section')
      .filter({ has: page.locator('h2', { hasText: 'ShadowCard · 四部曲' }) })
      .locator('[data-comp="shadow-card"]')

  test('四张标本：组合恰为基础 / hover / 打孔 / 打孔＋hover', async ({ page }) => {
    const cards = specimens(page)
    await expect(cards).toHaveCount(4)
    const combos = await cards.evaluateAll((ns) =>
      ns.map((el) => {
        const face = el.querySelector<HTMLElement>('.ticket-face')
        return {
          ticket: !!face,
          hover: el.className.includes('shadow-ink-lift') || el.classList.contains('ticket-lift'),
          punched: !!face && getComputedStyle(face).maskImage.includes('radial-gradient'),
        }
      }),
    )
    expect(combos).toEqual([
      { ticket: false, hover: false, punched: false },
      { ticket: false, hover: true, punched: false },
      { ticket: true, hover: false, punched: true },
      { ticket: true, hover: true, punched: true },
    ])
  })

  test('第 4 张（打孔＋hover）：阴影 5→8px 跟随打孔轮廓，浮起 3px，离开复原', async ({ page }) => {
    const card = specimens(page).nth(3)
    await card.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    const shadow = card.locator('.ticket-shadow')
    await expect
      .poll(() => shadow.evaluate((el) => getComputedStyle(el).filter))
      .toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
    expect(
      await card.locator('.ticket-face').evaluate((el) => getComputedStyle(el).maskImage),
    ).toContain('radial-gradient')
    const initial = (await card.boundingBox())!
    await card.hover()
    await expect
      .poll(() => shadow.evaluate((el) => getComputedStyle(el).filter))
      .toBe('drop-shadow(rgb(17, 17, 17) 8px 8px 0px)')
    expect((await card.boundingBox())!.y).toBeCloseTo(initial.y - 3, 1)
    await page.mouse.move(0, 0)
    await expect
      .poll(() => shadow.evaluate((el) => getComputedStyle(el).filter))
      .toBe('drop-shadow(rgb(17, 17, 17) 5px 5px 0px)')
    expect((await card.boundingBox())!.y).toBeCloseTo(initial.y, 1)
  })
})

test.describe('阴影册 · hover-host 触发模型', () => {
  test('宿主承接 hover：命中区不动，位移作用于内部元素（防边界震荡）', async ({ page }) => {
    await page.goto('/design-shadow.html')
    const host = page.locator('.hover-host').first()
    const inner = host.locator('.hoverable-shadow')
    await expect(inner).toHaveCSS('translate', 'none')

    await host.hover()
    await expect(inner).toHaveCSS('translate', '0px -3px')
    await expect(inner).toHaveCSS('box-shadow', /rgb\(17, 17, 17\) 8px 8px 0px 0px/)

    const hostBox = await host.boundingBox()
    await page.mouse.move(hostBox.x + 2, hostBox.y + 2)
    await expect(inner).toHaveCSS('translate', '0px -3px')

    await page.mouse.move(hostBox.x - 40, hostBox.y - 40)
    await expect(inner).toHaveCSS('translate', 'none')
  })
})
