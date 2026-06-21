function toRad(d: number) { return (d * Math.PI) / 180 }
function toDeg(r: number) { return (r * 180) / Math.PI }

const MATERIALS: Record<string, { B: number; C: number; nameAr: string }> = {
  glass: { B: 1.504, C: 0.0042, nameAr: 'زجاج' },
  water: { B: 1.324, C: 0.0031, nameAr: 'ماء' },
  diamond: { B: 2.381, C: 0.0104, nameAr: 'ألماس' },
  flint: { B: 1.728, C: 0.0134, nameAr: 'فلينت' },
}

export function getMaterialList() {
  return Object.entries(MATERIALS).map(([key, v]) => ({ key, ...v }))
}

export function refractiveIndex(materialKey: string, wavelengthNm: number): number {
  const mat = MATERIALS[materialKey] ?? MATERIALS.glass
  const lambdaUm = wavelengthNm / 1000
  return mat.B + mat.C / (lambdaUm * lambdaUm)
}

export function calculatePrismAngles(
  prismAngle: number,
  angleIncidence: number,
  wavelength: number,
  materialKey: string
) {
  const A = toRad(prismAngle)
  const theta1 = toRad(angleIncidence)
  const n = refractiveIndex(materialKey, wavelength)

  // Snell at face 1
  const sinR1 = Math.sin(theta1) / n
  if (Math.abs(sinR1) > 1) {
    return { angleRefraction1: null, angleIncidence2: null, angleEmergence: null, deviation: null, n, tir: true }
  }
  const r1 = Math.asin(sinR1)

  // Geometry: r1 + r2 = A
  const r2 = A - r1

  // Snell at face 2
  const sinThetaE = n * Math.sin(r2)
  if (Math.abs(sinThetaE) > 1) {
    return { angleRefraction1: toDeg(r1), angleIncidence2: toDeg(r2), angleEmergence: null, deviation: null, n, tir: true }
  }
  const thetaE = Math.asin(sinThetaE)

  // Deviation: δ = θ1 + θ4 - A
  const D = toDeg(theta1 + thetaE - A)

  return {
    angleRefraction1: toDeg(r1),
    angleIncidence2: toDeg(r2),
    angleEmergence: toDeg(thetaE),
    deviation: D,
    n,
    tir: false,
  }
}

export function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return { m: 0, b: 0, r2: 0 }
  let sx = 0, sy = 0, sxy = 0, sx2 = 0, sy2 = 0
  for (const p of points) {
    sx += p.x; sy += p.y; sxy += p.x * p.y
    sx2 += p.x * p.x; sy2 += p.y * p.y
  }
  const d = n * sx2 - sx * sx
  if (Math.abs(d) < 1e-12) return { m: 0, b: 0, r2: 0 }
  const m = (n * sxy - sx * sy) / d
  const b = (sy - m * sx) / n
  const ssTot = sy2 - (sy * sy) / n
  let ssRes = 0
  for (const p of points) {
    const yh = m * p.x + b
    ssRes += (p.y - yh) ** 2
  }
  return { m, b, r2: ssTot === 0 ? 1 : 1 - ssRes / ssTot }
}
