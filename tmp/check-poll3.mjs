async function check() {
  const url = 'https://fine-certified-social-collins.trycloudflare.com';
  for (let i = 0; i < 6; i++) {
    await new Promise(r => setTimeout(r, 8000));
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }
      });
      const text = await r.text();
      console.log(`Attempt ${i+1}: Status ${r.status}, Length ${text.length}, HTML: ${text.includes('<script') || text.includes('<div')}`);
      if (r.status === 200 && text.length > 100) {
        console.log('SUCCESS!');
        break;
      }
    } catch (e) {
      console.log(`Attempt ${i+1}: ${e.message}`);
    }
  }
}
check();
