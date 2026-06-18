import type { OpenLabReportOptions, LabReportImage } from './lab-report.types'

export function eh(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildStudentHtml(dir: 'rtl' | 'ltr', studentInfo: Record<string, string>): string {
  const rows = Object.entries(studentInfo).filter(([, v]) => v)
  if (!rows.length) return ''
  const tableRows = rows
    .map(([k, v]) => `<tr><td class="param-label">${eh(k)}</td><td class="param-value">${eh(v)}</td></tr>`)
    .join('')
  return `
<div class="section">
  <h3 class="section-title">📋 ${dir === 'rtl' ? 'معلومات الطالب' : 'Student Information'}</h3>
  <table class="params-table"><tbody>${tableRows}</tbody></table>
</div>`
}

export function buildMetaHtml(meta: Record<string, string>): string {
  return Object.entries(meta)
    .map(([k, v]) => `<div><span class="meta-key">${eh(k)}:</span> ${eh(v)}</div>`)
    .join('')
}

export function buildParamsHtml(params: OpenLabReportOptions['params'], heading: string, dir: 'rtl' | 'ltr'): string {
  if (!params?.length) return ''
  const rows = params
    .map(p => `<tr><td class="param-label">${eh(p.label)}</td><td class="param-value">${eh(String(p.value))}${p.unit ? ` <span class="unit">${eh(p.unit)}</span>` : ''}</td></tr>`)
    .join('')
  return `
<section class="sec">
  <h2 class="sec-heading params-heading">⚙️ ${eh(heading)}</h2>
  <table class="params-table"><tbody>${rows}</tbody></table>
</section>`
}

export function buildStatsHtml(stats: OpenLabReportOptions['summaryStats'], heading: string): string {
  if (!stats?.length) return ''
  const cards = stats
    .map(s => `<div class="stat-card${s.highlight ? ' highlight' : ''}"><span class="stat-label">${eh(s.label)}</span><span class="stat-value">${eh(String(s.value))}${s.unit ? `<span class="stat-unit"> ${eh(s.unit)}</span>` : ''}</span></div>`)
    .join('')
  return `
<section class="sec">
  <h2 class="sec-heading results-heading">📊 ${eh(heading)}</h2>
  <div class="stats-row">${cards}</div>
</section>`
}

export function buildTablesHtml(tables: OpenLabReportOptions['tables']): string {
  if (!tables?.length) return ''
  return tables.map(table => {
    const cap = table.caption ? `<h3 class="table-caption">${eh(table.caption)}</h3>` : ''
    const head = `<tr>${table.headers.map(h => `<th>${eh(String(h))}</th>`).join('')}</tr>`
    const body = table.rows
      .map(row => `<tr>${row.map(c => `<td>${eh(c === undefined ? '' : String(c))}</td>`).join('')}</tr>`)
      .join('')
    return `<section class="sec">${cap}<table><thead>${head}</thead><tbody>${body}</tbody></table></section>`
  }).join('')
}

export function buildImagesHtml(images: LabReportImage[], canvasSnapshot: string | undefined, simSnapLabel: string): string {
  const all: LabReportImage[] = []
  if (canvasSnapshot) all.push({ src: canvasSnapshot, caption: simSnapLabel, fullWidth: true })
  all.push(...(images ?? []))
  return all
    .filter(img => img.src)
    .map((img, idx) => {
      const safeSrc = img.src.replace(/"/g, '&quot;')
      const cls = img.fullWidth ? 'img-full' : ''
      const breakCls = idx > 0 ? ' print-break' : ''
      return `<section class="sec${breakCls}"><p class="img-cap">${eh(img.caption ?? '')}</p><img alt="" src="${safeSrc}" class="${cls}"/></section>`
    })
    .join('')
}

export function buildBlocksHtml(blocks: OpenLabReportOptions['htmlBlocks']): string {
  if (!blocks?.length) return ''
  return blocks
    .map(block => {
      const titleHtml = block.title ? `<h2 class="sec-heading">${eh(block.title)}</h2>` : ''
      return `<section class="sec html-block">${titleHtml}${block.html}</section>`
    })
    .join('')
}

export function buildCss(dir: 'rtl' | 'ltr'): string {
  const borderSide = dir === 'rtl' ? 'right' : 'left'
  return `
*{box-sizing:border-box;}
body{font-family:"Segoe UI",Cairo,Tajawal,sans-serif;padding:0;color:#1e293b;max-width:960px;margin:0 auto;line-height:1.6;background:#f8fafc;}
.report-header{background:linear-gradient(135deg,#4f46e5,#0891b2);color:#fff;padding:28px 32px;border-radius:0 0 1.5rem 1.5rem;margin-bottom:24px;}
.report-header h1{margin:0;font-size:1.6rem;font-weight:800;}
.report-header .subtitle{opacity:.85;font-size:.92rem;margin-top:6px;}
.meta{background:#fff;border:1px solid #e2e8f0;padding:14px 18px;border-radius:1rem;font-size:.85rem;margin:0 0 16px;display:flex;flex-wrap:wrap;gap:12px 28px;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.meta-key{font-weight:700;color:#475569;}
.sec{margin:0 0 20px;}
.sec-heading{font-size:1rem;font-weight:700;margin:0 0 10px;padding:7px 14px;border-radius:.6rem;display:flex;align-items:center;gap:8px;}
.params-heading{background:#eef2ff;color:#3730a3;border-${borderSide}:4px solid #6366f1;}
.results-heading{background:#ecfdf5;color:#065f46;border-${borderSide}:4px solid #059669;}
.params-table{width:100%;border-collapse:collapse;font-size:.85rem;}
.params-table td{border:1px solid #e2e8f0;padding:7px 12px;}
.param-label{font-weight:600;color:#334155;width:55%;background:#f8fafc;}
.param-value{font-family:monospace;color:#1e3a8a;}
.unit{color:#64748b;font-weight:normal;font-family:inherit;}
.stats-row{display:flex;flex-wrap:wrap;gap:10px;}
.stat-card{background:#fff;border:1px solid #e2e8f0;border-radius:1rem;padding:10px 16px;min-width:140px;flex:1;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.stat-card.highlight{border-color:#f97316;background:#fff7ed;}
.stat-label{display:block;font-size:.75rem;font-weight:600;color:#64748b;margin-bottom:4px;}
.stat-value{display:block;font-size:1.15rem;font-weight:800;font-family:monospace;color:#1e293b;}
.stat-unit{font-size:.78rem;color:#64748b;font-weight:normal;}
.table-caption{font-size:.92rem;font-weight:700;color:#334155;margin:0 0 6px;}
table{width:100%;border-collapse:collapse;margin:0;font-size:.8rem;}
th,td{border:1px solid #e2e8f0;padding:6px 8px;text-align:center;}
th{background:#e0e7ff;color:#3730a3;font-weight:700;}
tr:nth-child(even) td{background:#f8fafc;}
img{max-width:100%;border:1px solid #e2e8f0;border-radius:.75rem;display:block;margin:8px auto;box-shadow:0 2px 8px rgba(0,0,0,.08);}
img.img-full{width:100%;}
.img-cap{text-align:center;font-size:.82rem;color:#64748b;margin:0 0 4px;}
.html-block{background:#fff;border:1px solid #e2e8f0;padding:14px 18px;border-radius:1rem;font-size:.9rem;box-shadow:0 1px 4px rgba(0,0,0,.06);}
.footer{margin-top:32px;text-align:center;color:#94a3b8;font-size:.75rem;border-top:1px solid #e2e8f0;padding-top:12px;}
.actions{display:flex;justify-content:flex-end;gap:10px;margin:20px 0;}
.btn-print{background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;padding:10px 22px;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;font-size:.92rem;}
.btn-close{background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;padding:10px 22px;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;font-size:.92rem;}
.btn-send-teacher{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;padding:10px 22px;border-radius:999px;cursor:pointer;font:inherit;font-weight:700;font-size:.92rem;box-shadow:0 4px 12px rgba(79,70,229,.3);}
.btn-send-teacher:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(79,70,229,.4);}
.btn-sent{background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.3);padding:10px 22px;border-radius:999px;font:inherit;font-weight:700;font-size:.92rem;cursor:default;}
.content{padding:0 24px 24px;}
@media print{
  .noprint{display:none!important;}
  body{background:#fff;}
  .report-header{border-radius:0;}
  .stat-card,.html-block{break-inside:avoid;}
  table{break-inside:avoid;}
  .print-break{page-break-before:always;padding-top:12px;}
  .print-break .img-cap{margin-top:4px;}
}`
}
