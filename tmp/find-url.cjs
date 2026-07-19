const { execSync } = require('child_process');
try {
  const out = execSync('pm2 logs tunnel --lines 100 --nostream 2>&1', { encoding: 'utf8' });
  const lines = out.split('\n').filter(l => l.includes('localhost') || l.includes('trycloudflare') || l.includes('http'));
  console.log(lines.join('\n'));
} catch(e) {
  console.log(e.message);
}
