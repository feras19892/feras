import type { WorkshopComponent, ComponentType } from './types'
import { type DrawCtx, type RenderMode, drawTerminals, roundRect } from './drawHelpers'
import * as d3p from './draw3d-passive'
import * as d3s from './draw3d-switches'
import * as d3m from './draw3d-multimeter'
import * as d3a from './draw3d-advanced'
import * as d2b from './draw2d-basic'
import * as d2a from './draw2d-advanced'
import * as dsc from './draw-semiconductors'

export type { RenderMode } from './drawHelpers'
export { RESISTOR_COLORS, valueToResistorBands, getResistorBandColors } from './resistorColors'

export function drawComponent(
  ctx: CanvasRenderingContext2D,
  comp: WorkshopComponent,
  selectedId: number | null,
  dc: DrawCtx,
  running: boolean,
  renderMode: RenderMode = '3d',
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

  const draw2d = renderMode === '2d'

  if (comp.type === 'battery') {
    draw2d ? d2b.drawBattery2D(ctx, z, comp, isSelected, running) : d3p.drawBattery3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'resistor') {
    draw2d ? d2b.drawResistor2D(ctx, z, comp, isSelected, running) : d3p.drawResistor3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'capacitor') {
    draw2d ? d2b.drawCapacitor2D(ctx, z, comp, isSelected, running) : d3p.drawCapacitor3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'inductor') {
    draw2d ? d2b.drawInductor2D(ctx, z, comp, isSelected, running) : d3p.drawInductor3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'diode') {
    draw2d ? d2b.drawDiode2D(ctx, z, comp, isSelected, running) : d3p.drawDiode3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'switch') {
    draw2d ? d2b.drawSwitch2D(ctx, z, comp, isSelected, running) : d3p.drawSwitch3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'lamp') {
    draw2d ? d2b.drawLamp2D(ctx, z, comp, isSelected, running) : d3p.drawLamp3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'ammeter') {
    draw2d ? d2b.drawAmmeter2D(ctx, z, comp, isSelected, running) : d3p.drawAmmeter3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'voltmeter') {
    draw2d ? d2b.drawVoltmeter2D(ctx, z, comp, isSelected, running) : d3p.drawVoltmeter3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'relay') {
    draw2d ? d2a.drawRelay2D(ctx, z, comp, isSelected, running) : d3s.drawRelay3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'breaker') {
    draw2d ? d2a.drawBreaker2D(ctx, z, comp, isSelected, running) : d3s.drawBreaker3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'fuse') {
    draw2d ? d2a.drawFuse2D(ctx, z, comp, isSelected, running) : d3s.drawFuse3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'ground') {
    draw2d ? d2a.drawGround2D(ctx, z, comp, isSelected) : d3s.drawGround3D(ctx, z, comp, isSelected)
  } else if (comp.type === 'multimeter') {
    draw2d ? d2a.drawMultimeter2D(ctx, z, comp, isSelected, running) : d3m.drawMultimeter3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'acsource') {
    draw2d ? d2a.drawACSource2D(ctx, z, comp, isSelected, running) : d3a.drawACSource3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'transformer') {
    draw2d ? d2a.drawTransformer2D(ctx, z, comp, isSelected, running) : d3a.drawTransformer3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'oscilloscope') {
    draw2d ? d2a.drawOscilloscope2D(ctx, z, comp, isSelected, running) : d3a.drawOscilloscope3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'led') {
    drawLED(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'potentiometer') {
    drawPotentiometer(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'motor') {
    drawMotor(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'zener') {
    draw2d ? dsc.drawZener2D(ctx, z, comp, isSelected, running) : dsc.drawZener3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'npn') {
    draw2d ? dsc.drawNPN2D(ctx, z, comp, isSelected, running) : dsc.drawNPN3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'pnp') {
    draw2d ? dsc.drawPNP2D(ctx, z, comp, isSelected, running) : dsc.drawPNP3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'opamp') {
    draw2d ? dsc.drawOpAmp2D(ctx, z, comp, isSelected, running) : dsc.drawOpAmp3D(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'thermistor') {
    drawThermistor(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'buzzer') {
    drawBuzzer(ctx, z, comp, isSelected, running)
  } else if (comp.type === 'solarcell') {
    drawSolarCell(ctx, z, comp, isSelected, running)
  }

  if (comp.type !== 'multimeter') {
    drawTerminals(ctx, comp, z)
  }

  ctx.restore()

  if (comp.type === 'multimeter') {
    d3a.drawProbesAndClamp(ctx, comp, dc, renderMode)
  }
}

export function drawComponentIcon(
  ctx: CanvasRenderingContext2D,
  type: ComponentType,
  size: number,
  value: number = 0,
) {
  const cx = size / 2
  const cy = size / 2
  const z = size / 50

  const dummy: WorkshopComponent = {
    id: 0,
    type,
    x: 0, y: 0,
    rotation: 0,
    scale: 1,
    value: value,
    unit: '',
    label: '',
    terminals: [],
    voltage: 0,
    current: 0,
    closed: false,
    breakerTripped: false,
    fuseBlown: false,
    relayState: false,
    relayManualOverride: false,
    multimeterMode: 'voltage',
  }

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(z, z)

  const sel = false
  const running = false

  switch (type) {
    case 'battery':     d2b.drawBattery2D(ctx, 1, dummy, sel, running); break
    case 'resistor':    d2b.drawResistor2D(ctx, 1, dummy, sel, running); break
    case 'capacitor':   d2b.drawCapacitor2D(ctx, 1, dummy, sel, running); break
    case 'inductor':    d2b.drawInductor2D(ctx, 1, dummy, sel, running); break
    case 'diode':       d2b.drawDiode2D(ctx, 1, dummy, sel, running); break
    case 'switch':      d2b.drawSwitch2D(ctx, 1, dummy, sel, running); break
    case 'lamp':        d2b.drawLamp2D(ctx, 1, dummy, sel, running); break
    case 'ammeter':     d2b.drawAmmeter2D(ctx, 1, dummy, sel, running); break
    case 'voltmeter':   d2b.drawVoltmeter2D(ctx, 1, dummy, sel, running); break
    case 'relay':       d2a.drawRelay2D(ctx, 1, dummy, sel, running); break
    case 'breaker':     d2a.drawBreaker2D(ctx, 1, dummy, sel, running); break
    case 'fuse':        d2a.drawFuse2D(ctx, 1, dummy, sel, running); break
    case 'ground':      d2a.drawGround2D(ctx, 1, dummy, sel); break
    case 'multimeter':  d2a.drawMultimeter2D(ctx, 1, dummy, sel, running); break
    case 'acsource':    d2a.drawACSource2D(ctx, 1, dummy, sel, running); break
    case 'transformer': d2a.drawTransformer2D(ctx, 1, dummy, sel, running); break
    case 'oscilloscope':d2a.drawOscilloscope2D(ctx, 1, dummy, sel, running); break
    case 'led':         drawLED(ctx, 1, dummy, sel, running); break
    case 'potentiometer': drawPotentiometer(ctx, 1, dummy, sel, running); break
    case 'motor':       drawMotor(ctx, 1, dummy, sel, running); break
    case 'zener':       dsc.drawZener2D(ctx, 1, dummy, sel, running); break
    case 'npn':         dsc.drawNPN2D(ctx, 1, dummy, sel, running); break
    case 'pnp':         dsc.drawPNP2D(ctx, 1, dummy, sel, running); break
    case 'opamp':       dsc.drawOpAmp2D(ctx, 1, dummy, sel, running); break
    case 'thermistor':  drawThermistor(ctx, 1, dummy, sel, running); break
    case 'buzzer':      drawBuzzer(ctx, 1, dummy, sel, running); break
    case 'solarcell':   drawSolarCell(ctx, 1, dummy, sel, running); break
  }

  ctx.restore()
}

function drawLED(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const Vf = comp.value || 2
  const isOn = running && Math.abs(comp.current) > 0.001

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-14 * z, 0)
  ctx.lineTo(-8 * z, 0)
  ctx.moveTo(8 * z, 0)
  ctx.lineTo(14 * z, 0)
  ctx.stroke()

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * z)
  if (isOn) {
    grad.addColorStop(0, '#fca5a5')
    grad.addColorStop(0.5, '#ef4444')
    grad.addColorStop(1, '#991b1b')
  } else {
    grad.addColorStop(0, '#475569')
    grad.addColorStop(0.5, '#334155')
    grad.addColorStop(1, '#1e293b')
  }
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(0, 0, 10 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  ctx.stroke()

  if (isOn) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(-3 * z, -3 * z, 3 * z, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#64748b'
  ctx.font = `${8 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${Vf}V`, 0, 20 * z)
}

function drawPotentiometer(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const R = comp.value || 1000

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-25 * z, 0)
  ctx.lineTo(-18 * z, 0)
  ctx.moveTo(18 * z, 0)
  ctx.lineTo(25 * z, 0)
  ctx.moveTo(0, 25 * z)
  ctx.lineTo(0, 18 * z)
  ctx.stroke()

  ctx.fillStyle = '#f59e0b'
  ctx.strokeStyle = sel ? '#0ea5e9' : '#92400e'
  ctx.lineWidth = 1.5 * z
  roundRect(ctx, -18 * z, -12 * z, 36 * z, 24 * z, 4 * z)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#1e293b'
  ctx.beginPath()
  ctx.arc(0, 0, 6 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, 14 * z)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${R}Ω`, 0, -16 * z)
}

function drawMotor(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const V = comp.value || 6
  const isRunning = running && Math.abs(comp.current) > 0.001

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-22 * z, 0)
  ctx.lineTo(-16 * z, 0)
  ctx.moveTo(16 * z, 0)
  ctx.lineTo(22 * z, 0)
  ctx.stroke()

  const grad = ctx.createRadialGradient(-3 * z, -3 * z, 0, 0, 0, 16 * z)
  grad.addColorStop(0, '#94a3b8')
  grad.addColorStop(0.7, '#64748b')
  grad.addColorStop(1, '#334155')
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.arc(0, 0, 14 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  if (isRunning) {
    const angle = (Date.now() / 50) % (Math.PI * 2)
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2 * z
    for (let i = 0; i < 3; i++) {
      const a = angle + (i * Math.PI * 2 / 3)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * 10 * z, Math.sin(a) * 10 * z)
      ctx.stroke()
    }
  } else {
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 2 * z
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * 10 * z, Math.sin(a) * 10 * z)
      ctx.stroke()
    }
  }

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('M', 0, 3 * z)
  ctx.fillText(`${V}V`, 0, 24 * z)
}

function drawThermistor(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const R = comp.value || 10000

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-25 * z, 0)
  ctx.lineTo(-18 * z, 0)
  ctx.moveTo(18 * z, 0)
  ctx.lineTo(25 * z, 0)
  ctx.stroke()

  ctx.fillStyle = '#f97316'
  ctx.strokeStyle = sel ? '#0ea5e9' : '#9a3412'
  ctx.lineWidth = 1.5 * z
  roundRect(ctx, -18 * z, -10 * z, 36 * z, 20 * z, 4 * z)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-12 * z, -4 * z)
  ctx.lineTo(-6 * z, 4 * z)
  ctx.lineTo(0, -4 * z)
  ctx.lineTo(6 * z, 4 * z)
  ctx.lineTo(12 * z, -4 * z)
  ctx.stroke()

  ctx.strokeStyle = '#dc2626'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.moveTo(-14 * z, -12 * z)
  ctx.lineTo(-8 * z, -16 * z)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${R >= 1000 ? (R / 1000) + 'k' : R}Ω`, 0, 22 * z)
}

function drawBuzzer(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, running: boolean) {
  const isOn = running && Math.abs(comp.current) > 0.001

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-14 * z, 0)
  ctx.lineTo(-10 * z, 0)
  ctx.moveTo(10 * z, 0)
  ctx.lineTo(14 * z, 0)
  ctx.stroke()

  const grad = ctx.createRadialGradient(-3 * z, -3 * z, 0, 0, 0, 12 * z)
  if (isOn) {
    grad.addColorStop(0, '#fde047')
    grad.addColorStop(0.7, '#eab308')
    grad.addColorStop(1, '#a16207')
  } else {
    grad.addColorStop(0, '#94a3b8')
    grad.addColorStop(0.7, '#64748b')
    grad.addColorStop(1, '#334155')
  }
  ctx.fillStyle = grad
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  ctx.beginPath()
  ctx.arc(0, 0, 10 * z, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = isOn ? '#fff' : '#475569'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.arc(0, 0, 6 * z, -Math.PI / 4, Math.PI / 4)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 6 * z, Math.PI - Math.PI / 4, Math.PI + Math.PI / 4)
  ctx.stroke()

  if (isOn) {
    const t = Date.now() / 100
    for (let i = 0; i < 3; i++) {
      const r = 12 * z + ((t + i * 4) % 10) * z
      ctx.strokeStyle = `rgba(234,179,8,${Math.max(0, 0.5 - (r - 12 * z) / (10 * z) * 0.5)})`
      ctx.lineWidth = 1.5 * z
      ctx.beginPath()
      ctx.arc(0, 0, r, -Math.PI / 4, Math.PI / 4)
      ctx.stroke()
    }
  }

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${comp.value}Ω`, 0, 24 * z)
}

function drawSolarCell(ctx: CanvasRenderingContext2D, z: number, comp: WorkshopComponent, sel: boolean, _running: boolean) {
  const V = comp.value || 5

  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.moveTo(-22 * z, 0)
  ctx.lineTo(-18 * z, 0)
  ctx.moveTo(18 * z, 0)
  ctx.lineTo(22 * z, 0)
  ctx.stroke()

  ctx.fillStyle = '#1e40af'
  ctx.strokeStyle = sel ? '#0ea5e9' : '#1e293b'
  ctx.lineWidth = 1.5 * z
  roundRect(ctx, -18 * z, -12 * z, 36 * z, 24 * z, 3 * z)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1 * z
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 10 * z, -12 * z)
    ctx.lineTo(i * 10 * z, 12 * z)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(-18 * z, 0)
  ctx.lineTo(18 * z, 0)
  ctx.stroke()

  ctx.fillStyle = '#fbbf24'
  ctx.font = `${10 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('☀', 0, -16 * z)

  ctx.fillStyle = '#64748b'
  ctx.font = `${7 * z}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(`${V}V`, 0, 22 * z)
}
