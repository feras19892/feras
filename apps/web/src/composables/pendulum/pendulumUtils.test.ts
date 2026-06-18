import { describe, it, expect } from 'vitest'
import { calculatePendulumRow } from './pendulumUtils'

describe('فحص معادلات وحسابات تجربة البندول البسيط', () => {
  it('يجب أن يحسب الزمن الدوري ومربعه بشكل صحيح لطول خيط 25 سم وجاذبية 9.81', () => {
    const result = calculatePendulumRow(1, 25)
    expect(result.periodT).toBeCloseTo(1.002, 2)
    expect(result.periodSquared).toBeCloseTo(1.004, 2)
    expect(result.timeFor20Osc).toBeCloseTo(20.04, 1)
  })

  it('تأكيد الحماية: تغيير الكتلة يجب ألا يدخل في حسابات الصفوف', () => {
    const result = calculatePendulumRow(2, 100)
    expect(result.periodT).toBeCloseTo(2.006, 2)
  })

  it('كوكب آخر: g=1.62 (القمر) يجب أن يعطي T أطول', () => {
    const result = calculatePendulumRow(3, 50, 1.62)
    expect(result.periodT).toBeGreaterThan(3.0)
    expect(result.periodT).toBeCloseTo(3.50, 1)
  })
})
