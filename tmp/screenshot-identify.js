const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8008/identify-meshes.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:/Users/feras/Desktop/feras/tmp/identify-meshes.png' });
  console.log('screenshot saved');
  await browser.close();
})();
