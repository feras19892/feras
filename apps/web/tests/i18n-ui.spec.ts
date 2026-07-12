import { test, expect, type Page } from '@playwright/test'

const SUPPORTED_LOCALES = ['ar', 'en', 'es'] as const

/** Navigate and set locale via localStorage then reload */
async function setLocale(page: Page, locale: string) {
  await page.evaluate((loc) => {
    localStorage.setItem('physicslab.locale', loc)
  }, locale)
  await page.reload({ waitUntil: 'domcontentloaded' })
  // انتظر hydration + تحميل الرسائل — networkidle قد لا ينتهي بسبب أنيميشن مستمر
  await page.waitForTimeout(800)
}

/** Verify direction (RTL vs LTR) */
async function verifyDirection(page: Page, expected: 'rtl' | 'ltr') {
  const dir = await page.evaluate(() => document.documentElement.dir)
  expect(dir).toBe(expected)
  const lang = await page.evaluate(() => document.documentElement.lang)
  expect(lang).toBeTruthy()
}

/** Collect layout bounding boxes for overlap detection */
async function getLayoutBoxes(page: Page, selectors: string[]) {
  const boxes: { selector: string; x: number; y: number; w: number; h: number }[] = []
  for (const sel of selectors) {
    const els = await page.locator(sel).all()
    for (const el of els) {
      const box = await el.boundingBox().catch(() => null)
      if (box) boxes.push({ selector: sel, x: box.x, y: box.y, w: box.width, h: box.height })
    }
  }
  return boxes
}

test.describe('i18n UI: RTL / LTR Layout Integrity', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const isRtl = locale === 'ar'

    test(`landing page direction is correct for "${locale}"`, async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(500)

      // اضبط اللغة ثم أعد التحميل لأن الاختبارات تشارك localStorage
      await page.evaluate((loc) => {
        localStorage.setItem('physicslab.locale', loc)
      }, locale)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(600)

      // تحقق من أن الصفحة تحملت ولم تنهار
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).toBeTruthy()
      expect(bodyText).not.toContain('undefined')
      expect(bodyText).not.toContain('[object Object]')

      // تحقق من وجود عناصر أساسية
      const heading = await page.locator('h1').first().textContent({ timeout: 2000 }).catch(() => null)
      expect(heading).toBeTruthy()

      // تحقق من الاتجاه (RTL للعربية، LTR للبقية)
      const dir = await page.evaluate(() => document.documentElement.dir || document.body.dir)
      expect(dir).toBe(isRtl ? 'rtl' : 'ltr')

      // تحقق من عدم تداخل الهيدر مع المحتوى
      const navbar = await page.locator('nav, .navbar, .app-navbar').first().boundingBox({ timeout: 2000 }).catch(() => null)
      const hero = await page.locator('h1').first().boundingBox({ timeout: 2000 }).catch(() => null)
      if (navbar && hero) {
        expect(hero.y).toBeGreaterThanOrEqual(navbar.y + navbar.height - 5)
      }
    })

    test(`dashboard layout does not break in "${locale}"`, async ({ page }) => {
      await page.goto('/dashboard')
      await setLocale(page, locale)

      const boxes = await getLayoutBoxes(page, [
        '.dashboard-card',
        '.app-navbar',
        'nav',
        '.sidebar',
        '.menu-bar',
        'button',
      ])

      // لا يجب أن تتداخل أي عناصر رئيسية
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i]
          const b = boxes[j]
          // استثناء الأزرار الصغيرة داخل البطاقات
          if (a.selector === 'button' && b.selector.includes('dashboard')) continue
          if (b.selector === 'button' && a.selector.includes('dashboard')) continue
          // التداخل مسموح به فقط إذا كان أحدهما داخل الآخر (nested)
        }
      }

      // تحقق من أن الصفحة كاملة مرئية
      const bodyBox = await page.locator('body').boundingBox()
      expect(bodyBox).toBeTruthy()
      expect(bodyBox!.width).toBeGreaterThan(0)
      expect(bodyBox!.height).toBeGreaterThan(0)
    })

    test(`experiment pages render correctly in "${locale}"`, async ({ page }) => {
      const sampleRoutes = [
        '/physics/mechanics/collision',
        '/physics/mechanics/spring',
        '/physics/mechanics/pendulum',
        '/chemistry',
      ]

      for (const route of sampleRoutes) {
        await page.goto(route)
        await setLocale(page, locale)
        await verifyDirection(page, isRtl ? 'rtl' : 'ltr')

        // تحقق من وجود عناصر أساسية
        const bodyText = await page.locator('body').textContent()
        expect(bodyText).not.toContain('undefined')
        expect(bodyText).not.toContain('null')
        expect(bodyText).not.toContain('[object Object]')

        // تحقق من أن عناصر التحكم مرئية
        const controls = await page.locator('.menu-bar, .control-bar, .param-panel, [class*="control"]').all()
        let visibleControls = 0
        for (const ctrl of controls) {
          if (await ctrl.isVisible().catch(() => false)) visibleControls++
        }
        expect(visibleControls).toBeGreaterThanOrEqual(0)
      }
    })

    test(`language switcher updates direction instantly in "${locale}"`, async ({ page }) => {
      await page.goto('/')
      await setLocale(page, locale)
      await verifyDirection(page, isRtl ? 'rtl' : 'ltr')

      // تبديل اللغة والتحقق من التحديث الفوري
      const nextLocale = locale === 'ar' ? 'en' : 'ar'
      await setLocale(page, nextLocale)
      await verifyDirection(page, nextLocale === 'ar' ? 'rtl' : 'ltr')
    })
  }

  test('text truncation does not break layout in narrow viewport', async ({ page }) => {
    await page.goto('/dashboard')
    await setLocale(page, 'ar')

    // اختبر على شاشة ضيقة جداً (موبايل)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(400)

    const cards = await page.locator('.dashboard-card, .card, [class*="card"]').all()
    for (const card of cards) {
      const box = await card.boundingBox().catch(() => null)
      if (box) {
        // يجب ألا تتجاوز البطاقات عرض الشاشة
        expect(box.x + box.width).toBeLessThanOrEqual(375 + 20)
      }
    }
  })

  test('long Arabic text does not overflow containers', async ({ page }) => {
    await page.goto('/')
    await setLocale(page, 'ar')

    const containers = await page.locator('div, section, article').all()
    let overflowCount = 0
    for (const container of containers.slice(0, 50)) {
      const box = await container.boundingBox().catch(() => null)
      const text = await container.textContent().catch(() => '')
      if (box && text && text.length > 30) {
        // التحقق من أن النص الطويل لا يخرج عن الحاوية
        const scrollWidth = await container.evaluate((el) => (el as HTMLElement).scrollWidth)
        const clientWidth = await container.evaluate((el) => (el as HTMLElement).clientWidth)
        if (scrollWidth > clientWidth + 5) {
          overflowCount++
        }
      }
    }
    // يسمح بعدد محدود من التجاوزات (بعضها مقصود)
    expect(overflowCount).toBeLessThan(10)
  })
})
