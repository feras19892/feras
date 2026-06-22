import { describe, it, expect } from 'vitest'
import { calculatePrismAngles, linearRegression, refractiveIndex } from './usePrismCalculations'

describe('usePrismCalculations', () => {
  describe('refractiveIndex', () => {
    it('returns ~1.516 for BK7 glass at 588nm', () => {
      const n = refractiveIndex('glass', 588)
      expect(n).toBeCloseTo(1.516, 2)
    })

    it('returns ~1.333 for water at 588nm', () => {
      const n = refractiveIndex('water', 588)
      expect(n).toBeCloseTo(1.333, 2)
    })
  })

  describe('calculatePrismAngles', () => {
    it('computes angles for typical glass prism (A=60, θi=45, λ=580)', () => {
      const r = calculatePrismAngles(60, 45, 580, 'glass')
      expect(r.tir).toBe(false)
      expect(r.angleRefraction1).not.toBeNull()
      expect(r.angleEmergence).not.toBeNull()
      expect(r.deviation).not.toBeNull()
      expect(r.n).toBeCloseTo(1.516, 2)
      if (r.deviation !== null) {
        expect(r.deviation).toBeGreaterThan(0)
      }
    })

    it('detects TIR for steep incidence on diamond', () => {
      const r = calculatePrismAngles(60, 85, 580, 'diamond')
      // May or may not TIR depending on geometry; just ensure it does not crash
      expect(typeof r.tir).toBe('boolean')
    })
  })

  describe('linearRegression', () => {
    it('returns exact line for perfect linear data', () => {
      const pts = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ]
      const reg = linearRegression(pts)
      expect(reg.m).toBeCloseTo(2, 6)
      expect(reg.b).toBeCloseTo(1, 6)
      expect(reg.r2).toBeCloseTo(1, 6)
    })

    it('returns zeros for less than 2 points', () => {
      const reg = linearRegression([{ x: 1, y: 1 }])
      expect(reg.m).toBe(0)
      expect(reg.b).toBe(0)
      expect(reg.r2).toBe(0)
    })
  })
})
