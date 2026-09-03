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

// t used as a function call
const tCallRe = /\bt\s*\(/
// t used as a variable argument, e.g. useFoo(..., t) or [..., t]
const tArgRe = /[,\[]\s*t\s*[\)\],;]/

function needsT(content: string): boolean {
  return tCallRe.test(content) || tArgRe.test(content)
}

function hasOtherTDecl(content: string): boolean {
  if (/\b(let|const|var)\s+t\s*[:=]/.test(content)) return true
  const destructures = [...content.matchAll(/\{\s*([^}]*)\bt\b([^}]*)\}\s*=\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)]
  for (const m of destructures) {
    if (m[3] !== 'useI18n') return true
  }
  return false
}

function hasI18nImport(content: string): boolean {
  return /import\s*\{\s*useI18n\s*\}\s*from/.test(content)
}

function addI18nImport(content: string): string {
  const open = content.match(/<script[^>]*>\s*/)
  if (!open) return content
  return content.replace(open[0], open[0] + "\nimport { useI18n } from '@/composables/useI18n';")
}

function findLastImportEnd(content: string): number {
  const lines = content.split('\n')
  let lastImportEnd = -1
  let inImport = false
  for (let i = 0; i < lines.length && i < 200; i++) {
    if (/^\s*import\b/.test(lines[i])) {
      inImport = true
      lastImportEnd = i
    } else if (inImport) {
      const isContinuation = /^\s*(\}.*\bfrom\b|\/\/|[A-Za-z_$][A-Za-z0-9_$]*\s*,?$|[A-Za-z_$][A-Za-z0-9_$]*\s+as\s+[A-Za-z0-9_$]+\s*,?$)/.test(lines[i])
      if (isContinuation) {
        lastImportEnd = i
        if (/;\s*$/.test(lines[i])) inImport = false
      } else {
        break
      }
    }
  }
  return lastImportEnd
}

function insertAfterLastImport(content: string, line: string): string {
  const idx = findLastImportEnd(content)
  if (idx === -1) return content
  const lines = content.split('\n')
  lines.splice(idx + 1, 0, line)
  return lines.join('\n')
}

let removed = 0
let moved = 0
let added = 0
let filesChanged = 0

walk(root, (file) => {
  let content = readFileSync(file, 'utf-8')

  // Remove every added "const { t } = useI18n();" line
  const constRe = /^\s*const\s*\{\s*t\s*\}\s*=\s*useI18n\(\);?\s*$/gm
  const hadConst = constRe.test(content)
  if (hadConst) {
    content = content.replace(constRe, '')
    removed++
    filesChanged++
  }

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
    content = addI18nImport(content)
    added++
    filesChanged++
  }

  content = insertAfterLastImport(content, 'const { t } = useI18n();')
  moved++
  writeFileSync(file, content, 'utf-8')
})

console.log(`Files changed: ${filesChanged}, removed: ${removed}, moved: ${moved}, added imports: ${added}`)
