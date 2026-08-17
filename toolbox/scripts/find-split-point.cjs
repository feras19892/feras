const fs = require('fs');
const file = process.argv[2];
const targetLines = parseInt(process.argv[3]) || 400;

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

let depth = 0;
let bestLine = -1;
let bestDiff = Infinity;

for (let i = 0; i < lines.length - 1; i++) {
  for (const ch of lines[i]) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  // Look for lines where depth returns to 1 (top-level key boundary)
  // and the next line starts a new key
  if (depth === 1 && i + 1 < lines.length) {
    const nextLine = lines[i + 1].trim();
    if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('}')) {
      const diff = Math.abs(i - targetLines);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestLine = i;
      }
    }
  }
}

if (bestLine === -1) {
  console.error('No safe split point found');
  process.exit(1);
}

console.log('Safe split at line ' + (bestLine + 1) + ' (depth=1)');
console.log('Line content: ' + lines[bestLine].trim().substring(0, 80));
