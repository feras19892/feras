import { test, expect } from '@playwright/test';

test.describe('School login flow', () => {
  test('School admin can log in and view dashboard', async ({ page }) => {
    await page.goto('/school/login');
    await page.locator('input[type="email"]').fill('school1@test.com');
    await page.locator('input[type="password"]').fill('Test1234!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/school', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-admin-shell]')).toBeVisible({ timeout: 15000 });
  });
});
