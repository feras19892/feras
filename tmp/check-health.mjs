async function check() {
  try {
    const r = await fetch('http://localhost:3000/api/health');
    const d = await r.json();
    console.log('API:', JSON.stringify(d));
  } catch (e) {
    console.log('API down:', e.message);
  }
}
check();
