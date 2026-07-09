import type { CircuitComponent } from './types'
import type { CanvasContext, WorkspaceProps } from './workspaceTypes'

export function drawComponent(
  ctx: CanvasRenderingContext2D,
  c: CircuitComponent,
  selectedId: number | null,
  cc: CanvasContext,
  props: WorkspaceProps,
) {
  const { worldToScreen, zoom } = cc
  const [sx, sy] = worldToScreen(c.x, c.y)
  const z = zoom.value
  const isSelected = selectedId === c.id

  ctx.lineWidth = (isSelected ? 2.5 : 2) * z

  if (c.type === 'battery') {
    ctx.strokeStyle = isSelected ? '#fbbf24' : '#f59e0b'
    const w = 30 * z
    ctx.beginPath()
    ctx.moveTo(sx - w, sy); ctx.lineTo(sx - w * 0.3, sy)
    ctx.lineTo(sx - w * 0.3, sy - 12 * z); ctx.lineTo(sx + w * 0.3, sy - 12 * z)
    ctx.lineTo(sx + w * 0.3, sy); ctx.lineTo(sx + w, sy); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(sx - w * 0.3, sy); ctx.lineTo(sx - w * 0.3, sy + 12 * z)
    ctx.lineTo(sx + w * 0.3, sy + 12 * z); ctx.lineTo(sx + w * 0.3, sy); ctx.stroke()
    ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${11 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText(`${c.value}V`, sx, sy - 22 * z)
    ctx.font = `${8 * z}px sans-serif`; ctx.fillStyle = '#94a3b8'
    ctx.fillText('+', sx - w * 0.5, sy - 16 * z)
    ctx.fillText('−', sx + w * 0.5, sy - 16 * z)
  } else if (c.type === 'resistor') {
    ctx.strokeStyle = isSelected ? '#67e8f9' : '#06b6d4'
    const w = 40 * z, h = 12 * z
    ctx.beginPath()
    ctx.moveTo(sx - w, sy); ctx.lineTo(sx - w * 0.7, sy)
    ctx.lineTo(sx - w * 0.55, sy - h); ctx.lineTo(sx - w * 0.25, sy + h)
    ctx.lineTo(sx, sy - h); ctx.lineTo(sx + w * 0.25, sy + h)
    ctx.lineTo(sx + w * 0.55, sy - h); ctx.lineTo(sx + w * 0.7, sy)
    ctx.lineTo(sx + w, sy); ctx.stroke()
    ctx.fillStyle = '#67e8f9'; ctx.font = `bold ${11 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText(`${c.value}Ω`, sx, sy - 18 * z)
  } else if (c.type === 'ammeter') {
    const r = 18 * z
    ctx.strokeStyle = isSelected ? '#4ade80' : '#22c55e'
    ctx.fillStyle = '#0d1117'
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#4ade80'; ctx.font = `bold ${12 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText(c.label || 'A', sx, sy + 4 * z)
    let val = '0.00'
    if (props.running) {
      if (props.kirchhoffCurrents) {
        if (c.label === 'A1') val = props.kirchhoffCurrents.I1.toFixed(3)
        else if (c.label === 'A2') val = props.kirchhoffCurrents.I2.toFixed(3)
        else if (c.label === 'A3') val = props.kirchhoffCurrents.I3.toFixed(3)
        else val = props.current.toFixed(2)
      } else if (props.parallelCurrents) {
        if (c.label === 'A1') val = props.parallelCurrents.I1.toFixed(3)
        else if (c.label === 'A2') val = props.parallelCurrents.I2.toFixed(3)
        else if (c.label === 'At') val = props.parallelCurrents.Itotal.toFixed(3)
        else val = props.current.toFixed(2)
      } else if (props.isRC && props.rcReading) {
        val = props.rcReading.I.toExponential(2)
      } else if (props.isLamp && props.lampReading) {
        val = props.lampReading.I.toFixed(3)
      } else if (props.isInternalResistance && props.internalResistanceReading) {
        val = props.internalResistanceReading.I.toFixed(4)
      } else if (props.isSeries && props.seriesReading) {
        val = props.seriesReading.I.toFixed(4)
      } else if (props.isNonOhmic && props.nonOhmicReading) {
        val = props.nonOhmicReading.I_lamp.toFixed(4)
      } else { val = props.current.toFixed(2) }
    }
    ctx.font = `${8 * z}px sans-serif`; ctx.fillStyle = '#94a3b8'
    ctx.fillText(`${val}A`, sx, sy + r + 12 * z)
  } else if (c.type === 'voltmeter') {
    const r = 18 * z
    ctx.strokeStyle = isSelected ? '#a78bfa' : '#8b5cf6'
    ctx.fillStyle = '#0d1117'
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#a78bfa'; ctx.font = `bold ${12 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText('V', sx, sy + 4 * z)
    let vVal = props.running ? props.voltage.toFixed(1) : '0.0'
    if (props.isRC && props.rcReading) vVal = props.running ? props.rcReading.V.toFixed(2) : '0.00'
    if (props.isLamp && props.lampReading) vVal = props.running ? props.lampReading.V.toFixed(2) : '0.00'
    if (props.isInternalResistance && props.internalResistanceReading) vVal = props.running ? props.internalResistanceReading.Vt.toFixed(3) : '0.000'
    if (props.isSeries && props.seriesReading) vVal = props.running ? props.seriesReading.V2.toFixed(3) : '0.000'
    if (props.isNonOhmic && props.nonOhmicReading) vVal = props.running ? props.nonOhmicReading.V.toFixed(2) : '0.00'
    ctx.font = `${8 * z}px sans-serif`; ctx.fillStyle = '#94a3b8'
    ctx.fillText(`${vVal}V`, sx, sy + r + 12 * z)
  } else if (c.type === 'capacitor') {
    ctx.strokeStyle = isSelected ? '#fbbf24' : '#f59e0b'
    const w = 12 * z, gap = 4 * z
    ctx.lineWidth = 3 * z
    ctx.beginPath()
    ctx.moveTo(sx - w - gap, sy - 18 * z); ctx.lineTo(sx - w - gap, sy + 18 * z)
    ctx.moveTo(sx + w + gap, sy - 18 * z); ctx.lineTo(sx + w + gap, sy + 18 * z)
    ctx.stroke()
    ctx.lineWidth = 2 * z
    ctx.beginPath()
    ctx.moveTo(sx - 40 * z, sy); ctx.lineTo(sx - w - gap, sy)
    ctx.moveTo(sx + w + gap, sy); ctx.lineTo(sx + 40 * z, sy)
    ctx.stroke()
    ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${11 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText(`${c.value}µF`, sx, sy - 24 * z)
  } else if (c.type === 'switch') {
    const w = 20 * z
    ctx.strokeStyle = isSelected ? '#4ade80' : '#22c55e'
    ctx.lineWidth = 2 * z
    ctx.beginPath(); ctx.moveTo(sx - w, sy); ctx.lineTo(sx - 8 * z, sy); ctx.stroke()
    const closed = (c as any)._closed !== false
    ctx.beginPath(); ctx.moveTo(sx - 8 * z, sy)
    if (closed) { ctx.lineTo(sx + 8 * z, sy) } else { ctx.lineTo(sx + 6 * z, sy - 14 * z) }
    ctx.stroke()
    ctx.beginPath(); ctx.arc(sx + 8 * z, sy, 3 * z, 0, Math.PI * 2)
    ctx.fillStyle = '#0d1117'; ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(sx + 8 * z, sy); ctx.lineTo(sx + w, sy); ctx.stroke()
    ctx.fillStyle = closed ? '#4ade80' : '#ef4444'
    ctx.font = `bold ${9 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText(closed ? 'ON' : 'OFF', sx, sy - 20 * z)
  } else if (c.type === 'lamp') {
    const r = 16 * z
    const brightness = (props.isLamp && props.lampReading && props.running) ? props.lampReading.brightness : 0
    if (brightness > 0) {
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3)
      grad.addColorStop(0, `rgba(253,224,71,${brightness * 0.4})`)
      grad.addColorStop(1, 'rgba(253,224,71,0)')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(sx, sy, r * 3, 0, Math.PI * 2); ctx.fill()
    }
    ctx.strokeStyle = isSelected ? '#fbbf24' : '#f59e0b'
    ctx.fillStyle = brightness > 0 ? `rgba(253,224,71,${brightness * 0.3})` : '#0d1117'
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2 * z
    ctx.beginPath()
    ctx.moveTo(sx - r * 0.6, sy - r * 0.6); ctx.lineTo(sx + r * 0.6, sy + r * 0.6)
    ctx.moveTo(sx + r * 0.6, sy - r * 0.6); ctx.lineTo(sx - r * 0.6, sy + r * 0.6)
    ctx.stroke()
    ctx.fillStyle = '#fbbf24'; ctx.font = `bold ${10 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText(`${c.value}V`, sx, sy + r + 12 * z)
  } else if (c.type === 'galvanometer') {
    const r = 20 * z
    const sens = (props.isGalvanometer && props.galvanometerReading && props.running) ? props.galvanometerReading.sensitivity : 0
    ctx.strokeStyle = isSelected ? '#67e8f9' : '#06b6d4'
    ctx.fillStyle = '#0d1117'
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = '#1e2530'; ctx.lineWidth = 2 * z
    ctx.beginPath(); ctx.arc(sx, sy, r * 0.8, Math.PI * 0.75, Math.PI * 0.25, false); ctx.stroke()
    const angle = Math.PI * 0.75 + (sens / 100) * Math.PI * 1.5
    ctx.strokeStyle = sens > 0 ? '#4ade80' : '#64748b'; ctx.lineWidth = 2 * z
    ctx.beginPath(); ctx.moveTo(sx, sy)
    ctx.lineTo(sx + Math.cos(angle) * r * 0.7, sy - Math.sin(angle) * r * 0.7); ctx.stroke()
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(sx, sy, 3 * z, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#67e8f9'; ctx.font = `bold ${10 * z}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText('G', sx, sy + r + 12 * z)
    if (props.isGalvanometer && props.galvanometerReading && props.running) {
      ctx.font = `${8 * z}px sans-serif`; ctx.fillStyle = '#94a3b8'
      ctx.fillText(`${props.galvanometerReading.IuA.toFixed(1)}µA`, sx, sy + r + 22 * z)
    }
  }
}
