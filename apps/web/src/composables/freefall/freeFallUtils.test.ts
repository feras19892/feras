import { describe, it, expect } from 'vitest'
import { calculateFreeFallRow } from './freeFallUtils'

describe('Free Fall calculations', () => {
  it('computes t and v_impact for h=1m, g=9.81', () => {
    const r = calculateFreeFallRow(1, 1.0, 9.81)
    expect(r.timeSec).toBeCloseTo(0.452, 2)
    expect(r.impactVelocityMs).toBeCloseTo(4.43, 1)
    expect(r.timeSquaredSec2).toBeCloseTo(0.2038, 3)
  })

  it('computes for h=0.5m, g=9.81', () => {
    const r = calculateFreeFallRow(2, 0.5, 9.81)
    expect(r.timeSec).toBeCloseTo(0.319, 2)
  })

  it('returns zeros for invalid inputs', () => {
    const r = calculateFreeFallRow(3, -1, 9.81)
    expect(r.timeSec).toBe(0)
    expect(r.impactVelocityMs).toBe(0)
  })
})
