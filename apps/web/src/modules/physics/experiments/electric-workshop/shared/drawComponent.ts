import type { WorkshopComponent } from './types'

interface DrawCtx {
  zoom: number
  panX: number
  panY: number
  worldToScreen: (x: number, y: number) => [number, number]
}

export function drawComponent(
  ctx: CanvasRenderingContext2D,
  comp: WorkshopComponent,
  selectedId: number | null,
  dc: DrawCtx,
  running: boolean,
) {
  const { worldToScreen, zoom } = dc
  const [sx, sy] = worldToScreen(comp.x, comp.y)
  const compScale = comp.scale ?? 1
  const z = zoom * compScale
  const isSelected = selectedId === comp.id
  const r = comp.rotation * Math.PI / 180

  ctx.save()
  ctx.translate(sx, sy)
  ctx.rotate(r)


  if (comp.type === 'battery') {
    drawBattery3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'resistor') {
    drawResistor3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'capacitor') {
    drawCapacitor3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'inductor') {
    drawInductor3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'diode') {
    drawDiode3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'switch') {
    drawSwitch3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'lamp') {
    drawLamp3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'ammeter') {
    drawAmmeter3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'voltmeter') {
    drawVoltmeter3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'relay') {
    drawRelay3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'breaker') {
    drawBreaker3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'fuse') {
    drawFuse3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'ground') {
    drawGround3D(ctx, z, comp, isSelected)
  } else if (comp.type === 'multimeter') {
    drawMultimeter3D(ctx, z, comp, isSelected, running)
  }

  // Draw terminals
  drawTerminals(ctx, comp, z)

  ctx.restore()
}

function drawTerminals(ctx: CanvasRenderingContext2D, comp: WorkshopComponent, z: number) {
  for (const t of comp.terminals) {
    const tx = t.dx * z
    const ty = t.dy * z
    const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 4 * z)
    grad.addColorStop(0, '#cbd5e1')
    grad.addColorStop(1, '#475569')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(tx, ty, 4 * z, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1 * z
    ctx.stroke()
  }
}

function drawBattery3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 22 * z, h = 10 * z
  // 3D body
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#fbbf24')
  grad.addColorStop(0.5, '#f59e0b')
  grad.addColorStop(1, '#b45309')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fde68a' : '#92400e'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  // Terminal markers
  ctx.fillStyle = '#fde68a'
  ctx.font = `bold ${10 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('+', w * 0.7, -h - 4 * z)
  ctx.fillText('−', -w * 0.7, -h - 4 * z)
  // Value
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${10 * z}px sans-serif`
  ctx.fillText(`${comp.value}V`, 0, 3 * z)
  // Current flow animation
  if (running && Math.abs(comp.current) > 0.001) {
    ctx.fillStyle = `rgba(74,222,128,${0.3 + 0.2 * Math.sin(Date.now() / 200)})`
    ctx.font = `${8 * z}px sans-serif`
    ctx.fillText('⚡', 0, h + 10 * z)
  }
}

function drawResistor3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 25 * z, h = 10 * z
  // 3D body
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#818cf8')
  grad.addColorStop(0.5, '#6366f1')
  grad.addColorStop(1, '#3730a3')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#a5b4fc' : '#312e81'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 3 * z)
  ctx.fill()
  ctx.stroke()
  // Color bands
  const bandColors = ['#ef4444', '#f59e0b', '#22c55e', '#fbbf24']
  for (let i = 0; i < 4; i++) {
    const bx = -w * 0.5 + i * w * 0.25
    ctx.fillStyle = bandColors[i]
    ctx.fillRect(bx, -h, w * 0.08, h * 2)
  }
  // Value
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}Ω`, 0, -h - 5 * z)
}

function drawCapacitor3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 7 * z, gap = 4 * z, h = 14 * z
  ctx.strokeStyle = sel ? '#67e8f9' : '#06b6d4'
  ctx.lineWidth = 3 * z
  // Plates with gradient
  const grad = ctx.createLinearGradient(-w - gap, 0, w + gap, 0)
  grad.addColorStop(0, '#22d3ee')
  grad.addColorStop(0.5, '#06b6d4')
  grad.addColorStop(1, '#0e7490')
  ctx.strokeStyle = grad
  ctx.beginPath()
  ctx.moveTo(-w - gap, -h); ctx.lineTo(-w - gap, h)
  ctx.moveTo(w + gap, -h); ctx.lineTo(w + gap, h)
  ctx.stroke()
  // Leads
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 3, 0); ctx.lineTo(-w - gap, 0)
  ctx.moveTo(w + gap, 0); ctx.lineTo(w * 3, 0)
  ctx.stroke()
  // Value
  ctx.fillStyle = '#67e8f9'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}µF`, 0, -h - 5 * z)
}

function drawInductor3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 25 * z, r = 6 * z
  ctx.strokeStyle = sel ? '#c084fc' : '#a855f7'
  ctx.lineWidth = 3 * z
  // Coils
  const coils = 4
  ctx.beginPath()
  ctx.moveTo(-w, 0)
  for (let i = 0; i < coils; i++) {
    const cx = -w + (i + 0.5) * (w * 2 / coils)
    ctx.arc(cx, 0, r, Math.PI, 0, false)
  }
  ctx.lineTo(w, 0)
  ctx.stroke()
  // Glow when energized
  if (running && Math.abs(comp.current) > 0.001) {
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 10 * z
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  // Value
  ctx.fillStyle = '#c084fc'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}mH`, 0, -r - 8 * z)
}

function drawDiode3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 14 * z, h = 11 * z
  // Triangle (anode → cathode)
  const grad = ctx.createLinearGradient(-w, 0, w, 0)
  grad.addColorStop(0, '#fca5a5')
  grad.addColorStop(1, '#dc2626')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fca5a5' : '#991b1b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w, -h)
  ctx.lineTo(-w, h)
  ctx.lineTo(w, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // Cathode line
  ctx.beginPath()
  ctx.moveTo(w, -h); ctx.lineTo(w, h)
  ctx.stroke()
  // Leads
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-w * 2, 0); ctx.lineTo(-w, 0)
  ctx.moveTo(w, 0); ctx.lineTo(w * 2, 0)
  ctx.stroke()
  // Value
  ctx.fillStyle = '#fca5a5'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, -h - 5 * z)
}

function drawSwitch3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 16 * z, h = 10 * z
  // Base
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#4ade80')
  grad.addColorStop(1, '#15803d')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#86efac' : '#14532d'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 3 * z)
  ctx.fill()
  ctx.stroke()
  // Lever
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.moveTo(-w * 0.6, 0)
  if (comp.closed) {
    ctx.lineTo(w * 0.6, 0)
  } else {
    ctx.lineTo(w * 0.4, -h * 0.8)
  }
  ctx.stroke()
  // Contact dot
  ctx.fillStyle = comp.closed ? '#4ade80' : '#ef4444'
  ctx.beginPath()
  ctx.arc(w * 0.6, 0, 3 * z, 0, Math.PI * 2)
  ctx.fill()
  // Status
  ctx.fillStyle = comp.closed ? '#4ade80' : '#ef4444'
  ctx.font = `bold ${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(comp.closed ? 'ON' : 'OFF', 0, -h - 5 * z)
}

function drawLamp3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 12 * z
  const power = running ? Math.abs(comp.voltage * comp.current) : 0
  const brightness = Math.min(1, power / 10)
  // Glow
  if (brightness > 0) {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3)
    grad.addColorStop(0, `rgba(253,224,71,${brightness * 0.5})`)
    grad.addColorStop(1, 'rgba(253,224,71,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(0, 0, r * 3, 0, Math.PI * 2)
    ctx.fill()
  }
  // Bulb
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  grad.addColorStop(0, brightness > 0 ? `rgba(253,224,71,${0.3 + brightness * 0.5})` : '#1e293b')
  grad.addColorStop(1, brightness > 0 ? `rgba(245,158,11,${brightness * 0.3})` : '#0d1117')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fde68a' : '#f59e0b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // Filament
  ctx.strokeStyle = brightness > 0 ? '#fbbf24' : '#475569'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(-r * 0.5, -r * 0.5); ctx.lineTo(r * 0.5, r * 0.5)
  ctx.moveTo(r * 0.5, -r * 0.5); ctx.lineTo(-r * 0.5, r * 0.5)
  ctx.stroke()
  // Value
  ctx.fillStyle = '#fbbf24'
  ctx.font = `bold ${9 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}V`, 0, r + 12 * z)
}

function drawAmmeter3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 13 * z
  // 3D bezel
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  grad.addColorStop(0, '#0d1526')
  grad.addColorStop(1, '#020617')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#4ade80' : '#22c55e'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // Label
  ctx.fillStyle = '#4ade80'
  ctx.font = `bold ${11 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('A', 0, 4 * z)
  // Reading
  const val = running ? Math.abs(comp.current).toFixed(3) : '0.000'
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${8 * z}px sans-serif`
  ctx.fillText(`${val}A`, 0, r + 12 * z)
}

function drawVoltmeter3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const r = 13 * z
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  grad.addColorStop(0, '#0d1526')
  grad.addColorStop(1, '#020617')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#a78bfa' : '#8b5cf6'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#a78bfa'
  ctx.font = `bold ${11 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('V', 0, 4 * z)
  const val = running ? Math.abs(comp.voltage).toFixed(2) : '0.00'
  ctx.fillStyle = '#94a3b8'
  ctx.font = `${8 * z}px sans-serif`
  ctx.fillText(`${val}V`, 0, r + 12 * z)
}

function drawRelay3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 28 * z, h = 18 * z
  // Body
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#a16207')
  grad.addColorStop(0.5, '#92400e')
  grad.addColorStop(1, '#451a03')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#fbbf24' : '#451a03'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()
  // Coil (left side)
  ctx.strokeStyle = '#d97706'
  ctx.lineWidth = 2 * z
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(-w * 0.5 + i * 8 * z, 0, 6 * z, 0, Math.PI * 2)
    ctx.stroke()
  }
  // Switch (right side)
  ctx.strokeStyle = comp.relayState ? '#4ade80' : '#ef4444'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(w * 0.3, -h * 0.5)
  if (comp.relayState) {
    ctx.lineTo(w * 0.7, h * 0.3)
  } else {
    ctx.lineTo(w * 0.7, -h * 0.8)
  }
  ctx.stroke()
  // Labels
  ctx.fillStyle = '#fbbf24'
  ctx.font = `bold ${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('RELAY', 0, -h - 5 * z)
  ctx.fillStyle = comp.relayState ? '#4ade80' : '#ef4444'
  ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(comp.relayState ? 'ENG' : 'IDLE', 0, h + 10 * z)
}

function drawBreaker3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 18 * z, h = 11 * z
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, '#64748b')
  grad.addColorStop(0.5, '#475569')
  grad.addColorStop(1, '#1e293b')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#94a3b8' : '#0f172a'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 3 * z)
  ctx.fill()
  ctx.stroke()
  // Lever
  ctx.strokeStyle = comp.breakerTripped ? '#ef4444' : '#22c55e'
  ctx.lineWidth = 3 * z
  ctx.beginPath()
  ctx.moveTo(0, h * 0.5)
  if (comp.breakerTripped) {
    ctx.lineTo(w * 0.5, -h * 0.3)
  } else {
    ctx.lineTo(0, -h * 0.5)
  }
  ctx.stroke()
  // Label
  ctx.fillStyle = comp.breakerTripped ? '#ef4444' : '#22c55e'
  ctx.font = `bold ${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}A`, 0, -h - 5 * z)
  ctx.font = `${7 * z}px sans-serif`
  ctx.fillText(comp.breakerTripped ? 'TRIPPED' : 'MCB', 0, h + 10 * z)
}

function drawFuse3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const w = 22 * z, h = 7 * z
  // Glass body
  const grad = ctx.createLinearGradient(0, -h, 0, h)
  grad.addColorStop(0, 'rgba(226,232,240,0.3)')
  grad.addColorStop(1, 'rgba(100,116,139,0.3)')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#e2e8f0' : '#94a3b8'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, h)
  ctx.fill()
  ctx.stroke()
  // Fuse wire
  ctx.strokeStyle = comp.fuseBlown ? '#ef4444' : '#fbbf24'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  if (comp.fuseBlown) {
    ctx.moveTo(-w * 0.8, 0)
    ctx.lineTo(-w * 0.2, 0)
    ctx.moveTo(w * 0.2, 0)
    ctx.lineTo(w * 0.8, 0)
  } else {
    ctx.moveTo(-w * 0.8, 0)
    ctx.lineTo(w * 0.8, 0)
  }
  ctx.stroke()
  // Label
  ctx.fillStyle = comp.fuseBlown ? '#ef4444' : '#94a3b8'
  ctx.font = `bold ${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}A`, 0, -h - 5 * z)
}

function drawGround3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean) {
  const w = 12 * z
  ctx.strokeStyle = sel ? '#86efac' : '#22c55e'
  ctx.lineWidth = 3 * z
  // Three horizontal lines (decreasing)
  ctx.beginPath()
  ctx.moveTo(0, -10 * z); ctx.lineTo(0, 0)
  ctx.moveTo(-w, 0); ctx.lineTo(w, 0)
  ctx.moveTo(-w * 0.7, 6 * z); ctx.lineTo(w * 0.7, 6 * z)
  ctx.moveTo(-w * 0.4, 12 * z); ctx.lineTo(w * 0.4, 12 * z)
  ctx.stroke()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawMultimeter3D(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const w = 22 * z, h = 28 * z
  const mode = comp.multimeterMode || 'voltage'

  // Body (3D gradient - dark blue plastic)
  const bodyGrad = ctx.createLinearGradient(-w, -h, w, h)
  bodyGrad.addColorStop(0, '#1e3a5f')
  bodyGrad.addColorStop(0.5, '#0f1f3a')
  bodyGrad.addColorStop(1, '#050a18')
  ctx.fillStyle = bodyGrad
  ctx.strokeStyle = sel ? '#38bdf8' : '#0ea5e9'
  ctx.lineWidth = 2 * z
  roundRect(ctx, -w, -h, w * 2, h * 2, 4 * z)
  ctx.fill()
  ctx.stroke()

  // Top highlight (3D shine)
  const shineGrad = ctx.createLinearGradient(0, -h, 0, -h * 0.5)
  shineGrad.addColorStop(0, 'rgba(255,255,255,0.08)')
  shineGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shineGrad
  roundRect(ctx, -w + 2 * z, -h + 2 * z, w * 2 - 4 * z, h * 0.5, 3 * z)
  ctx.fill()

  // LCD Screen
  const lcdW = w * 1.5, lcdH = h * 0.4
  const lcdX = -lcdW / 2, lcdY = -h + 5 * z
  // Screen bezel
  ctx.fillStyle = '#1a1a2e'
  roundRect(ctx, lcdX - 2 * z, lcdY - 2 * z, lcdW + 4 * z, lcdH + 4 * z, 2 * z)
  ctx.fill()
  // Screen background
  const lcdGrad = ctx.createLinearGradient(lcdX, lcdY, lcdX, lcdY + lcdH)
  lcdGrad.addColorStop(0, '#c0c8a0')
  lcdGrad.addColorStop(1, '#a8b890')
  ctx.fillStyle = lcdGrad
  roundRect(ctx, lcdX, lcdY, lcdW, lcdH, 2 * z)
  ctx.fill()

  // Screen content
  ctx.textAlign = 'center'
  if (running) {
    let displayVal = '0.000'
    let displayUnit = ''
    if (mode === 'voltage') {
      displayVal = Math.abs(comp.voltage).toFixed(2)
      displayUnit = 'V'
    } else if (mode === 'current') {
      displayVal = Math.abs(comp.current).toFixed(3)
      displayUnit = 'A'
    } else if (mode === 'resistance') {
      const r = Math.abs(comp.current) > 1e-10 ? Math.abs(comp.voltage / comp.current) : 0
      displayVal = r < 1000 ? r.toFixed(0) : (r / 1000).toFixed(1) + 'k'
      displayUnit = 'Ω'
    }
    ctx.fillStyle = '#1a2a1a'
    ctx.font = `bold ${9 * z}px monospace`
    ctx.fillText(displayVal, 0, lcdY + lcdH * 0.5)
    ctx.font = `bold ${6 * z}px monospace`
    ctx.textAlign = 'right'
    ctx.fillText(displayUnit, lcdX + lcdW - 3 * z, lcdY + lcdH * 0.5)
  } else {
    ctx.fillStyle = '#5a6a4a'
    ctx.font = `bold ${8 * z}px monospace`
    ctx.fillText('---', 0, lcdY + lcdH * 0.55)
  }

  // Mode indicator on screen (top-left)
  ctx.textAlign = 'left'
  ctx.fillStyle = running ? '#2a4a2a' : '#5a6a4a'
  ctx.font = `${5 * z}px monospace`
  const modeLabel = mode === 'voltage' ? 'V DC' : mode === 'current' ? 'A DC' : 'Ω'
  ctx.fillText(modeLabel, lcdX + 2 * z, lcdY + 7 * z)

  // Mode selector dial (bottom part)
  const dialY = h * 0.35
  const dialR = 8 * z
  const dialGrad = ctx.createRadialGradient(0, dialY, 0, 0, dialY, dialR)
  dialGrad.addColorStop(0, '#334155')
  dialGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = dialGrad
  ctx.beginPath()
  ctx.arc(0, dialY, dialR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 1 * z
  ctx.stroke()

  // Mode labels around dial
  const modes = [
    { label: 'V', angle: -Math.PI / 2, color: mode === 'voltage' ? '#38bdf8' : '#64748b' },
    { label: 'A', angle: 0, color: mode === 'current' ? '#38bdf8' : '#64748b' },
    { label: 'Ω', angle: Math.PI / 2, color: mode === 'resistance' ? '#38bdf8' : '#64748b' },
  ]
  for (const m of modes) {
    const lx = Math.cos(m.angle) * (dialR + 4 * z)
    const ly = dialY + Math.sin(m.angle) * (dialR + 4 * z)
    ctx.fillStyle = m.color
    ctx.font = `bold ${5 * z}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(m.label, lx, ly + 2 * z)
  }

  // Dial pointer
  const activeAngle = mode === 'voltage' ? -Math.PI / 2 : mode === 'current' ? 0 : Math.PI / 2
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(0, dialY)
  ctx.lineTo(Math.cos(activeAngle) * dialR * 0.7, dialY + Math.sin(activeAngle) * dialR * 0.7)
  ctx.stroke()

  // Center dot
  ctx.fillStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(0, dialY, 1.5 * z, 0, Math.PI * 2)
  ctx.fill()

  // Probe terminals (red and black jacks at bottom)
  const jackY = h - 3 * z
  const jackR = 3 * z
  // Red jack (V/Ω)
  const redGrad = ctx.createRadialGradient(-8 * z, jackY, 0, -8 * z, jackY, jackR)
  redGrad.addColorStop(0, '#fca5a5')
  redGrad.addColorStop(1, '#dc2626')
  ctx.fillStyle = redGrad
  ctx.beginPath()
  ctx.arc(-8 * z, jackY, jackR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#7f1d1d'
  ctx.lineWidth = 1 * z
  ctx.stroke()

  // Black jack (COM)
  const blackGrad = ctx.createRadialGradient(8 * z, jackY, 0, 8 * z, jackY, jackR)
  blackGrad.addColorStop(0, '#64748b')
  blackGrad.addColorStop(1, '#1e293b')
  ctx.fillStyle = blackGrad
  ctx.beginPath()
  ctx.arc(8 * z, jackY, jackR, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1 * z
  ctx.stroke()

  // Brand label
  ctx.fillStyle = '#38bdf8'
  ctx.font = `bold ${4 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('DMM', 0, -h + 3 * z)
}
