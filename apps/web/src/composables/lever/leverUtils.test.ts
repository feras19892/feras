import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateBallTorque,
  calculateForceTorque,
  calculateNetTorque,
  snapPosition,
  isBalanced,
  calculateTilt,
  maxReferenceTorque,
  createLeverBall,
  createLeverForce,
  resetLeverIdCounter,
} from './leverUtils'

describe('leverUtils', () => {
  describe('calculateBallTorque', () => {
    it('returns correct torque for positive x', () => {
      expect(calculateBallTorque(2, 3, 9.81)).toBeCloseTo(58.86, 2)
    })
    it('returns negative torque for negative x', () => {
      expect(calculateBallTorque(2, -3, 9.81)).toBeCloseTo(-58.86, 2)
    })
    it('returns zero when mass is zero', () => {
      expect(calculateBallTorque(0, 5, 9.81)).toBeCloseTo(0, 5)
    })
  })

  describe('calculateForceTorque', () => {
    it('returns correct torque for down direction', () => {
      expect(calculateForceTorque(20, 4, -1)).toBe(-80)
    })
    it('returns opposite for up direction', () => {
      expect(calculateForceTorque(20, 4, 1)).toBe(80)
    })
  })

  describe('calculateNetTorque', () => {
    it('returns zero for balanced masses', () => {
      const balls = [
        { mass: 4, x: -1 },
        { mass: 1, x: 4 },
      ]
      expect(calculateNetTorque(balls, [], 9.81)).toBeCloseTo(0, 2)
    })
    it('returns positive for right-heavy', () => {
      const balls = [{ mass: 2, x: 3 }]
      expect(calculateNetTorque(balls, [], 9.81)).toBeCloseTo(58.86, 2)
    })
    it('returns negative for left-heavy', () => {
      const balls = [{ mass: 2, x: -3 }]
      expect(calculateNetTorque(balls, [], 9.81)).toBeCloseTo(-58.86, 2)
    })
    it('combines balls and forces', () => {
      const balls = [{ mass: 2, x: 3 }]
      const forces = [{ force: 20, x: -3, direction: -1 as 1 | -1 }]
      expect(calculateNetTorque(balls, forces, 9.81)).toBeCloseTo(0, 2)
    })
  })

  describe('snapPosition', () => {
    it('snaps to nearest step', () => {
      expect(snapPosition(2.3, 0.5, 10)).toBe(2.5)
    })
    it('returns exact for already snapped', () => {
      expect(snapPosition(2.0, 0.5, 10)).toBe(2.0)
    })
    it('clamps to beam half-length', () => {
      expect(snapPosition(10, 0.5, 8)).toBe(4)
    })
    it('clamps negative to -half', () => {
      expect(snapPosition(-10, 0.5, 8)).toBe(-4)
    })
  })

  describe('isBalanced', () => {
    it('returns true for zero torque', () => {
      expect(isBalanced(0)).toBe(true)
    })
    it('returns true for small torque', () => {
      expect(isBalanced(0.04)).toBe(true)
    })
    it('returns false for large torque', () => {
      expect(isBalanced(0.1)).toBe(false)
    })
    it('uses custom threshold', () => {
      expect(isBalanced(0.08, 0.1)).toBe(true)
      expect(isBalanced(0.12, 0.1)).toBe(false)
    })
  })

  describe('calculateTilt', () => {
    it('returns zero for zero torque', () => {
      expect(calculateTilt(0, 100, 15)).toBe(0)
    })
    it('returns max tilt at max torque', () => {
      expect(calculateTilt(100, 100, 15)).toBe(15)
    })
    it('returns -max tilt at negative max torque', () => {
      expect(calculateTilt(-100, 100, 15)).toBe(-15)
    })
    it('clamps to maxTiltDeg', () => {
      expect(calculateTilt(200, 100, 15)).toBe(15)
    })
  })

  describe('maxReferenceTorque', () => {
    it('returns correct reference', () => {
      // 10*9.81*5 + 100*5 = 490.5 + 500 = 990.5
      expect(maxReferenceTorque(10, 9.81)).toBeCloseTo(990.5, 1)
    })
  })

  describe('createLeverBall', () => {
    beforeEach(() => resetLeverIdCounter())

    it('creates ball with sequential id', () => {
      const b1 = createLeverBall(2, 3)
      const b2 = createLeverBall(1, -2)
      expect(b1.id).toBe(1)
      expect(b2.id).toBe(2)
    })
    it('applies ball color', () => {
      const b = createLeverBall(5, 0)
      expect(b.color).toContain('hsl')
    })
    it('supports unknown flag', () => {
      const b = createLeverBall(3, 2, undefined, true)
      expect(b.isUnknown).toBe(true)
    })
  })

  describe('createLeverForce', () => {
    beforeEach(() => resetLeverIdCounter())

    it('creates force with sequential id', () => {
      const f1 = createLeverForce(20, 3, -1)
      const f2 = createLeverForce(10, -2, 1)
      expect(f1.id).toBe(1)
      expect(f2.id).toBe(2)
    })
    it('applies force color', () => {
      const f = createLeverForce(50, 0, -1)
      expect(f.color).toContain('hsl')
    })
    it('clamps force to 0-100', () => {
      const f = createLeverForce(150, 0, -1)
      expect(f.force).toBe(100)
    })
  })
})
