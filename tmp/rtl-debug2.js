const { chromium } = require('../node_modules/playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  const t0 = await p.evaluate(() => getComputedStyle(document.documentElement).transform);
  console.log('t=0', t0);
  await p.waitForTimeout(200);
  console.log('t=200', await p.evaluate(() => getComputedStyle(document.documentElement).transform));
  await p.waitForTimeout(500);
  console.log('t=700', await p.evaluate(() => getComputedStyle(document.documentElement).transform));
  await p.waitForTimeout(1000);
  console.log('t=1700', await p.evaluate(() => getComputedStyle(document.documentElement).transform));

  // Inspect all stylesheets for a rule targeting html with transform
  const rules = await p.evaluate(() => {
    const found = [];
    for (const sheet of document.styleSheets) {
      let rulesList;
      try { rulesList = sheet.cssRules; } catch (e) { continue; }
      for (const r of rulesList) {
        if (r.selectorText && /html/i.test(r.selectorText) && r.style && r.style.transform) {
          found.push({ selector: r.selectorText, transform: r.style.transform, href: sheet.href });
        }
      }
    }
    return found;
  });
  console.log('rules', JSON.stringify(rules, null, 2));

  // check inline style attribute on html
  console.log('inline style', await p.evaluate(() => document.documentElement.getAttribute('style')));

  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
