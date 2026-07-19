const http = require('http');
http.get('http://127.0.0.1:4040/api/tunnels', (r) => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    try {
      const data = JSON.parse(d);
      const tunnels = data.tunnels || [];
      tunnels.forEach(t => console.log(t.public_url));
    } catch(e) {
      console.log('Parse error:', e.message);
    }
  });
}).on('error', e => console.log('Err:', e.message));
