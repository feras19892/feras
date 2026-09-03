import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLocaleMessages } from '../locales';
import { loadExperimentMessages } from '../locales/experiments/index';

function getKeys(obj: unknown, prefix = ''): string[] {
  const keys: string[] = [];
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0) {
        keys.push(...getKeys(v, path));
      } else {
        keys.push(path);
      }
    }
  }
  return keys;
}

function groupByPrefix(keys: string[]) {
  const groups: Record<string, number> = {};
  for (const k of keys) {
    const p = k.split('.')[0];
    groups[p] = (groups[p] || 0) + 1;
  }
  return groups;
}

async function main() {
  const [arBase, enBase, esBase] = await Promise.all([
    loadLocaleMessages('ar'),
    loadLocaleMessages('en'),
    loadLocaleMessages('es'),
  ]);
  const [arExp, enExp, esExp] = await Promise.all([
    loadExperimentMessages('ar'),
    loadExperimentMessages('en'),
    loadExperimentMessages('es'),
  ]);

  const ar = { ...arBase, experiments: arExp } as Record<string, unknown>;
  const en = { ...enBase, experiments: enExp } as Record<string, unknown>;
  const es = { ...esBase, experiments: esExp } as Record<string, unknown>;

  const arKeys = new Set(getKeys(ar));
  const enKeys = new Set(getKeys(en));
  const esKeys = new Set(getKeys(es));

  const missingEn = [...arKeys].filter(k => !enKeys.has(k));
  const missingEs = [...arKeys].filter(k => !esKeys.has(k));
  const extraEn = [...enKeys].filter(k => !arKeys.has(k));
  const extraEs = [...esKeys].filter(k => !arKeys.has(k));

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outPath = path.join(__dirname, 'i18n-coverage-output.txt');

  const lines: string[] = [
    `ar keys: ${arKeys.size}, en keys: ${enKeys.size}, es keys: ${esKeys.size}`,
    `Missing en: ${missingEn.length}, missing es: ${missingEs.length}`,
    `Extra en: ${extraEn.length}, extra es: ${extraEs.length}`,
    'Missing en by namespace: ' + JSON.stringify(groupByPrefix(missingEn)),
    'Missing es by namespace: ' + JSON.stringify(groupByPrefix(missingEs)),
    '--- Sample missing en (first 100) ---',
    ...missingEn.slice(0, 100),
    '--- Sample missing es (first 100) ---',
    ...missingEs.slice(0, 100),
  ];
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Coverage written to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
