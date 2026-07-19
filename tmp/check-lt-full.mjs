async function check() {
  const url = 'https://forty-zoos-peel.loca.lt';
  try {
    // Get the HTML
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }
    });
    const text = await r.text();
    console.log('HTML Status:', r.status, 'Length:', text.length);
    
    // Check if it's the localtunnel warning page
    if (text.includes('Tunnel website ahead') || text.includes('Click to continue')) {
      console.log('Got localtunnel warning page - need to bypass');
      // Try with bypass header
      const r2 = await fetch(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
          'bypass-tunnel-reminder': 'true'
        }
      });
      const text2 = await r2.text();
      console.log('Bypassed Status:', r2.status, 'Length:', text2.length);
      console.log('Has app:', text2.includes('<div id="app">'));
    } else {
      console.log('Has app div:', text.includes('<div id="app">'));
      // Try loading the vite client
      const r3 = await fetch(url + '/@vite/client', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log('Vite client status:', r3.status);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
check();
