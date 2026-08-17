const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', '..', 'apps', 'web', 'src', 'pages', 'math', 'equations-advanced.ts');
const outDir = path.join(__dirname, '..', '..', 'apps', 'web', 'src', 'pages', 'math', 'equations-advanced');

const content = fs.readFileSync(srcFile, 'utf8');

// Extract array content between first [ and last ]
const arrayStart = content.indexOf('[');
const arrayEnd = content.lastIndexOf(']');
const arrayContent = content.substring(arrayStart + 1, arrayEnd);

// Split into equation objects. Each starts with "  {" at line start and ends with "  }," or "  }"
const lines = arrayContent.split('\n');
const equations = [];
let current = null;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Start of a new equation object
  if (current === null && /^  \{/.test(line)) {
    current = [line];
    depth = 1;
    continue;
  }

  if (current !== null) {
    current.push(line);
    // Count braces to track depth
    for (const ch of trimmed) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    // When depth returns to 0, we've closed the equation object
    if (depth <= 0) {
      equations.push(current.join('\n'));
      current = null;
    }
  }
}

console.log(`Found ${equations.length} equations`);

// Group by branchId
const byBranch = {};
for (const eq of equations) {
  const match = eq.match(/branchId:\s*'([^']+)'/);
  const branch = match ? match[1] : 'other';
  if (!byBranch[branch]) byBranch[branch] = [];
  byBranch[branch].push(eq);
}

// Ensure output dir exists
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Write each branch file
const branchOrder = ['electromagnetism', 'electricity', 'heat', 'mechanics', 'waves-optics', 'algebra', 'calculus', 'geometry', 'number-theory', 'statistics', 'trigonometry'];

for (const branch of branchOrder) {
  if (!byBranch[branch]) continue;
  const eqs = byBranch[branch];
  const fileName = `${branch}.ts`;
  const filePath = path.join(outDir, fileName);

  const fileContent = `import type { Equation } from '../math-types';
import { fmt, parseNumbers, toRad, toDeg } from '../math-utils';

export const equationsAdvanced_${branch.replace(/-/g, '_')}: Equation[] = [
${eqs.map(e => e.replace(/,\s*$/, '').trim()).join(',\n')}
];
`;

  fs.writeFileSync(filePath, fileContent);
  console.log(`  ${fileName}: ${eqs.length} equations`);
}

// Write index file
const imports = branchOrder
  .filter(b => byBranch[b])
  .map(b => `import { equationsAdvanced_${b.replace(/-/g, '_')} } from './${b}';`);

const spreads = branchOrder
  .filter(b => byBranch[b])
  .map(b => `  ...equationsAdvanced_${b.replace(/-/g, '_')},`);

const indexContent = `import type { Equation } from '../math-types';
${imports.join('\n')}

export const equationsAdvanced: Equation[] = [
${spreads.join('\n')}
];
`;

const indexPath = path.join(outDir, 'index.ts');
fs.writeFileSync(indexPath, indexContent);
console.log(`  index.ts: re-exports all`);

// Verify total count
const totalCount = branchOrder.reduce((sum, b) => sum + (byBranch[b]?.length || 0), 0);
console.log(`Total: ${totalCount} equations (expected ${equations.length})`);
