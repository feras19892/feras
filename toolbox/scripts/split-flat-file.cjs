const fs = require('fs');

const file = process.argv[2];
const splitLine = parseInt(process.argv[3]); // 1-indexed line to split AFTER

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find the export variable name from first line
const firstLine = lines[0];
const match = firstLine.match(/export const (\w+) = \{/);
if (!match) {
  console.error('Could not find export const in first line');
  process.exit(1);
}
const varName = match[1];
const varNameB = varName + '_b';

// Calculate depth at the split point
const splitIdx = splitLine; // 0-indexed
let depthAtSplit = 0;
for (let i = 0; i < splitIdx; i++) {
  for (const ch of lines[i]) {
    if (ch === '{') depthAtSplit++;
    if (ch === '}') depthAtSplit--;
  }
}

// Part A: lines[0..splitIdx-1]
// Need to close (depthAtSplit - 1) extra braces before the final } as const
let partA = lines.slice(0, splitIdx).join('\n');
for (let d = depthAtSplit; d > 1; d--) {
  partA += '\n  },';
}
partA += '\n} as const\n';

// Part B: starts with export const, then lines[splitIdx..end-1] (skip final } as const)
// The content was at depth depthAtSplit in original, but now starts at depth 1
// Need to remove (depthAtSplit - 1) closing braces from the end
const bContent = lines.slice(splitIdx, lines.length - 1); // skip last line (} as const)
let extraBraces = depthAtSplit - 1;
let bLines = [...bContent];
for (let i = bLines.length - 1; i >= 0 && extraBraces > 0; i--) {
  const trimmed = bLines[i].trim();
  if (trimmed === '},') {
    bLines.splice(i, 1);
    extraBraces--;
  } else if (trimmed === '}') {
    bLines.splice(i, 1);
    extraBraces--;
  } else {
    break;
  }
}

const partB = `export const ${varNameB} = {\n` + bLines.join('\n') + '\n} as const\n';

const baseName = file.replace(/\.ts$/, '');
const fileA = baseName + '_a.ts';
const fileB = baseName + '_b.ts';

fs.writeFileSync(fileA, partA, 'utf8');
fs.writeFileSync(fileB, partB, 'utf8');

console.log('Created ' + fileA + ' (' + partA.split('\n').length + ' lines)');
console.log('Created ' + fileB + ' (' + partB.split('\n').length + ' lines)');
console.log('Split depth: ' + depthAtSplit);
