export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h]
      const str = val === null || val === undefined ? '' : String(val)
      const escaped = str.replace(/"/g, '""')
      const prefix = /^[-+=@\t\r]/.test(escaped) ? "'" : ''
      return `"${prefix}${escaped}"`
    }).join(',')
  )
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n')
  download(csv, filename + '.csv', 'text/csv;charset=utf-8')
}

export function exportToJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2)
  download(json, filename + '.json', 'application/json')
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
