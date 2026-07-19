const http = require('http');
http.get('http://127.0.0.1:5173', (r) => {
  console.log('127.0.0.1:', r.statusCode);
}).on('error', (e) => console.log('127.0.0.1 err:', e.message));
