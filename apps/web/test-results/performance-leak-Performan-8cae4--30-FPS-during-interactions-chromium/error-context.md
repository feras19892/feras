# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance-leak.spec.ts >> Performance & Memory Leak >> chemistry lab maintains 30 FPS during interactions
- Location: tests\performance-leak.spec.ts:39:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.chemistry-landing') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"@sentry/vue\" from \"src/main.ts\". Does the file exist?"
  - generic [ref=e5]: C:/Users/feras/Desktop/هام 2/feras/apps/web/src/main.ts:16:32
  - generic [ref=e6]: "9 | if (sentryDsn) { 10 | try { 11 | const Sentry = await import(\"@sentry/vue\"); | ^ 12 | Sentry.init({ 13 | app,"
  - generic [ref=e7]: at TransformPluginContext._formatError (file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41) at TransformPluginContext.error (file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16) at normalizeUrl (file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23) at process.processTicksAndRejections (node:internal/process/task_queues:104:5) at async file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39 at async Promise.all (index 7) at async TransformPluginContext.transform (file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7) at async PluginContainer.transform (file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18) at async loadAndTransform (file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27) at async viteTransformMiddleware (file:///C:/Users/feras/Desktop/%D9%87%D8%A7%D9%85%202/feras/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:62106:24
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.ts
    - text: .
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Performance & Memory Leak', () => {
  4  |   test('collision experiment maintains 60 FPS during simulation', async ({ page }) => {
  5  |     await page.goto('/physics/mechanics/collision')
  6  |     await page.waitForSelector('.menu-bar')
  7  | 
  8  |     // ابدأ المحاكاة
  9  |     await page.click('text=بدء')
  10 |     await page.waitForTimeout(500)
  11 | 
  12 |     // قياس FPS عبر Performance API
  13 |     const fpsSamples: number[] = []
  14 |     for (let i = 0; i < 10; i++) {
  15 |       const fps = await page.evaluate(() => {
  16 |         return new Promise<number>((resolve) => {
  17 |           let frames = 0
  18 |           const start = performance.now()
  19 |           function count() {
  20 |             frames++
  21 |             if (performance.now() - start < 1000) {
  22 |               requestAnimationFrame(count)
  23 |             } else {
  24 |               resolve(frames)
  25 |             }
  26 |           }
  27 |           requestAnimationFrame(count)
  28 |         })
  29 |       })
  30 |       fpsSamples.push(fps)
  31 |       await page.waitForTimeout(200)
  32 |     }
  33 | 
  34 |     const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
  35 |     console.log('Average FPS:', avgFps)
  36 |     expect(avgFps).toBeGreaterThan(30) // الحد الأدنى المقبول
  37 |   })
  38 | 
  39 |   test('chemistry lab maintains 30 FPS during interactions', async ({ page }) => {
  40 |     await page.goto('/chemistry')
> 41 |     await page.waitForSelector('.chemistry-landing')
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  42 | 
  43 |     const fpsSamples: number[] = []
  44 |     for (let i = 0; i < 10; i++) {
  45 |       const fps = await page.evaluate(() => {
  46 |         return new Promise<number>((resolve) => {
  47 |           let frames = 0
  48 |           const start = performance.now()
  49 |           function count() {
  50 |             frames++
  51 |             if (performance.now() - start < 1000) {
  52 |               requestAnimationFrame(count)
  53 |             } else {
  54 |               resolve(frames)
  55 |             }
  56 |           }
  57 |           requestAnimationFrame(count)
  58 |         })
  59 |       })
  60 |       fpsSamples.push(fps)
  61 |       await page.waitForTimeout(200)
  62 |     }
  63 | 
  64 |     const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
  65 |     console.log('Chemistry avg FPS:', avgFps)
  66 |     expect(avgFps).toBeGreaterThan(30)
  67 |   })
  68 | 
  69 |   test('memory does not grow unbounded after multiple runs', async ({ page }) => {
  70 |     await page.goto('/physics/mechanics/collision')
  71 |     await page.waitForSelector('.menu-bar')
  72 | 
  73 |     const memSnapshots: number[] = []
  74 | 
  75 |     for (let run = 0; run < 5; run++) {
  76 |       await page.click('text=بدء')
  77 |       // انتظر الاصطدام التلقائي ثم توقف المحاكاة
  78 |       await page.waitForTimeout(2000)
  79 | 
  80 |       const mem = await page.evaluate(() => {
  81 |         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  82 |         // @ts-ignore
  83 |         // eslint-disable-next-line @typescript-eslint/no-explicit-any
  84 |         const perf = (performance as any).memory
  85 |         return perf ? perf.usedJSHeapSize : 0
  86 |       })
  87 |       memSnapshots.push(mem)
  88 |     }
  89 | 
  90 |     // النمو يجب ألا يتجاوز 20% بين التشغيل الأول والأخير
  91 |     if (memSnapshots[0] > 0 && memSnapshots[memSnapshots.length - 1] > 0) {
  92 |       const growth = (memSnapshots[memSnapshots.length - 1] - memSnapshots[0]) / memSnapshots[0]
  93 |       console.log('Memory growth:', growth)
  94 |       expect(growth).toBeLessThan(0.5) // 50% threshold
  95 |     }
  96 |   })
  97 | })
  98 | 
```