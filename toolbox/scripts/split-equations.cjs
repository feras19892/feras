const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const srcFileName = args[0] || 'equations-advanced';
const srcFile = path.join(__dirname, '..', '..', 'apps', 'web', 'src', 'pages', 'math', `${srcFileName}.ts`);
const outDir = path.join(__dirname, '..', '..', 'apps', 'web', 'src', 'pages', 'math', srcFileName);

const content = fs.readFileSync(srcFile, 'utf8');

// Extract export const name
const exportMatch = content.match(/export\s+const\s+(\w+):/);
const exportName = exportMatch ? exportMatch[1] : srcFileName.replace(/-/g, '_');

// Extract imports
const importMatch = content.match(/^([\s\S]*?)export\s+const/s);
const imports = importMatch ? importMatch[1].trim() : '';

// Extract array content between first [ and last ]
const arrayStart = content.indexOf('[');
const arrayEnd = content.lastIndexOf(']');
const arrayContent = content.substring(arrayStart + 1, arrayEnd);

// Split into equation objects
const lines = arrayContent.split('\n');
const equations = [];
let current = null;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (current === null && /^  \{/.test(line)) {
    current = [line];
    depth = 1;
    continue;
  }

  if (current !== null) {
    current.push(line);
    for (const ch of trimmed) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    if (depth <= 0) {
      equations.push(current.join('\n'));
      current = null;
    }
  }
}

console.log(`Found ${equations.length} equations in ${srcFileName}`);

// Group by branchId
const byBranch = {};
for (const eq of equations) {
  const match = eq.match(/branchId:\s*'([^']+)'/);
  const branch = match ? match[1] : 'other';
  if (!byBranch[branch]) byBranch[branch] = [];
  byBranch[branch].push(eq);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Determine import paths (relative from outDir to math-types and math-utils)
const relImport = '..';

// Write each branch file
const branchOrder = Object.keys(byBranch).sort();

for (const branch of branchOrder) {
  const eqs = byBranch[branch];
  const safeName = branch.replace(/-/g, '_');
  const fileName = `${branch}.ts`;
  const filePath = path.join(outDir, fileName);

  // Extract the specific imports needed
  const fileContent = `import type { Equation } from '${relImport}/math-types';
import { fmt, parseNumbers, toRad, toDeg } from '${relImport}/math-utils';

export const ${exportName}_${safeName}: Equation[] = [
${eqs.map(e => e.replace(/,\s*$/, '').trim()).join(',\n')}
];
`;

  fs.writeFileSync(filePath, fileContent);
  console.log(`  ${fileName}: ${eqs.length} equations`);
}

// Write index file
const imports_list = branchOrder
  .map(b => `import { ${exportName}_${b.replace(/-/g, '_')} } from './${b}';`);

const spreads = branchOrder
  .map(b => `  ...${exportName}_${b.replace(/-/g, '_')},`);

const indexContent = `import type { Equation } from '${relImport}/math-types';
${imports_list.join('\n')}

export const ${exportName}: Equation[] = [
${spreads.join('\n')}
];
`;

fs.writeFileSync(path.join(outDir, 'index.ts'), indexContent);
console.log(`  index.ts: re-exports all`);

const totalCount = branchOrder.reduce((sum, b) => sum + (byBranch[b]?.length || 0), 0);
console.log(`Total: ${totalCount} equations (expected ${equations.length})`);
