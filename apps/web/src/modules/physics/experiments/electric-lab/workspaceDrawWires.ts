import type { CanvasContext, WorkspaceProps } from './workspaceTypes'
import { drawWheatstoneWires } from './workspaceDrawWiresBridge'
import { drawRcWires } from './workspaceDrawWiresRC'
import { drawSeriesWires } from './workspaceDrawWiresSeries'
import { drawPotentiometerWires } from './workspaceDrawWiresPotentiometer'
import { drawKirchhoffWires } from './workspaceDrawWiresKirchhoff'

export function drawWires(ctx: CanvasRenderingContext2D, cc: CanvasContext, props: WorkspaceProps) {
  if (props.components.length < 2) return
  const { worldToScreen, zoom } = cc
  const z = zoom.value
  ctx.strokeStyle = props.running ? '#4ade80' : '#475569'
  ctx.lineWidth = 2 * z; ctx.lineCap = 'round'

  const batteries = props.components.filter(c => c.type === 'battery')
  const resistors = props.components.filter(c => c.type === 'resistor')
  const ammeters = props.components.filter(c => c.type === 'ammeter')
  const vol = props.components.find(c => c.type === 'voltmeter')
  const caps = props.components.filter(c => c.type === 'capacitor')
  const sw = props.components.find(c => c.type === 'switch')
  const lamps = props.components.filter(c => c.type === 'lamp')
  const galvs = props.components.filter(c => c.type === 'galvanometer')

  if (galvs.length >= 1 && batteries.length >= 1 && resistors.length >= 3 && caps.length === 0 && lamps.length === 0) {
    drawWheatstoneWires(ctx, cc, props, props.components)
    return
  } else if (galvs.length >= 1 && batteries.length >= 1 && caps.length === 0 && lamps.length === 0) {
    const batt = batteries[0], galv = galvs[0], coil = resistors[0]
    const [bx, by] = worldToScreen(batt.x, batt.y)
    const [gx, gy] = worldToScreen(galv.x, galv.y)
    const [sx, sy] = sw ? worldToScreen(sw.x, sw.y) : [bx + 60 * z, by]
    const [cx, cy] = coil ? worldToScreen(coil.x, coil.y) : [gx - 100 * z, gy]
    const botY = Math.max(by, gy) + 40 * z
    ctx.beginPath()
    ctx.moveTo(bx + 30 * z, by); ctx.lineTo(sx - 20 * z, sy)
    ctx.moveTo(sx + 20 * z, sy); ctx.lineTo(cx - 20 * z, cy)
    ctx.moveTo(cx + 20 * z, cy); ctx.lineTo(gx - 20 * z, gy)
    ctx.moveTo(gx + 20 * z, gy); ctx.lineTo(gx + 40 * z, gy)
    ctx.lineTo(gx + 40 * z, botY); ctx.lineTo(bx - 30 * z, botY); ctx.lineTo(bx - 30 * z, by)
    ctx.stroke()
  } else if (lamps.length >= 1 && batteries.length >= 1 && caps.length === 0) {
    const batt = batteries[0], lamp = lamps[0], amm = ammeters[0]
    const [bx, by] = worldToScreen(batt.x, batt.y)
    const [lx, ly] = worldToScreen(lamp.x, lamp.y)
    const [sx, sy] = sw ? worldToScreen(sw.x, sw.y) : [bx + 60 * z, by]
    const [ax, ay] = amm ? worldToScreen(amm.x, amm.y) : [lx + 80 * z, ly]
    const botY = Math.max(by, ly) + 40 * z
    ctx.beginPath()
    ctx.moveTo(bx + 30 * z, by); ctx.lineTo(sx - 20 * z, sy)
    ctx.moveTo(sx + 20 * z, sy); ctx.lineTo(lx - 16 * z, ly)
    ctx.moveTo(lx + 16 * z, ly); ctx.lineTo(ax - 18 * z, ay)
    ctx.moveTo(ax + 18 * z, ay); ctx.lineTo(ax + 40 * z, ay)
    ctx.lineTo(ax + 40 * z, botY); ctx.lineTo(bx - 30 * z, botY); ctx.lineTo(bx - 30 * z, by)
    ctx.stroke()
    if (vol) {
      const [vx, vy] = worldToScreen(vol.x, vol.y)
      ctx.strokeStyle = props.running ? '#a78bfa' : '#475569'
      ctx.setLineDash([5 * z, 5 * z])
      ctx.beginPath()
      ctx.moveTo(vx - 18 * z, vy); ctx.lineTo(lx - 16 * z, ly + 16 * z)
      ctx.moveTo(vx + 18 * z, vy); ctx.lineTo(lx + 16 * z, ly + 16 * z)
      ctx.stroke(); ctx.setLineDash([])
    }
  } else if (caps.length >= 1 && batteries.length >= 1) {
    drawRcWires(ctx, cc, props)
    return
  } else if (batteries.length >= 2 && resistors.length >= 2 && galvs.length === 0 && caps.length === 0 && lamps.length === 0 && ammeters.length >= 1 && !ammeters.some(a => a.label === 'A1' || a.label === 'A2' || a.label === 'A3')) {
    drawPotentiometerWires(ctx, cc, props)
    return
  } else if (batteries.length === 1 && resistors.length >= 2 && !ammeters.some(a => a.label === 'At')) {
    drawSeriesWires(ctx, cc, props)
    return
  } else if (batteries.length === 1 && resistors.length === 2) {
    const batt = batteries[0], [r1, r2] = resistors
    const at = ammeters.find(a => a.label === 'At')
    const a1 = ammeters.find(a => a.label === 'A1')
    const a2 = ammeters.find(a => a.label === 'A2')
    const [bx, by] = worldToScreen(batt.x, batt.y)
    const [r1x, r1y] = worldToScreen(r1.x, r1.y)
    const [r2x, r2y] = worldToScreen(r2.x, r2.y)
    const [atx, aty] = at ? worldToScreen(at.x, at.y) : [bx + 60 * z, by]
    const [a1x, a1y] = a1 ? worldToScreen(a1.x, a1.y) : [r1x - 60 * z, r1y]
    const [a2x, a2y] = a2 ? worldToScreen(a2.x, a2.y) : [r2x - 60 * z, r2y]
    const topY = Math.min(r1y, r2y) - 30 * z
    const botY = Math.max(r1y, r2y) + 30 * z
    const midY = by
    ctx.beginPath()
    ctx.moveTo(bx + 30 * z, by); ctx.lineTo(atx - 18 * z, aty)
    ctx.moveTo(atx + 18 * z, aty); ctx.lineTo(r1x - 40 * z, topY); ctx.lineTo(r1x - 40 * z, r1y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(r1x - 40 * z, topY); ctx.lineTo(a1x - 18 * z, a1y)
    ctx.moveTo(a1x + 18 * z, a1y); ctx.lineTo(r1x - 40 * z, r1y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(r1x - 40 * z, topY); ctx.lineTo(r2x - 40 * z, topY)
    ctx.lineTo(a2x - 18 * z, a2y)
    ctx.moveTo(a2x + 18 * z, a2y); ctx.lineTo(r2x - 40 * z, r2y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(r1x + 40 * z, r1y); ctx.lineTo(r1x + 40 * z, botY)
    ctx.lineTo(r2x + 40 * z, botY); ctx.lineTo(r2x + 40 * z, r2y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(r2x + 40 * z, botY); ctx.lineTo(bx - 30 * z, botY); ctx.lineTo(bx - 30 * z, by)
    ctx.stroke()
    if (vol) {
      const [vx, vy] = worldToScreen(vol.x, vol.y)
      ctx.strokeStyle = props.running ? '#a78bfa' : '#475569'
      ctx.setLineDash([5 * z, 5 * z])
      ctx.beginPath()
      ctx.moveTo(vx - 18 * z, vy); ctx.lineTo(r1x + 40 * z, midY)
      ctx.moveTo(vx + 18 * z, vy); ctx.lineTo(r2x + 40 * z, midY)
      ctx.stroke(); ctx.setLineDash([])
    }
  } else if (props.isCellsParallel && batteries.length >= 2 && resistors.length >= 1) {
    const b1 = batteries[0], b2 = batteries[1]
    const res = resistors[0]
    const amp = ammeters[0]
    const [b1x, b1y] = worldToScreen(b1.x, b1.y)
    const [b2x, b2y] = worldToScreen(b2.x, b2.y)
    const [rx, ry] = worldToScreen(res.x, res.y)
    const [ax, ay] = amp ? worldToScreen(amp.x, amp.y) : [(b1x + rx) / 2, (b1y + b2y) / 2]
    const midY = (b1y + b2y) / 2
    const junctionX = Math.min(b1x, b2x) + 60 * z
    const botY = Math.max(b1y, b2y) + 40 * z

    ctx.beginPath()
    ctx.moveTo(b1x + 30 * z, b1y)
    ctx.lineTo(junctionX, b1y)
    ctx.lineTo(junctionX, midY)
    if (amp) { ctx.lineTo(ax - 18 * z, ay) }
    ctx.moveTo(b2x + 30 * z, b2y)
    ctx.lineTo(junctionX, b2y)
    ctx.lineTo(junctionX, midY)
    ctx.stroke()

    ctx.beginPath()
    if (amp) {
      ctx.moveTo(ax + 18 * z, ay)
      ctx.lineTo(rx - 40 * z, ry)
    } else {
      ctx.moveTo(junctionX, midY)
      ctx.lineTo(rx - 40 * z, ry)
    }
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(rx + 40 * z, ry)
    ctx.lineTo(rx + 40 * z, botY)
    ctx.lineTo(Math.min(b1x, b2x) - 30 * z, botY)
    ctx.lineTo(Math.min(b1x, b2x) - 30 * z, b1y)
    ctx.moveTo(Math.min(b1x, b2x) - 30 * z, botY)
    ctx.lineTo(Math.max(b1x, b2x) - 30 * z, botY)
    ctx.lineTo(Math.max(b1x, b2x) - 30 * z, b2y)
    ctx.stroke()

    if (vol) {
      const [vx, vy] = worldToScreen(vol.x, vol.y)
      ctx.strokeStyle = props.running ? '#a78bfa' : '#475569'
      ctx.setLineDash([5 * z, 5 * z])
      ctx.beginPath()
      ctx.moveTo(vx - 18 * z, vy); ctx.lineTo(rx - 40 * z, ry)
      ctx.moveTo(vx + 18 * z, vy); ctx.lineTo(rx + 40 * z, ry)
      ctx.stroke(); ctx.setLineDash([])
    }
  } else if (batteries.length >= 2 && resistors.length >= 3) {
    drawKirchhoffWires(ctx, cc, props)
    return
  } else {
    const batt = batteries[0], res = resistors[0], amp = ammeters[0]
    if (batt && res) {
      const [bx, by] = worldToScreen(batt.x, batt.y)
      const [rx, ry] = worldToScreen(res.x, res.y)
      const [ax, ay] = amp ? worldToScreen(amp.x, amp.y) : [0, 0]
      const wireOffset = 50 * z
      if (amp) {
        ctx.beginPath()
        ctx.moveTo(bx + 30 * z, by); ctx.lineTo(ax - 18 * z, ay)
        ctx.moveTo(ax + 18 * z, ay); ctx.lineTo(rx - 40 * z, ry)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(bx - 30 * z, by); ctx.lineTo(bx - 30 * z, by + wireOffset)
        ctx.lineTo(rx + 40 * z, ry + wireOffset); ctx.lineTo(rx + 40 * z, ry)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(bx + 30 * z, by); ctx.lineTo(rx - 40 * z, ry)
        ctx.moveTo(bx - 30 * z, by); ctx.lineTo(bx - 30 * z, by + wireOffset)
        ctx.lineTo(rx + 40 * z, ry + wireOffset); ctx.lineTo(rx + 40 * z, ry)
        ctx.stroke()
      }
      if (vol) {
        const [vx, vy] = worldToScreen(vol.x, vol.y)
        ctx.strokeStyle = props.running ? '#a78bfa' : '#475569'
        ctx.setLineDash([5 * z, 5 * z])
        ctx.beginPath()
        ctx.moveTo(vx, vy + 18 * z); ctx.lineTo(vx, ry - 20 * z); ctx.moveTo(vx - 18 * z, vy); ctx.lineTo(rx - 20 * z, ry)
        ctx.moveTo(vx + 18 * z, vy); ctx.lineTo(rx + 20 * z, ry)
        ctx.stroke(); ctx.setLineDash([]) } } } }

