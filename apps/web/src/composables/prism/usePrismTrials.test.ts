import { describe, it, expect } from 'vitest'
import { usePrismTrials } from './usePrismTrials'

describe('usePrismTrials', () => {
  it('records a valid trial', () => {
    const params = { value: { prismAngle: 60, angleIncidence: 45, wavelength: 580 } }
    const angleEmergence = { value: 35 }
    const deviation = { value: 40 }
    const nValue = { value: 1.5 }

    const trials = usePrismTrials(params, angleEmergence, deviation, nValue)
    trials.recordTrial()

    expect(trials.trials.value.length).toBe(1)
    expect(trials.trials.value[0].id).toBe(1)
    expect(trials.trials.value[0].angleEmergence).toBe(35)
  })

  it('does not record when angleEmergence is null (TIR)', () => {
    const params = { value: { prismAngle: 60, angleIncidence: 45, wavelength: 580 } }
    const angleEmergence = { value: null as number | null }
    const deviation = { value: null as number | null }
    const nValue = { value: 1.5 }

    const trials = usePrismTrials(params, angleEmergence, deviation, nValue)
    trials.recordTrial()

    expect(trials.trials.value.length).toBe(0)
  })

  it('exports CSV correctly with null handling', () => {
    const params = { value: { prismAngle: 60, angleIncidence: 45, wavelength: 580 } }
    const angleEmergence = { value: 35 }
    const deviation = { value: 40 }
    const nValue = { value: 1.5 }

    const trials = usePrismTrials(params, angleEmergence, deviation, nValue)
    trials.recordTrial()
    const csv = trials.exportCsv()

    expect(csv).toContain('Trial,A(deg),theta_i(deg),lambda(nm)')
    expect(csv).toContain('35.0,40.0')
  })

  it('undo and redo work', () => {
    const params = { value: { prismAngle: 60, angleIncidence: 45, wavelength: 580 } }
    const angleEmergence = { value: 35 }
    const deviation = { value: 40 }
    const nValue = { value: 1.5 }

    const trials = usePrismTrials(params, angleEmergence, deviation, nValue)
    trials.recordTrial()
    expect(trials.trials.value.length).toBe(1)

    trials.undo()
    expect(trials.trials.value.length).toBe(0)

    trials.redo()
    expect(trials.trials.value.length).toBe(1)
  })
})
