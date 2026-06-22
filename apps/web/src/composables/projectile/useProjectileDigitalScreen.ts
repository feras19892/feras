import { useI18n } from '../../composables/useI18n'
import type { ProjectileParams } from '../../modules/physics/experiments/projectile/useProjectilePhysics'

interface SimState {
  x: number; y: number; vx: number; vy: number; t: number
  running: boolean; paused: boolean; landed: boolean
  targetHit: boolean
  distanceToTarget: number | null
  maxHeightReached: number
  landingSpeed: number
}

export function useProjectileDigitalScreen(_params: ProjectileParams, simState: SimState) {
  const { t } = useI18n()

  function draw(ctx: CanvasRenderingContext2D, w: number) {
    const boxH = 56
    const boxX = 10
    const boxY = 10
    const boxW = w - 20

    ctx.fillStyle = 'rgba(15,23,42,0.92)'
    ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, 8); ctx.fill()
    ctx.strokeStyle = 'rgba(91,141,184,0.4)'; ctx.lineWidth = 1.5; ctx.stroke()

    ctx.fillStyle = '#5B8DB8'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText(`📊 ${t('experiments.experimentMeasurements')}`, boxX + 8, boxY + 4)

    let status = `⏸️ ${t('experiments.statusReady')}`, statusColor = '#94a3b8'
    if (simState.targetHit) { status = `🎯 ${t('experiments.statusTargetHit')}`; statusColor = '#22c55e' }
    else if (simState.running && !simState.landed) { status = `🚀 ${t('experiments.statusFlying')}`; statusColor = '#5B8DB8' }
    else if (simState.landed) { status = `✅ ${t('experiments.statusLanded')}`; statusColor = '#22c55e' }
    ctx.fillStyle = statusColor; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'right'
    ctx.fillText(status, boxX + boxW - 8, boxY + 4)

    ctx.textAlign = 'center'; ctx.textBaseline = 'top'

    function item(label: string, value: string, color: string, x: number, y: number) {
      ctx.fillStyle = '#8B95A5'; ctx.font = '10px sans-serif'
      ctx.fillText(label, x, y)
      ctx.fillStyle = color; ctx.font = 'bold 13px monospace'
      ctx.fillText(value, x, y + 14)
    }

    const landed = simState.landed
    const vMag = landed && simState.landingSpeed > 0 ? simState.landingSpeed : Math.sqrt(simState.vx ** 2 + simState.vy ** 2)

    const r = boxY + 22
    const s = boxW / 4

    item(t('experiments.timeLabel'), landed ? `${simState.t.toFixed(2)} s` : '--', landed ? '#fbbf24' : '#475569', boxX + s * 0.5, r)
    item(t('experiments.maxHeight'), landed ? `${simState.maxHeightReached.toFixed(2)} m` : '--', landed ? '#fbbf24' : '#475569', boxX + s * 1.5, r)
    item(t('experiments.speedLabel'), landed ? `${vMag.toFixed(2)} m/s` : '--', landed ? '#fbbf24' : '#475569', boxX + s * 2.5, r)
    item(t('experiments.rangeLabel'), landed ? `${simState.x.toFixed(2)} m` : '--', landed ? '#fbbf24' : '#475569', boxX + s * 3.5, r)
  }

  return { draw }
}
