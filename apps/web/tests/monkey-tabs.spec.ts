import { test, expect, type Page } from '@playwright/test'

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function monkeyClick(page: Page, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    const buttons = await page.locator('button, [role="button"], a, .tab, [class*="tab"]').all()
    if (buttons.length === 0) break
    const target = buttons[randomInt(0, buttons.length - 1)]
    const box = await target.boundingBox().catch(() => null)
    if (!box) continue
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(randomInt(20, 80))
  }
}

async function monkeyType(page: Page, iterations: number) {
  const inputs = await page.locator('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]), textarea').all()
  for (let i = 0; i < Math.min(iterations, inputs.length); i++) {
    const input = inputs[randomInt(0, inputs.length - 1)]
    await input.click()
    const value = randomInt(-1000, 10000)
    await input.fill(String(value))
    await page.waitForTimeout(randomInt(20, 80))
  }
}

async function monkeyScroll(page: Page, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    await page.mouse.wheel(0, randomInt(-500, 500))
    await page.waitForTimeout(randomInt(20, 80))
  }
}

async function monkeyResize(page: Page, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    const w = randomInt(320, 1920)
    const h = randomInt(400, 1200)
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(randomInt(100, 300))
  }
}

/** Collect all errors from console and page */
function captureErrors(page: Page) {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => {
    pageErrors.push(err.message)
  })

  return { consoleErrors, pageErrors }
}

/** Measure JS heap memory (Chrome-only) */
async function getHeapSize(page: Page): Promise<number> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perf = (performance as any).memory
    return perf ? perf.usedJSHeapSize : 0
  })
}

test.describe('Monkey Testing: Random UI Interactions', () => {
  test('survives random clicks and inputs on collision experiment', async ({ page }) => {
    const { consoleErrors, pageErrors } = captureErrors(page)

    await page.goto('/physics/mechanics/collision')
    await page.waitForSelector('.menu-bar, .control-bar, [class*="control"]', { timeout: 10000 })

    await monkeyClick(page, 50)
    await monkeyType(page, 15)
    await monkeyScroll(page, 15)

    await page.waitForTimeout(500)

    // لا يجب أن يكون هناك أخطاء فادحة
    const fatalErrors = pageErrors.filter(e =>
      e.includes('undefined') || e.includes('null') || e.includes('Cannot read') || e.includes('is not a function')
    )
    expect(fatalErrors).toHaveLength(0)
    expect(consoleErrors.length).toBeLessThan(10)
  })

  test('survives rapid tab switching and resizing', async ({ page }) => {
    const { consoleErrors, pageErrors } = captureErrors(page)

    const routes = [
      '/physics/mechanics/collision',
      '/physics/mechanics/freefall',
      '/physics/mechanics/spring',
      '/physics/mechanics/pendulum',
      '/physics/mechanics/projectile',
      '/physics/mechanics/inclined',
      '/physics/mechanics/analysis-calc',
      '/physics/thermodynamics/calorimetry',
      '/chemistry',
    ]

    for (let i = 0; i < 20; i++) {
      const route = routes[randomInt(0, routes.length - 1)]
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await monkeyResize(page, randomInt(1, 3))
      await monkeyClick(page, randomInt(5, 15))
      await monkeyType(page, randomInt(2, 5))
      await page.waitForTimeout(randomInt(50, 150))
    }

    const fatalErrors = pageErrors.filter(e =>
      e.includes('undefined') || e.includes('null') || e.includes('Cannot read') || e.includes('is not a function')
    )
    expect(fatalErrors).toHaveLength(0)
    expect(consoleErrors.length).toBeLessThan(20)
  })

  test('no memory leak after intensive tab switching', async ({ page }) => {
    const { pageErrors } = captureErrors(page)

    const routes = [
      '/physics/mechanics/collision',
      '/physics/mechanics/spring',
      '/physics/mechanics/pendulum',
      '/chemistry',
    ]

    const memSnapshots: number[] = []

    // تشغيل الجمع بين التبديل السريع وقياس الذاكرة
    for (let cycle = 0; cycle < 10; cycle++) {
      for (const route of routes) {
        await page.goto(route)
        await page.waitForLoadState('networkidle')
        await monkeyClick(page, 10)
        await page.waitForTimeout(200)
      }

      // اضغط على زر GC إن وُجد (Chrome DevTools Protocol)
      try {
        await page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const w = window as any
          if (w.gc) w.gc()
        })
      } catch { /* ignore */ }

      await page.waitForTimeout(500)
      const mem = await getHeapSize(page)
      if (mem > 0) memSnapshots.push(mem)
    }

    if (memSnapshots.length >= 3) {
      // احسب معدل النمو بين القياسات
      const growthRates: number[] = []
      for (let i = 1; i < memSnapshots.length; i++) {
        growthRates.push((memSnapshots[i] - memSnapshots[i - 1]) / memSnapshots[i - 1])
      }
      const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length
      console.log('Memory snapshots (MB):', memSnapshots.map(m => (m / 1024 / 1024).toFixed(1)))
      console.log('Average growth rate:', avgGrowth.toFixed(3))

      // النمو المتوسط يجب ألا يتجاوز 10% بين الدورات
      expect(avgGrowth).toBeLessThan(0.10)
    }

    const fatalErrors = pageErrors.filter(e =>
      e.includes('undefined') || e.includes('null') || e.includes('Cannot read') || e.includes('is not a function')
    )
    expect(fatalErrors).toHaveLength(0)
  })

  test('survives keyboard spam during simulation', async ({ page }) => {
    const { pageErrors } = captureErrors(page)

    await page.goto('/physics/mechanics/spring')
    await page.waitForSelector('.menu-bar, .control-bar', { timeout: 10000 })

    // اضغط على زر البدء
    const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
    }

    // اضغط أزرار عشوائية بسرعة
    const keys = ['Space', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'KeyR', 'KeyS']
    for (let i = 0; i < 100; i++) {
      const key = keys[randomInt(0, keys.length - 1)]
      await page.keyboard.press(key)
      await page.waitForTimeout(randomInt(10, 30))
    }

    await page.waitForTimeout(500)

    const fatalErrors = pageErrors.filter(e =>
      e.includes('undefined') || e.includes('null') || e.includes('Cannot read') || e.includes('is not a function')
    )
    expect(fatalErrors).toHaveLength(0)
  })

  test('survives concurrent interactions on chemistry lab', async ({ page }) => {
    const { consoleErrors, pageErrors } = captureErrors(page)

    await page.goto('/chemistry')
    await page.waitForSelector('.chemistry-landing', { timeout: 10000 })
    await page.waitForTimeout(500)

    // نقرات عشوائية مكثفة على أدوات المعمل
    const toolSelectors = [
      '[class*="chemical"]',
      '[class*="beaker"]',
      '[class*="test-tube"]',
      '[class*="burette"]',
      'button',
      '[class*="panel"]',
    ]

    for (let i = 0; i < 60; i++) {
      const selector = toolSelectors[randomInt(0, toolSelectors.length - 1)]
      const elements = await page.locator(selector).all()
      if (elements.length > 0) {
        const el = elements[randomInt(0, elements.length - 1)]
        const box = await el.boundingBox().catch(() => null)
        if (box) {
          const action = randomInt(0, 2)
          if (action === 0) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
          else if (action === 1) await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2)
          else await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        }
      }
      await page.waitForTimeout(randomInt(20, 50))
    }

    // سحب وإفلات عشوائي
    for (let i = 0; i < 10; i++) {
      const x = randomInt(100, 800)
      const y = randomInt(100, 600)
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x + randomInt(-100, 100), y + randomInt(-100, 100))
      await page.mouse.up()
      await page.waitForTimeout(50)
    }

    await page.waitForTimeout(500)

    const fatalErrors = pageErrors.filter(e =>
      e.includes('undefined') || e.includes('null') || e.includes('Cannot read') || e.includes('is not a function')
    )
    expect(fatalErrors).toHaveLength(0)
    expect(consoleErrors.length).toBeLessThan(15)
  })
})
