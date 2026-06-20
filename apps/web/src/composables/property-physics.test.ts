import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  computeFinalVelocities,
  computeMomentum,
  computeKE,
  computeTotalKE,
  computeCollisionResult,
} from './collision/collisionUtils'

/* ───────────────────────────────────────
   Property-Based Testing: قوانين فيزيائية ثابتة
   ─────────────────────────────────────── */

describe('Property: Conservation of Momentum (Collision)', () => {
  it('Pi == Pf for ANY elastic collision (e=1)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        (m1: number, m2: number, v1i: number, v2i: number) => {
          const { v1f, v2f } = computeFinalVelocities(m1, m2, v1i, v2i, 1)
          const Pi = computeMomentum(m1, v1i) + computeMomentum(m2, v2i)
          const Pf = computeMomentum(m1, v1f) + computeMomentum(m2, v2f)
          expect(Pf).toBeCloseTo(Pi, 2)
        }
      ),
      { numRuns: 1000 }
    )
  })
})

describe('Property: Energy Conservation (Elastic e=1)', () => {
  it('KEi == KEf for ANY elastic collision', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        (m1: number, m2: number, v1i: number, v2i: number) => {
          const { v1f, v2f } = computeFinalVelocities(m1, m2, v1i, v2i, 1)
          const KEi = computeTotalKE(m1, v1i, m2, v2i)
          const KEf = computeTotalKE(m1, v1f, m2, v2f)
          expect(KEf).toBeCloseTo(KEi, 2)
        }
      ),
      { numRuns: 1000 }
    )
  })
})

describe('Property: Inelastic Collision (e=0) — velocities equal', () => {
  it('v1f == v2f for perfectly inelastic collision', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        (m1: number, m2: number, v1i: number, v2i: number) => {
          const { v1f, v2f } = computeFinalVelocities(m1, m2, v1i, v2i, 0)
          expect(v1f).toBeCloseTo(v2f, 3)
        }
      ),
      { numRuns: 1000 }
    )
  })
})

describe('Property: Coefficient of Restitution bounds', () => {
  it('energy loss is 0% when e=1, >0% when e<1', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (m1: number, m2: number, v1i: number, v2i: number, e: number) => {
          const result = computeCollisionResult({ m1, m2, v1i, v2i, r1: 0.2, r2: 0.2, e })
          if (e === 1) {
            expect(result.lossPercent).toBe(0)
          } else {
            expect(result.lossPercent).toBeGreaterThanOrEqual(0)
          }
        }
      ),
      { numRuns: 1000 }
    )
  })
})

describe('Property: Momentum monotonicity with mass', () => {
  it('increasing mass while keeping v constant increases momentum', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        (m1: number, m2: number, v: number) => {
          const p1 = computeMomentum(m1, v)
          const p2 = computeMomentum(m1 + m2, v)
          if (v >= 0) expect(p2).toBeGreaterThanOrEqual(p1)
          else expect(p2).toBeLessThanOrEqual(p1)
        }
      ),
      { numRuns: 1000 }
    )
  })
})

describe('Property: KE is always non-negative', () => {
  it('computeKE(m,v) >= 0 for all real values', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: -100, max: 100, noNaN: true }),
        (m: number, v: number) => {
          const ke = computeKE(m, v)
          expect(ke).toBeGreaterThanOrEqual(0)
        }
      ),
      { numRuns: 1000 }
    )
  })
})
