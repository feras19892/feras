import type { WorkshopComponent } from './types'

export function drawRelay2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 28 * z, h = 16 * z
  ctx.strokeStyle = sel ? '#fbbf24' : '#92400e'
  ctx.lineWidth = 2 * z
  ctx.strokeRect(-w, -h, w * 2, h * 2)
  ctx.strokeStyle = 'rgba(146,64,14,0.3)'
  ctx.lineWidth = 1 * z
  ctx.beginPath(); ctx.moveTo(-w * 0.9, 0); ctx.lineTo(w * 0.9, 0); ctx.stroke()
  const a1x = -w, a1y = -18 * z
  const a2x = w, a2y = -18 * z
  const comx = -w, comy = 18 * z
  const nox = w, noy = 18 * z
  const ncx = 0, ncy = 18 * z
  ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2 * z
  ctx.beginPath(); ctx.moveTo(a1x, a1y); ctx.lineTo(a1x, -h * 0.3); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(a2x, a2y); ctx.lineTo(a2x, -h * 0.3); ctx.stroke()
  const coilStart = -w * 0.35, coilEnd = w * 0.35, coilY = -h * 0.3
  const coilW = coilEnd - coilStart
  const bumps = 4
  ctx.beginPath()
  ctx.moveTo(coilStart, coilY)
  for (let i = 0; i < bumps; i++) {
    const cx = coilStart + coilW * (i + 0.5) / bumps
    ctx.arc(cx, coilY, coilW / (bumps * 2), Math.PI, 0, false)
  }
  ctx.stroke()
  ctx.beginPath(); ctx.moveTo(coilStart, coilY); ctx.lineTo(a1x, coilY); ctx.lineTo(a1x, -h * 0.3); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(coilEnd, coilY); ctx.lineTo(a2x, coilY); ctx.lineTo(a2x, -h * 0.3); ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${7 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('A1', a1x, a1y - 4 * z)
  ctx.fillText('A2', a2x, a2y - 4 * z)
  const pivotX = -w * 0.35, pivotY = h * 0.3
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2 * z
  ctx.beginPath(); ctx.moveTo(comx, comy); ctx.lineTo(comx, pivotY); ctx.lineTo(pivotX, pivotY); ctx.stroke()
  const noContactX = w * 0.35, noContactY = h * 0.1
  const ncContactX = w * 0.35, ncContactY = h * 0.5
  ctx.beginPath(); ctx.moveTo(noContactX, noContactY); ctx.lineTo(nox, noContactY); ctx.lineTo(nox, noy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ncContactX, ncContactY); ctx.lineTo(ncx, ncContactY); ctx.lineTo(ncx, ncy); ctx.stroke()
  ctx.fillStyle = '#64748b'
  ctx.beginPath(); ctx.arc(noContactX, noContactY, 2.5 * z, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(ncContactX, ncContactY, 2.5 * z, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(pivotX, pivotY, 2.5 * z, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = comp.relayState ? '#4ade80' : '#ef4444'
  ctx.lineWidth = 2.5 * z
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(pivotX, pivotY)
  if (comp.relayState) { ctx.lineTo(noContactX, noContactY) } else { ctx.lineTo(ncContactX, ncContactY) }
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${6 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('COM', comx, comy + 8 * z)
  ctx.fillText('NO', nox, noy + 8 * z)
  ctx.fillText('NC', ncx, ncy + 8 * z)
  ctx.fillStyle = comp.relayState ? '#4ade80' : '#ef4444'
  ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(comp.relayState ? 'ENG' : 'IDLE', 0, -h - 5 * z)
}

export function drawBreaker2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 16 * z, h = 10 * z
  ctx.strokeStyle = sel ? '#94a3b8' : '#475569'
  ctx.lineWidth = 2 * z
  ctx.strokeRect(-w, -h, w * 2, h * 2)
  ctx.strokeStyle = comp.breakerTripped ? '#ef4444' : '#22c55e'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.moveTo(0, h * 0.5)
  if (comp.breakerTripped) { ctx.lineTo(w * 0.5, -h * 0.3) } else { ctx.lineTo(0, -h * 0.5) }
  ctx.stroke()
  ctx.fillStyle = comp.breakerTripped ? '#ef4444' : '#22c55e'
  ctx.font = `bold ${8 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}A`, 0, -h - 5 * z)
  ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(comp.breakerTripped ? 'TRIPPED' : 'MCB', 0, h + 10 * z)
}

export function drawFuse2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 22 * z, h = 7 * z
  ctx.strokeStyle = sel ? '#e2e8f0' : '#94a3b8'
  ctx.lineWidth = 2 * z
  ctx.strokeRect(-w, -h, w * 2, h * 2)
  ctx.strokeStyle = comp.fuseBlown ? '#ef4444' : '#fbbf24'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  if (comp.fuseBlown) {
    ctx.moveTo(-w * 0.8, 0); ctx.lineTo(-w * 0.2, 0)
    ctx.moveTo(w * 0.2, 0); ctx.lineTo(w * 0.8, 0)
  } else {
    ctx.moveTo(-w * 0.8, 0); ctx.lineTo(w * 0.8, 0)
  }
  ctx.stroke()
  ctx.fillStyle = comp.fuseBlown ? '#ef4444' : '#94a3b8'
  ctx.font = `bold ${8 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}A`, 0, -h - 5 * z)
}

export function drawGround2D(ctx: CanvasRenderingContext2D, z: number, _comp: WorkshopComponent, sel: boolean) {
  const w = 12 * z
  ctx.strokeStyle = sel ? '#86efac' : '#22c55e'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(0, -10 * z); ctx.lineTo(0, 0)
  ctx.moveTo(-w, 0); ctx.lineTo(w, 0)
  ctx.moveTo(-w * 0.7, 6 * z); ctx.lineTo(w * 0.7, 6 * z)
  ctx.moveTo(-w * 0.4, 12 * z); ctx.lineTo(w * 0.4, 12 * z)
  ctx.stroke()
}

export function drawMultimeter2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 20 * z, h = 24 * z
  const mode = comp.multimeterMode || 'voltage'
  ctx.strokeStyle = sel ? '#38bdf8' : '#0ea5e9'
  ctx.lineWidth = 2 * z
  ctx.strokeRect(-w, -h, w * 2, h * 2)
  const scrX = -w * 0.7, scrY = -h + 4 * z, scrW = w * 1.4, scrH = h * 0.4
  ctx.fillStyle = '#1a2a1a'
  ctx.fillRect(scrX, scrY, scrW, scrH)
  if (running) {
    let displayVal = '0.000'
    let displayUnit = ''
    if (mode === 'voltage') {
      const v = Math.abs(comp.voltage)
      if (v < 1e-3) { displayVal = (v * 1e6).toFixed(0); displayUnit = 'µV' }
      else if (v < 1) { displayVal = (v * 1e3).toFixed(1); displayUnit = 'mV' }
      else if (v < 1000) { displayVal = v.toFixed(2); displayUnit = 'V' }
      else { displayVal = (v / 1e3).toFixed(2); displayUnit = 'kV' }
    } else if (mode === 'current') {
      const a = Math.abs(comp.current)
      if (a < 1e-3) { displayVal = (a * 1e6).toFixed(0); displayUnit = 'µA' }
      else if (a < 1) { displayVal = (a * 1e3).toFixed(1); displayUnit = 'mA' }
      else { displayVal = a.toFixed(3); displayUnit = 'A' }
    } else if (mode === 'resistance') {
      const r = Math.abs(comp.current) > 1e-10 ? Math.abs(comp.voltage / comp.current) : 0
      if (r < 1) { displayVal = r.toFixed(2); displayUnit = 'Ω' }
      else if (r < 1000) { displayVal = r.toFixed(1); displayUnit = 'Ω' }
      else if (r < 1e6) { displayVal = (r / 1e3).toFixed(2); displayUnit = 'kΩ' }
      else { displayVal = (r / 1e6).toFixed(2); displayUnit = 'MΩ' }
    }
    ctx.fillStyle = '#4ade80'
    ctx.font = `bold ${8 * z}px monospace`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    const valY = scrY + scrH / 2
    ctx.fillText(displayVal, scrX + scrW - 6 * z, valY)
    ctx.font = `bold ${5 * z}px monospace`
    ctx.textAlign = 'left'
    ctx.fillText(displayUnit, scrX + scrW - 5 * z, valY)
    ctx.textBaseline = 'alphabetic'
  } else {
    ctx.fillStyle = '#5a6a4a'; ctx.font = `bold ${7 * z}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('---', 0, scrY + scrH / 2)
    ctx.textBaseline = 'alphabetic'
  }
  ctx.fillStyle = '#38bdf8'; ctx.font = `bold ${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  const modeLabel = mode === 'voltage' ? 'V' : mode === 'current' ? 'A' : 'Ω'
  ctx.fillText(modeLabel, 0, h * 0.2)
}

export function drawACSource2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 22 * z, h = 14 * z
  ctx.strokeStyle = sel ? '#fbbf24' : '#3b82f6'
  ctx.lineWidth = 2 * z
  ctx.strokeRect(-w, -h, w * 2, h * 2)
  ctx.strokeStyle = '#93c5fd'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  const sw = w * 0.7, sh = h * 0.4
  for (let i = 0; i <= 30; i++) {
    const x = -sw + (2 * sw * i / 30)
    const y = sh * Math.sin((i / 30) * Math.PI * 2)
    if (i === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
  }
  ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${8 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('~', -w + 6 * z, 3 * z)
  ctx.fillText('~', w - 6 * z, 3 * z)
  const freq = comp.acFrequency ?? 50
  const vamp = comp.acAmplitude ?? comp.value
  ctx.fillStyle = '#64748b'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`${vamp}V ${freq}Hz`, 0, h + 10 * z)
}

export function drawTransformer2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 28 * z, h = 18 * z
  ctx.strokeStyle = sel ? '#fbbf24' : '#8b5cf6'
  ctx.lineWidth = 2 * z
  ctx.strokeRect(-w, -h, w * 2, h * 2)
  ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2 * z
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(-w * 0.3, -h * 0.2 + i * h * 0.2, w * 0.15, Math.PI / 2, Math.PI * 1.5, false)
    ctx.stroke()
  }
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(w * 0.3, -h * 0.2 + i * h * 0.2, w * 0.15, -Math.PI / 2, Math.PI / 2, false)
    ctx.stroke()
  }
  ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 1.5 * z
  ctx.beginPath(); ctx.moveTo(-2 * z, -h * 0.5); ctx.lineTo(-2 * z, h * 0.5); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(2 * z, -h * 0.5); ctx.lineTo(2 * z, h * 0.5); ctx.stroke()
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${6 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('P1', -w, -h - 4 * z)
  ctx.fillText('P2', w, -h - 4 * z)
  ctx.fillText('S1', -w, h + 8 * z)
  ctx.fillText('S2', w, h + 8 * z)
  const ratio = comp.transformerRatio ?? comp.value
  ctx.fillStyle = '#a78bfa'; ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(`1:${ratio}`, 0, -h - 4 * z)
}

export function drawOscilloscope2D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 34 * z, h = 22 * z
  ctx.strokeStyle = sel ? '#fbbf24' : '#06b6d4'
  ctx.lineWidth = 2 * z
  ctx.strokeRect(-w, -h, w * 2, h * 2)
  ctx.fillStyle = '#0c1117'
  ctx.fillRect(-w * 0.8, -h * 0.7, w * 1.6, h * 1.2)
  ctx.strokeStyle = '#155e63'; ctx.lineWidth = 1 * z
  ctx.strokeRect(-w * 0.8, -h * 0.7, w * 1.6, h * 1.2)
  ctx.strokeStyle = 'rgba(34,211,238,0.15)'; ctx.lineWidth = 0.5 * z
  for (let i = 1; i < 8; i++) {
    const gx = -w * 0.8 + (w * 1.6 * i / 8)
    ctx.beginPath(); ctx.moveTo(gx, -h * 0.7); ctx.lineTo(gx, h * 0.5); ctx.stroke()
  }
  for (let i = 1; i < 5; i++) {
    const gy = -h * 0.7 + (h * 1.2 * i / 5)
    ctx.beginPath(); ctx.moveTo(-w * 0.8, gy); ctx.lineTo(w * 0.8, gy); ctx.stroke()
  }
  const trace = comp.oscilloscopeTrace
  if (trace && trace.length > 1) {
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5 * z
    ctx.beginPath()
    const maxV = Math.max(...trace.map(p => Math.abs(p.v)), 0.1)
    const screenW = w * 1.6, screenH = h * 1.2, screenTop = -h * 0.7
    for (let i = 0; i < trace.length; i++) {
      const px = -w * 0.8 + (screenW * i / (trace.length - 1))
      const py = screenTop + screenH / 2 - (trace[i].v / maxV) * screenH * 0.4
      if (i === 0) { ctx.moveTo(px, py) } else { ctx.lineTo(px, py) }
    }
    ctx.stroke()
  } else {
    ctx.strokeStyle = 'rgba(74,222,128,0.4)'; ctx.lineWidth = 1.5 * z
    ctx.beginPath()
    for (let i = 0; i <= 40; i++) {
      const px = -w * 0.8 + (w * 1.6 * i / 40)
      const py = -h * 0.1 + h * 0.3 * Math.sin((i / 40) * Math.PI * 4)
      if (i === 0) { ctx.moveTo(px, py) } else { ctx.lineTo(px, py) }
    }
    ctx.stroke()
  }
  ctx.fillStyle = '#4ade80'; ctx.font = `bold ${6 * z}px sans-serif`; ctx.textAlign = 'left'
  ctx.fillText('CH1', -w * 0.75, -h * 0.55)
  ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${7 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('OSC', 0, h + 10 * z)
}
