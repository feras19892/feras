import type { CollisionState, CollisionParams } from '../../../modules/physics/experiments/collision/useCollisionPhysics'

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  w: number,
  st: CollisionState,
  _params: CollisionParams,
  t: (key: string) => string,
) {
  const { collided, v1, v2, v1f, v2f, t: simTime } = st
  ctx.save()
  ctx.fillStyle = 'rgba(15,23,42,0.92)'
  ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.lineWidth = 1.5
  const rx = 12, ry = 10, rw = 200, rh = 148, rr = 8
  ctx.beginPath(); ctx.moveTo(rx + rr, ry); ctx.lineTo(rx + rw - rr, ry); ctx.arcTo(rx + rw, ry, rx + rw, ry + rr, rr); ctx.lineTo(rx + rw, ry + rh - rr); ctx.arcTo(rx + rw, ry + rh, rx + rw - rr, ry + rh, rr); ctx.lineTo(rx + rr, ry + rh); ctx.arcTo(rx, ry + rh, rx, ry + rh - rr, rr); ctx.lineTo(rx, ry + rr); ctx.arcTo(rx, ry, rx + rr, ry, rr); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 13px "Segoe UI"'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.fillText(`v₁ = ${(collided ? (v1f ?? v1) : v1).toFixed(2)} m/s`, 22, 16)
  ctx.fillStyle = '#38bdf8'
  ctx.fillText(`v₂ = ${(collided ? (v2f ?? v2) : v2).toFixed(2)} m/s`, 22, 36)
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(`t = ${simTime.toFixed(2)} s`, 22, 56)
  if (st.KEi !== null && st.KEf !== null) {
    ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px "Segoe UI"'
    ctx.fillText(`${t('experiments.momentumBefore')} = ${st.Pi?.toFixed(1)}  |  ${t('experiments.momentumAfter')} = ${st.Pf?.toFixed(1)}`, 22, 80)
    ctx.fillStyle = '#34d399'
    ctx.fillText(`${t('experiments.energyBefore')} = ${st.KEi?.toFixed(1)} J`, 22, 98)
    ctx.fillStyle = '#f87171'
    ctx.fillText(`${t('experiments.energyAfter')} = ${st.KEf?.toFixed(1)} J  |  ${t('experiments.energyLoss')} ${st.lossPercent?.toFixed(0)}%`, 22, 116)
  }
  ctx.restore()
}

export function drawStatus(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  st: CollisionState,
  t: (key: string) => string,
) {
  ctx.save()
  ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 16px "Segoe UI"'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  let status = ''
  if (!st.running) status = t('experiments.pressStartLaunchBalls')
  else if (st.paused) status = '⏸️ ' + t('experiments.pausedTemporarily')
  else if (st.collided) status = '💥 ' + t('experiments.collisionStatus')
  else status = t('experiments.ballsMovingHint')
  ctx.fillText(status, w / 2, h - 32)
  ctx.restore()
}

export function drawCountdown(
  ctx: CanvasRenderingContext2D,
  w: number,
  st: CollisionState,
  params: CollisionParams,
  t: (key: string) => string,
) {
  if (!st.running || st.collided || st.paused) return
  const dist = Math.abs(st.x2 - st.x1) - (params.r1 + params.r2)
  const relV = Math.abs(st.v1 - st.v2)
  if (dist > 0 && relV > 0.1) {
    const timeToCollide = dist / relV
    if (timeToCollide < 3) {
      ctx.save()
      ctx.fillStyle = 'rgba(251,191,36,0.9)'
      ctx.font = 'bold 18px "Segoe UI"'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`${t('experiments.collisionIn')} ${timeToCollide.toFixed(1)}s`, w / 2, 80)
      ctx.restore()
    }
  }
}
