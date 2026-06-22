import { drawMirrorRays } from './drawMirrorRays'

export interface MirrorRenderProps {
  mirrorType: 'concave' | 'convex'
  focalLength: number
  objectDistance: number
  objectHeight: number
  imageDistance: number | null
  imageHeight: number | null
  magnification: number | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function drawMirror(canvas: HTMLCanvasElement, props: MirrorRenderProps, t?: (key: string, ...args: any[]) => string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2
  const isConcave = props.mirrorType === 'concave'
  const mirrorH = Math.min(cy * 0.65, h * 0.35)

  // ─── DYNAMIC SCALE ───
  // Ensure all elements (object, focal points, center, image) stay inside canvas
  const padding = 50
  const halfW = w / 2 - padding
  const halfH = h / 2 - padding

  const leftSpan = isConcave
    ? Math.max(props.objectDistance, props.focalLength * 2, props.imageDistance || 0)
    : props.objectDistance
  const rightSpan = isConcave
    ? Math.max(0, -(props.imageDistance || 0))
    : Math.max(props.focalLength * 2, Math.abs(props.imageDistance || 0))
  const maxSpan = Math.max(leftSpan, rightSpan, 10)

  const maxScaleX = halfW / maxSpan
  const maxScaleY = (halfH * 0.6) / Math.max(props.objectHeight, Math.abs(props.imageHeight || 0), 1)
  const maxScale = Math.min(maxScaleX, maxScaleY)

  let scale = Math.min(Math.min(w, h) / 60, maxScale)
  scale = Math.max(0.01, scale) // absolute safety floor

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, w, h)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
  for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

  // Principal axis
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke()

  const fPx = props.focalLength * scale
  const R = 2 * fPx
  const arcAngle = Math.asin(Math.min(1, mirrorH / R))

  // ─── MIRROR ARC ───
  // Concave: center LEFT of vertex (cx-R), arc bulges LEFT (toward object)
  // Convex: center RIGHT of vertex (cx+R), arc bulges RIGHT (away from object)
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 4
  ctx.beginPath()
  if (isConcave) {
    const arcCx = cx - R
    ctx.arc(arcCx, cy, R, -arcAngle, arcAngle)
  } else {
    const arcCx = cx + R
    ctx.arc(arcCx, cy, R, Math.PI - arcAngle, Math.PI + arcAngle)
  }
  ctx.stroke()

  // Dashed back surface
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  if (isConcave) {
    const arcCx = cx - R
    ctx.arc(arcCx, cy, R, -arcAngle, arcAngle)
  } else {
    const arcCx = cx + R
    ctx.arc(arcCx, cy, R, Math.PI - arcAngle, Math.PI + arcAngle)
  }
  ctx.stroke()
  ctx.setLineDash([])

  // ─── FOCAL POINTS ───
  // Concave: F and C on LEFT (same side as object)
  // Convex: F and C on RIGHT (behind mirror)
  const fX = isConcave ? cx - fPx : cx + fPx
  const cX = isConcave ? cx - R : cx + R

  ctx.fillStyle = '#fbbf24'
  ctx.beginPath(); ctx.arc(fX, cy, 4, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#67e8f9'
  ctx.beginPath(); ctx.arc(cX, cy, 3, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#8B95A5'
  ctx.font = 'bold 11px sans-serif'
  ctx.fillText('F', fX + (isConcave ? -14 : 6), cy - 8)
  ctx.fillText('C', cX + (isConcave ? -14 : 6), cy - 8)

  // ─── OBJECT (always to the left of mirror vertex) ───
  const ox = cx - props.objectDistance * scale
  const oh = props.objectHeight * scale
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(ox, cy); ctx.lineTo(ox, cy - oh); ctx.stroke()
  ctx.fillStyle = '#22c55e'
  ctx.beginPath(); ctx.moveTo(ox - 5, cy - oh + 8); ctx.lineTo(ox + 5, cy - oh + 8); ctx.lineTo(ox, cy - oh); ctx.fill()
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('O', ox - 8, cy - oh - 6)

  // ─── IMAGE ───
  let ix = 0, ih = 0
  if (props.imageDistance !== null && props.imageHeight !== null) {
    const di = props.imageDistance
    const hi = props.imageHeight
    ix = cx - di * scale
    ih = hi * scale
    const isVirtual = di < 0
    const imgColor = isVirtual ? '#a78bfa' : '#ef4444'

    ctx.strokeStyle = imgColor
    ctx.lineWidth = 2.5
    ctx.setLineDash(isVirtual ? [6, 4] : [])
    ctx.beginPath(); ctx.moveTo(ix, cy); ctx.lineTo(ix, cy - ih); ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = imgColor
    if (ih > 0) {
      ctx.beginPath(); ctx.moveTo(ix - 5, cy - ih - 8); ctx.lineTo(ix + 5, cy - ih - 8); ctx.lineTo(ix, cy - ih); ctx.fill()
    } else {
      ctx.beginPath(); ctx.moveTo(ix - 5, cy - ih + 8); ctx.lineTo(ix + 5, cy - ih + 8); ctx.lineTo(ix, cy - ih); ctx.fill()
    }
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('I', ix - 6, ih > 0 ? cy - ih - 8 : cy - ih + 16)
  }

  const hasImage = props.imageDistance !== null && props.imageHeight !== null

  // ═══════════════════════════════════════
  // RAY TRACING
  // ═══════════════════════════════════════
  drawMirrorRays(ctx, isConcave, hasImage, ox, oh, ix, ih, cx, cy, fX, cX, R, mirrorH, scale, w, h, fPx)

  // ─── NO-IMAGE HINT (object at focal point) ───
  if (!hasImage) {
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 13px sans-serif'
    const hintText = t ? (isConcave ? t('experiments.mirrorObjectAtFocalPoint') : t('experiments.mirrorNoRealImageConvex')) : (isConcave ? 'Object at focal point: rays do not meet (di = ∞)' : 'No real image for convex mirror')
    const textW = ctx.measureText(hintText).width
    ctx.fillText(hintText, (w - textW) / 2, cy + 40)
  }

  // ─── LABELS ───
  ctx.fillStyle = '#8B95A5'
  ctx.font = '11px sans-serif'
  ctx.fillText(`f = ${props.focalLength} cm (${isConcave ? '+' : '−'})`, 10, h - 36)
  ctx.fillText(`do = ${props.objectDistance} cm`, 10, h - 22)
  if (props.imageDistance !== null) {
    ctx.fillText(`di = ${props.imageDistance.toFixed(1)} cm`, 10, h - 8)
  }
}
