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
  let inImportBlock = false
  for (let i = 0; i < lines.length && i < 250; i++) {
    if (/^\s*import\b/.test(lines[i])) {
      inImportBlock = true
      lastImportEnd = i
    } else if (inImportBlock) {
      const isContinuation = /^\s*(\}.*\bfrom\b|\/\/|\b(type|[A-Za-z_$][A-Za-z0-9_$]*)\b(\s+as\s+\b[A-Za-z_$][A-Za-z0-9_$]*\b)?\s*,?\s*)$/.test(lines[i])
      if (isContinuation) {
        lastImportEnd = i
        if (/\bfrom\s+['"][^'"]+['"]\s*;?\s*$/.test(lines[i])) inImportBlock = false
      } else {
        break
      }
    }
  }
  return lastImportEnd
}

const tCallRe = /\bt\s*\(/
const tUsageRe = /\bt\s*[\)\],;]/

function needsT(content: string): boolean {
  return tCallRe.test(content) || tUsageRe.test(content)
}

function hasOtherTDecl(content: string): boolean {
  if (/\b(let|const|var)\s+t\s*[:=]/.test(content)) return true
  const destructures = [...content.matchAll(/\{\s*([^}]*)\bt\b([^}]*)\}\s*=\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)]
  for (const m of destructures) if (m[3] !== 'useI18n') return true
  return false
}

const i18nConstRe = /\bconst\s*\{\s*([^}]+)\s*\}\s*=\s*useI18n\(\)\s*;?/g

function collectI18nProps(content: string): { hasT: boolean; other: string[] } {
  const out = new Set<string>()
  let hasT = false
  const matches = [...content.matchAll(i18nConstRe)]
  for (const m of matches) {
    const raw = m[1]
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
    for (const part of parts) {
      const nameMatch = part.match(/^([A-Za-z_$][A-Za-z0-9_$]*)(\s*:\s*([A-Za-z_$][A-Za-z0-9_$]*))?$/)
      if (!nameMatch) continue
      const name = nameMatch[1]
      if (name === 't') hasT = true
      else out.add(part)
    }
  }
  return { hasT, other: [...out] }
}

function hasI18nImport(content: string): boolean {
  return /import\s*\{\s*useI18n\s*\}\s*from/.test(content)
}

let removed = 0
let reinserted = 0
let addedImport = 0
let filesChanged = 0

walk(root, (file) => {
  let content = readFileSync(file, 'utf-8')

  // Remove all const { ... } = useI18n() that we or the scripts added
  const hadI18nConst = i18nConstRe.test(content)
  if (hadI18nConst) {
    content = content.replace(i18nConstRe, '')
    removed++
    filesChanged++
  }

  const otherT = hasOtherTDecl(content)
  const need = needsT(content)

  // Collect original useI18n props from the removed consts
  const { hasT, other } = collectI18nProps(content)
  const needT = !otherT && need && !hasT
  const keepT = !otherT && (need || hasT)

  if (!keepT && other.length === 0) {
    if (!/useI18n\(/.test(content)) {
      content = content.replace(/^\s*import\s*\{\s*useI18n\s*\}\s*from\s*['"][^'"]*['"];?\s*$/gm, '')
    }
    writeFileSync(file, content, 'utf-8')
    return
  }

  const newProps = [...other]
  if (keepT) newProps.unshift('t')
  if (newProps.length === 0) {
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
      addedImport++
      filesChanged++
    }
  }

  const idx = findLastImportEnd(content)
  if (idx === -1) {
    // fallback: place after first <script> tag if no imports
    const open = content.match(/<script[^>]*>\s*/)
    if (open) content = content.replace(open[0], open[0] + '\n')
    const lines = content.split('\n')
    const openIdx = lines.findIndex(l => /<script[^>]*>/.test(l))
    if (openIdx !== -1) lines.splice(openIdx + 1, 0, `const { ${newProps.join(', ')} } = useI18n();`)
    content = lines.join('\n')
  } else {
    const lines = content.split('\n')
    lines.splice(idx + 1, 0, `const { ${newProps.join(', ')} } = useI18n();`)
    content = lines.join('\n')
  }
  reinserted++
  writeFileSync(file, content, 'utf-8')
})

console.log(`Files changed: ${filesChanged}, removed: ${removed}, reinserted: ${reinserted}, added imports: ${addedImport}`)
