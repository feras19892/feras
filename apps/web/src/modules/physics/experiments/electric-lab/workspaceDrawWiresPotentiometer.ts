import type { CanvasContext, WorkspaceProps } from './workspaceTypes'

export function drawPotentiometerWires(
  ctx: CanvasRenderingContext2D, cc: CanvasContext, props: WorkspaceProps,
) {
  const { worldToScreen, zoom } = cc
  const z = zoom.value
  const comps = props.components
  const refBatt = comps.find(c => c.type === 'battery' && c.label === 'بطارية مرجعية')
  const unkBatt = comps.find(c => c.type === 'battery' && c.label === 'بطارية مجهولة')
  const r1 = comps.find(c => c.type === 'resistor' && c.label === 'سلك (R1)')
  const r2 = comps.find(c => c.type === 'resistor' && c.label === 'R2')
  const galv = comps.find(c => c.type === 'ammeter')
  if (!refBatt || !unkBatt || !r1) return

  const [rbx, rby] = worldToScreen(refBatt.x, refBatt.y)
  const [r1x, r1y] = worldToScreen(r1.x, r1.y)
  const [ubx, uby] = worldToScreen(unkBatt.x, unkBatt.y)
  const [gx, gy] = galv ? worldToScreen(galv.x, galv.y) : [r1x + 100 * z, r1y]
  const [r2x, r2y] = r2 ? worldToScreen(r2.x, r2.y) : [ubx - 100 * z, uby]

  ctx.strokeStyle = props.running ? '#4ade80' : '#475569'
  ctx.lineWidth = 2 * z; ctx.lineCap = 'round'

  // Reference battery+ → R1 left (top wire of potentiometer wire)
  ctx.beginPath()
  ctx.moveTo(rbx + 30 * z, rby); ctx.lineTo(r1x - 40 * z, r1y)
  ctx.stroke()

  // R1 right → back to reference battery- (bottom return)
  const botY = rby + 50 * z
  ctx.beginPath()
  ctx.moveTo(r1x + 40 * z, r1y); ctx.lineTo(r1x + 40 * z, botY)
  ctx.lineTo(rbx - 30 * z, botY); ctx.lineTo(rbx - 30 * z, rby)
  ctx.stroke()

  // Unknown battery+ → R2 → galvanometer → R1 (sliding contact point)
  ctx.beginPath()
  ctx.moveTo(ubx + 30 * z, uby); ctx.lineTo(r2x - 40 * z, r2y)
  ctx.moveTo(r2x + 40 * z, r2y); ctx.lineTo(gx - 18 * z, gy)
  ctx.moveTo(gx + 18 * z, gy); ctx.lineTo(r1x + 40 * z, r1y)
  ctx.stroke()

  // Unknown battery- → back to reference battery- (common ground)
  ctx.beginPath()
  ctx.moveTo(ubx - 30 * z, uby); ctx.lineTo(ubx - 30 * z, botY)
  ctx.lineTo(rbx - 30 * z, botY)
  ctx.stroke()
}
