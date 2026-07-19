const http = require('http');
http.get('http://127.0.0.1:5173/api/health', (r) => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => console.log('Proxy /api/health:', r.statusCode, d.substring(0, 200)));
}).on('error', e => console.log('Err:', e.message));

http.get('http://127.0.0.1:3000/api/health', (r) => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => console.log('Direct API:', r.statusCode, d.substring(0, 200)));
}).on('error', e => console.log('Direct Err:', e.message));
