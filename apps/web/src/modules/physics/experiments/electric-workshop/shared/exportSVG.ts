import type { WorkshopComponent, WorkshopWire } from './types'
import { getDef } from './componentDefs'
import { getTerminalWorldPos } from './drawWire'

export function exportCircuitSVG(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  zoom: number = 1,
): string {
  if (components.length === 0 && wires.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><text x="100" y="50" text-anchor="middle" fill="#666">Empty circuit</text></svg>'
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (const comp of components) {
    const def = getDef(comp.type)
    const halfW = (def ? def.width / 2 : 30) * (comp.scale ?? 1)
    const halfH = (def ? def.height / 2 : 22) * (comp.scale ?? 1)
    minX = Math.min(minX, comp.x - halfW - 20)
    minY = Math.min(minY, comp.y - halfH - 20)
    maxX = Math.max(maxX, comp.x + halfW + 20)
    maxY = Math.max(maxY, comp.y + halfH + 20)
    for (const term of comp.terminals) {
      const [tx, ty] = getTerminalWorldPos(comp, term)
      minX = Math.min(minX, tx - 10)
      minY = Math.min(minY, ty - 10)
      maxX = Math.max(maxX, tx + 10)
      maxY = Math.max(maxY, ty + 10)
    }
  }

  for (const wire of wires) {
    for (const p of wire.points) {
      minX = Math.min(minX, p.x - 10)
      minY = Math.min(minY, p.y - 10)
      maxX = Math.max(maxX, p.x + 10)
      maxY = Math.max(maxY, p.y + 10)
    }
  }

  const pad = 30
  const w = Math.ceil(maxX - minX + pad * 2)
  const h = Math.ceil(maxY - minY + pad * 2)
  const ox = -minX + pad
  const oy = -minY + pad

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="background:#0d1117">`)

  // Grid
  const gs = 20
  parts.push(`<defs><pattern id="grid" width="${gs}" height="${gs}" patternUnits="userSpaceOnUse">`)
  parts.push(`<path d="M ${gs} 0 L 0 0 0 ${gs}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`)
  parts.push(`</pattern></defs>`)
  parts.push(`<rect width="${w}" height="${h}" fill="url(#grid)"/>`)

  // Wires
  for (const wire of wires) {
    const fromComp = components.find(c => c.id === wire.fromCompId)
    const toComp = components.find(c => c.id === wire.toCompId)
    if (!fromComp || !toComp) continue
    const fromTerm = fromComp.terminals[wire.fromTerminalIndex]
    const toTerm = toComp.terminals[wire.toTerminalIndex]
    if (!fromTerm || !toTerm) continue
    const [fx, fy] = getTerminalWorldPos(fromComp, fromTerm)
    const [tx, ty] = getTerminalWorldPos(toComp, toTerm)
    let d = `M ${fx + ox} ${fy + oy}`
    for (const p of wire.points) {
      d += ` L ${p.x + ox} ${p.y + oy}`
    }
    d += ` L ${tx + ox} ${ty + oy}`
    const color = wire.color || '#ef4444'
    parts.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`)
  }

  // Components (simplified SVG representation)
  for (const comp of components) {
    const cx = comp.x + ox
    const cy = comp.y + oy
    const def = getDef(comp.type)
    const color = def?.color || '#64748b'
    const label = def?.label || comp.type
    const halfW = (def ? def.width / 2 : 30) * (comp.scale ?? 1)
    const halfH = (def ? def.height / 2 : 22) * (comp.scale ?? 1)

    // Body
    if (comp.type === 'ground') {
      parts.push(`<line x1="${cx}" y1="${cy - 12}" x2="${cx}" y2="${cy}" stroke="${color}" stroke-width="2"/>`)
      parts.push(`<line x1="${cx - 10}" y1="${cy}" x2="${cx + 10}" y2="${cy}" stroke="${color}" stroke-width="2"/>`)
      parts.push(`<line x1="${cx - 7}" y1="${cy + 4}" x2="${cx + 7}" y2="${cy + 4}" stroke="${color}" stroke-width="2"/>`)
      parts.push(`<line x1="${cx - 4}" y1="${cy + 8}" x2="${cx + 4}" y2="${cy + 8}" stroke="${color}" stroke-width="2"/>`)
    } else if (comp.type === 'battery' || comp.type === 'solarcell') {
      parts.push(`<line x1="${cx - halfW}" y1="${cy}" x2="${cx - 5}" y2="${cy}" stroke="#334155" stroke-width="2"/>`)
      parts.push(`<line x1="${cx + 5}" y1="${cy}" x2="${cx + halfW}" y2="${cy}" stroke="#334155" stroke-width="2"/>`)
      parts.push(`<line x1="${cx - 5}" y1="${cy - 10}" x2="${cx - 5}" y2="${cy + 10}" stroke="${color}" stroke-width="3"/>`)
      parts.push(`<line x1="${cx + 5}" y1="${cy - 6}" x2="${cx + 5}" y2="${cy + 6}" stroke="${color}" stroke-width="2"/>`)
      parts.push(`<text x="${cx}" y="${cy + halfH + 12}" text-anchor="middle" fill="${color}" font-size="10" font-family="sans-serif">${comp.value}V</text>`)
    } else if (comp.type === 'resistor' || comp.type === 'thermistor' || comp.type === 'buzzer') {
      parts.push(`<line x1="${cx - halfW}" y1="${cy}" x2="${cx - 15}" y2="${cy}" stroke="#334155" stroke-width="2"/>`)
      parts.push(`<line x1="${cx + 15}" y1="${cy}" x2="${cx + halfW}" y2="${cy}" stroke="#334155" stroke-width="2"/>`)
      parts.push(`<rect x="${cx - 15}" y="${cy - 8}" width="30" height="16" rx="3" fill="${color}" stroke="#1e293b" stroke-width="1"/>`)
      parts.push(`<text x="${cx}" y="${cy + halfH + 12}" text-anchor="middle" fill="${color}" font-size="10" font-family="sans-serif">${comp.value}${def?.unit || ''}</text>`)
    } else if (comp.type === 'lamp' || comp.type === 'ammeter' || comp.type === 'voltmeter') {
      parts.push(`<line x1="${cx - halfW}" y1="${cy}" x2="${cx - 10}" y2="${cy}" stroke="#334155" stroke-width="2"/>`)
      parts.push(`<line x1="${cx + 10}" y1="${cy}" x2="${cx + halfW}" y2="${cy}" stroke="#334155" stroke-width="2"/>`)
      parts.push(`<circle cx="${cx}" cy="${cy}" r="10" fill="${color}" stroke="#1e293b" stroke-width="1"/>`)
      const sym = comp.type === 'lamp' ? '💡' : comp.type === 'ammeter' ? 'A' : 'V'
      parts.push(`<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#fff" font-size="10" font-family="sans-serif">${sym}</text>`)
    } else {
      parts.push(`<rect x="${cx - halfW}" y="${cy - halfH}" width="${halfW * 2}" height="${halfH * 2}" rx="4" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1.5"/>`)
      parts.push(`<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="${color}" font-size="10" font-family="sans-serif">${label}</text>`)
    }

    // Terminals
    for (const term of comp.terminals) {
      const [tx, ty] = getTerminalWorldPos(comp, term)
      parts.push(`<circle cx="${tx + ox}" cy="${ty + oy}" r="3" fill="#64748b"/>`)
    }
  }

  parts.push(`</svg>`)
  return parts.join('\n')
}

export function downloadSVG(svgContent: string, filename: string = 'circuit.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
