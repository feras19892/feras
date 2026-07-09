import { test, expect, type Page } from '@playwright/test'

/** Wait for any loading or animation to settle */
async function waitForStable(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(400)
}

/** Inject an edge-case value into an input field and verify app stability */
async function injectAndCheck(page: Page, inputSelector: string, value: string | number) {
  const input = page.locator(inputSelector).first()
  await input.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null)
  if (await input.isVisible().catch(() => false)) {
    await input.fill(String(value))
    await page.waitForTimeout(200)

    // تحقق من أن الصفحة لم تنهار (لا يوجد شاشة بيضاء أو خطأ Vue)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('undefined is not an object')
    expect(bodyText).not.toContain('Cannot read properties')
    expect(bodyText).not.toContain('Vue error')
  }
}

/** Collect console errors */
function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => {
    errors.push(err.message)
  })
  return errors
}

test.describe('Physics Bounds: Edge Case Injection (E2E)', () => {
  test('spring experiment survives extreme inputs', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/physics/mechanics/spring')
    await waitForStable(page)

    // حقن قيم قصوى في معاملات النابض
    await injectAndCheck(page, 'input[placeholder*="k"], input[name*="k"], [data-param="k"] input', 1_000_000)
    await injectAndCheck(page, 'input[placeholder*="mass"], input[name*="mass"], [data-param="mass"] input', -5)
    await injectAndCheck(page, 'input[placeholder*="amplitude"], input[name*="amplitude"], [data-param="amplitude"] input', 999_999)
    await injectAndCheck(page, 'input[placeholder*="damping"], input[name*="damping"], [data-param="damping"] input', -0.5)

    // اضغط زر البدء إن وُجد
    const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(1000)
    }

    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })

  test('pendulum experiment survives extreme inputs', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/physics/mechanics/pendulum')
    await waitForStable(page)

    await injectAndCheck(page, 'input[placeholder*="length"], input[name*="length"], [data-param="length"] input', -10)
    await injectAndCheck(page, 'input[placeholder*="g"], input[name*="g"], [data-param="g"] input', 0)
    await injectAndCheck(page, 'input[placeholder*="theta"], input[name*="theta"], [data-param="theta"] input', 370)
    await injectAndCheck(page, 'input[placeholder*="mass"], input[name*="mass"], [data-param="mass"] input', -0.01)

    const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(1000)
    }

    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })

  test('freefall experiment survives extreme inputs', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/physics/mechanics/freefall')
    await waitForStable(page)

    await injectAndCheck(page, 'input[placeholder*="height"], input[name*="height"], [data-param="height"] input', -50)
    await injectAndCheck(page, 'input[placeholder*="g"], input[name*="g"], [data-param="g"] input', 0)
    await injectAndCheck(page, 'input[placeholder*="mass"], input[name*="mass"], [data-param="mass"] input', 1e12)

    const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(1000)
    }

    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })

  test('inclined plane survives extreme inputs', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/physics/mechanics/inclined')
    await waitForStable(page)

    await injectAndCheck(page, 'input[placeholder*="angle"], input[name*="angle"], [data-param="angle"] input', 95)
    await injectAndCheck(page, 'input[placeholder*="length"], input[name*="length"], [data-param="length"] input', -5)
    await injectAndCheck(page, 'input[placeholder*="mass"], input[name*="mass"], [data-param="mass"] input', -10)
    await injectAndCheck(page, 'input[placeholder*="mu"], input[name*="mu"], [data-param="mu"] input', 2.5)

    const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(1000)
    }

    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })

  test('projectile experiment survives extreme inputs', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/physics/mechanics/projectile')
    await waitForStable(page)

    await injectAndCheck(page, 'input[placeholder*="velocity"], input[name*="velocity"], [data-param="velocity"] input', 3e8) // سرعة الضوء!
    await injectAndCheck(page, 'input[placeholder*="angle"], input[name*="angle"], [data-param="angle"] input', -45)
    await injectAndCheck(page, 'input[placeholder*="height"], input[name*="height"], [data-param="height"] input', -10)
    await injectAndCheck(page, 'input[placeholder*="mass"], input[name*="mass"], [data-param="mass"] input', -0.5)

    const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(1000)
    }

    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })

  test('collision experiment survives extreme inputs', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/physics/mechanics/collision')
    await waitForStable(page)

    await injectAndCheck(page, 'input[placeholder*="mass"], input[name*="mass"], [data-param="mass"] input', -1)
    await injectAndCheck(page, 'input[placeholder*="velocity"], input[name*="velocity"], [data-param="velocity"] input', 1e9)
    await injectAndCheck(page, 'input[placeholder*="elasticity"], input[name*="elasticity"], [data-param="elasticity"] input', 2.0)

    const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(1000)
    }

    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })

  test('thermodynamics experiments survive extreme temperatures', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    const thermoRoutes = [
      '/physics/thermodynamics/calorimetry',
      '/physics/thermodynamics/specific-heat',
      '/physics/thermodynamics/latent-heat',
      '/physics/thermodynamics/thermal-expansion',
    ]

    for (const route of thermoRoutes) {
      await page.goto(route)
      await waitForStable(page)

      // درجات حرارة تحت الصفر المطلق أو فوق الحد المنطقي
      await injectAndCheck(page, 'input[placeholder*="temp"], input[name*="temp"], [data-param*="temp"] input', -300)
      await injectAndCheck(page, 'input[placeholder*="mass"], input[name*="mass"], [data-param*="mass"] input', -5)
      await injectAndCheck(page, 'input[placeholder*="heat"], input[name*="heat"], [data-param*="heat"] input', 1e15)

      const startBtn = page.locator('button:has-text("بدء"), button:has-text("Start"), button:has-text("تشغيل")').first()
      if (await startBtn.isVisible().catch(() => false)) {
        await startBtn.click()
        await page.waitForTimeout(500)
      }
    }

    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })

  test('chemistry lab survives extreme concentrations', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/chemistry')
    await waitForStable(page)

    // انتظر حتى تظهر الواجهة الكاملة
    await page.waitForSelector('.chemistry-landing', { timeout: 10000 })

    // حاول إدخال قيم غير منطقية في حقول التركيز إن وُجدت
    const inputs = await page.locator('input[type="number"]').all()
    for (const input of inputs.slice(0, 5)) {
      await input.fill('-99999')
      await page.waitForTimeout(100)
    }

    // تحقق من أن Vue لم ينهار
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('undefined is not an object')
    expect(bodyText).not.toContain('Vue error')
    expect(errors.filter(e => e.includes('undefined') || e.includes('null'))).toHaveLength(0)
  })

  test('analysis-calc chart regression survives empty/single-point data', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto('/physics/mechanics/analysis-calc')
    await waitForStable(page)

    // حاول فتح تبويب الرسم البياني والمعادلات
    const chartTab = page.locator('button:has-text("رسم"), button:has-text("Chart"), button:has-text("Plot"), .analysis-tab').first()
    if (await chartTab.isVisible().catch(() => false)) {
      await chartTab.click()
      await page.waitForTimeout(300)
    }

    // تحقق من عدم وجود أخطاء رياضية
    expect(errors.filter(e => e.includes('undefined') || e.includes('null') || e.includes('NaN') || e.includes('Infinity'))).toHaveLength(0)
  })
})
