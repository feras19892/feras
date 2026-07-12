import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:5173/math');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'math-v1-home.png' });

  await page.goto('http://localhost:5173/math/algebra');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'math-v1-branch.png' });

  await page.goto('http://localhost:5173/math/algebra/linear-equation');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'math-v1-equation.png' });

  await browser.close();
})();
