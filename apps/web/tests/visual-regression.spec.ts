import { test, expect } from '@playwright/test'

const EXPERIMENT_ROUTES = [
  '/physics/mechanics/collision',
  '/physics/mechanics/freefall',
  '/physics/mechanics/spring',
  '/physics/mechanics/pendulum',
  '/physics/mechanics/projectile',
  '/physics/mechanics/inclined',
  '/physics/mechanics/analysis-calc',
]

test.describe('Visual Regression: Physics Experiments', () => {
  for (const route of EXPERIMENT_ROUTES) {
    test(`snapshot ${route}`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      // استقرار الواجهة: انتظر 300ms إضافية للرسوم المتحركة
      await page.waitForTimeout(300)
      await expect(page).toHaveScreenshot(`${route.replace(/\//g, '_')}.png`, {
        maxDiffPixels: 100,
      })
    })
  }
})
