const MU0 = 4 * Math.PI * 1e-7
const E_CHARGE = 1.602e-19
const E_MASS = 9.109e-31

export const R_MAX_VIS = 0.5

export { MU0, E_CHARGE, E_MASS }

export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, size = 6) {
  ctx.fillStyle = color
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(size, 0)
  ctx.lineTo(-size * 0.6, -size * 0.7)
  ctx.lineTo(-size * 0.6, size * 0.7)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function computePhysics(V: number, I: number, N: number, R: number) {
  const R_safe = Math.max(R, 1e-6)
  const B_val = (8 * MU0 * N * I) / (5 * Math.sqrt(5) * R_safe)
  const v_val = Math.sqrt((2 * E_CHARGE * V) / E_MASS)
  let r_val = Infinity
  if (B_val > 1e-15) {
    r_val = (E_MASS * v_val) / (E_CHARGE * B_val)
  }
  return { B_val, v_val, r_val }
}

export function drawHelmholtzCoil(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, flatR: number, turns: number,
  currentI: number,
) {
  const coilW = r * 0.95
  ctx.strokeStyle = 'rgba(100,116,139,0.35)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(x, y, coilW, flatR, 0, Math.PI, Math.PI * 2)
  ctx.stroke()

  const grad = ctx.createLinearGradient(x - coilW, 0, x + coilW, 0)
  grad.addColorStop(0, '#8B5E3C')
  grad.addColorStop(0.5, '#D49A6E')
  grad.addColorStop(1, '#8B5E3C')
  ctx.strokeStyle = grad
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(x, y, coilW, flatR, 0, 0, Math.PI)
  ctx.stroke()

  const numTurns = Math.min(Math.max(3, Math.round(turns / 15)), 12)
  for (let n = 1; n < numTurns; n++) {
    const oy = n * 2
    const shrink = 1 - n * 0.015
    ctx.strokeStyle = `rgba(100,116,139,${Math.max(0.12, 0.35 - n * 0.025)})`
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(x, y - oy, coilW * shrink, flatR * shrink, 0, Math.PI, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = `rgba(200,137,90,${Math.max(0.18, 0.45 - n * 0.025)})`
    ctx.beginPath()
    ctx.ellipse(x, y - oy, coilW * shrink, flatR * shrink, 0, 0, Math.PI)
    ctx.stroke()
  }

  if (Math.abs(currentI) > 0.01) {
    const arrowY = y + flatR * 0.5
    const arrowDir = currentI >= 0 ? 1 : -1
    drawArrow(ctx, x + coilW * arrowDir, arrowY, arrowDir > 0 ? 0 : Math.PI, 'rgba(59,130,246,0.8)', 5)
  }
}

export function drawFieldIndicators(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, tubeR: number, visualR: number,
  B_val: number, currentI: number,
) {
  if (B_val <= 1e-15) return
  const fieldColor = currentI >= 0 ? 'rgba(59,130,246,' : 'rgba(239,68,68,'
  const B_vis = Math.min(1, B_val / 0.01)
  const dotSpacing = 40 / (0.5 + B_vis * 0.5)
  const dotR = 3

  for (let i = -4; i < 5; i++) {
    for (let j = -4; j < 5; j++) {
      const dx = cx + i * dotSpacing
      const dy = cy + j * dotSpacing
      const distFromCenter = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2)
      if (distFromCenter > tubeR * 0.8) continue
      if (distFromCenter < visualR * 0.85 && distFromCenter > 0) continue

      ctx.strokeStyle = fieldColor + '0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(dx, dy, dotR, 0, Math.PI * 2)
      ctx.stroke()
      if (currentI >= 0) {
        ctx.fillStyle = fieldColor + '0.4)'
        ctx.beginPath()
        ctx.arc(dx, dy, 1.2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(dx - dotR * 0.6, dy - dotR * 0.6)
        ctx.lineTo(dx + dotR * 0.6, dy + dotR * 0.6)
        ctx.moveTo(dx + dotR * 0.6, dy - dotR * 0.6)
        ctx.lineTo(dx - dotR * 0.6, dy + dotR * 0.6)
        ctx.stroke()
      }
    }
  }
}

export function drawTube(ctx: CanvasRenderingContext2D, cx: number, cy: number, tubeR: number) {
  const tubeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, tubeR)
  tubeGrad.addColorStop(0, 'rgba(20,30,50,0.4)')
  tubeGrad.addColorStop(0.7, 'rgba(15,22,40,0.2)')
  tubeGrad.addColorStop(1, 'rgba(10,18,32,0.6)')
  ctx.fillStyle = tubeGrad
  ctx.beginPath()
  ctx.ellipse(cx, cy, tubeR, tubeR * 0.85, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(100,150,200,0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, tubeR, tubeR * 0.85, 0, 0, Math.PI * 2)
  ctx.stroke()
}

export function drawElectronGun(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, tubeR: number,
  running: boolean, gunLabel: string,
) {
  const gunW = 24
  const gunH = 30
  const gunX = cx - gunW / 2
  const gunY = cy + tubeR * 0.7
  ctx.fillStyle = '#2D3645'
  ctx.strokeStyle = '#5B8DB8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(gunX, gunY, gunW, gunH, 4)
  ctx.fill()
  ctx.stroke()
  if (running) {
    ctx.fillStyle = 'rgba(239,68,68,0.6)'
    ctx.beginPath()
    ctx.arc(cx, gunY + 8, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(239,68,68,0.2)'
    ctx.beginPath()
    ctx.arc(cx, gunY + 8, 8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#64748b'
  ctx.font = '8px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(gunLabel, cx, gunY + gunH + 12)
}

export function drawLabels(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  currentV_val: number, currentI: number, currentN: number,
  B_val: number, v_val: number, r_val: number, Fm_val: number,
  beamOn: boolean,
  t: (key: string) => string,
) {
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`V = ${currentV_val.toFixed(0)} V`, 15, 25)
  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`I = ${currentI.toFixed(2)} A`, 15, 42)
  ctx.fillStyle = '#a855f7'
  ctx.fillText(`N = ${Math.round(currentN)} ${t('experiments.genTurns')}`, 15, 59)

  if (B_val > 1e-15) {
    ctx.fillStyle = '#3b82f6'
    ctx.fillText(`B = ${B_val.toExponential(2)} T`, 15, 76)
    ctx.fillStyle = '#22c55e'
    ctx.fillText(`v = ${v_val.toExponential(2)} m/s`, 15, 93)
    ctx.fillStyle = '#a855f7'
    ctx.fillText(`r = ${r_val.toExponential(2)} m (${(r_val * 100).toFixed(1)} cm)`, 15, 110)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(`F = ${Fm_val.toExponential(2)} N`, 15, 127)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.fillText(t('experiments.emCanvasNoField'), 15, 76)
    ctx.fillStyle = '#22c55e'
    ctx.fillText(`v = ${v_val.toExponential(2)} m/s`, 15, 93)
    ctx.fillStyle = '#64748b'
    ctx.fillText(t('experiments.emCanvasBeamStraightShort'), 15, 110)
  }

  ctx.textAlign = 'right'
  if (beamOn) {
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emCanvasBeamActive'), w - 15, 25)
  } else {
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(t('experiments.emCanvasBeamStopped'), w - 15, 25)
  }
}
