import type { WorkshopComponent, ComponentType } from './types'
import { type DrawCtx, type RenderMode, drawTerminals } from './drawHelpers'
import * as d3p from './draw3d-passive'
import * as d3s from './draw3d-switches'
import * as d3m from './draw3d-multimeter'
import * as d3a from './draw3d-advanced'
import * as d2b from './draw2d-basic'
import * as d2a from './draw2d-advanced'
import * as dsc from './draw-semiconductors'
import { drawLED, drawPotentiometer, drawMotor, drawThermistor, drawBuzzer, drawSolarCell } from './drawCustomComponents'

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

