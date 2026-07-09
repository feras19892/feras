const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.turbo', 'dist', '.next', 'build',
  '.vite-inspect', 'resources', '.turbo', 'coverage', '.nyc_output',
  '.cache', 'out', 'tmp', 'temp', '__pycache__',
]);

const EXCLUDE_FILES = [
  /^\./,           // hidden files
  /\.map$/,        // source maps
  /\.d\.ts$/,      // declaration files
  /\.zst$/,        // turbo cache
  /-manifest\.json$/, // turbo manifest
  /^\d+\w+\.json$/, // turbo hash files
  /\.png$/,         // screenshots
  /\.jpg$/,         // images
  /\.jpeg$/,        // images
  /\.webp$/,        // images
  /\.svg$/,         // svgs
  /\.woff2?$/,      // fonts
  /\.ttf$/,         // fonts
  /\.mp4$/,         // videos
  /\.mp3$/,         // audio
  /\.mjs$/,         // generated mjs
  /timestamp.*\.mjs$/, // vite timestamp
];

const MAX_DEPTH = 99;
const MAX_FILES_PER_DIR = 100;

function shouldSkipFile(name) {
  return EXCLUDE_FILES.some(p => p.test(name));
}

function shouldSkipDir(name) {
  return EXCLUDE_DIRS.has(name);
}

function walk(dir, prefix = '', depth = 0) {
  if (depth > MAX_DEPTH) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = [];
  const files = [];

  for (const e of entries) {
    if (shouldSkipFile(e.name)) continue;
    if (e.isDirectory()) {
      if (!shouldSkipDir(e.name)) dirs.push(e);
    } else {
      files.push(e);
    }
  }

  dirs.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));

  const lines = [];
  const all = [...dirs, ...files];
  const total = all.length;

  for (let i = 0; i < total; i++) {
    const e = all[i];
    const isLast = i === total - 1;
    const branch = isLast ? '`-- ' : '|-- ';
    const nextPrefix = isLast ? prefix + '    ' : prefix + '|   ';

    if (e.isDirectory()) {
      lines.push(prefix + branch + e.name + '/');
      const subLines = walk(path.join(dir, e.name), nextPrefix, depth + 1);
      lines.push(...subLines);
    } else {
      lines.push(prefix + branch + e.name);
    }
  }

  return lines;
}

const root = process.argv[2] || '.';
const absRoot = path.resolve(root);
const name = path.basename(absRoot);

const lines = [name + '/'];
lines.push(...walk(absRoot));

console.log(lines.join('\n'));
