import type { CanvasContext, WorkspaceProps } from './workspaceTypes'

export function drawKirchhoffWires(
  ctx: CanvasRenderingContext2D, cc: CanvasContext, props: WorkspaceProps,
) {
  const { worldToScreen, zoom } = cc
  const z = zoom.value
  const comps = props.components
  const batteries = comps.filter(c => c.type === 'battery')
  const resistors = comps.filter(c => c.type === 'resistor')
  const ammeters = comps.filter(c => c.type === 'ammeter')
  if (batteries.length < 2 || resistors.length < 3) return

  const [v1, v2] = batteries, [r1, r2, r3] = resistors
  const a1 = ammeters.find(a => a.label === 'A1')
  const a2 = ammeters.find(a => a.label === 'A2')
  const a3 = ammeters.find(a => a.label === 'A3')
  const [v1x, v1y] = worldToScreen(v1.x, v1.y)
  const [v2x, v2y] = worldToScreen(v2.x, v2.y)
  const [r1x, r1y] = worldToScreen(r1.x, r1.y)
  const [r2x, r2y] = worldToScreen(r2.x, r2.y)
  const [r3x, r3y] = worldToScreen(r3.x, r3.y)
  const [a1x, a1y] = a1 ? worldToScreen(a1.x, a1.y) : [v1x + 50 * z, v1y]
  const [a2x, a2y] = a2 ? worldToScreen(a2.x, a2.y) : [v2x + 50 * z, v2y]
  const [a3x, a3y] = a3 ? worldToScreen(a3.x, a3.y) : [r3x - 50 * z, r3y]
  const topY = Math.min(v1y, v2y) - 60 * z
  const botY = Math.max(v1y, v2y) + 60 * z

  ctx.strokeStyle = props.running ? '#4ade80' : '#475569'
  ctx.lineWidth = 2 * z; ctx.lineCap = 'round'

  // Left loop: V1+ → A1 → R1 → node A (A3 left)
  ctx.beginPath()
  ctx.moveTo(v1x + 30 * z, v1y); ctx.lineTo(a1x - 18 * z, a1y)
  ctx.moveTo(a1x + 18 * z, a1y); ctx.lineTo(r1x - 40 * z, r1y)
  ctx.moveTo(r1x + 40 * z, r1y); ctx.lineTo(r1x + 40 * z, a3y)
  ctx.lineTo(a3x - 18 * z, a3y)
  ctx.stroke()

  // Right loop: V2+ → A2 → R2 → node A (A3 left)
  ctx.beginPath()
  ctx.moveTo(v2x + 30 * z, v2y); ctx.lineTo(a2x - 18 * z, a2y)
  ctx.moveTo(a2x + 18 * z, a2y); ctx.lineTo(r2x - 40 * z, r2y)
  ctx.moveTo(r2x + 40 * z, r2y); ctx.lineTo(r2x + 40 * z, a3y)
  ctx.lineTo(a3x - 18 * z, a3y)
  ctx.stroke()

  // A3 → R3 (shared branch)
  ctx.beginPath()
  ctx.moveTo(a3x + 18 * z, a3y); ctx.lineTo(r3x - 18 * z, r3y)
  ctx.stroke()

  // R3 right → node B → V1- (top return)
  ctx.beginPath()
  ctx.moveTo(r3x + 18 * z, r3y); ctx.lineTo(r3x + 40 * z, r3y)
  ctx.lineTo(r3x + 40 * z, topY); ctx.lineTo(v1x - 30 * z, topY); ctx.lineTo(v1x - 30 * z, v1y)
  ctx.stroke()

  // R3 right → node B → V2- (bottom return)
  ctx.beginPath()
  ctx.moveTo(r3x + 40 * z, r3y); ctx.lineTo(r3x + 40 * z, botY)
  ctx.lineTo(v2x - 30 * z, botY); ctx.lineTo(v2x - 30 * z, v2y)
  ctx.stroke()
}
