const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.turbo', '.git', 'dist', '.next', 'build', '.vite-inspect'].includes(entry.name)) continue;
      walk(full, files);
    } else if (entry.isFile()) {
      if (/\.(ts|tsx|js|mjs|cjs)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        files.push(full);
      }
    }
  }
  return files;
}

const PROJECT_ROOT = 'c:/Users/feras/Desktop/feras';
const allFiles = walk(PROJECT_ROOT);
const results = allFiles.map(f => {
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split(/\r?\n/).length;
  return { file: f.replace(PROJECT_ROOT + path.sep, '').replace(/\\/g, '/'), lines };
});

results.sort((a, b) => b.lines - a.lines);

console.log('=== TOP 30 LARGEST FILES ===');
results.slice(0, 30).forEach(r => console.log(String(r.lines).padStart(5) + '  ' + r.file));

console.log('\n=== FILES > 300 LINES ===');
const over300 = results.filter(r => r.lines > 300);
if (over300.length === 0) {
  console.log('None found! All files are within limit.');
} else {
  over300.forEach(r => console.log(String(r.lines).padStart(5) + '  ' + r.file));
}

console.log('\n=== TOTAL FILES:', results.length, '===');
console.log('=== FILES > 300:', over300.length, '===');
