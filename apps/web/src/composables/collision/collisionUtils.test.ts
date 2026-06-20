import { describe, it, expect } from 'vitest'
import {
  detectCollision,
  separateBalls,
  computeFinalVelocities,
  computeCollisionResult,
} from './collisionUtils'

describe('collisionUtils', () => {
  describe('detectCollision', () => {
    it('detects when balls touch', () => {
      expect(detectCollision(0, 1, 0.5, 0.5)).toBe(true)
    })
    it('detects when balls overlap', () => {
      expect(detectCollision(0, 0.8, 0.5, 0.5)).toBe(true)
    })
    it('returns false when balls are apart', () => {
      expect(detectCollision(0, 2, 0.5, 0.5)).toBe(false)
    })
  })

  describe('separateBalls', () => {
    it('separates overlapping balls equally', () => {
      const { x1, x2 } = separateBalls(0, 0.8, 0.5, 0.5)
      expect(Math.abs(x1 - x2)).toBeCloseTo(1.0, 3)
    })
  })

  describe('computeFinalVelocities', () => {
    it('equal masses, one stationary: complete velocity transfer (e=1)', () => {
      const { v1f, v2f } = computeFinalVelocities(1, 1, 3, 0, 1)
      expect(v1f).toBeCloseTo(0, 3)
      expect(v2f).toBeCloseTo(3, 3)
    })

    it('equal masses, opposite directions: swap (e=1)', () => {
      const { v1f, v2f } = computeFinalVelocities(1, 1, 3, -3, 1)
      expect(v1f).toBeCloseTo(-3, 3)
      expect(v2f).toBeCloseTo(3, 3)
    })

    it('light hits heavy wall: light bounces back (e=1)', () => {
      const { v1f, v2f } = computeFinalVelocities(0.1, 1000, 5, 0, 1)
      expect(v1f).toBeCloseTo(-5, 1)
      expect(v2f).toBeCloseTo(0, 2)
    })

    it('heavy hits light stationary: light shoots to 2v (e=1)', () => {
      const { v1f, v2f } = computeFinalVelocities(1000, 0.1, 5, 0, 1)
      expect(v1f).toBeCloseTo(5, 2)
      expect(v2f).toBeCloseTo(10, 2)
    })

    it('perfectly inelastic: stick together (e=0)', () => {
      const { v1f, v2f } = computeFinalVelocities(2, 3, 4, -1, 0)
      expect(v1f).toBeCloseTo(v2f, 3)
      const expectedVf = (2 * 4 + 3 * (-1)) / (2 + 3)
      expect(v1f).toBeCloseTo(expectedVf, 3)
    })
  })

  describe('computeCollisionResult', () => {
    it('conserves momentum for elastic collision', () => {
      const result = computeCollisionResult({ m1: 2, m2: 3, v1i: 4, v2i: -1, r1: 0.2, r2: 0.2, e: 1 })
      expect(result.Pi).toBeCloseTo(result.Pf, 3)
    })

    it('zero energy loss for perfectly elastic', () => {
      const result = computeCollisionResult({ m1: 2, m2: 2, v1i: 5, v2i: 0, r1: 0.2, r2: 0.2, e: 1 })
      expect(result.lossPercent).toBe(0)
    })

    it('maximum energy loss for perfectly inelastic', () => {
      const result = computeCollisionResult({ m1: 2, m2: 2, v1i: 5, v2i: -3, r1: 0.2, r2: 0.2, e: 0 })
      expect(result.lossPercent).toBeGreaterThan(0)
    })
  })
})
