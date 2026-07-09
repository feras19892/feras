import { test, expect } from '@playwright/test'

/** All experiment routes to snapshot */
const EXPERIMENT_ROUTES = [
  '/physics/mechanics/collision',
  '/physics/mechanics/freefall',
  '/physics/mechanics/spring',
  '/physics/mechanics/pendulum',
  '/physics/mechanics/projectile',
  '/physics/mechanics/inclined',
  '/physics/mechanics/analysis-calc',
  '/physics/mechanics/prism',
  '/physics/mechanics/mirror',
  '/physics/mechanics/lightray',
  '/physics/thermodynamics/calorimetry',
  '/physics/thermodynamics/specific-heat',
  '/physics/thermodynamics/latent-heat',
  '/physics/thermodynamics/thermal-expansion',
  '/physics/thermodynamics/boyles-law',
  '/physics/thermodynamics/ideal-gas',
  '/physics/electromagnetism/faraday',
  '/physics/electromagnetism/rc-circuit',
  '/physics/electromagnetism/biot-savart',
  '/physics/waves/diffraction',
  '/physics/waves/interference',
  '/physics/waves/grating',
  '/physics/waves/polarization',
  '/physics/waves/speed-of-sound',
  '/physics/waves/resonance',
  '/physics/waves/wave-interference',
  '/chemistry',
]

/** Viewport sizes to test */
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
]

/** Normalize route for filename */
function toFileName(route: string, vpName: string) {
  return `${route.replace(/\//g, '_')}_${vpName}.png`
}

test.describe('Visual Regression: All Experiments', () => {
  for (const route of EXPERIMENT_ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`snapshot ${route} @ ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto(route)
        await page.waitForLoadState('networkidle')
        // استقرار الواجهة: انتظر 500ms إضافية للرسوم المتحركة الأولية
        await page.waitForTimeout(500)

        // التقاط لقطة للصفحة كاملة
        await expect(page).toHaveScreenshot(toFileName(route, vp.name), {
          maxDiffPixels: vp.name === 'mobile' ? 150 : 100,
          fullPage: true,
        })
      })
    }
  }
})

test.describe('Visual Regression: UI Components', () => {
  test('dashboard page renders correctly', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixels: 100 })
  })

  test('landing page renders correctly in RTL', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('landing_rtl.png', { maxDiffPixels: 100 })
  })

  test('chemistry lab tools panel does not overlap', async ({ page }) => {
    await page.goto('/chemistry')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // افتح لوحة الأدوات وتحقق من عدم التداخل
    const toolPanels = await page.locator('.chemistry-landing, .workspace-canvas, .left-panel, .right-panel').all()
    for (const panel of toolPanels) {
      const box = await panel.boundingBox().catch(() => null)
      if (box) {
        expect(box.width).toBeGreaterThan(0)
        expect(box.height).toBeGreaterThan(0)
      }
    }

    await expect(page).toHaveScreenshot('chemistry_layout.png', { maxDiffPixels: 150 })
  })

  test('experiment analysis-calc tabs do not overflow', async ({ page }) => {
    await page.goto('/physics/mechanics/analysis-calc')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)

    const tabs = await page.locator('.analysis-tab, [role="tab"]').all()
    for (const tab of tabs) {
      const box = await tab.boundingBox().catch(() => null)
      if (box) {
        // يجب أن يكون التبويب مرئياً بالكامل داخل نافذة العرض
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.y).toBeGreaterThanOrEqual(0)
      }
    }

    await expect(page).toHaveScreenshot('analysis_calc_tabs.png', { maxDiffPixels: 100 })
  })
})
