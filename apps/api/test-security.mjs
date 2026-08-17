import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Start server
const server = spawn('node', ['../../node_modules/tsx/dist/cli.mjs', 'src/index.ts'], {
  cwd: 'c:/Users/feras/Desktop/feras/apps/api',
  stdio: 'pipe',
});

await setTimeout(2000);

async function curl(args) {
  return new Promise((resolve) => {
    const proc = spawn('curl', ['-s', '-I', ...args, 'http://localhost:3000/api/health'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.on('close', () => resolve(out));
  });
}

console.log('=== Test 1: CORS allowed origin ===');
const r1 = await curl(['-H', 'Origin: http://localhost:5173']);
console.log(r1.includes('access-control-allow-origin: http://localhost:5173') ? 'PASS' : 'FAIL');

console.log('\n=== Test 2: CORS blocked origin ===');
const r2 = await curl(['-H', 'Origin: https://evil.com']);
console.log(!r2.includes('access-control-allow-origin') ? 'PASS (no CORS header for evil)' : 'FAIL');

console.log('\n=== Test 3: Security headers ===');
const r3 = await curl([]);
const checks = [
  ['X-Frame-Options: DENY', r3.includes('x-frame-options: DENY')],
  ['X-Content-Type-Options: nosniff', r3.includes('x-content-type-options: nosniff')],
  ['Referrer-Policy', r3.includes('referrer-policy')],
];
for (const [name, ok] of checks) {
  console.log(ok ? `PASS: ${name}` : `FAIL: ${name}`);
}

server.kill();
process.exit(0);
