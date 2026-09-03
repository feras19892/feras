import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.setTimeout(600_000);

const ROLES = [
  {
    name: 'school',
    loginPath: '/school/login',
    emailSelector: 'input[type="email"]',
    email: 'school1@test.com',
    password: 'Test1234!',
  },
  {
    name: 'teacher',
    loginPath: '/login',
    emailSelector: 'input[name="email"], input[type="email"]',
    email: 'school1_teacher1@test.com',
    password: 'Test1234!',
  },
  {
    name: 'student',
    loginPath: '/login',
    emailSelector: 'input[name="email"], input[type="email"]',
    email: 'school1_t1_student1@test.com',
    password: 'Test1234!',
  },
];

function getTopLevelRoutes(): string[] {
  const routesFile = fs.readFileSync(path.resolve('src', 'router', 'routes.ts'), 'utf-8');
  const paths = new Set<string>();
  const regex = /path:\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(routesFile)) !== null) {
    const p = match[1];
    if (p.startsWith('/')) paths.add(p);
  }
  return [...paths]
    .filter((p) => p !== '*' && p !== '/')
    .sort();
}

async function login(page: any, role: any) {
  await page.goto(role.loginPath);
  await page.locator(role.emailSelector).first().fill(role.email);
  await page.locator('input[type="password"]').first().fill(role.password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(1500);
}

function attachListeners(page: any, bucket: any[]) {
  page.on('pageerror', (err: any) => bucket.push({ type: 'pageerror', message: err.message }));
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') bucket.push({ type: 'console', text: msg.text() });
  });
  page.on('response', (res: any) => {
    if (res.status() >= 500) {
      bucket.push({
        type: 'server',
        url: res.url(),
        status: res.status(),
        method: res.request().method(),
      });
    }
  });
}

test('Comprehensive button crawl report', async ({ browser }) => {
  const routes = getTopLevelRoutes();
  const report: Record<string, any[]> = {};

  // Public (no login) crawl
  const publicCtx = await browser.newContext();
  const publicPage = await publicCtx.newPage();
  const publicIssues: any[] = [];
  attachListeners(publicPage, publicIssues);

  for (const route of routes) {
    const before = publicIssues.length;
    await publicPage.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
    await publicPage.waitForTimeout(400);
    await publicPage.evaluate(() => {
      document.querySelectorAll('button, [role="button"], .btn, .btn-submit').forEach((el) => {
        try { (el as HTMLElement).click(); } catch { void 0; }
      });
    });
    await publicPage.waitForTimeout(800);
    const collected = publicIssues.slice(before);
    report[`public:${route}`] = collected.length ? collected : [];
  }
  await publicCtx.close();

  // Authenticated role crawls
  for (const role of ROLES) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const issues: any[] = [];
    attachListeners(page, issues);
    await login(page, role);

    for (const route of routes) {
      const before = issues.length;
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(400);
      await page.evaluate(() => {
        document.querySelectorAll('button, [role="button"], .btn, .btn-submit').forEach((el) => {
          try { (el as HTMLElement).click(); } catch { void 0; }
        });
      });
      await page.waitForTimeout(800);
      const collected = issues.slice(before);
      report[`${role.name}:${route}`] = collected.length ? collected : [];
    }
    await ctx.close();
  }

  const outDir = path.resolve('test-results');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'button-crawl-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');

  const totalErrors = Object.values(report).reduce((sum, arr) => sum + arr.length, 0);
  const failing = Object.entries(report)
    .filter(([, arr]) => arr.length > 0)
    .map(([k]) => k);

  console.log(`\n=== Button Crawl Summary ===`);
  console.log(`Routes checked: ${routes.length} x 4 contexts`);
  console.log(`Total issues: ${totalErrors}`);
  if (failing.length) {
    console.log('Contexts with issues:', failing.join(', '));
  } else {
    console.log('No issues found.');
  }
  console.log(`Report written to: ${outFile}\n`);
});
