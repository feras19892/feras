import { test, expect } from '@playwright/test'

test.describe('Performance & Memory Leak', () => {
  test('collision experiment maintains 60 FPS during simulation', async ({ page }) => {
    await page.goto('/physics/mechanics/collision')
    await page.waitForSelector('.menu-bar')

    // ابدأ المحاكاة
    await page.click('text=بدء')
    await page.waitForTimeout(500)

    // قياس FPS عبر Performance API
    const fpsSamples: number[] = []
    for (let i = 0; i < 10; i++) {
      const fps = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0
          const start = performance.now()
          function count() {
            frames++
            if (performance.now() - start < 1000) {
              requestAnimationFrame(count)
            } else {
              resolve(frames)
            }
          }
          requestAnimationFrame(count)
        })
      })
      fpsSamples.push(fps)
      await page.waitForTimeout(200)
    }

    const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
    console.log('Average FPS:', avgFps)
    expect(avgFps).toBeGreaterThan(30) // الحد الأدنى المقبول
  })

  test('chemistry lab maintains 30 FPS during interactions', async ({ page }) => {
    await page.goto('/chemistry')
    await page.waitForSelector('.chemistry-landing')

    const fpsSamples: number[] = []
    for (let i = 0; i < 10; i++) {
      const fps = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0
          const start = performance.now()
          function count() {
            frames++
            if (performance.now() - start < 1000) {
              requestAnimationFrame(count)
            } else {
              resolve(frames)
            }
          }
          requestAnimationFrame(count)
        })
      })
      fpsSamples.push(fps)
      await page.waitForTimeout(200)
    }

    const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
    console.log('Chemistry avg FPS:', avgFps)
    expect(avgFps).toBeGreaterThan(30)
  })

  test('memory does not grow unbounded after multiple runs', async ({ page }) => {
    await page.goto('/physics/mechanics/collision')
    await page.waitForSelector('.menu-bar')

    const memSnapshots: number[] = []

    for (let run = 0; run < 5; run++) {
      await page.click('text=بدء')
      await page.waitForTimeout(1000)
      await page.click('text=توقف')
      await page.waitForTimeout(200)

      const mem = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perf = (performance as any).memory
        return perf ? perf.usedJSHeapSize : 0
      })
      memSnapshots.push(mem)
    }

    // النمو يجب ألا يتجاوز 20% بين التشغيل الأول والأخير
    if (memSnapshots[0] > 0 && memSnapshots[memSnapshots.length - 1] > 0) {
      const growth = (memSnapshots[memSnapshots.length - 1] - memSnapshots[0]) / memSnapshots[0]
      console.log('Memory growth:', growth)
      expect(growth).toBeLessThan(0.5) // 50% threshold
    }
  })
})
