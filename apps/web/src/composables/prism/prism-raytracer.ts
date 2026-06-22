/**
 * Single-ray tracer through an equilateral triangular prism.
 */

import { refractiveIndex } from './usePrismCalculations'
import { toRad, lineIntersection, type Point } from './prism-geometry'

export interface RayTraceResult {
  p2: Point
  emergentAngle: number | null
  tir: boolean
  reflectionAngle: number | null
  refractedRayAngle: number
  internalIncidentAngle: number
}

function norm(v: Point) {
  const m = Math.hypot(v.x, v.y)
  return m > 1e-12 ? { x: v.x / m, y: v.y / m } : { x: 0, y: 0 }
}

function dot(a: Point, b: Point) { return a.x * b.x + a.y * b.y }

function pointInTriangle(p: Point, a: Point, b: Point, c: Point) {
  const v0 = { x: c.x - a.x, y: c.y - a.y }
  const v1 = { x: b.x - a.x, y: b.y - a.y }
  const v2 = { x: p.x - a.x, y: p.y - a.y }
  const d00 = dot(v0, v0)
  const d01 = dot(v0, v1)
  const d11 = dot(v1, v1)
  const d20 = dot(v2, v0)
  const d21 = dot(v2, v1)
  const denom = d00 * d11 - d01 * d01
  if (Math.abs(denom) < 1e-12) return false
  const v = (d11 * d20 - d01 * d21) / denom
  const w = (d00 * d21 - d01 * d20) / denom
  const u = 1 - v - w
  return u >= 0 && v >= 0 && w >= 0
}

function outwardNormal(edgeP: Point, edgeQ: Point, triA: Point, triB: Point, triC: Point) {
  const t = norm({ x: edgeQ.x - edgeP.x, y: edgeQ.y - edgeP.y })
  const n1 = { x: -t.y, y: t.x }
  const n2 = { x: t.y, y: -t.x }
  const mid = { x: (edgeP.x + edgeQ.x) / 2, y: (edgeP.y + edgeQ.y) / 2 }
  const eps = 2
  const test1 = { x: mid.x + n1.x * eps, y: mid.y + n1.y * eps }
  return pointInTriangle(test1, triA, triB, triC) ? n2 : n1
}

function refract(I: Point, N: Point, n1: number, n2: number) {
  const In = norm(I)
  const Nn = norm(N)
  const cosI = dot(In, Nn)
  if (cosI < 0) return null
  const t = { x: -Nn.y, y: Nn.x }
  const sinI = dot(In, t)
  const eta = n1 / n2
  const sinT = eta * sinI
  if (Math.abs(sinT) > 1) return null
  const cosT = Math.sqrt(Math.max(0, 1 - sinT * sinT))
  return norm({ x: Nn.x * cosT + t.x * sinT, y: Nn.y * cosT + t.y * sinT })
}

function reflect(I: Point, N: Point) {
  const In = norm(I)
  const Nn = norm(N)
  const k = 2 * dot(In, Nn)
  return norm({ x: In.x - k * Nn.x, y: In.y - k * Nn.y })
}

export function traceRay(
  p1: Point,
  pA: Point,
  pB: Point,
  pC: Point,
  theta1Deg: number,
  wavelengthNm: number,
  material: string,
  edgeAB_angle: number,
  normal1Angle: number
): RayTraceResult | null {
  const n_lambda = refractiveIndex(material, wavelengthNm)
  const theta1 = toRad(theta1Deg)

  // Incident direction (renderer uses this same convention)
  const incidentRayAngle = normal1Angle + Math.PI + theta1
  const I0 = norm({ x: Math.cos(incidentRayAngle), y: Math.sin(incidentRayAngle) })

  // Face 1 normal: normal1Angle is expected to be the OUTWARD normal of AB.
  const Nout1 = norm({ x: Math.cos(normal1Angle), y: Math.sin(normal1Angle) })
  const Nin1 = { x: -Nout1.x, y: -Nout1.y }

  // Refraction into prism
  const D1 = refract(I0, Nin1, 1, n_lambda)
  if (!D1) return null
  const refractedRayAngle = Math.atan2(D1.y, D1.x)

  // Intersect with face 2 (AC); if it fails, fall back to base (BC)
  const far1 = { x: p1.x + D1.x * 1e6, y: p1.y + D1.y * 1e6 }
  const p2AC = lineIntersection(p1, far1, pA, pC, false)
  const p2BC = lineIntersection(p1, far1, pB, pC, false)

  let p2: Point | null = p2AC
  let eP = pA
  let eQ = pC
  if (!p2 && p2BC) {
    p2 = p2BC
    eP = pB
    eQ = pC
  }
  if (!p2) return null

  const Nout2 = outwardNormal(eP, eQ, pA, pB, pC)
  const internalIncidentAngle = Math.acos(Math.max(-1, Math.min(1, dot(D1, norm(Nout2)))))

  const D2 = refract(D1, Nout2, n_lambda, 1)
  if (!D2) {
    const R = reflect(D1, Nout2)
    const reflectionAngle = Math.atan2(R.y, R.x)
    return { p2, emergentAngle: null, tir: true, reflectionAngle, refractedRayAngle, internalIncidentAngle }
  }

  const emergentAngle = Math.atan2(D2.y, D2.x)
  return { p2, emergentAngle, tir: false, reflectionAngle: null, refractedRayAngle, internalIncidentAngle }
}
