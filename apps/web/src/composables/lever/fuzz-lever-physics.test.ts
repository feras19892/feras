import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { useLeverPhysics } from '../../modules/physics/experiments/lever/useLeverPhysics'
import { isBalanced } from './leverUtils'

describe('Fuzz: Lever Physics', () => {
  it('never produces NaN/Infinity for any balls', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          mass: fc.double({ min: 0.1, max: 20, noNaN: true, noDefaultInfinity: true }),
          x: fc.double({ min: -5, max: 5, noNaN: true, noDefaultInfinity: true }),
        }), { minLength: 1, maxLength: 10 }),
        (balls) => {
          const physics = useLeverPhysics({ beamLength: 10, g: 9.81, maxTiltDeg: 15, snapStep: 0.5 })
          balls.forEach(b => physics.addBall(b.mass, b.x))
          physics.step()
          expect(Number.isFinite(physics.state.netTorque)).toBe(true)
          expect(Number.isFinite(physics.state.tiltDeg)).toBe(true)
          expect(Math.abs(physics.state.tiltDeg)).toBeLessThanOrEqual(15.01)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('isBalanced when netTorque is near zero', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -0.04, max: 0.04, noNaN: true }),
        (torque) => {
          expect(isBalanced(torque, 0.05)).toBe(true)
        }
      )
    )
  })
})
