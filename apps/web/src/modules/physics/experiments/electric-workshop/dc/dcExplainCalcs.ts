import type { useWorkshop } from '../shared/useWorkshop'
import type { ExplainCtx } from './dcExplainCalcs1'
import { explainOhm, explainSeries, explainParallel } from './dcExplainCalcs1'
import { explainMixed, explainKvl, explainKcl, explainVdivider } from './dcExplainCalcs2'
import { explainCdivider, explainBseries, explainBparallel, explainRelay, explainRcCharge, explainRlTransient, explainWheatstone, explainThevenin, explainSuperposition, explainMaxPower } from './dcExplainCalcs3'

type Workshop = ReturnType<typeof useWorkshop>

type ExperimentName = 'ohm' | 'series' | 'parallel' | 'mixed' | 'kvl' | 'kcl' | 'vdivider' | 'cdivider' | 'bseries' | 'bparallel' | 'relay' | 'rc_charge' | 'rl_transient' | 'wheatstone' | 'thevenin' | 'superposition' | 'maxpower'

const explainers: Record<string, (ctx: ExplainCtx) => string> = {
  ohm: explainOhm,
  series: explainSeries,
  parallel: explainParallel,
  mixed: explainMixed,
  kvl: explainKvl,
  kcl: explainKcl,
  vdivider: explainVdivider,
  cdivider: explainCdivider,
  bseries: explainBseries,
  bparallel: explainBparallel,
  relay: explainRelay,
  rc_charge: explainRcCharge,
  rl_transient: explainRlTransient,
  wheatstone: explainWheatstone,
  thevenin: explainThevenin,
  superposition: explainSuperposition,
  maxpower: explainMaxPower,
}

export function buildCalcExplanation(
  exp: ExperimentName,
  workshop: Workshop,
  t: (key: string, vars?: Record<string, string>) => string,
): string {
  const ctx: ExplainCtx = {
    t,
    V: workshop.totalVoltage.value,
    I: workshop.totalCurrent.value,
    P: workshop.totalPower.value,
    comps: workshop.components,
    resistors: workshop.components.filter(c => c.type === 'resistor'),
    batteries: workshop.components.filter(c => c.type === 'battery'),
    ammeters: workshop.components.filter(c => c.type === 'ammeter'),
    voltmeters: workshop.components.filter(c => c.type === 'voltmeter'),
  }
  return explainers[exp]?.(ctx) ?? ''
}
