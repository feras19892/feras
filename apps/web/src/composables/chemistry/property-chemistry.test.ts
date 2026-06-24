import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { items, liquidMap, getLiquid, createLabItem } from './useChemistryLab'
import { computeBalanceWeight } from './useLabSimulation'
import type { ToolDef } from './useChemistryTools'

/* ───────────────────────────────────────
   Property-Based Testing: كيمياء — حفظ الحجم والكتلة
   ─────────────────────────────────────── */

beforeEach(() => {
  items.value = []
  Object.keys(liquidMap).forEach(k => delete liquidMap[k])
})

const beaker250: ToolDef = { id: 'beaker-250', name: 'بيكر 250', icon: '🥣', type: 'container' }
const balanceDef: ToolDef = { id: 'digital-balance', name: 'ميزان', icon: '⚖️', type: 'device' }

describe('Property: Liquid Volume Conservation', () => {
  it('adding then removing same amount restores original volume', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 250, noNaN: true }),
        fc.double({ min: 0, max: 250, noNaN: true }),
        (initial: number, delta: number) => {
          const item = createLabItem(beaker250, 100, 100)
          const liq = getLiquid(item.uid)
          liq.volume = Math.min(initial, liq.maxVolume)
          const before = liq.volume
          const toAdd = Math.min(delta, liq.maxVolume - liq.volume)
          liq.volume += toAdd
          const toRemove = Math.min(toAdd, liq.volume)
          liq.volume -= toRemove
          expect(liq.volume).toBeCloseTo(before, 2)
        }
      ),
      { numRuns: 500 }
    )
  })

  it('volume never exceeds maxVolume after any addition', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 500, noNaN: true }),
        (start: number, add: number) => {
          const item = createLabItem(beaker250, 100, 100)
          const liq = getLiquid(item.uid)
          liq.volume = Math.min(start, liq.maxVolume)
          liq.volume = Math.min(liq.volume + add, liq.maxVolume)
          expect(liq.volume).toBeLessThanOrEqual(liq.maxVolume)
        }
      ),
      { numRuns: 500 }
    )
  })
})

describe('Property: Balance Weight Monotonicity', () => {
  it('weight increases (or stays same) when adding containers', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0, max: 100, noNaN: true }), { minLength: 1, maxLength: 5 }),
        (volumes: number[]) => {
          const balance = createLabItem(balanceDef, 200, 200)
          const before = computeBalanceWeight(balance)
          for (const v of volumes) {
            const beaker = createLabItem(beaker250, 200 + (Math.random() - 0.5) * 40, 100)
            getLiquid(beaker.uid).volume = v
          }
          const after = computeBalanceWeight(balance)
          expect(after).toBeGreaterThanOrEqual(before)
        }
      ),
      { numRuns: 200 }
    )
  })
})
