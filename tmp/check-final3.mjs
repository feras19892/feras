async function check() {
  try {
    const r = await fetch('https://mighty-prairie-strengthen-disclaimer.trycloudflare.com', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }
    });
    console.log('Status:', r.status);
    const text = await r.text();
    console.log('Length:', text.length);
    console.log('Has HTML:', text.includes('<div id="app">') || text.includes('<script'));
    console.log('First 150:', text.substring(0, 150));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
check();
