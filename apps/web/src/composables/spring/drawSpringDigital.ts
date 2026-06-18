export function drawSpringDigital(
  ctx: CanvasRenderingContext2D,
  w: number,
  params: { mass: number; k: number },
  simState: { x: number; v: number; t: number },
  massY: number,
  natEqY: number,
  staticStretchCm: number,
  pxPerCm: number
) {
  const hasMass = params.mass > 1e-6
  const padX = w - 168
  const padY = 10
  const padW = 156
  const padH = 116

  // Outer dark case
  ctx.fillStyle = 'rgba(22,27,34,0.95)'
  ctx.strokeStyle = '#3a4a5c'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(padX, padY, padW, padH, 8)
  ctx.fill()
  ctx.stroke()

  // Inner LCD screen
  const lcdX = padX + 6
  const lcdY = padY + 22
  const lcdW = padW - 12
  const lcdH = padH - 30
  ctx.fillStyle = 'rgba(20,40,30,0.9)'
  ctx.strokeStyle = 'rgba(60,100,70,0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(lcdX, lcdY, lcdW, lcdH, 4)
  ctx.fill()
  ctx.stroke()

  // LCD grid lines
  ctx.strokeStyle = 'rgba(80,160,100,0.06)'
  ctx.lineWidth = 0.5
  for (let ly = lcdY + 4; ly < lcdY + lcdH; ly += 14) {
    ctx.beginPath(); ctx.moveTo(lcdX + 4, ly); ctx.lineTo(lcdX + lcdW - 4, ly); ctx.stroke()
  }

  // Title
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#8B95A5'
  ctx.fillText('📟 القراءات الإلكترونية', padX + 8, padY + 15)

  // Battery icon
  ctx.fillStyle = '#4a5'
  ctx.fillRect(padX + padW - 22, padY + 6, 14, 7)
  ctx.fillStyle = 'rgba(22,27,34,0.95)'
  ctx.fillRect(padX + padW - 18, padY + 8, 2, 3)
  ctx.fillRect(padX + padW - 14, padY + 8, 2, 3)
  ctx.fillRect(padX + padW - 10, padY + 8, 2, 3)

  const massG = (params.mass * 1000).toFixed(0)
  const stretchCm = staticStretchCm.toFixed(2)
  const currentPosCm = (staticStretchCm + simState.x * 100).toFixed(2)  // y from natural position (real)
  const dispFromEqCm = (simState.x * 100).toFixed(2)                    // displacement from equilibrium (real)
  const velocity = simState.v.toFixed(3)
  const timeS = simState.t.toFixed(2)

  ctx.font = '11px "Courier New", monospace'
  const lx = lcdX + 6
  const ly = lcdY + 14

  const rows = [
    { label: 'm', val: massG, unit: 'g', highlight: false },
    { label: 'Δy', val: stretchCm, unit: 'cm', highlight: false },
    { label: 'y', val: currentPosCm, unit: 'cm', highlight: false },
    { label: 'Δx', val: dispFromEqCm, unit: 'cm', highlight: hasMass && Math.abs(simState.x) > 0.001 },
    { label: 'v', val: velocity, unit: 'm/s', highlight: hasMass && Math.abs(simState.v) > 0.01 },
  ]

  rows.forEach((r, i) => {
    const ry = ly + i * 16
    ctx.textAlign = 'left'
    ctx.fillStyle = '#4ade80'
    ctx.fillText(r.label, lx, ry)
    ctx.fillStyle = r.highlight ? '#fbbf24' : '#86efac'
    ctx.fillText(`= ${r.val}`, lx + 18, ry)
    ctx.fillStyle = '#4ade80'
    ctx.textAlign = 'right'
    ctx.fillText(r.unit, lcdX + lcdW - 6, ry)
  })
}
