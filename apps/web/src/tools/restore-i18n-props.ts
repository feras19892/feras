import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('..', import.meta.url))

function walk(dir: string, cb: (f: string) => void) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, cb)
    else if (p.endsWith('.vue')) cb(p)
  }
}

function findLastImportEnd(content: string): number {
  const lines = content.split('\n')
  let lastImportEnd = -1
  let inImport = false
  for (let i = 0; i < lines.length && i < 250; i++) {
    if (/^\s*import\b/.test(lines[i])) {
      inImport = true
      lastImportEnd = i
    }
    if (inImport) {
      lastImportEnd = i
      if (/\bfrom\s+['"][^'"]+['"]\s*;?\s*$/.test(lines[i])) inImport = false
    }
  }
  return lastImportEnd
}

function hasConflictingDecl(name: string, content: string): boolean {
  const re = new RegExp(`\\b(?:const|let|var|type|function)\\s+${name}\\b`)
  return re.test(content)
}

const propPatterns: Record<string, RegExp> = {
  t: /\bt\s*\(/,
  locale: /\blocale(?:\.value)?\b/,
  direction: /\bdirection(?:\.value)?\b/,
  d: /\bd\s*\(/,
  n: /\bn\s*\(/,
}

function requiredProps(content: string): string[] {
  const set = new Set<string>()
  for (const [name, re] of Object.entries(propPatterns)) {
    if (re.test(content) && !hasConflictingDecl(name, content)) set.add(name)
  }
  return [...set]
}

const i18nConstRe = /\bconst\s*\{\s*([^}]*)\s*\}\s*=\s*useI18n\(\)\s*;?/g
const i18nImportRe = /^\s*import\s*\{\s*useI18n\s*\}\s*from\s*['"][^'"]+['"]\s*;?\s*$/gm

let changed = 0

walk(root, (file) => {
  let content = readFileSync(file, 'utf-8')
  const needs = requiredProps(content)

  if (needs.length === 0) {
    i18nConstRe.lastIndex = 0
    if (i18nConstRe.test(content)) {
      i18nConstRe.lastIndex = 0
      content = content.replace(i18nConstRe, '')
      changed++
    }
    i18nImportRe.lastIndex = 0
    if (i18nImportRe.test(content)) {
      i18nImportRe.lastIndex = 0
      content = content.replace(i18nImportRe, '')
      changed++
    }
    writeFileSync(file, content, 'utf-8')
    return
  }

  i18nConstRe.lastIndex = 0
  content = content.replace(i18nConstRe, '')
  i18nImportRe.lastIndex = 0
  content = content.replace(i18nImportRe, '')

  if (!/import\s*\{\s*useI18n\s*\}\s*from/.test(content)) {
    const open = content.match(/<script[^>]*>\s*/)
    if (open) {
      content = content.replace(open[0], open[0] + "\nimport { useI18n } from '@/composables/useI18n';")
    }
  }

  const idx = findLastImportEnd(content)
  const lines = content.split('\n')
  const propStr = needs.join(', ')

  if (idx === -1) {
    const openIdx = lines.findIndex((l: string) => /<script[^>]*>/.test(l))
    if (openIdx !== -1) lines.splice(openIdx + 1, 0, `const { ${propStr} } = useI18n();`)
  } else {
    lines.splice(idx + 1, 0, `const { ${propStr} } = useI18n();`)
  }

  content = lines.join('\n')
  changed++
  writeFileSync(file, content, 'utf-8')
})

console.log(`Changed: ${changed}`)
