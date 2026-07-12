import { describe, it, expect, beforeEach } from 'vitest'
import { registerExperiment, getExperiment, listExperiments, listByCategory, listByLevel, hasExperiment, clearRegistry } from '../registry'
import type { ExperimentDefinition } from '../types'

function makeExp(overrides: Partial<ExperimentDefinition> = {}): ExperimentDefinition {
  return {
    id: 'test-exp',
    level: 'high',
    category: 'titration',
    nameKey: 'test.name',
    descKey: 'test.desc',
    icon: '🧪',
    steps: [{ id: 1, textKey: 'test.step1', rules: [{ type: 'hasTool', toolId: 'burette' }] }],
    reportTemplate: { type: 'titration', fields: [] },
    ...overrides,
  }
}

describe('Experiment Registry', () => {
  beforeEach(() => clearRegistry())

  it('registerExperiment stores definition', () => {
    const exp = makeExp()
    registerExperiment(exp)
    expect(hasExperiment('test-exp')).toBe(true)
    expect(getExperiment('test-exp')).toBe(exp)
  })

  it('listExperiments returns all registered experiments', () => {
    registerExperiment(makeExp({ id: 'a' }))
    registerExperiment(makeExp({ id: 'b' }))
    expect(listExperiments()).toHaveLength(2)
  })

  it('listByCategory filters correctly', () => {
    registerExperiment(makeExp({ id: 'a', category: 'titration' }))
    registerExperiment(makeExp({ id: 'b', category: 'precipitation' }))
    expect(listByCategory('titration')).toHaveLength(1)
    expect(listByCategory('precipitation')).toHaveLength(1)
    expect(listByCategory('gas')).toHaveLength(0)
  })

  it('listByLevel filters correctly', () => {
    registerExperiment(makeExp({ id: 'a', level: 'high' }))
    registerExperiment(makeExp({ id: 'b', level: 'middle' }))
    registerExperiment(makeExp({ id: 'c', level: 'university' }))
    expect(listByLevel('high')).toHaveLength(1)
    expect(listByLevel('middle')).toHaveLength(1)
    expect(listByLevel('university')).toHaveLength(1)
  })

  it('clearRegistry removes all experiments', () => {
    registerExperiment(makeExp())
    clearRegistry()
    expect(listExperiments()).toHaveLength(0)
    expect(hasExperiment('test-exp')).toBe(false)
  })

  it('re-registering same id overwrites', () => {
    registerExperiment(makeExp({ id: 'x', icon: '🔬' }))
    registerExperiment(makeExp({ id: 'x', icon: '🧫' }))
    expect(listExperiments()).toHaveLength(1)
    expect(getExperiment('x')!.icon).toBe('🧫')
  })
})
