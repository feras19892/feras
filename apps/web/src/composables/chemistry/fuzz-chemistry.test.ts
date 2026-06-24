import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { getMaxVolume, isContainer, isBeaker } from './chemLabIds'
import { phColor } from './useLabSimulation'

/* ───────────────────────────────────────
   Fuzz Testing: كيمياء — القيم الحدية
   ─────────────────────────────────────── */

/** Pure mouth position used in LabBeaker drop physics */
function mouthPosition(tiltDeg: number) {
  const rad = (tiltDeg * Math.PI) / 180
  return {
    x: Math.max(10, Math.min(130, 70 + 75 * Math.sin(rad))),
    y: Math.max(10, Math.min(200, 100 - 75 * Math.cos(rad))),
  }
}

describe('Fuzz: Chemistry Lab IDs', () => {
  it('getMaxVolume never returns NaN/Infinity', () => {
    fc.assert(
      fc.property(fc.string(), (id: string) => {
        const v = getMaxVolume(id)
        expect(Number.isFinite(v)).toBe(true)
        expect(v).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 500 }
    )
  })

  it('isContainer always returns boolean', () => {
    fc.assert(
      fc.property(fc.string(), (id: string) => {
        expect(typeof isContainer(id)).toBe('boolean')
      }),
      { numRuns: 500 }
    )
  })

  it('isBeaker is consistent with isContainer', () => {
    fc.assert(
      fc.property(fc.string(), (id: string) => {
        if (isBeaker(id)) expect(isContainer(id)).toBe(true)
      }),
      { numRuns: 500 }
    )
  })
})

describe('Fuzz: pH & Drop Physics', () => {
  it('phColor returns valid hex for any real pH', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true }), (ph: number) => {
        const color = phColor(ph)
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      }),
      { numRuns: 500 }
    )
  })

  it('mouthPosition is always finite and within canvas bounds', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        (tilt: number) => {
          const m = mouthPosition(tilt)
          expect(Number.isFinite(m.x)).toBe(true)
          expect(Number.isFinite(m.y)).toBe(true)
          expect(m.x).toBeGreaterThanOrEqual(10)
          expect(m.x).toBeLessThanOrEqual(130)
          expect(m.y).toBeGreaterThanOrEqual(10)
          expect(m.y).toBeLessThanOrEqual(200)
        }
      ),
      { numRuns: 1000 }
    )
  })

  it('mouthPosition is continuous (small tilt change → small move)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -80, max: 80, noNaN: true }),
        fc.double({ min: -1, max: 1, noNaN: true }),
        (tilt: number, delta: number) => {
          const a = mouthPosition(tilt)
          const b = mouthPosition(tilt + delta)
          expect(Math.abs(a.x - b.x)).toBeLessThanOrEqual(2)
          expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(2)
        }
      ),
      { numRuns: 500 }
    )
  })
})
