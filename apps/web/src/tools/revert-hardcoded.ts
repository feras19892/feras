import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('..', import.meta.url))

const mapping: Record<string, string> = {
  'hardcoded.ctrlZ': 'Ctrl+Z',
  'hardcoded.ctrlY': 'Ctrl+Y',
  'hardcoded.space': 'Space',
  'hardcoded.s': 'S',
  'hardcoded.r': 'R',
  'hardcoded.csv': 'CSV',
  'hardcoded.pdf': 'PDF',
  'hardcoded.fps': 'FPS',
  'hardcoded.onOff': 'ON/OFF',
  'hardcoded.hotPlate': 'HOT PLATE',
  'hardcoded.snap': 'Snap!',
  'hardcoded.spoon05g': '🥄 +0.5g',
  'hardcoded.spoon1g': '🥄 +1g',
  'hardcoded.spoon2g': '🥄 +2g',
  'hardcoded.spoon5g': '🥄 +5g',
  'hardcoded.altNumber': 'Alt + رقم (1–9)',
  'hardcoded.close': 'إغلاق',
  'hardcoded.accessDenied': 'غير مصرح',
  'hardcoded.i18nLoadFailed': 'فشل تحميل ملفات اللغة',
  'hardcoded.langChangeFailed': 'فشل تغيير اللغة',
  'common.loading': 'جاري التحميل...',
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function walk(dir: string, cb: (f: string) => void) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, cb)
    else if (p.endsWith('.vue')) cb(p)
  }
}

function usesT(content: string): boolean {
  return /\bt\(/.test(content)
}

let total = 0

walk(root, (file) => {
  let content = readFileSync(file, 'utf-8')
  let changed = false

  for (const [key, text] of Object.entries(mapping)) {
    const escKey = escape(key)

    // text nodes: {{ t('key') }}
    const textRe = new RegExp(`\\{\\{\\s*t\\('${escKey}'\\)\\s*\\}\\}`, 'g')
    const beforeText = content
    content = content.replace(textRe, () => {
      changed = true
      total++
      return text
    })

    // attributes: :title="t('key')"
    const attrRe = new RegExp(`:(title|aria-label|alt|placeholder)="t\\('${escKey}'\\)"`, 'g')
    const beforeAttr = content
    content = content.replace(attrRe, (_full, attr: string) => {
      changed = true
      total++
      return `${attr}="${text}"`
    })
  }

  if (!changed) return

  // Remove t-only destructuring the script added
  content = content.replace(/^\s*const\s*\{\s*t\s*\}\s*=\s*useI18n\(\);?\s*$/gm, '')

  // Remove the import the script added only if useI18n is no longer used elsewhere
  const useI18nImport = /import\s*\{\s*useI18n\s*\}\s*from\s*['"]@\/composables\/useI18n['"];?\s*\n?/g
  const body = content.replace(useI18nImport, '')
  // If useI18n still appears in the rest of the file, keep the import
  if (body.includes('useI18n')) {
    content = content // keep import
  } else {
    content = body
  }

  writeFileSync(file, content, 'utf-8')
})

console.log(`Reverted ${total} hardcoded t() calls`)
