const { chromium } = require('../node_modules/playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const el = await p.$('.brand-text');
  await el.screenshot({ path: 'C:/Users/feras/Desktop/feras/tmp/brand-text.png' });
  const cs = await p.evaluate(() => {
    const e = document.querySelector('.brand-text');
    const c = getComputedStyle(e);
    const parents = [];
    let node = e;
    while (node) {
      const cc = getComputedStyle(node);
      parents.push({
        tag: node.tagName,
        cls: node.className,
        transform: cc.transform,
        direction: cc.direction,
        unicodeBidi: cc.unicodeBidi,
        writingMode: cc.writingMode,
      });
      node = node.parentElement;
    }
    return parents;
  });
  console.log(JSON.stringify(cs, null, 2));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
