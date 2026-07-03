import { readdirSync, readFileSync, statSync } from 'fs'
import { join, relative } from 'path'

const SRC_DIR = new URL('..', import.meta.url).pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '\\')
const ROOT = SRC_DIR

interface AuditResult {
  file: string
  lines: number
  hasI18n: boolean
  hardcoded: { line: number; text: string }[]
  tCalls: string[]
}

const results: AuditResult[] = []

function walk(dir: string, cb: (f: string) => void) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const st = statSync(p)
    if (st.isDirectory() && !entry.includes('node_modules') && entry !== 'tools') walk(p, cb)
    else if (st.isFile() && /\.(vue|ts)$/.test(entry)) cb(p)
  }
}

function scanFile(filePath: string): AuditResult {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const rel = relative(ROOT, filePath).replace(/\\/g, '/')

  const hardcoded: { line: number; text: string }[] = []
  const tCalls: string[] = []
  let hasI18n = false

  // Check for useI18n import or t(' usage
  hasI18n = content.includes("useI18n") || content.includes("t('")

  // Find t('...') calls
  const tMatches = content.match(/t\(['"`]([^'"`]+)['"`]/g)
  if (tMatches) {
    tMatches.forEach(m => {
      const key = m.replace(/t\(['"`]/, '').replace(/['"`)]/g, '')
      if (!tCalls.includes(key)) tCalls.push(key)
    })
  }

  // Find hardcoded text in template (between > and <)
  // Only check .vue files and only inside <template>
  if (filePath.endsWith('.vue')) {
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
    if (templateMatch) {
      const template = templateMatch[1]
      const templateLines = template.split('\n')
      let lineOffset = content.indexOf('<template>')
      lineOffset = content.substring(0, lineOffset).split('\n').length

      templateLines.forEach((line, idx) => {
        // Match text between > and < that contains Arabic/English/Spanish letters
        const matches = line.matchAll(/>\s*([^<>{}$]+?)\s*</g)
        for (const m of matches) {
          const text = m[1].trim()
          // Skip if it's just whitespace, numbers, symbols, or already a t() call
          if (!text || /^[\d\s\W]+$/.test(text)) continue
          if (text.includes('t(')) continue
          if (text.startsWith('{{') && text.endsWith('}}')) continue
          if (text.startsWith('<!--')) continue
          // Skip CSS class names and common patterns
          if (/^[\s]*[.#]?[\w-]+$/.test(text)) continue
          // Skip single word that might be a CSS class or variable
          if (/^[A-Za-z0-9_-]+$/.test(text) && text.length < 15) continue
          hardcoded.push({ line: lineOffset + idx, text: text.slice(0, 60) })
        }
      })
    }
  }

  return { file: rel, lines: lines.length, hasI18n, hardcoded, tCalls }
}

walk(ROOT, (f) => {
  if (f.includes('tools')) return
  results.push(scanFile(f))
})

// Summary
const vueFiles = results.filter(r => r.file.endsWith('.vue'))
const tsFiles = results.filter(r => r.file.endsWith('.ts'))
const over300 = results.filter(r => r.lines > 300)
const hasHardcoded = results.filter(r => r.hardcoded.length > 0)

console.log('=== I18N AUDIT REPORT ===\n')

console.log(`Total files scanned: ${results.length}`)
console.log(`  Vue files: ${vueFiles.length}`)
console.log(`  TS files: ${tsFiles.length}`)
console.log(`Files > 300 lines: ${over300.length}`)
console.log(`Files with hardcoded text: ${hasHardcoded.length}`)
console.log(`\n`)

console.log('=== FILES > 300 LINES ===')
over300.sort((a, b) => b.lines - a.lines).forEach(r => {
  console.log(`  ${r.file.padEnd(60)} ${r.lines} lines`)
})

console.log('\n=== FILES WITH HARDCODED TEXT (Vue templates) ===')
hasHardcoded.filter(r => r.hardcoded.length > 0 && r.file.endsWith('.vue')).forEach(r => {
  console.log(`\n  ${r.file} (${r.lines} lines, ${r.hardcoded.length} hardcoded strings):`)
  r.hardcoded.slice(0, 5).forEach(h => {
    console.log(`    Line ${h.line}: "${h.text}"`)
  })
  if (r.hardcoded.length > 5) console.log(`    ... and ${r.hardcoded.length - 5} more`)
})

// Check locale coverage
console.log('\n=== LOCALE COVERAGE ===')
const localesDir = join(ROOT, 'locales')
try {
  const localeFiles = readdirSync(localesDir)
    .filter(f => f.endsWith('.ts'))
    .map(f => f.replace('.ts', ''))
  console.log(`  Locale files: ${localeFiles.join(', ')}`)
} catch { console.log('  Could not read locales dir') }

console.log('\n=== DONE ===')
