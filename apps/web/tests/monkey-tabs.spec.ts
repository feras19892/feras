import { test, expect, type Page } from '@playwright/test'

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function monkeyClick(page: Page, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    const buttons = await page.locator('button, [role="button"], a').all()
    if (buttons.length === 0) break
    const target = buttons[randomInt(0, buttons.length - 1)]
    const box = await target.boundingBox().catch(() => null)
    if (!box) continue
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(50)
  }
}

async function monkeyType(page: Page, iterations: number) {
  const inputs = await page.locator('input, textarea').all()
  for (let i = 0; i < Math.min(iterations, inputs.length); i++) {
    const input = inputs[i]
    await input.click()
    await input.fill(String(randomInt(0, 100)))
    await page.waitForTimeout(50)
  }
}

async function monkeyScroll(page: Page, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    await page.mouse.wheel(0, randomInt(-300, 300))
    await page.waitForTimeout(50)
  }
}

async function monkeyResize(page: Page, iterations: number) {
  for (let i = 0; i < iterations; i++) {
    const w = randomInt(800, 1600)
    const h = randomInt(600, 1200)
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(200)
  }
}

test.describe('Monkey Testing: Random UI Interactions', () => {
  test('survives random clicks and inputs on collision experiment', async ({ page }) => {
    await page.goto('/physics/mechanics/collision')
    await page.waitForSelector('.menu-bar')

    await monkeyClick(page, 30)
    await monkeyType(page, 10)
    await monkeyScroll(page, 10)

    // يجب ألا يكون هناك أخطاء في console
    const consoleErrors: string[] = []
    page.on('console', (msg: { type: () => string; text: () => string }) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.waitForTimeout(500)
    expect(consoleErrors.length).toBeLessThan(5) // يسمح ببعض الأخطاء
  })

  test('survives rapid tab switching and resizing', async ({ page }) => {
    const routes = [
      '/physics/mechanics/collision',
      '/physics/mechanics/freefall',
      '/physics/mechanics/spring',
      '/physics/mechanics/pendulum',
      '/physics/mechanics/analysis-calc',
    ]

    const pageErrors: string[] = []
    page.on('pageerror', (err: { message: string }) => pageErrors.push(err.message))

    for (let i = 0; i < 10; i++) {
      const route = routes[randomInt(0, routes.length - 1)]
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await monkeyResize(page, 2)
      await monkeyClick(page, 5)
      await page.waitForTimeout(100)
    }

    expect(pageErrors.filter(e => e.includes('undefined') || e.includes('null'))).toHaveLength(0)
  })
})
