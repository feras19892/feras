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

function hasTDestructure(content: string): boolean {
  return /const\s*\{[^}]*\bt\b[^}]*\}\s*=\s*useI18n\(\)/.test(content)
}

function hasTUsage(content: string): boolean {
  return /\bt\(/.test(content)
}

function hasI18nImport(content: string): boolean {
  return /import\s*\{\s*useI18n\s*\}\s*from/.test(content)
}

function addI18nSetup(content: string): string {
  const scriptOpen = content.match(/<script setup[^>]*>\s*/)
  if (!scriptOpen) return content
  const open = scriptOpen[0]
  let replacement = open
  if (!hasI18nImport(content)) {
    replacement += "\nimport { useI18n } from '@/composables/useI18n';"
  }
  replacement += '\nconst { t } = useI18n();\n'
  return content.replace(open, replacement)
}

let total = 0

walk(root, (file) => {
  let content = readFileSync(file, 'utf-8')

  if (!hasTUsage(content)) return
  if (hasTDestructure(content)) return

  content = addI18nSetup(content)
  writeFileSync(file, content, 'utf-8')
  total++
})

console.log(`Added t() to ${total} .vue files`)
