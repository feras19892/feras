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

// Detects t used as a function or a variable argument, but not as part of a longer word
function hasTUsage(content: string): boolean {
  return /\bt\s*[\(\),;:]/.test(content)
}

// Detects if t is already declared from a non-useI18n source
function hasOtherTDecl(content: string): boolean {
  // let t:, const t =, var t =
  if (/\b(let|const|var)\s+t\s*[:=]/.test(content)) return true
  // t in destructuring of any other composable/return/expose
  const destructures = [...content.matchAll(/\{\s*([^}]*)\bt\b([^}]*)\}\s*=\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)]
  for (const m of destructures) {
    const source = m[3]
    if (source !== 'useI18n') return true
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

function insertAfterLastImport(content: string, line: string): string {
  // Find all import lines at the top of the script (within first 200 lines)
  const lines = content.split('\n')
  let lastImportIndex = -1
  for (let i = 0; i < lines.length && i < 200; i++) {
    if (/^\s*import\s/.test(lines[i])) lastImportIndex = i
  }
  if (lastImportIndex === -1) return content
  lines.splice(lastImportIndex + 1, 0, line)
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
  const constMatches = [...content.matchAll(constRe)]
  if (constMatches.length) {
    content = content.replace(constRe, '')
    removed += constMatches.length
    filesChanged++
  }

  const otherDecl = hasOtherTDecl(content)
  const usesT = hasTUsage(content)

  if (otherDecl) {
    // t is declared elsewhere; remove the useI18n import if it is no longer used
    if (!/useI18n\(/.test(content)) {
      content = content.replace(/^\s*import\s*\{\s*useI18n\s*\}\s*from\s*['"][^'"]*['"];?\s*$/gm, '')
    }
    writeFileSync(file, content, 'utf-8')
    return
  }

  if (!usesT) {
    // no t usage; remove useI18n import if unused
    if (!/useI18n\(/.test(content)) {
      content = content.replace(/^\s*import\s*\{\s*useI18n\s*\}\s*from\s*['"][^'"]*['"];?\s*$/gm, '')
    }
    writeFileSync(file, content, 'utf-8')
    return
  }

  // t is used and not declared elsewhere; we need const { t } from useI18n
  if (!hasI18nImport(content)) {
    content = addI18nImport(content)
    added++
  }

  // Add const { t } after the last import in the script
  content = insertAfterLastImport(content, 'const { t } = useI18n();')
  moved++
  writeFileSync(file, content, 'utf-8')
})

console.log(`Files changed: ${filesChanged}, removed: ${removed}, moved: ${moved}, added imports: ${added}`)
