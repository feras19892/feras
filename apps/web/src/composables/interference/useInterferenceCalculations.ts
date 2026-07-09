export interface InterferenceResult {
  fringeSpacingMm: number
  angularSeparationDeg: number
  orderPositionsMm: number[]
  intensityPattern: { xMm: number; intensity: number }[]
  constructiveOrders: number[]
  destructiveOrders: number[]
}

export function calculateInterference(
  slitDistanceMm: number,
  screenDistanceM: number,
  wavelengthNm: number,
  slitWidthUm: number,
  viewWidthMm: number = 50,
  points: number = 400
): InterferenceResult {
  const d = slitDistanceMm * 1e-3
  const D = screenDistanceM
  const lambda = wavelengthNm * 1e-9
  const a = slitWidthUm * 1e-6

  if (d <= 0 || D <= 0 || lambda <= 0) {
    return { fringeSpacingMm: 0, angularSeparationDeg: 0, orderPositionsMm: [], intensityPattern: [], constructiveOrders: [], destructiveOrders: [] }
  }

  const fringeSpacingMm = (lambda * D / d) * 1000
  const angularSeparationDeg = (lambda / d) * (180 / Math.PI)
  const maxOrder = Math.floor((viewWidthMm / 1000) * d / (lambda * D))

  const constructiveOrders: number[] = []
  const destructiveOrders: number[] = []
  for (let m = -maxOrder; m <= maxOrder; m++) {
    constructiveOrders.push(m)
    if (Math.abs(m + 0.5) <= maxOrder) destructiveOrders.push(m)
  }

  const orderPositionsMm = constructiveOrders.map(m => m * fringeSpacingMm)

  const intensityPattern: { xMm: number; intensity: number }[] = []
  for (let i = 0; i <= points; i++) {
    const x = (-viewWidthMm) + (2 * viewWidthMm * i) / points
    const xM = x * 1e-3
    const theta = Math.atan2(xM, D)
    const sinTheta = Math.sin(theta)
    const phase = (Math.PI * d * sinTheta) / lambda
    const interference = Math.cos(phase) ** 2
    const envelopeArg = (Math.PI * a * sinTheta) / lambda
    const envelope = envelopeArg === 0 ? 1 : (Math.sin(envelopeArg) / envelopeArg) ** 2
    intensityPattern.push({ xMm: Number(x.toFixed(3)), intensity: Number((interference * envelope).toFixed(4)) })
  }

  return {
    fringeSpacingMm: Number(fringeSpacingMm.toFixed(3)),
    angularSeparationDeg: Number(angularSeparationDeg.toFixed(4)),
    orderPositionsMm,
    intensityPattern,
    constructiveOrders,
    destructiveOrders,
  }
}

export function linearRegression(pts: { x: number; y: number }[]) {
  const n = pts.length
  if (n < 2) return { m: 0, b: 0, r2: 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (const p of pts) {
    sumX += p.x; sumY += p.y; sumXY += p.x * p.y
    sumX2 += p.x * p.x; sumY2 += p.y * p.y
  }
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n
  const ssTot = sumY2 - (sumY * sumY) / n
  const ssRes = sumY2 - 2 * m * sumXY - 2 * b * sumY + m * m * sumX2 + 2 * m * b * sumX + n * b * b
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { m, b, r2 }
}

export function wavelengthToColor(wavelengthNm: number): string {
  const wl = wavelengthNm
  if (wl < 380 || wl > 750) return '#888888'
  if (wl < 440) return `rgb(${Math.round((440 - wl) / 60 * 255)}, 0, 255)`
  if (wl < 490) return `rgb(0, ${Math.round((wl - 440) / 50 * 255)}, 255)`
  if (wl < 510) return `rgb(0, 255, ${Math.round((510 - wl) / 20 * 255)})`
  if (wl < 580) return `rgb(${Math.round((wl - 510) / 70 * 255)}, 255, 0)`
  if (wl < 645) return `rgb(255, ${Math.round((645 - wl) / 65 * 255)}, 0)`
  return `rgb(255, 0, 0)`
}
