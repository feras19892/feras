const http = require('http');
const options = {
  hostname: '127.0.0.1',
  port: 5173,
  path: '/',
  headers: { 'Host': 'enables-fresh-accurate-reaction.trycloudflare.com' }
};
http.get(options, (r) => {
  let data = '';
  r.on('data', (c) => data += c);
  r.on('end', () => {
    console.log('Status:', r.statusCode);
    console.log('Body length:', data.length);
    console.log('First 200 chars:', data.substring(0, 200));
  });
}).on('error', (e) => console.log('Error:', e.message));
