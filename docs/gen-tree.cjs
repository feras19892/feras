// يولّد docs/PROJECT-TREE.txt من الملفات المتتبعة في git فقط
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const EXCLUDE = /^\.turbo\/|\/node_modules\/|\/dist\/|\/data\/|\/backups\/|\.db(-|\.|$)|\.db-(shm|wal)$|coverage\//;

const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((f) => !f.startsWith('docs/PROJECT-TREE.txt') && f !== 'docs/gen-tree.cjs')
  .filter((f) => !EXCLUDE.test(f))
  .sort();

const tree = {};
for (const file of files) {
  const parts = file.split('/');
  let node = tree;
  for (const part of parts) {
    node = node[part] = node[part] || {};
  }
}

const lines = ['feras/'];
function walk(node, prefix) {
  const entries = Object.keys(node).sort((a, b) => {
    const aDir = Object.keys(node[a]).length > 0;
    const bDir = Object.keys(node[b]).length > 0;
    if (aDir !== bDir) return aDir ? -1 : 1; // المجلدات أولاً
    return a.localeCompare(b);
  });
  entries.forEach((name, i) => {
    const last = i === entries.length - 1;
    const connector = last ? '└── ' : '├── ';
    const isDir = Object.keys(node[name]).length > 0;
    lines.push(prefix + connector + name + (isDir ? '/' : ''));
    if (isDir) walk(node[name], prefix + (last ? '    ' : '│   '));
  });
}
walk(tree, '');

const header = `# شجرة المشروع — مُولَّدة تلقائياً من الملفات المتتبعة في git\n# التاريخ: ${new Date().toISOString().slice(0, 10)} — الملفات: ${files.length}\n\n`;
fs.writeFileSync(path.join(__dirname, 'PROJECT-TREE.txt'), header + lines.join('\n') + '\n', 'utf8');
console.log(`PROJECT-TREE.txt written: ${lines.length} lines, ${files.length} files`);
