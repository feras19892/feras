import { test } from '@playwright/test';

test.setTimeout(120_000);

async function login(page: any, email: string) {
  await page.goto('/login');
  await page.locator('input[name="email"], input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill('Test1234!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(1200);
}

function attach(page: any) {
  page.on('pageerror', (err: any) => {
    console.log('=== PAGEERROR ===');
    console.log(err.message);
    console.log(err.stack);
    console.log('=================');
  });
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      console.log('=== CONSOLE ERROR ===', msg.text());
    }
  });
  page.on('response', (res: any) => {
    if (res.status() === 403) {
      console.log('=== 403 ===', res.request().method(), res.url());
    }
  });
}

test('Debug /biology page 403s for student', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  attach(page);
  await login(page, 'school1_t1_student1@test.com');
  await page.goto('/biology', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    document.querySelectorAll('button, [role="button"], .btn, .btn-submit').forEach((el) => {
      try { (el as HTMLElement).click(); } catch { void 0; }
    });
  });
  await page.waitForTimeout(1500);
  await ctx.close();
});

test('Debug /biology/cell/plant-cell page error for student', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  attach(page);
  await login(page, 'school1_t1_student1@test.com');
  await page.goto('/biology/cell/plant-cell', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('button, [role="button"], .btn, .btn-submit').forEach((el) => {
      try { (el as HTMLElement).click(); } catch { void 0; }
    });
  });
  await page.waitForTimeout(1500);
  await ctx.close();
});
