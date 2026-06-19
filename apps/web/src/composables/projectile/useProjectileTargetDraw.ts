import type { ProjectileParams } from '../../modules/physics/experiments/projectile/useProjectilePhysics'

interface TargetSimState {
  targetHit: boolean
  distanceToTarget: number | null
}

export function useProjectileTargetDraw() {
  function drawTree(ctx: CanvasRenderingContext2D, tx: number, ty: number, scale: number, hit: boolean) {
    const s = Math.max(scale, 18)
    const trunkW = Math.max(6, s * 0.15)
    const trunkH = Math.max(18, s * 0.6)
    const canopyR = Math.max(14, s * 0.55)
    const trunkColor = '#5D4037'
    const canopyColor = hit ? '#4ade80' : '#16a34a'
    // Shadow/glow at base
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.beginPath(); ctx.ellipse(tx, ty + 2, trunkW * 1.5, 3, 0, 0, Math.PI * 2); ctx.fill()
    // Trunk
    ctx.fillStyle = trunkColor
    ctx.fillRect(tx - trunkW / 2, ty - trunkH, trunkW, trunkH)
    // Canopy (3 circles)
    ctx.fillStyle = canopyColor
    ctx.beginPath(); ctx.arc(tx, ty - trunkH - canopyR * 0.3, canopyR, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(tx - canopyR * 0.5, ty - trunkH + canopyR * 0.3, canopyR * 0.7, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(tx + canopyR * 0.5, ty - trunkH + canopyR * 0.3, canopyR * 0.7, 0, Math.PI * 2); ctx.fill()
    // Trunk outline
    ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 1
    ctx.strokeRect(tx - trunkW / 2, ty - trunkH, trunkW, trunkH)
    // Hit glow
    if (hit) {
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.arc(tx, ty - trunkH * 0.5, canopyR * 1.4, 0, Math.PI * 2); ctx.stroke()
      // Bright flash
      ctx.fillStyle = 'rgba(251,191,36,0.3)'
      ctx.beginPath(); ctx.arc(tx, ty - trunkH * 0.5, canopyR * 1.8, 0, Math.PI * 2); ctx.fill()
      // Ripple rings
      ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(tx, ty - trunkH * 0.5, canopyR * 2.2, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = 'rgba(251,191,36,0.3)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(tx, ty - trunkH * 0.5, canopyR * 2.8, 0, Math.PI * 2); ctx.stroke()
    }
  }

  function drawTarget(
    ctx: CanvasRenderingContext2D,
    _w: number,
    h: number,
    params: ProjectileParams,
    simState: TargetSimState,
    margin: number,
    groundY: number,
    scale: number
  ) {
    if (!params.targetMode || !params.targetVisible) return
    const tx = margin + params.targetX * scale
    const ty = groundY - params.targetY * scale
    drawTree(ctx, tx, ty, scale, simState.targetHit)
    // Label
    ctx.fillStyle = simState.targetHit ? '#22c55e' : '#ef4444'
    ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(simState.targetHit ? '🎯' : '🌲', tx, ty - scale * 0.8)
  }
  return { drawTarget }
}
