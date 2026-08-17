const fs = require('fs');
const path = require('path');

function walk(dir, exts) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.turbo', 'dist', '.vite-inspect', 'tmp'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full, exts));
    } else if (exts.some(e => entry.name.endsWith(e))) {
      const lines = fs.readFileSync(full, 'utf8').split('\n').length;
      if (lines > 300) results.push({ file: full.replace(/\\/g, '/'), lines });
    }
  }
  return results;
}

const files = walk('.', ['.ts', '.vue', '.js', '.mjs']).sort((a, b) => a.lines - b.lines);
for (const f of files) console.log(f.lines + '  ' + f.file);
