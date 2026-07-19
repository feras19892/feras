async function check() {
  try {
    const r = await fetch('http://localhost:5173', { headers: { 'Host': 'physlab.ferasapp.uk' } });
    console.log('Local status:', r.status);
    const text = await r.text();
    console.log('Has HTML:', text.includes('<div id="app">') || text.includes('<script'));
  } catch (e) {
    console.log('Local error:', e.message);
  }

  try {
    const r2 = await fetch('https://physlab.ferasapp.uk');
    console.log('Remote status:', r2.status);
    const text2 = await r2.text();
    console.log('Has HTML:', text2.includes('<div id="app">') || text2.includes('<script'));
  } catch (e) {
    console.log('Remote error:', e.message);
  }
}
check();
