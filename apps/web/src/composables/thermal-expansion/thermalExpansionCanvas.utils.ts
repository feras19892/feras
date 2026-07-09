export function materialColor(t: number, mat: string): string {
  const base: Record<string, number[]> = {
    copper: [184, 115, 51], aluminum: [206, 206, 206], iron: [80, 80, 80],
    steel: [120, 120, 120], brass: [181, 166, 66], glass: [200, 220, 230],
  }
  const c = base[mat] || base.copper
  const r = Math.max(0, Math.min(1, (t - 20) / 100))
  return `rgb(${Math.min(255, c[0] + r * 60)},${Math.max(40, c[1] - r * 40)},${Math.max(40, c[2] - r * 60)})`
}

export function adjustBrightness(rgbStr: string, amount: number): string {
  const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return rgbStr
  const r = Math.min(255, Math.max(0, parseInt(match[1]) + amount))
  const g = Math.min(255, Math.max(0, parseInt(match[2]) + amount))
  const b = Math.min(255, Math.max(0, parseInt(match[3]) + amount))
  return `rgb(${r},${g},${b})`
}

export function drawClampStand(ctx: CanvasRenderingContext2D, x: number, y: number, s: (v: number) => number) {
  ctx.fillStyle = '#2A3540'
  ctx.fillRect(x - s(30), y - s(8), s(60), s(8))
  ctx.strokeStyle = '#1e2530'; ctx.lineWidth = s(1)
  ctx.strokeRect(x - s(30), y - s(8), s(60), s(8))
  ctx.fillStyle = '#3D4A5C'; ctx.fillRect(x - s(30), y - s(8), s(60), s(2))

  const tubeW = s(6)
  const grad = ctx.createLinearGradient(x - tubeW / 2, 0, x + tubeW / 2, 0)
  grad.addColorStop(0, '#1A232E')
  grad.addColorStop(0.3, '#3D4A5C')
  grad.addColorStop(0.7, '#2A3540')
  grad.addColorStop(1, '#141A22')
  ctx.fillStyle = grad
  ctx.fillRect(x - tubeW / 2, y - s(90), tubeW, s(90))
  ctx.strokeStyle = '#1e2530'; ctx.lineWidth = s(0.5)
  ctx.strokeRect(x - tubeW / 2, y - s(90), tubeW, s(90))

  const armY = y - s(72)
  ctx.fillStyle = '#2A3540'
  ctx.fillRect(x, armY - s(4), s(35), s(8))
  ctx.strokeStyle = '#1e2530'; ctx.strokeRect(x, armY - s(4), s(35), s(8))

  const jawX = x + s(35)
  ctx.fillStyle = '#3D4A5C'
  ctx.fillRect(jawX - s(2), armY - s(10), s(4), s(20))
  ctx.strokeStyle = '#1e2530'; ctx.strokeRect(jawX - s(2), armY - s(10), s(4), s(20))
  ctx.fillStyle = '#8B95A5'
  ctx.beginPath(); ctx.arc(jawX, armY - s(6), s(1.5), 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(jawX, armY + s(6), s(1.5), 0, Math.PI * 2); ctx.fill()
}

export function drawBurner(ctx: CanvasRenderingContext2D, x: number, y: number, s: (v: number) => number, active: boolean) {
  ctx.fillStyle = '#2A3540'
  ctx.beginPath()
  ctx.moveTo(x - s(8), y)
  ctx.lineTo(x + s(8), y)
  ctx.lineTo(x + s(6), y - s(20))
  ctx.lineTo(x - s(6), y - s(20))
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1e2530'; ctx.lineWidth = s(1); ctx.stroke()

  ctx.strokeStyle = '#2A3540'; ctx.lineWidth = s(3)
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s(15), y + s(5)); ctx.stroke()

  if (active) {
    const flicker = 3 * Math.sin(Date.now() / 150) + 2 * Math.cos(Date.now() / 230)
    const flameH = s(28 + flicker)
    const fGrad = ctx.createRadialGradient(x, y - s(20), 0, x, y - s(20) - flameH, flameH)
    fGrad.addColorStop(0, 'rgba(255,240,150,0.95)')
    fGrad.addColorStop(0.25, 'rgba(255,160,40,0.7)')
    fGrad.addColorStop(0.6, 'rgba(255,80,20,0.4)')
    fGrad.addColorStop(1, 'rgba(200,30,0,0)')
    ctx.fillStyle = fGrad
    ctx.beginPath()
    ctx.moveTo(x - s(5), y - s(20))
    ctx.quadraticCurveTo(x - s(8), y - s(20) - flameH * 0.5, x, y - s(20) - flameH)
    ctx.quadraticCurveTo(x + s(8), y - s(20) - flameH * 0.5, x + s(5), y - s(20))
    ctx.closePath(); ctx.fill()

    const bGrad = ctx.createRadialGradient(x, y - s(20) - flameH * 0.3, 0, x, y - s(20) - flameH * 0.3, s(4))
    bGrad.addColorStop(0, 'rgba(100,180,255,0.8)')
    bGrad.addColorStop(1, 'rgba(100,180,255,0)')
    ctx.fillStyle = bGrad
    ctx.beginPath(); ctx.ellipse(x, y - s(20) - flameH * 0.3, s(3), s(6), 0, 0, Math.PI * 2); ctx.fill()
  }
}

export function drawRuler(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, s: (v: number) => number, expansionPx: number) {
  ctx.fillStyle = '#1A232E'
  ctx.fillRect(x, y - s(6), len + s(40), s(14))
  ctx.strokeStyle = '#2D3645'; ctx.lineWidth = s(1)
  ctx.strokeRect(x, y - s(6), len + s(40), s(14))

  const pxPerMm = s(2)
  const maxMm = Math.ceil((len + s(40)) / pxPerMm)
  ctx.fillStyle = '#5B8DB8'; ctx.font = `${s(6)}px sans-serif`; ctx.textAlign = 'center'
  for (let mm = 0; mm <= maxMm; mm += 5) {
    const tx = x + mm * pxPerMm
    const h = mm % 10 === 0 ? s(5) : s(2)
    ctx.strokeStyle = mm % 10 === 0 ? '#5B8DB8' : '#3D4A5C'
    ctx.lineWidth = s(0.5)
    ctx.beginPath(); ctx.moveTo(tx, y - s(1)); ctx.lineTo(tx, y - s(1) - h); ctx.stroke()
    if (mm % 10 === 0 && mm > 0) {
      ctx.fillText(`${mm}`, tx, y - s(7))
    }
  }

  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = s(1.5)
  ctx.beginPath(); ctx.moveTo(x, y - s(6)); ctx.lineTo(x, y + s(6)); ctx.stroke()

  if (expansionPx > s(2)) {
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = s(1.5)
    const arrowX = x + expansionPx
    ctx.beginPath(); ctx.moveTo(x, y + s(4)); ctx.lineTo(arrowX, y + s(4)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(arrowX, y + s(4)); ctx.lineTo(arrowX - s(4), y + s(2)); ctx.lineTo(arrowX - s(4), y + s(6)); ctx.closePath(); ctx.fillStyle = '#22c55e'; ctx.fill()
  }
}

export function drawThermometer(ctx: CanvasRenderingContext2D, x: number, y: number, temp: number, s: (v: number) => number) {
  const stemW = s(4), bulbR = s(7)
  const stemH = s(65)

  // Glass tube background
  ctx.fillStyle = 'rgba(200,220,240,0.15)'
  ctx.beginPath()
  ctx.roundRect(x - stemW/2, y, stemW, stemH, s(2))
  ctx.fill()
  ctx.strokeStyle = 'rgba(100,140,180,0.4)'; ctx.lineWidth = s(1)
  ctx.stroke()

  // Bulb
  ctx.fillStyle = 'rgba(200,220,240,0.2)'
  ctx.beginPath(); ctx.arc(x, y + stemH + bulbR * 0.3, bulbR, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = 'rgba(100,140,180,0.5)'; ctx.lineWidth = s(1)
  ctx.stroke()

  const maxT = 200, minT = 0
  const frac = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)))

  // Red liquid in stem
  ctx.fillStyle = '#ef4444'
  ctx.fillRect(x - stemW/2 + s(1), y + stemH - frac * stemH, stemW - s(2), frac * stemH + s(1))
  // Red liquid in bulb
  ctx.beginPath(); ctx.arc(x, y + stemH + bulbR * 0.3, bulbR * 0.65, 0, Math.PI * 2); ctx.fill()

  // Scale ticks on right side
  ctx.fillStyle = '#5B8DB8'; ctx.font = `${s(5.5)}px sans-serif`; ctx.textAlign = 'left'
  for (let t = 0; t <= 200; t += 20) {
    const ty = y + stemH - ((t - minT) / (maxT - minT)) * stemH
    ctx.strokeStyle = t % 40 === 0 ? '#5B8DB8' : '#3D4A5C'
    ctx.lineWidth = s(0.5)
    ctx.beginPath(); ctx.moveTo(x + stemW/2 + s(1), ty); ctx.lineTo(x + stemW/2 + s(4), ty); ctx.stroke()
    if (t % 40 === 0) {
      ctx.fillText(`${t}°`, x + stemW/2 + s(6), ty + s(2))
    }
  }

  // Current temp label near top
  ctx.fillStyle = temp > 150 ? '#f87171' : temp > 100 ? '#ef4444' : temp > 50 ? '#fbbf24' : '#D1D7E0'
  ctx.font = `bold ${s(9)}px sans-serif`; ctx.textAlign = 'center'
  ctx.fillText(`${Math.round(temp)}°C`, x, y - s(4))
}
