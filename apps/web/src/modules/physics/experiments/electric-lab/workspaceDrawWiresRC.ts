import type { CanvasContext, WorkspaceProps } from './workspaceTypes'

export function drawRcWires(
  ctx: CanvasRenderingContext2D, cc: CanvasContext, props: WorkspaceProps,
) {
  const { worldToScreen, zoom } = cc
  const z = zoom.value
  const caps = props.components.filter(c => c.type === 'capacitor')
  const batt = props.components.find(c => c.type === 'battery')!
  const sw = props.components.find(c => c.type === 'switch')
  const res = props.components.find(c => c.type === 'resistor')
  const amm = props.components.find(c => c.type === 'ammeter')
  const vol = props.components.find(c => c.type === 'voltmeter')
  const [bx, by] = worldToScreen(batt.x, batt.y)
  const [sx, sy] = sw ? worldToScreen(sw.x, sw.y) : [bx + 60 * z, by]

  if (caps.length >= 2) {
    const [rx, ry] = res ? worldToScreen(res.x, res.y) : [sx + 80 * z, sy]
    const [ax, ay] = amm ? worldToScreen(amm.x, amm.y) : [rx + 60 * z, ry]
    const [c1x, c1y] = worldToScreen(caps[0].x, caps[0].y)
    const [c2x, c2y] = worldToScreen(caps[1].x, caps[1].y)
    const botY = Math.max(c1y, c2y) + 40 * z
    ctx.strokeStyle = props.running ? '#4ade80' : '#475569'
    ctx.lineWidth = 2 * z; ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(bx + 30 * z, by); ctx.lineTo(sx - 20 * z, sy)
    ctx.moveTo(sx + 20 * z, sy); ctx.lineTo(rx - 40 * z, ry)
    ctx.moveTo(rx + 40 * z, ry); ctx.lineTo(ax - 18 * z, ay)
    ctx.moveTo(ax + 18 * z, ay); ctx.lineTo(ax + 40 * z, ay)
    ctx.lineTo(c1x - 28 * z, c1y); ctx.moveTo(c1x - 28 * z, c1y); ctx.lineTo(c2x - 28 * z, c2y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(c1x + 28 * z, c1y); ctx.lineTo(c2x + 28 * z, c2y)
    ctx.lineTo(c2x + 60 * z, botY); ctx.lineTo(bx - 30 * z, botY); ctx.lineTo(bx - 30 * z, by)
    ctx.stroke()
    if (vol) {
      const [vx, vy] = worldToScreen(vol.x, vol.y)
      ctx.strokeStyle = props.running ? '#a78bfa' : '#475569'
      ctx.setLineDash([5 * z, 5 * z])
      ctx.beginPath()
      ctx.moveTo(vx - 18 * z, vy); ctx.lineTo(c1x + 28 * z, c1y)
      ctx.moveTo(vx + 18 * z, vy); ctx.lineTo(c2x + 28 * z, c2y)
      ctx.stroke(); ctx.setLineDash([])
    }
  } else {
    const cap = caps[0]
    const [cx, cy] = worldToScreen(cap.x, cap.y)
    const [rx, ry] = res ? worldToScreen(res.x, res.y) : [cx - 100 * z, cy]
    const [ax, ay] = amm ? worldToScreen(amm.x, amm.y) : [rx + 60 * z, ry]
    const botY = Math.max(by, cy) + 40 * z
    ctx.strokeStyle = props.running ? '#4ade80' : '#475569'
    ctx.lineWidth = 2 * z; ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(bx + 30 * z, by); ctx.lineTo(sx - 20 * z, sy)
    ctx.moveTo(sx + 20 * z, sy); ctx.lineTo(rx - 40 * z, ry)
    ctx.moveTo(rx + 40 * z, ry); ctx.lineTo(ax - 18 * z, ay)
    ctx.moveTo(ax + 18 * z, ay); ctx.lineTo(cx - 28 * z, cy)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + 28 * z, cy); ctx.lineTo(cx + 60 * z, cy)
    ctx.lineTo(cx + 60 * z, botY); ctx.lineTo(bx - 30 * z, botY); ctx.lineTo(bx - 30 * z, by)
    ctx.stroke()
    if (vol) {
      const [vx, vy] = worldToScreen(vol.x, vol.y)
      ctx.strokeStyle = props.running ? '#a78bfa' : '#475569'
      ctx.setLineDash([5 * z, 5 * z])
      ctx.beginPath()
      ctx.moveTo(vx - 18 * z, vy); ctx.lineTo(cx - 28 * z, cy + 20 * z)
      ctx.moveTo(vx + 18 * z, vy); ctx.lineTo(cx + 28 * z, cy + 20 * z)
      ctx.stroke(); ctx.setLineDash([])
    }
  }
}
