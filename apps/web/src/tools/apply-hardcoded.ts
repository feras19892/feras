import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('..', import.meta.url))

const mapping: Record<string, string> = {
  'Ctrl+Z': 'hardcoded.ctrlZ',
  'Ctrl+Y': 'hardcoded.ctrlY',
  'Space': 'hardcoded.space',
  'S': 'hardcoded.s',
  'R': 'hardcoded.r',
  'CSV': 'hardcoded.csv',
  'PDF': 'hardcoded.pdf',
  'FPS': 'hardcoded.fps',
  'ON/OFF': 'hardcoded.onOff',
  'HOT PLATE': 'hardcoded.hotPlate',
  'Snap!': 'hardcoded.snap',
  '🥄 +0.5g': 'hardcoded.spoon05g',
  '🥄 +1g': 'hardcoded.spoon1g',
  '🥄 +2g': 'hardcoded.spoon2g',
  '🥄 +5g': 'hardcoded.spoon5g',
  'إغلاق': 'hardcoded.close',
  'غير مصرح': 'hardcoded.accessDenied',
  'جاري التحميل...': 'common.loading',
  'جارٍ التحميل...': 'common.loading',
  'فشل تحميل ملفات اللغة': 'hardcoded.i18nLoadFailed',
  'فشل تغيير اللغة': 'hardcoded.langChangeFailed',
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

function hasI18nImport(content: string): boolean {
  return content.includes('useI18n')
}

function hasTDestructure(content: string): boolean {
  return /const\s*\{[^}]*\bt\b/.test(content)
}

function addI18nSetup(content: string): string {
  const scriptOpen = content.match(/<script setup[^>]*>\s*/)
  if (!scriptOpen) return content
  const open = scriptOpen[0]
  let replacement = open
  if (!hasI18nImport(content)) {
    replacement += "\nimport { useI18n } from '@/composables/useI18n'"
  }
  if (!hasTDestructure(content)) {
    replacement += '\nconst { t } = useI18n()\n'
  } else {
    replacement += '\n'
  }
  return content.replace(open, replacement)
}

function applyToTemplate(template: string): [string, number] {
  let count = 0
  for (const [text, key] of Object.entries(mapping)) {
    const esc = escape(text)

    // text between tags
    const textRe = new RegExp(`>([^<]*?)${esc}([^<]*?)<`, 'g')
    let prev = template
    template = template.replace(textRe, (_full, before, after) => {
      count++
      return `>${before}{{ t('${key}') }}${after}<`
    })
    if (prev === template) count += 0

    // attributes with exact value (no surrounding spaces/other text)
    const attrRe = new RegExp(`\\b(title|aria-label|alt|placeholder)=["']${esc}["']`, 'g')
    prev = template
    template = template.replace(attrRe, (_full, attr: string) => {
      count++
      return `:${attr}="t('${key}')"`
    })
  }
  return [template, count]
}

let total = 0
walk(root, (file) => {
  let content = readFileSync(file, 'utf-8')
  const match = content.match(/<template>([\s\S]*?)<\/template>/)
  if (!match) return

  const [template, count] = applyToTemplate(match[1])
  if (count === 0) return

  content = content.replace(match[1], template)

  if (!hasI18nImport(content) || !hasTDestructure(content)) {
    content = addI18nSetup(content)
  }

  writeFileSync(file, content, 'utf-8')
  total += count
})

console.log(`Applied ${total} hardcoded translations`)
