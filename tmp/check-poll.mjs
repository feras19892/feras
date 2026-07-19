async function check() {
  const url = 'https://statutory-double-phase-crossing.trycloudflare.com';
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 10000));
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' },
        redirect: 'manual'
      });
      console.log(`Attempt ${i+1}: Status ${r.status}, Length ${(await r.text()).length}`);
      if (r.status === 200) {
        console.log('SUCCESS!');
        break;
      }
    } catch (e) {
      console.log(`Attempt ${i+1}: ${e.message}`);
    }
  }
}
check();
