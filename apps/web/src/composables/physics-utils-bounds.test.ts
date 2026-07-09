import { describe, it, expect } from 'vitest'
import { calculateFreeFallRow } from './freefall/freeFallUtils'
import { calculateStaticRow } from './spring/physicsUtils'
import { calculatePendulumRow } from './pendulum/pendulumUtils'
import { calculateInclinedSummary, calculateDragForce, toRad } from './inclined/inclinedUtils'

describe('Physics Utils: Edge Cases & Bounds Validation', () => {
  describe('calculateFreeFallRow', () => {
    it('returns zeroed row for negative height', () => {
      const row = calculateFreeFallRow(1, -10)
      expect(row.timeSec).toBe(0)
      expect(row.timeSquaredSec2).toBe(0)
      expect(row.impactVelocityMs).toBe(0)
    })

    it('returns zeroed row for zero height', () => {
      const row = calculateFreeFallRow(1, 0)
      expect(row.timeSec).toBe(0)
      expect(row.impactVelocityMs).toBe(0)
    })

    it('returns zeroed row for zero gravity', () => {
      const row = calculateFreeFallRow(1, 10, 0)
      expect(row.timeSec).toBe(0)
      expect(row.impactVelocityMs).toBe(0)
    })

    it('returns zeroed row for negative gravity', () => {
      const row = calculateFreeFallRow(1, 10, -5)
      expect(row.timeSec).toBe(0)
      expect(row.impactVelocityMs).toBe(0)
    })

    it('handles extremely large height without crashing', () => {
      const row = calculateFreeFallRow(1, 1e9)
      expect(Number.isFinite(row.timeSec)).toBe(true)
      expect(Number.isFinite(row.impactVelocityMs)).toBe(true)
      expect(row.timeSec).toBeGreaterThan(0)
    })

    it('handles extremely small height', () => {
      const row = calculateFreeFallRow(1, 1e-9)
      expect(Number.isFinite(row.timeSec)).toBe(true)
      expect(row.timeSec).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateStaticRow (Spring)', () => {
    it('returns zeroed row for negative mass', () => {
      const row = calculateStaticRow(1, -50, 20)
      expect(row.forceNewton).toBe(0)
      expect(row.displacementCm).toBe(0)
    })

    it('returns zeroed row for zero mass', () => {
      const row = calculateStaticRow(1, 0, 20)
      expect(row.forceNewton).toBe(0)
      expect(row.displacementCm).toBe(0)
    })

    it('returns zeroed row for negative spring constant', () => {
      const row = calculateStaticRow(1, 100, -10)
      expect(row.forceNewton).toBe(0)
      expect(row.displacementCm).toBe(0)
    })

    it('returns zeroed row for zero spring constant', () => {
      const row = calculateStaticRow(1, 100, 0)
      expect(row.forceNewton).toBe(0)
      expect(row.displacementCm).toBe(0)
    })

    it('handles extremely large mass without Infinity', () => {
      const row = calculateStaticRow(1, 1e12, 10)
      expect(Number.isFinite(row.forceNewton)).toBe(true)
      expect(Number.isFinite(row.displacementCm)).toBe(true)
    })

    it('handles extremely small spring constant safely', () => {
      const row = calculateStaticRow(1, 100, 1e-9)
      expect(Number.isFinite(row.displacementCm)).toBe(true)
    })
  })

  describe('calculatePendulumRow', () => {
    it('returns zeroed row for negative length', () => {
      const row = calculatePendulumRow(1, -20)
      expect(row.periodT).toBe(0)
      expect(row.timeFor20Osc).toBe(0)
      expect(row.periodSquared).toBe(0)
    })

    it('returns zeroed row for zero length', () => {
      const row = calculatePendulumRow(1, 0)
      expect(row.periodT).toBe(0)
      expect(row.timeFor20Osc).toBe(0)
    })

    it('returns zeroed row for zero gravity', () => {
      const row = calculatePendulumRow(1, 50, 0)
      expect(row.periodT).toBe(0)
      expect(row.timeFor20Osc).toBe(0)
    })

    it('returns zeroed row for negative gravity', () => {
      const row = calculatePendulumRow(1, 50, -9.81)
      expect(row.periodT).toBe(0)
      expect(row.timeFor20Osc).toBe(0)
    })

    it('handles extremely long pendulum without crashing', () => {
      const row = calculatePendulumRow(1, 1e9)
      expect(Number.isFinite(row.periodT)).toBe(true)
      expect(Number.isFinite(row.timeFor20Osc)).toBe(true)
    })

    it('handles very short pendulum', () => {
      const row = calculatePendulumRow(1, 0.001)
      expect(Number.isFinite(row.periodT)).toBe(true)
      expect(row.periodT).toBeGreaterThan(0)
    })
  })

  describe('calculateInclinedSummary', () => {
    it('handles negative mass gracefully', () => {
      const summary = calculateInclinedSummary(30, 2, -5)
      expect(Number.isFinite(summary.acceleration)).toBe(true)
      expect(Number.isFinite(summary.timeOfArrival)).toBe(true)
      expect(Number.isFinite(summary.finalVelocity)).toBe(true)
    })

    it('handles zero length (no travel)', () => {
      const summary = calculateInclinedSummary(30, 0, 2)
      expect(summary.timeOfArrival).toBe(0)
      expect(summary.finalVelocity).toBe(0)
    })

    it('handles 90 degree angle (vertical wall)', () => {
      const summary = calculateInclinedSummary(90, 2, 1)
      expect(Number.isFinite(summary.acceleration)).toBe(true)
      expect(Number.isFinite(summary.timeOfArrival)).toBe(true)
    })

    it('handles 0 degree angle (flat surface)', () => {
      const summary = calculateInclinedSummary(0, 2, 1)
      expect(summary.acceleration).toBe(0)
    })

    it('handles very high friction coefficient', () => {
      const summary = calculateInclinedSummary(30, 2, 1, 9.81, 5.0)
      expect(Number.isFinite(summary.acceleration)).toBe(true)
      expect(summary.acceleration).toBeLessThanOrEqual(0.001)
    })

    it('handles air resistance with extreme drag', () => {
      const summary = calculateInclinedSummary(45, 5, 0.001, 9.81, 0, true, 2.0, 0.1)
      expect(Number.isFinite(summary.timeOfArrival)).toBe(true)
      expect(Number.isFinite(summary.finalVelocity)).toBe(true)
      expect(summary.dragForce).toBeGreaterThan(0)
    })
  })

  describe('calculateDragForce', () => {
    it('handles zero velocity', () => {
      const fd = calculateDragForce(0, 0.47, 0.01)
      expect(fd).toBe(0)
    })

    it('handles negative velocity (magnitude squared)', () => {
      const fd = calculateDragForce(-10, 0.47, 0.01)
      expect(fd).toBeGreaterThan(0)
      expect(Number.isFinite(fd)).toBe(true)
    })

    it('handles extremely high velocity without Infinity', () => {
      const fd = calculateDragForce(1e6, 0.47, 0.01)
      expect(Number.isFinite(fd)).toBe(true)
    })

    it('handles zero drag coefficient', () => {
      const fd = calculateDragForce(10, 0, 0.01)
      expect(fd).toBe(0)
    })
  })

  describe('toRad', () => {
    it('converts degrees to radians correctly', () => {
      expect(toRad(0)).toBe(0)
      expect(toRad(90)).toBeCloseTo(Math.PI / 2, 10)
      expect(toRad(180)).toBeCloseTo(Math.PI, 10)
      expect(toRad(360)).toBeCloseTo(2 * Math.PI, 10)
    })

    it('handles negative angles', () => {
      expect(toRad(-90)).toBeCloseTo(-Math.PI / 2, 10)
    })

    it('handles angles > 360', () => {
      expect(toRad(720)).toBeCloseTo(4 * Math.PI, 10)
    })
  })
})
