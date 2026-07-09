import type { CanvasContext, WorkspaceProps } from './workspaceTypes'

export function drawSeriesWires(
  ctx: CanvasRenderingContext2D, cc: CanvasContext, props: WorkspaceProps,
) {
  const { worldToScreen, zoom } = cc
  const z = zoom.value
  const comps = props.components
  const batt = comps.find(c => c.type === 'battery')!
  const sw = comps.find(c => c.type === 'switch')
  const resistors = comps.filter(c => c.type === 'resistor')
  const amp = comps.find(c => c.type === 'ammeter')
  const vol = comps.find(c => c.type === 'voltmeter')

  const [bx, by] = worldToScreen(batt.x, batt.y)
  const [sx, sy] = sw ? worldToScreen(sw.x, sw.y) : [bx + 60 * z, by]
  const [ax, ay] = amp ? worldToScreen(amp.x, amp.y) : [0, 0]
  const botY = by + 60 * z

  ctx.strokeStyle = props.running ? '#4ade80' : '#475569'
  ctx.lineWidth = 2 * z; ctx.lineCap = 'round'

  // Top wire: batt+ → switch → ammeter → R1 → R2 → ... → Rn
  ctx.beginPath()
  ctx.moveTo(bx + 30 * z, by)
  if (sw) { ctx.lineTo(sx - 20 * z, sy); ctx.moveTo(sx + 20 * z, sy) }
  if (amp) { ctx.lineTo(ax - 18 * z, ay); ctx.moveTo(ax + 18 * z, ay) }
  for (let i = 0; i < resistors.length; i++) {
    const [rx, ry] = worldToScreen(resistors[i].x, resistors[i].y)
    ctx.lineTo(rx - 40 * z, ry)
    if (i < resistors.length - 1) ctx.moveTo(rx + 40 * z, ry)
  }
  // Last resistor right → down → bottom wire
  const lastR = resistors[resistors.length - 1]
  const [lrx, lry] = worldToScreen(lastR.x, lastR.y)
  ctx.moveTo(lrx + 40 * z, lry); ctx.lineTo(lrx + 40 * z, botY)
  ctx.lineTo(bx - 30 * z, botY); ctx.lineTo(bx - 30 * z, by)
  ctx.stroke()

  // Voltmeter (parallel to R2 if exists, else R1)
  if (vol) {
    const target = resistors.find(r => r.label === 'R2') ?? resistors[0]
    const [tx, ty] = worldToScreen(target.x, target.y)
    const [vx, vy] = worldToScreen(vol.x, vol.y)
    ctx.strokeStyle = props.running ? '#a78bfa' : '#475569'
    ctx.setLineDash([5 * z, 5 * z])
    ctx.beginPath()
    ctx.moveTo(vx - 18 * z, vy); ctx.lineTo(tx - 40 * z, ty)
    ctx.moveTo(vx + 18 * z, vy); ctx.lineTo(tx + 40 * z, ty)
    ctx.stroke(); ctx.setLineDash([])
  }
}
