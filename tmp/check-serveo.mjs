async function check() {
  const url = 'https://7c5129732b15ef0c-89-44-57-31.serveousercontent.com';
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }
    });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Length:', text.length);
    console.log('HTML:', text.includes('<script') || text.includes('<div'));
    console.log('First 200:', text.substring(0, 200));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
check();
