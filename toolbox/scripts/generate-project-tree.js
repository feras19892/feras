#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT = path.join(ROOT, 'PROJECT_TREE_LATEST.md');

const EXCLUDED = new Set([
  '.git',
  'node_modules',
  '.turbo',
  '.vite-inspect',
  'dist',
  'build',
  'coverage',
  '.DS_Store',
  'Thumbs.db',
]);

function shouldInclude(name) {
  return !EXCLUDED.has(name) && !name.endsWith('.zst') && !name.endsWith('.tar');
}

function getSize(file) {
  try {
    const stats = fs.statSync(file);
    if (stats.isDirectory()) return null;
    if (stats.size < 1024) return `${stats.size}B`;
    if (stats.size < 1024 * 1024) return `${Math.round(stats.size / 1024)}KB`;
    return `${(stats.size / (1024 * 1024)).toFixed(1)}MB`;
  } catch {
    return null;
  }
}

function walk(dir, prefix = '', isLast = true, lines = []) {
  let items;
  try {
    items = fs.readdirSync(dir).filter(shouldInclude).sort((a, b) => {
      const aPath = path.join(dir, a);
      const bPath = path.join(dir, b);
      const aDir = fs.statSync(aPath).isDirectory();
      const bDir = fs.statSync(bPath).isDirectory();
      if (aDir && !bDir) return -1;
      if (!aDir && bDir) return 1;
      return a.localeCompare(b);
    });
  } catch (err) {
    return lines;
  }

  items.forEach((name, index) => {
    const fullPath = path.join(dir, name);
    const last = index === items.length - 1;
    const branch = last ? '└── ' : '├── ';
    const size = getSize(fullPath);
    const sizeLabel = size ? ` (${size})` : '';
    lines.push(`${prefix}${branch}${name}${sizeLabel}`);

    if (fs.statSync(fullPath).isDirectory()) {
      const newPrefix = prefix + (last ? '    ' : '│   ');
      walk(fullPath, newPrefix, last, lines);
    }
  });

  return lines;
}

const lines = [
  '# شجرة المشروع التفصيلية',
  `## تاريخ التحديث: ${new Date().toLocaleString('ar-SA')}`,
  '',
  '```',
  path.basename(ROOT) + '/',
  ...walk(ROOT),
  '```',
];

fs.writeFileSync(OUTPUT, lines.join('\n') + '\n', 'utf8');
console.log(`Tree written to: ${OUTPUT}`);
console.log(`Total lines: ${lines.length}`);
