/**
 * تدقيق ترجمات قسم الأحياء — يقارن المفاتيح المستخدمة في الكود مع المعرّفة في
 * biology-{ar,en,es}_{a-d}.ts (بنفس منطق الدمج في ar-science.ts)،
 * ويكشف الفروق بين اللغات.
 * الاستخدام: node scripts/check-biology-i18n.mjs
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname, sep, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const LOCALES = join(SRC, 'locales');

function loadLocaleObject(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/export const \w+\s*=\s*/);
  if (!m) throw new Error('no export const found');
  let body = text.slice(m.index + m[0].length).trim();
  body = body.replace(/as const\s*;?\s*$/, '').replace(/;\s*$/, '');
  return eval('(' + body + ')');
}

function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, path, out);
    else out.add(path);
  }
  return out;
}

const langs = ['ar', 'en', 'es'];
const defined = {};
for (const lang of langs) {
  const parts = {};
  for (const part of ['a', 'b', 'c', 'd']) {
    const f = join(LOCALES, `biology-${lang}_${part}.ts`);
    try {
      parts[part] = loadLocaleObject(f);
    } catch (e) {
      console.error(`✗ failed to parse ${f}: ${e.message}`);
      process.exitCode = 1;
    }
  }
  const merged = { ...parts.a, ...parts.b, ...parts.d };
  // دمج عميق للكائنات المتداخلة — مطابق لمنطق ar-science.ts المُصلح:
  merged.anatomy = { ...(parts.a?.anatomy ?? {}), ...(parts.b?.anatomy ?? {}), ...(parts.c ?? {}) };
  merged.topic = { ...(parts.a?.topic ?? {}), ...(parts.b?.topic ?? {}), ...(parts.d?.topic ?? {}) };
  merged.section = { ...(parts.a?.section ?? {}), ...(parts.b?.section ?? {}), ...(parts.d?.section ?? {}) };
  merged.report = { ...(parts.a?.report ?? {}), ...(parts.b?.report ?? {}), ...(parts.d?.report ?? {}) };
  defined[lang] = flatten({ biology: merged }, '', new Set());
}

// فحص صحة المفاتيح: أي مفتاح محدد لكنه ليس ورقة (كائن) لا يمكن استخدامها مع t()
const leafSets = defined;

// 2) مسح المفاتيح المستخدمة في الكود
function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const SKIP_DIRS = ['locales', '.vercel', 'dist', 'node_modules'];
const used = new Map(); // key -> Set<file>
for (const f of walk(SRC)) {
  const rel = relative(SRC, f);
  if (SKIP_DIRS.some((d) => rel.split(sep).includes(d))) continue;
  const ext = extname(f);
  if (!['.ts', '.vue', '.js'].includes(ext)) continue;
  const text = readFileSync(f, 'utf8');
  const re = /['"`](biology\.[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)/g;
  for (const match of text.matchAll(re)) {
    const key = match[1];
    if (!used.has(key)) used.set(key, new Set());
    used.get(key).add(rel.split(sep).slice(-2).join('/'));
  }
}

const isDefined = (lang, key) => leafSets[lang].has(key);
const hasPrefixIn = (lang, key) => [...leafSets[lang]].some((k) => k.startsWith(key + '.'));

let problems = 0;
console.log('═'.repeat(70));
console.log('1) مفاتيح مستخدمة لكن غير معرّفة (لكل لغة):');
for (const lang of langs) {
  const missing = [...used.keys()].filter((k) => !isDefined(lang, k) && !hasPrefixIn(lang, k));
  if (missing.length) {
    problems += missing.length;
    console.log(`  [${lang}] ✗ ${missing.length} مفتاح ناقص:`);
    for (const k of missing) console.log(`     - ${k}  ← ${[...used.get(k)].join(', ')}`);
  } else {
    console.log(`  [${lang}] ✓ كاملة`);
  }
}

console.log('═'.repeat(70));
console.log('2) مفاتيح معرّفة في ar لكن ناقصة في en/es:');
for (const lang of ['en', 'es']) {
  const missing = [...defined.ar].filter((k) => !defined[lang].has(k));
  if (missing.length) {
    problems += missing.length;
    console.log(`  ar→${lang}: ✗ ${missing.length}`);
    for (const k of missing.slice(0, 40)) console.log(`     - ${k}`);
    if (missing.length > 40) console.log(`     ... و${missing.length - 40} أخرى`);
  } else {
    console.log(`  ar→${lang}: ✓`);
  }
}

console.log('═'.repeat(70));
console.log(`3) إحصائيات: مستخدم ${used.size} · معرّف ar ${defined.ar.size} · en ${defined.en.size} · es ${defined.es.size}`);
console.log(problems ? `✗ إجمالي المشاكل: ${problems}` : '✓ لا مشاكل — القسم مكتمل اللغات');

// 4) تصدير المفاتيح الناقصة (ar) إلى JSON نظيف
const missingAr = [...used.keys()].filter((k) => !isDefined('ar', k) && !hasPrefixIn('ar', k));
writeFileSync(join(ROOT, 'scripts', 'biology-i18n-missing.json'), JSON.stringify(missingAr, null, 2), 'utf8');
console.log(`→ حفظ ${missingAr.length} مفتاح ناقص في scripts/biology-i18n-missing.json`);
