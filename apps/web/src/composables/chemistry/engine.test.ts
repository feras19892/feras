import { describe, it, expect } from 'vitest'
import { findEquation, canReact, calculateTitrationPh, getIndicatorColor, isAcid, isBase, isIndicator, mixColor, hexToRgb } from '@my-modern-app/chemistry-engine'

describe('Chemistry Engine: Equations', () => {
  it('findEquation returns matching equation for hcl+naoh', () => {
    const eq = findEquation(['hcl', 'naoh'])
    expect(eq).not.toBeNull()
    expect(eq!.type).toBe('neutralization')
    expect(eq!.equation).toContain('HCl')
    expect(eq!.equation).toContain('NaOH')
  })

  it('findEquation returns null for non-reacting chemicals', () => {
    const eq = findEquation(['water', 'nacl'])
    expect(eq).toBeNull()
  })

  it('canReact returns true for reacting pair', () => {
    expect(canReact('hcl', 'naoh')).toBe(true)
    expect(canReact('cuso4', 'naoh')).toBe(true)
  })

  it('canReact returns false for non-reacting pair', () => {
    expect(canReact('water', 'nacl')).toBe(false)
  })

  it('gas equations have gasType field', () => {
    const znHcl = findEquation(['zn', 'hcl'])
    expect(znHcl).not.toBeNull()
    expect(znHcl!.gasEvolution).toBe(true)
    expect(znHcl!.gasType).toBe('H₂')

    const caco3Hcl = findEquation(['caco3', 'hcl'])
    expect(caco3Hcl).not.toBeNull()
    expect(caco3Hcl!.gasType).toBe('CO₂')

    const kmno4H2o2 = findEquation(['kmno4', 'h2o2'])
    expect(kmno4H2o2).not.toBeNull()
    expect(kmno4H2o2!.gasType).toBe('O₂')
  })

  it('redox equation products match equation string', () => {
    const kmno4H2o2 = findEquation(['kmno4', 'h2o2'])
    expect(kmno4H2o2!.products).toContain('mno2')
    expect(kmno4H2o2!.products).toContain('o2')
    expect(kmno4H2o2!.products).toContain('koh')
    expect(kmno4H2o2!.products).toContain('water')
  })
})

describe('Chemistry Engine: pH Calculations', () => {
  it('strong acid + strong base at equivalence = pH 7', () => {
    const ph = calculateTitrationPh(50, 'hcl', 50, 'naoh', 0.1, 0.1)
    expect(ph).toBeCloseTo(7, 0)
  })

  it('strong acid excess → pH < 7', () => {
    const ph = calculateTitrationPh(50, 'hcl', 10, 'naoh', 0.1, 0.1)
    expect(ph).toBeLessThan(7)
  })

  it('strong base excess → pH > 7', () => {
    const ph = calculateTitrationPh(10, 'hcl', 50, 'naoh', 0.1, 0.1)
    expect(ph).toBeGreaterThan(7)
  })

  it('weak acid + strong base at equivalence → pH > 7', () => {
    const ph = calculateTitrationPh(50, 'ch3cooh', 50, 'naoh', 0.1, 0.1)
    expect(ph).toBeGreaterThan(7)
    expect(ph).toBeLessThan(10)
  })

  it('zero volume → pH 7', () => {
    const ph = calculateTitrationPh(0, 'hcl', 0, 'naoh', 0.1, 0.1)
    expect(ph).toBe(7)
  })
})

describe('Chemistry Engine: Type Checks', () => {
  it('isAcid identifies known acids', () => {
    expect(isAcid('hcl')).toBe(true)
    expect(isAcid('h2so4')).toBe(true)
    expect(isAcid('ch3cooh')).toBe(true)
    expect(isAcid('naoh')).toBe(false)
  })

  it('isBase identifies known bases including nh3', () => {
    expect(isBase('naoh')).toBe(true)
    expect(isBase('koh')).toBe(true)
    expect(isBase('nh4oh')).toBe(true)
    expect(isBase('nh3')).toBe(true)
    expect(isBase('hcl')).toBe(false)
  })

  it('isIndicator identifies known indicators', () => {
    expect(isIndicator('phenolphthalein')).toBe(true)
    expect(isIndicator('methyl-orange')).toBe(true)
    expect(isIndicator('universal-indicator')).toBe(true)
    expect(isIndicator('starch')).toBe(true)
    expect(isIndicator('hcl')).toBe(false)
  })
})

describe('Chemistry Engine: Indicator Colors', () => {
  it('phenolphthalein: colorless at pH < 8.2, pink at pH > 8.2', () => {
    expect(getIndicatorColor('phenolphthalein', 4)).toBe('#fdf4ff')
    expect(getIndicatorColor('phenolphthalein', 9)).toBe('#ec4899')
  })

  it('universal-indicator returns valid hex for any pH', () => {
    for (let ph = 0; ph <= 14; ph += 0.5) {
      const color = getIndicatorColor('universal-indicator', ph)
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('starch returns colorless (not pH-dependent)', () => {
    expect(getIndicatorColor('starch', 2)).toBe('#fefce8')
    expect(getIndicatorColor('starch', 12)).toBe('#fefce8')
  })
})

describe('Chemistry Engine: Color Utils', () => {
  it('hexToRgb returns correct RGB values', () => {
    const rgb = hexToRgb('#ff0000')
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('mixColor returns valid hex', () => {
    const mixed = mixColor('#ff0000', 50, '#0000ff', 50)
    expect(mixed).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})
