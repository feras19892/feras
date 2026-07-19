const http = require('http');
const options = {
  hostname: '127.0.0.1',
  port: 5180,
  path: '/',
  headers: { 'Host': 'keep-girls-rush-induced.trycloudflare.com' }
};
http.get(options, (r) => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => console.log('Status:', r.statusCode, 'Length:', d.length, 'HTML:', d.includes('<script')));
}).on('error', e => console.log('Err:', e.message));
