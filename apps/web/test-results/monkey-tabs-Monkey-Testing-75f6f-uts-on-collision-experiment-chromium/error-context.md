# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: monkey-tabs.spec.ts >> Monkey Testing: Random UI Interactions >> survives random clicks and inputs on collision experiment
- Location: tests\monkey-tabs.spec.ts:46:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.menu-bar') to be visible

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
  1  | import { test, expect, type Page } from '@playwright/test'
  2  | 
  3  | function randomInt(min: number, max: number) {
  4  |   return Math.floor(Math.random() * (max - min + 1)) + min
  5  | }
  6  | 
  7  | async function monkeyClick(page: Page, iterations: number) {
  8  |   for (let i = 0; i < iterations; i++) {
  9  |     const buttons = await page.locator('button, [role="button"], a').all()
  10 |     if (buttons.length === 0) break
  11 |     const target = buttons[randomInt(0, buttons.length - 1)]
  12 |     const box = await target.boundingBox().catch(() => null)
  13 |     if (!box) continue
  14 |     await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  15 |     await page.waitForTimeout(50)
  16 |   }
  17 | }
  18 | 
  19 | async function monkeyType(page: Page, iterations: number) {
  20 |   const inputs = await page.locator('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]), textarea').all()
  21 |   for (let i = 0; i < Math.min(iterations, inputs.length); i++) {
  22 |     const input = inputs[i]
  23 |     await input.click()
  24 |     await input.fill(String(randomInt(0, 100)))
  25 |     await page.waitForTimeout(50)
  26 |   }
  27 | }
  28 | 
  29 | async function monkeyScroll(page: Page, iterations: number) {
  30 |   for (let i = 0; i < iterations; i++) {
  31 |     await page.mouse.wheel(0, randomInt(-300, 300))
  32 |     await page.waitForTimeout(50)
  33 |   }
  34 | }
  35 | 
  36 | async function monkeyResize(page: Page, iterations: number) {
  37 |   for (let i = 0; i < iterations; i++) {
  38 |     const w = randomInt(800, 1600)
  39 |     const h = randomInt(600, 1200)
  40 |     await page.setViewportSize({ width: w, height: h })
  41 |     await page.waitForTimeout(200)
  42 |   }
  43 | }
  44 | 
  45 | test.describe('Monkey Testing: Random UI Interactions', () => {
  46 |   test('survives random clicks and inputs on collision experiment', async ({ page }) => {
  47 |     await page.goto('/physics/mechanics/collision')
> 48 |     await page.waitForSelector('.menu-bar')
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  49 | 
  50 |     await monkeyClick(page, 30)
  51 |     await monkeyType(page, 10)
  52 |     await monkeyScroll(page, 10)
  53 | 
  54 |     // يجب ألا يكون هناك أخطاء في console
  55 |     const consoleErrors: string[] = []
  56 |     page.on('console', (msg: { type: () => string; text: () => string }) => {
  57 |       if (msg.type() === 'error') consoleErrors.push(msg.text())
  58 |     })
  59 | 
  60 |     await page.waitForTimeout(500)
  61 |     expect(consoleErrors.length).toBeLessThan(5) // يسمح ببعض الأخطاء
  62 |   })
  63 | 
  64 |   test('survives rapid tab switching and resizing', async ({ page }) => {
  65 |     const routes = [
  66 |       '/physics/mechanics/collision',
  67 |       '/physics/mechanics/freefall',
  68 |       '/physics/mechanics/spring',
  69 |       '/physics/mechanics/pendulum',
  70 |       '/physics/mechanics/analysis-calc',
  71 |       '/chemistry',
  72 |     ]
  73 | 
  74 |     const pageErrors: string[] = []
  75 |     page.on('pageerror', (err: { message: string }) => pageErrors.push(err.message))
  76 | 
  77 |     for (let i = 0; i < 10; i++) {
  78 |       const route = routes[randomInt(0, routes.length - 1)]
  79 |       await page.goto(route)
  80 |       await page.waitForLoadState('networkidle')
  81 |       await monkeyResize(page, 2)
  82 |       await monkeyClick(page, 5)
  83 |       await page.waitForTimeout(100)
  84 |     }
  85 | 
  86 |     expect(pageErrors.filter(e => e.includes('undefined') || e.includes('null'))).toHaveLength(0)
  87 |   })
  88 | })
  89 | 
```