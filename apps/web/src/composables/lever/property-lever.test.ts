import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { calculateNetTorque, calculateTorque, snapPosition } from './leverUtils'

describe('Property: Lever Physics', () => {
  it('torque is linear in mass', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 10, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -5, max: 5, noNaN: true, noDefaultInfinity: true }),
        (m, x) => {
          const g = 9.81
          const t1 = calculateTorque(m, x, g)
          const t2 = calculateTorque(m * 2, x, g)
          expect(Math.abs(t2)).toBeCloseTo(Math.abs(t1) * 2, 5)
        }
      )
    )
  })

  it('torque is linear in distance', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 10, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 4, noNaN: true, noDefaultInfinity: true }),
        (m, x) => {
          const g = 9.81
          const t1 = calculateTorque(m, x, g)
          const t2 = calculateTorque(m, x * 2, g)
          expect(Math.abs(t2)).toBeCloseTo(Math.abs(t1) * 2, 5)
        }
      )
    )
  })

  it('symmetric masses at same distance cancel out', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 10, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.5, max: 4, noNaN: true, noDefaultInfinity: true }),
        (m, x) => {
          const g = 9.81
          const net = calculateNetTorque([
            { mass: m, x: -x },
            { mass: m, x: x },
          ], g)
          expect(net).toBeCloseTo(0, 5)
        }
      )
    )
  })

  it('snapPosition always returns values within beam bounds', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -20, max: 20, noNaN: true }),
        fc.double({ min: 0.1, max: 2, noNaN: true }),
        fc.double({ min: 4, max: 20, noNaN: true }),
        (x, step, length) => {
          const s = snapPosition(x, step, length)
          expect(s).toBeGreaterThanOrEqual(-length / 2)
          expect(s).toBeLessThanOrEqual(length / 2)
        }
      )
    )
  })

  it('netTorque sign matches which side is heavier', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 10, noNaN: true }),
        fc.double({ min: 1, max: 10, noNaN: true }),
        fc.double({ min: 1, max: 5, noNaN: true }),
        fc.double({ min: 1, max: 5, noNaN: true }),
        (m1, m2, x1, x2) => {
          const g = 9.81
          const net = calculateNetTorque([
            { mass: m1, x: -x1 },
            { mass: m2, x: x2 },
          ], g)
          if (m1 * x1 > m2 * x2) expect(net).toBeLessThan(0)
          else if (m1 * x1 < m2 * x2) expect(net).toBeGreaterThan(0)
          else expect(net).toBeCloseTo(0, 3)
        }
      )
    )
  })
})
