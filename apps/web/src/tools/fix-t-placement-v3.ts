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

const tCallRe = /\bt\s*\(/
const tArgRe = /[,\[]\s*t\s*[\)\],;]/

function needsT(content: string): boolean {
  return tCallRe.test(content) || tArgRe.test(content)
}

function hasOtherTDecl(content: string): boolean {
  if (/\b(let|const|var)\s+t\s*[:=]/.test(content)) return true
  const destructures = [...content.matchAll(/\{\s*([^}]*)\bt\b([^}]*)\}\s*=\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)]
  for (const m of destructures) if (m[3] !== 'useI18n') return true
  return false
}

function hasI18nImport(content: string): boolean {
  return /import\s*\{\s*useI18n\s*\}\s*from/.test(content)
}

const importRe = /^\s*import\b[\s\S]*?\bfrom\s+['"][^'"]+['"]\s*;?$/gm

function lastImportLineIndex(content: string): number {
  const matches = [...content.matchAll(importRe)]
  if (!matches.length) return -1
  const last = matches[matches.length - 1]
  const prefix = content.slice(0, last.index + last[0].length)
  return prefix.split('\n').length - 1
}

function insertAfterLastImport(content: string, line: string): string {
  const idx = lastImportLineIndex(content)
  if (idx === -1) return content
  const lines = content.split('\n')
  // collapse duplicate blank lines at insertion
  lines.splice(idx + 1, 0, line)
  return lines.join('\n')
}

let removed = 0
let moved = 0
let added = 0
let filesChanged = 0

walk(root, (file) => {
  let content = readFileSync(file, 'utf-8')

  const constRe = /^\s*const\s*\{\s*t\s*\}\s*=\s*useI18n\(\);?\s*$/gm
  const hadConst = constRe.test(content)
  if (hadConst) {
    content = content.replace(constRe, '')
    removed++
    filesChanged++
  }

  // Normalize multiple blank lines to single blank between top imports and script body
  content = content.replace(/(<script[^>]*>\s*)\n\n+/g, '$1\n')
  content = content.replace(/(\n*import\s+\{[\s\S]*?from\s+['"][^'"]+['"]\s*;?\n)\n+/g, '$1\n')

  const otherDecl = hasOtherTDecl(content)
  const need = needsT(content)

  if (otherDecl || !need) {
    if (!/useI18n\(/.test(content)) {
      content = content.replace(/^\s*import\s*\{\s*useI18n\s*\}\s*from\s*['"][^'"]*['"];?\s*$/gm, '')
    }
    writeFileSync(file, content, 'utf-8')
    return
  }

  if (!hasI18nImport(content)) {
    const open = content.match(/<script[^>]*>\s*/)
    if (open) {
      content = content.replace(open[0], open[0] + "\nimport { useI18n } from '@/composables/useI18n';")
      added++
      filesChanged++
    }
  }

  content = insertAfterLastImport(content, 'const { t } = useI18n();')
  moved++
  writeFileSync(file, content, 'utf-8')
})

console.log(`Files changed: ${filesChanged}, removed: ${removed}, moved: ${moved}, added imports: ${added}`)
