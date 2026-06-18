import { describe, it, expect } from 'vitest'
import { calculateStaticRow } from './physicsUtils'

describe('فحص منطق حسابات النابض الاستاتيكية', () => {

  it('يجب أن يحسب القوة والاستطالة بشكل صحيح لكتلة 10 جرام وثابت 5', () => {
    const result = calculateStaticRow(1, 10, 5) // كتلة 10 جرام، ثابت 5
    expect(result.forceNewton).toBeCloseTo(0.098, 3)
    expect(result.displacementCm).toBeCloseTo(1.96, 2)
  })

  it('منع كوارث الجدول: فحص سيناريو كتلة 1 كيلو وثابت 50', () => {
    const result = calculateStaticRow(2, 1000, 50) // كتلة 1000 جرام (1 كيلو)، ثابت 50
    expect(result.displacementCm).toBeCloseTo(19.62, 2)
  })
})
