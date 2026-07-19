async function check() {
  try {
    const r = await fetch('https://jury-controller-how-auction.trycloudflare.com');
    console.log('Status:', r.status);
    const text = await r.text();
    console.log('Has HTML:', text.includes('<div id="app">') || text.includes('<script'));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
check();
