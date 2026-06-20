import type { SpringParams } from '../../modules/physics/experiments/spring/useSpringPhysics'

interface SimState {
  x: number; v: number; t: number; running: boolean; paused: boolean
}

export function drawSpringScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: SpringParams,
  simState: SimState,
) {
  const pivotX = w / 2
  const pivotY = 45
  const hasMass = params.mass > 1e-6

  const springTop = pivotY + 12
  const natLenPx = 50
  const natEqY = springTop + natLenPx

  const staticStretchCm = hasMass && params.k > 1e-9
    ? (params.mass * 9.81 / params.k) * 100
    : 0

  const basePxPerCm = 8
  const pxPerCm = (natEqY + staticStretchCm * basePxPerCm > h * 0.75 && staticStretchCm > 0.001)
    ? Math.max(4, (h * 0.75 - natEqY) / staticStretchCm)
    : basePxPerCm

  const maxTravel = h * 0.22
  const peakDisp = Math.max(params.amplitude, Math.abs(simState.x), 0.01)
  const oscillationScale = Math.min(maxTravel / peakDisp, pxPerCm * 100)

  const staticStretchPx = staticStretchCm * pxPerCm
  const eqY = natEqY + staticStretchPx
  const massY = eqY + simState.x * oscillationScale
  const massRadius = hasMass
    ? Math.max(14, Math.min(38, 12 + params.mass * 5.2))
    : 0

  // Background grid
  ctx.strokeStyle = 'rgba(148,163,184,0.2)'
  ctx.lineWidth = 1
  for (let i = 0; i < w; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke() }
  for (let i = 0; i < h; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke() }

  // Pivot
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(pivotX - 10, pivotY - 2, 20, 14)
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1
  ctx.strokeRect(pivotX - 10, pivotY - 2, 20, 14)

  // Spring
  const springBot = hasMass ? massY - massRadius : massY
  const kNorm = Math.max(0, Math.min(1, (params.k - 5) / (200 - 5)))
  const coils = Math.max(10, Math.min(28, Math.round(22 - kNorm * 8 + params.mass * 1.5)))
  const coilWidth = Math.max(8, Math.min(24, 10 + (1 - kNorm) * 8 + params.mass * 1.5))
  const segLen = Math.max(1.5, (springBot - springTop - 8) / coils)

  const springGrad = ctx.createLinearGradient(pivotX - coilWidth, 0, pivotX + coilWidth, 0)
  springGrad.addColorStop(0, `rgb(${50 + kNorm * 15},${55 + kNorm * 15},${70 + kNorm * 10})`)
  springGrad.addColorStop(0.5, `rgb(${90 + kNorm * 25},${95 + kNorm * 25},${110 + kNorm * 15})`)
  springGrad.addColorStop(1, `rgb(${50 + kNorm * 15},${55 + kNorm * 15},${70 + kNorm * 10})`)

  ctx.beginPath()
  ctx.moveTo(pivotX, springTop + 4)
  for (let i = 1; i <= coils; i++) {
    const cy = springTop + 4 + i * segLen
    const cx = pivotX + (i % 2 === 0 ? -coilWidth : coilWidth)
    ctx.lineTo(cx, cy)
  }
  ctx.lineTo(pivotX, springBot)
  ctx.lineWidth = 1.8 + kNorm * 2.2
  ctx.strokeStyle = springGrad
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter'

  // Mass
  if (hasMass) {
    ctx.fillStyle = 'rgba(15,23,42,0.1)'
    ctx.beginPath()
    ctx.ellipse(pivotX + 6, massY + massRadius + 6, massRadius * 1.1, massRadius * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()

    const massGrad = ctx.createRadialGradient(pivotX - massRadius * 0.3, massY - massRadius * 0.3, 3, pivotX, massY, massRadius * 1.1)
    massGrad.addColorStop(0, '#fca5a5')
    massGrad.addColorStop(0.5, '#e11d48')
    massGrad.addColorStop(1, '#7f1d1d')

    ctx.fillStyle = massGrad
    ctx.beginPath(); ctx.arc(pivotX, massY, massRadius, 0, 2 * Math.PI); ctx.fill()
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1.5; ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = `bold ${Math.max(11, Math.min(16, Math.round(massRadius * 0.6)))}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(params.mass.toFixed(2), pivotX, massY - 3)
    ctx.font = '9px Arial'
    ctx.fillText('kg', pivotX, massY + 9)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'

    const trayW = massRadius * 2.5
    const trayH = 8
    ctx.fillStyle = '#64748b'
    ctx.fillRect(pivotX - trayW / 2, massY + massRadius, trayW, trayH)
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1
    ctx.strokeRect(pivotX - trayW / 2, massY + massRadius, trayW, trayH)

    const numWeights = Math.min(10, Math.max(0, Math.round(params.mass * 2)))
    for (let i = 0; i < numWeights; i++) {
      const wy = massY + massRadius - 3 - i * 3
      ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#60a5fa'
      ctx.beginPath(); ctx.arc(pivotX, wy, 4, 0, 2 * Math.PI); ctx.fill()
    }
  }

  // Reference lines
  ctx.strokeStyle = 'rgba(59,130,246,0.4)'
  ctx.setLineDash([5, 4])
  ctx.beginPath(); ctx.moveTo(pivotX - 60, natEqY); ctx.lineTo(pivotX + 60, natEqY); ctx.stroke()
  ctx.setLineDash([])

  if (hasMass) {
    ctx.strokeStyle = 'rgba(34,197,94,0.5)'
    ctx.setLineDash([5, 4])
    ctx.beginPath(); ctx.moveTo(pivotX - 60, eqY); ctx.lineTo(pivotX + 60, eqY); ctx.stroke()
    ctx.setLineDash([])
  }

  // Ruler
  const rulerLeft = pivotX + 50
  const rulerTop = pivotY + 10
  const rulerBot = h - 20
  const zeroY = natEqY

  ctx.fillStyle = 'rgba(241,245,249,0.3)'
  ctx.fillRect(rulerLeft - 2, rulerTop, 22, rulerBot - rulerTop)
  ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 1
  ctx.strokeRect(rulerLeft - 2, rulerTop, 22, rulerBot - rulerTop)

  const pxPerMmRuler = pxPerCm / 10

  const maxCmDown = Math.floor((rulerBot - zeroY) / pxPerCm)
  for (let cm = 0; cm <= maxCmDown; cm++) {
    const ry = zeroY + cm * pxPerCm
    ctx.beginPath(); ctx.moveTo(rulerLeft, ry); ctx.lineTo(rulerLeft + 20, ry); ctx.stroke()

    if (cm < maxCmDown) {
      for (let mm = 1; mm < 10; mm++) {
        const mmy = ry + mm * pxPerMmRuler
        const mTickLen = mm === 5 ? 12 : 6
        ctx.beginPath(); ctx.moveTo(rulerLeft, mmy); ctx.lineTo(rulerLeft + mTickLen, mmy); ctx.stroke()
      }
    }
  }

  const maxCmUp = Math.floor((zeroY - rulerTop) / pxPerCm)
  for (let cm = 1; cm <= maxCmUp; cm++) {
    const ry = zeroY - cm * pxPerCm
    ctx.beginPath(); ctx.moveTo(rulerLeft, ry); ctx.lineTo(rulerLeft + 20, ry); ctx.stroke()

    if (cm < maxCmUp || cm === maxCmUp) {
      for (let mm = 1; mm < 10; mm++) {
        const mmy = ry + mm * pxPerMmRuler
        if (mmy > rulerBot) break
        const mTickLen = mm === 5 ? 12 : 6
        ctx.beginPath(); ctx.moveTo(rulerLeft, mmy); ctx.lineTo(rulerLeft + mTickLen, mmy); ctx.stroke()
      }
    }
  }

  // Readouts
  const readoutX = rulerLeft + 28

  if (hasMass) {
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5
    ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(readoutX, massY); ctx.lineTo(pivotX + massRadius + 5, massY); ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.fillStyle = 'rgba(59,130,246,0.12)'
  ctx.fillRect(readoutX, natEqY - 10, 52, 20)
  ctx.strokeStyle = 'rgba(59,130,246,0.4)'; ctx.lineWidth = 1
  ctx.strokeRect(readoutX, natEqY - 10, 52, 20)
  ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 11px "Courier New",monospace'
  ctx.textAlign = 'center'
  ctx.fillText('0 cm', readoutX + 26, natEqY + 4)

  if (hasMass) {
    const dyStr = staticStretchCm.toFixed(2)
    ctx.fillStyle = 'rgba(34,197,94,0.12)'
    ctx.fillRect(readoutX, eqY - 10, 52, 20)
    ctx.strokeStyle = 'rgba(34,197,94,0.4)'
    ctx.strokeRect(readoutX, eqY - 10, 52, 20)
    ctx.fillStyle = '#22c55e'; ctx.font = 'bold 11px "Courier New",monospace'
    ctx.fillText(`${dyStr} cm`, readoutX + 26, eqY + 4)

    const yCm = (staticStretchCm + simState.x * 100).toFixed(2)
    ctx.fillStyle = 'rgba(220,38,38,0.12)'
    ctx.fillRect(readoutX, massY - 10, 52, 20)
    ctx.strokeStyle = 'rgba(220,38,38,0.4)'
    ctx.strokeRect(readoutX, massY - 10, 52, 20)
    ctx.fillStyle = '#dc2626'; ctx.font = 'bold 11px "Courier New",monospace'
    ctx.fillText(`${yCm} cm`, readoutX + 26, massY + 4)
  }

  ctx.textAlign = 'start'

  // Velocity arrow
  if (Math.abs(simState.v) > 0.01) {
    const vScale = 30
    const vDir = simState.v > 0 ? 1 : -1
    const vLen = Math.min(60, Math.abs(simState.v) * vScale)
    const arrowY = massY + vDir * (massRadius + 10)
    const tipY = arrowY + vDir * vLen
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(pivotX + massRadius + 12, arrowY); ctx.lineTo(pivotX + massRadius + 12, tipY); ctx.stroke()
    ctx.fillStyle = '#2563eb'
    ctx.beginPath()
    ctx.moveTo(pivotX + massRadius + 12, tipY)
    ctx.lineTo(pivotX + massRadius + 12 - 4, tipY - vDir * 8)
    ctx.lineTo(pivotX + massRadius + 12 + 4, tipY - vDir * 8)
    ctx.fill()
  }

  return { massY, natEqY, staticStretchCm, pxPerCm }
}
