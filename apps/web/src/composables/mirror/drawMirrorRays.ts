import { arcHit } from './mirrorArcHit'

export function drawMirrorRays(
  ctx: CanvasRenderingContext2D,
  isConcave: boolean,
  hasImage: boolean,
  ox: number, oh: number,
  ix: number, ih: number,
  cx: number, cy: number,
  fX: number, cX: number,
  R: number, mirrorH: number,
  scale: number, w: number, h: number,
  fPx: number
) {
  // Image top coordinates for ray intersection
  const iTopX = hasImage ? ix : null
  const iTopY = hasImage ? cy - ih : null

  // Clip rays to canvas bounds so nothing spills outside
  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip()

  if (isConcave) {
    // ═══ CONCAVE MIRROR ═══
    // F = fX = cx - fPx (on LEFT, same side as object)

    // Ray 1 (Yellow): Parallel → hits mirror → reflects through F → continues past I
    ctx.strokeStyle = 'rgba(251,191,36,0.7)'
    ctx.lineWidth = 1.5
    const hit1 = arcHit(ox, cy - oh, cx + 100, cy - oh, cx, cy, R, mirrorH, isConcave)
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(hit1.x, hit1.y); ctx.stroke()
    if (hasImage && iTopX !== null && iTopY !== null) {
      const pastX = Math.max(10, iTopX - 80)
      const pastY = iTopY + (iTopY - hit1.y) / (iTopX - hit1.x) * (pastX - iTopX)
      ctx.beginPath(); ctx.moveTo(hit1.x, hit1.y); ctx.lineTo(pastX, pastY); ctx.stroke()
    } else {
      ctx.beginPath(); ctx.moveTo(hit1.x, hit1.y); ctx.lineTo(fX, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(fX, cy); ctx.lineTo(Math.max(10, fX - 80), cy + (oh / fPx) * 80); ctx.stroke()
    }

    // Ray 2 (Purple): from O through F → hits mirror → reflects parallel horizontal → continues
    ctx.strokeStyle = 'rgba(168,85,247,0.7)'
    const hit2 = arcHit(ox, cy - oh, fX, cy, cx, cy, R, mirrorH, isConcave)
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(hit2.x, hit2.y); ctx.stroke()
    if (hasImage && iTopX !== null && iTopY !== null) {
      const pastX = Math.max(10, iTopX - 80)
      ctx.beginPath(); ctx.moveTo(hit2.x, hit2.y); ctx.lineTo(pastX, hit2.y); ctx.stroke()
    } else {
      ctx.beginPath(); ctx.moveTo(hit2.x, hit2.y); ctx.lineTo(Math.max(10, cx - 80), hit2.y); ctx.stroke()
    }

    // Ray 3 (Cyan): from O through C → hits mirror → reflects back on itself → continues past I
    ctx.strokeStyle = 'rgba(103,232,249,0.7)'
    const hit3 = arcHit(ox, cy - oh, cX, cy, cx, cy, R, mirrorH, isConcave)
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(hit3.x, hit3.y); ctx.stroke()
    // Reflected: retrace on same line O-C beyond hit3
    const dx3 = cX - ox
    if (Math.abs(dx3) < 0.5) {
      // Vertical line when do ≈ 2f (object at center of curvature)
      const pastY = hasImage && iTopY !== null ? iTopY : cy - oh * 3
      ctx.beginPath(); ctx.moveTo(hit3.x, hit3.y); ctx.lineTo(hit3.x, pastY); ctx.stroke()
    } else {
      const slope3 = oh / dx3
      if (hasImage && iTopX !== null && iTopY !== null) {
        const pastX = Math.max(10, iTopX - 80)
        const pastY = (cy - oh) + slope3 * (pastX - ox)
        ctx.beginPath(); ctx.moveTo(hit3.x, hit3.y); ctx.lineTo(pastX, pastY); ctx.stroke()
      } else {
        const pastX = Math.max(10, cX - 80)
        const pastY = (cy - oh) + slope3 * (pastX - ox)
        ctx.beginPath(); ctx.moveTo(hit3.x, hit3.y); ctx.lineTo(pastX, pastY); ctx.stroke()
      }
    }

  } else {
    // ═══ CONVEX MIRROR ═══
    // F = fX = cx + fPx (on RIGHT, behind mirror)

    // Ray 1 (Yellow): Parallel → hits mirror → diverges. Dashed backward through I and F
    ctx.strokeStyle = 'rgba(251,191,36,0.7)'
    ctx.lineWidth = 1.5
    const hit1c = arcHit(ox, cy - oh, cx + 100, cy - oh, cx, cy, R, mirrorH, isConcave)
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(hit1c.x, hit1c.y); ctx.stroke()
    // Real reflected diverges as if from F
    const dir1x = hit1c.x - fX
    const dir1y = hit1c.y - cy
    const divX = Math.min(w - 10, hit1c.x + dir1x * 3)
    const divY = hit1c.y + dir1y * 3
    ctx.beginPath(); ctx.moveTo(hit1c.x, hit1c.y); ctx.lineTo(divX, divY); ctx.stroke()
    // Dashed backward: straight line from mirror hit through F to canvas edge
    ctx.strokeStyle = 'rgba(251,191,36,0.35)'
    ctx.setLineDash([4, 4])
    const dx1 = fX - hit1c.x
    const dy1 = cy - hit1c.y
    const t1 = dx1 !== 0 ? (w - 10 - hit1c.x) / dx1 : 0
    const end1x = w - 10
    const end1y = hit1c.y + dy1 * t1
    ctx.beginPath(); ctx.moveTo(hit1c.x, hit1c.y); ctx.lineTo(end1x, end1y); ctx.stroke()
    ctx.setLineDash([])

    // Ray 2 (Purple): Aimed at F → hits mirror → reflects parallel horizontal left
    ctx.strokeStyle = 'rgba(168,85,247,0.7)'
    const hit2c = arcHit(ox, cy - oh, fX, cy, cx, cy, R, mirrorH, isConcave)
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(hit2c.x, hit2c.y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(hit2c.x, hit2c.y); ctx.lineTo(Math.max(10, cx - 80), hit2c.y); ctx.stroke()
    // Dashed backward: straight line from mirror hit through F to canvas edge
    ctx.strokeStyle = 'rgba(168,85,247,0.35)'
    ctx.setLineDash([4, 4])
    const dx2 = fX - hit2c.x
    const dy2 = cy - hit2c.y
    const t2 = dx2 !== 0 ? (w - 10 - hit2c.x) / dx2 : 0
    const end2x = w - 10
    const end2y = hit2c.y + dy2 * t2
    ctx.beginPath(); ctx.moveTo(hit2c.x, hit2c.y); ctx.lineTo(end2x, end2y); ctx.stroke()
    ctx.setLineDash([])

    // Ray 3 (Cyan): Aimed at C → hits mirror → reflects back on itself
    ctx.strokeStyle = 'rgba(103,232,249,0.7)'
    const hit3c = arcHit(ox, cy - oh, cX, cy, cx, cy, R, mirrorH, isConcave)
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(hit3c.x, hit3c.y); ctx.stroke()
    // Real reflected: retrace on same line O-C backward from hit3c
    const dx3c = cX - ox
    if (Math.abs(dx3c) < 0.5) {
      const pastYc = cy - oh * 3
      ctx.beginPath(); ctx.moveTo(hit3c.x, hit3c.y); ctx.lineTo(hit3c.x, pastYc); ctx.stroke()
    } else {
      const slope3c = oh / dx3c
      const pastXc = Math.max(10, cx - 80)
      const pastYc = (cy - oh) + slope3c * (pastXc - ox)
      ctx.beginPath(); ctx.moveTo(hit3c.x, hit3c.y); ctx.lineTo(pastXc, pastYc); ctx.stroke()
    }
    // Dashed backward: straight line from mirror hit through C to canvas edge
    ctx.strokeStyle = 'rgba(103,232,249,0.35)'
    ctx.setLineDash([4, 4])
    const dx3 = cX - hit3c.x
    const dy3 = cy - hit3c.y
    const t3 = dx3 !== 0 ? (w - 10 - hit3c.x) / dx3 : 0
    const end3x = w - 10
    const end3y = hit3c.y + dy3 * t3
    ctx.beginPath(); ctx.moveTo(hit3c.x, hit3c.y); ctx.lineTo(end3x, end3y); ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.restore()
}
