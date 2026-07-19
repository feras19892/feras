const http = require('http');
http.get('http://127.0.0.1:20241/metrics', (r) => {
  let data = '';
  r.on('data', (c) => data += c);
  r.on('end', () => {
    const lines = data.split('\n').filter(l => l.includes('total_requests') || l.includes('ha_connections') || l.includes('register_success'));
    console.log(lines.join('\n'));
  });
}).on('error', (e) => console.log('err:', e.message));
