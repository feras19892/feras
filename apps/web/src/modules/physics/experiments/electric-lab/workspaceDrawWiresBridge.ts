import type { CanvasContext, WorkspaceProps } from './workspaceTypes'
import type { CircuitComponent } from './types'

export function drawWheatstoneWires(
  ctx: CanvasRenderingContext2D,
  cc: CanvasContext,
  props: WorkspaceProps,
  components: CircuitComponent[],
) {
  const { worldToScreen, zoom } = cc
  const z = zoom.value
  const batt = components.find(c => c.type === 'battery')!
  const galv = components.find(c => c.type === 'galvanometer')!
  const sw = components.find(c => c.type === 'switch')
  const resistors = components.filter(c => c.type === 'resistor')
  if (resistors.length < 3) return
  const [r1, r2, r3] = resistors

  const [bx, by] = worldToScreen(batt.x, batt.y)
  const [sx, sy] = sw ? worldToScreen(sw.x, sw.y) : [bx + 60 * z, by]
  const [r1x, r1y] = worldToScreen(r1.x, r1.y)
  const [r2x, r2y] = worldToScreen(r2.x, r2.y)
  const [r3x, r3y] = worldToScreen(r3.x, r3.y)
  const [gx, gy] = worldToScreen(galv.x, galv.y)

  const r1L = r1x - 40 * z, r1R = r1x + 40 * z
  const r2L = r2x - 40 * z, r2R = r2x + 40 * z
  const r3L = r3x - 40 * z, r3R = r3x + 40 * z
  const gL = gx - 20 * z, gR = gx + 20 * z
  const botY = r3y + 40 * z

  ctx.strokeStyle = props.running ? '#4ade80' : '#475569'
  ctx.lineWidth = 2 * z; ctx.lineCap = 'round'

  // Battery+ → Switch → Top node A (R1 right to R2 left)
  ctx.beginPath()
  ctx.moveTo(bx + 30 * z, by); ctx.lineTo(sx - 20 * z, sy)
  ctx.moveTo(sx + 20 * z, sy); ctx.lineTo(sx + 20 * z, r1y)
  ctx.lineTo(r1R, r1y); ctx.lineTo(r2L, r2y)
  ctx.stroke()

  // Left side: R1 left → down → R3 left (node B)
  ctx.beginPath()
  ctx.moveTo(r1L, r1y); ctx.lineTo(r1L, r3y); ctx.lineTo(r3L, r3y)
  ctx.stroke()

  // Node B → Galvanometer left
  ctx.beginPath()
  ctx.moveTo(r1L, gy); ctx.lineTo(gL, gy)
  ctx.stroke()

  // R2 right → down → Galvanometer right (node C)
  ctx.beginPath()
  ctx.moveTo(r2R, r2y); ctx.lineTo(r2R, gy); ctx.lineTo(gR, gy)
  ctx.stroke()

  // Node C → down → bottom node D (implicit Rx) → R3 right
  ctx.beginPath()
  ctx.moveTo(r2R, gy); ctx.lineTo(r2R, botY)
  ctx.lineTo(r3R, botY); ctx.lineTo(r3R, r3y)
  ctx.stroke()

  // Bottom node D → Battery-
  ctx.beginPath()
  ctx.moveTo(r3R, botY); ctx.lineTo(bx - 30 * z, botY); ctx.lineTo(bx - 30 * z, by)
  ctx.stroke()

  // Label Rx (implicit resistor)
  ctx.fillStyle = '#94a3b8'; ctx.font = `${9 * z}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText('Rx=150Ω', (r3x + r2x) / 2, botY + 15 * z)
}
