import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  detectCollision,
  separateBalls,
  computeFinalVelocities,
  computeEnergyLoss,
} from './collision/collisionUtils'

import { calculateFreeFallRow } from './freefall/freeFallUtils'
import { calculatePendulumRow } from './pendulum/pendulumUtils'
import { calculateStaticRow } from './spring/physicsUtils'

/* ───────────────────────────────────────
   Fuzz Testing: القيم الحدية والتطرفية
   ─────────────────────────────────────── */

describe('Fuzz: Collision Engine', () => {
  it('computeFinalVelocities never returns NaN/Infinity for finite inputs', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: -100, max: 100, noNaN: true }),
        fc.double({ min: -100, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (m1: number, m2: number, v1i: number, v2i: number, e: number) => {
          const { v1f, v2f } = computeFinalVelocities(m1, m2, v1i, v2i, e)
          expect(Number.isFinite(v1f)).toBe(true)
          expect(Number.isFinite(v2f)).toBe(true)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it('detectCollision never throws for any real positions/radii', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -100, max: 100 }), fc.double({ min: -100, max: 100 }), fc.double({ min: 0, max: 10 }), fc.double({ min: 0, max: 10 }),
        (x1: number, x2: number, r1: number, r2: number) => {
          expect(() => detectCollision(x1, x2, r1, r2)).not.toThrow()
          const result = detectCollision(x1, x2, r1, r2)
          expect(typeof result).toBe('boolean')
        }
      ),
      { numRuns: 1000 }
    )
  })

  it('separateBalls never returns NaN/Infinity for positive radii', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true }), fc.double({ noNaN: true, noDefaultInfinity: true }), fc.double({ min: 0.001, max: 100, noNaN: true, noDefaultInfinity: true }), fc.double({ min: 0.001, max: 100, noNaN: true, noDefaultInfinity: true }),
        (x1: number, x2: number, r1: number, r2: number) => {
          const sep = separateBalls(x1, x2, r1, r2)
          expect(Number.isFinite(sep.x1)).toBe(true)
          expect(Number.isFinite(sep.x2)).toBe(true)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it('computeEnergyLoss returns finite percent for positive KEi', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1e6, noNaN: true }),
        fc.double({ min: 0, max: 1e6, noNaN: true }),
        (KEi: number, KEf: number) => {
          const loss = computeEnergyLoss(KEi, KEf)
          expect(Number.isFinite(loss)).toBe(true)
          // fuzz values may violate physics (KEf>KEi), so only check finite
        }
      ),
      { numRuns: 1000 }
    )
  })
})

describe('Fuzz: Free Fall Engine', () => {
  it('calculateFreeFallRow never returns NaN for positive h and g', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.1, max: 50, noNaN: true }),
        (h: number, g: number) => {
          const row = calculateFreeFallRow(1, h, g)
          expect(Number.isFinite(row.timeSec)).toBe(true)
          expect(Number.isFinite(row.impactVelocityMs)).toBe(true)
          expect(Number.isFinite(row.timeSquaredSec2)).toBe(true)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it('returns zeros for invalid (negative) height', () => {
    fc.assert(
      fc.property(
        fc.double({ max: -0.001, noNaN: true }),
        fc.double({ min: 0.1, noNaN: true }),
        (h: number, g: number) => {
          const row = calculateFreeFallRow(1, h, g)
          expect(row.timeSec).toBe(0)
          expect(row.impactVelocityMs).toBe(0)
        }
      ),
      { numRuns: 500 }
    )
  })
})

describe('Fuzz: Pendulum Engine', () => {
  it('calculatePendulumRow never returns NaN for positive L and g', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 50, noNaN: true }),
        (L: number, g: number) => {
          const row = calculatePendulumRow(1, L, g)
          expect(Number.isFinite(row.periodT)).toBe(true)
          expect(Number.isFinite(row.periodSquared)).toBe(true)
          expect(Number.isFinite(row.timeFor20Osc)).toBe(true)
        }
      ),
      { numRuns: 1000 }
    )
  })
})

describe('Fuzz: Spring Engine', () => {
  it('calculateStaticRow never returns NaN for positive mass and k', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 1000, noNaN: true }),
        fc.double({ min: 0.001, max: 10000, noNaN: true }),
        (mass: number, k: number) => {
          const row = calculateStaticRow(1, mass, k)
          expect(Number.isFinite(row.forceNewton)).toBe(true)
          expect(Number.isFinite(row.displacementCm)).toBe(true)
        }
      ),
      { numRuns: 1000 }
    )
  })
})
