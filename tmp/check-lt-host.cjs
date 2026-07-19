const http = require('http');
const options = {
  hostname: '127.0.0.1',
  port: 5173,
  path: '/',
  headers: { 'Host': 'forty-zoos-peel.loca.lt' }
};
http.get(options, (r) => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('Status:', r.statusCode);
    console.log('Length:', d.length);
    console.log('First 300:', d.substring(0, 300));
  });
}).on('error', e => console.log('Err:', e.message));
