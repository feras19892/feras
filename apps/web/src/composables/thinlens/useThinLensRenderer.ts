export interface LensRenderProps {
  lensType: 'convex' | 'concave'
  focalLength: number
  objectDistance: number
  objectHeight: number
  imageDistance: number | null
  imageHeight: number | null
  magnification: number | null
}

export function drawThinLens(canvas: HTMLCanvasElement, props: LensRenderProps) {
  const rect = canvas.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return
  const dpr = window.devicePixelRatio || 1
  const w = rect.width
  const h = rect.height
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) / 60

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

  const isConcave = props.lensType === 'concave'
  const fPx = props.focalLength * scale
  const lensHalfH = Math.min(cy * 0.65, h * 0.35)

  // ─── LENS SYMBOL ───
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(cx, cy - lensHalfH); ctx.lineTo(cx, cy + lensHalfH); ctx.stroke()

  // Convex: ▶|◀   Concave: ◀|▶
  ctx.fillStyle = '#5B8DB8'
  const arrowW = 10, arrowH = 10
  if (isConcave) {
    ctx.beginPath(); ctx.moveTo(cx - arrowW, cy - lensHalfH + arrowH); ctx.lineTo(cx, cy - lensHalfH); ctx.lineTo(cx + arrowW, cy - lensHalfH + arrowH); ctx.fill()
    ctx.beginPath(); ctx.moveTo(cx - arrowW, cy + lensHalfH - arrowH); ctx.lineTo(cx, cy + lensHalfH); ctx.lineTo(cx + arrowW, cy + lensHalfH - arrowH); ctx.fill()
  } else {
    ctx.beginPath(); ctx.moveTo(cx - arrowW, cy - lensHalfH); ctx.lineTo(cx, cy - lensHalfH + arrowH); ctx.lineTo(cx + arrowW, cy - lensHalfH); ctx.fill()
    ctx.beginPath(); ctx.moveTo(cx - arrowW, cy + lensHalfH); ctx.lineTo(cx, cy + lensHalfH - arrowH); ctx.lineTo(cx + arrowW, cy + lensHalfH); ctx.fill()
  }

  // ─── FOCAL POINTS ───
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath(); ctx.arc(cx + fPx, cy, 4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx - fPx, cy, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#8B95A5'
  ctx.font = 'bold 11px sans-serif'
  if (isConcave) {
    ctx.fillText('F', cx - fPx - 14, cy - 8)
    ctx.fillText("F'", cx + fPx + 6, cy - 8)
  } else {
    ctx.fillText('F', cx + fPx + 6, cy - 8)
    ctx.fillText("F'", cx - fPx - 18, cy - 8)
  }

  // 2F points
  const twofPx = 2 * fPx
  ctx.fillStyle = '#67e8f9'
  ctx.beginPath(); ctx.arc(cx + twofPx, cy, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx - twofPx, cy, 3, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#8B95A5'
  ctx.font = '11px sans-serif'
  ctx.fillText('2F', cx + twofPx + 4, cy - 4)
  ctx.fillText("2F'", cx - twofPx - 24, cy - 4)

  // ─── OBJECT (always left) ───
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
    ix = cx + di * scale
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

  // ═══════════════════════════════════════
  // RAY TRACING
  // ═══════════════════════════════════════

  if (isConcave) {
    // Ray 1: Parallel to axis → diverges as if from F
    ctx.strokeStyle = 'rgba(251,191,36,0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(cx, cy - oh); ctx.stroke()
    const slope1 = -oh / fPx
    ctx.beginPath(); ctx.moveTo(cx, cy - oh); ctx.lineTo(Math.min(w - 10, cx + 120), cy - oh + slope1 * 120); ctx.stroke()
    if (props.imageDistance !== null && props.imageHeight !== null) {
      ctx.strokeStyle = 'rgba(251,191,36,0.35)'
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(cx, cy - oh); ctx.lineTo(ix, cy - ih); ctx.stroke()
      ctx.setLineDash([])
    }

    // Ray 2: Through center → continues straight
    ctx.strokeStyle = 'rgba(103,232,249,0.7)'
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(cx, cy); ctx.stroke()
    const slope2 = (cy - (cy - oh)) / (cx - ox)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(Math.min(w - 10, cx + 120), cy + slope2 * 120); ctx.stroke()
    if (props.imageDistance !== null && props.imageHeight !== null) {
      ctx.strokeStyle = 'rgba(103,232,249,0.35)'
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ix, cy - ih); ctx.stroke()
      ctx.setLineDash([])
    }

    // Ray 3 omitted for concave: rays 1 & 2 are sufficient for virtual image

  } else {
    // CONVEX LENS
    const isVirtual = props.imageDistance !== null && props.imageHeight !== null && props.imageDistance < 0

    // Ray 1: Parallel to axis → through F (right)
    ctx.strokeStyle = 'rgba(251,191,36,0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(cx, cy - oh); ctx.stroke()
    if (isVirtual) {
      const fRight = cx + fPx
      ctx.beginPath(); ctx.moveTo(cx, cy - oh); ctx.lineTo(fRight, cy); ctx.stroke()
      const slopePastF = (cy - (cy - oh)) / (fRight - cx)
      ctx.beginPath(); ctx.moveTo(fRight, cy); ctx.lineTo(Math.min(w - 10, fRight + 80), cy + slopePastF * 80); ctx.stroke()
      ctx.strokeStyle = 'rgba(251,191,36,0.35)'
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(cx, cy - oh); ctx.lineTo(ix, cy - ih); ctx.stroke()
      ctx.setLineDash([])
    } else if (props.imageDistance !== null && props.imageHeight !== null) {
      const fRight = cx + fPx
      ctx.beginPath(); ctx.moveTo(cx, cy - oh); ctx.lineTo(fRight, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(fRight, cy); ctx.lineTo(ix, cy - ih); ctx.stroke()
    } else {
      const fRight = cx + fPx
      ctx.beginPath(); ctx.moveTo(cx, cy - oh); ctx.lineTo(fRight, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(fRight, cy); ctx.lineTo(Math.min(w - 10, fRight + 80), cy + 40); ctx.stroke()
    }

    // Ray 2: Through center → straight
    ctx.strokeStyle = 'rgba(103,232,249,0.7)'
    if (props.imageDistance !== null && props.imageHeight !== null) {
      if (isVirtual) {
        ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(cx, cy); ctx.stroke()
        const slope = (cy - (cy - oh)) / (cx - ox)
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(Math.min(w - 10, cx + 120), cy + slope * 120); ctx.stroke()
        ctx.strokeStyle = 'rgba(103,232,249,0.35)'
        ctx.setLineDash([4, 4])
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ix, cy - ih); ctx.stroke()
        ctx.setLineDash([])
      } else {
        ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(ix, cy - ih); ctx.stroke()
      }
    } else {
      ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(cx, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(Math.min(w - 10, cx + 100), cy + 50); ctx.stroke()
    }

    // Ray 3: Through F' (left) → refracts parallel
    ctx.strokeStyle = 'rgba(168,85,247,0.6)'
    const fLeft = cx - fPx
    if (props.imageDistance !== null && props.imageHeight !== null) {
      const dx = ox - fLeft
      if (Math.abs(dx) > 0.001) {
        const slope3 = (cy - oh - cy) / dx
        const yHit = cy + slope3 * (cx - fLeft)
        ctx.beginPath(); ctx.moveTo(fLeft, cy); ctx.lineTo(ox, cy - oh); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(cx, yHit); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(cx, yHit); ctx.lineTo(Math.min(w - 10, cx + 120), yHit); ctx.stroke()
        if (isVirtual) {
          ctx.strokeStyle = 'rgba(168,85,247,0.35)'
          ctx.setLineDash([4, 4])
          ctx.beginPath(); ctx.moveTo(cx, yHit); ctx.lineTo(ix, cy - ih); ctx.stroke()
          ctx.setLineDash([])
        }
      }
    } else {
      ctx.beginPath(); ctx.moveTo(ox, cy - oh); ctx.lineTo(cx, cy - oh); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - oh); ctx.lineTo(Math.min(w - 10, cx + 120), cy - oh); ctx.stroke()
    }
  }

  // ─── LABELS ───
  ctx.fillStyle = '#8B95A5'
  ctx.font = '11px sans-serif'
  ctx.fillText(`f = ${props.focalLength} cm (${isConcave ? '−' : '+'})`, 10, h - 36)
  ctx.fillText(`do = ${props.objectDistance} cm`, 10, h - 22)
  if (props.imageDistance !== null) {
    ctx.fillText(`di = ${props.imageDistance.toFixed(1)} cm`, 10, h - 8)
  }
}
