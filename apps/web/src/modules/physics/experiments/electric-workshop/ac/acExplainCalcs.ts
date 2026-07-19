import type { useWorkshop } from '../shared/useWorkshop'
import type { ACExplainCtx } from './acExplainCalcs1'
import { explainACRL, explainACRC } from './acExplainCalcs1'
import { explainACRLC, explainACTransformer, explainACFilter } from './acExplainCalcs2'

type Workshop = ReturnType<typeof useWorkshop>

type ExperimentName = 'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance'

export function buildACCalcExplanation(
  exp: ExperimentName,
  workshop: Workshop,
): string {
  const comps = workshop.components
  const ctx: ACExplainCtx = {
    V: comps.filter(c => c.type === 'acsource')[0]?.value ?? 220,
    f: (comps.filter(c => c.type === 'acsource')[0] as any)?.acFrequency ?? 50,
    omega: 0,
    resistors: comps.filter(c => c.type === 'resistor'),
    inductors: comps.filter(c => c.type === 'inductor'),
    capacitors: comps.filter(c => c.type === 'capacitor'),
    transformers: comps.filter(c => c.type === 'transformer'),
  }
  ctx.omega = 2 * Math.PI * ctx.f

  if (exp === 'ac_rl') return explainACRL(ctx)
  if (exp === 'ac_rc') return explainACRC(ctx)
  if (exp === 'ac_rlc') return explainACRLC(ctx)
  if (exp === 'ac_transformer') return explainACTransformer(ctx)
  if (exp === 'ac_filter') return explainACFilter(ctx)
  if (exp === 'ac_powerfactor') {
    const R = ctx.resistors.reduce((s, r) => s + r.value, 0)
    const XL = ctx.inductors.length > 0 ? ctx.omega * ctx.inductors[0].value * 1e-3 : 0
    const XC = ctx.capacitors.length > 0 ? 1 / (ctx.omega * ctx.capacitors[0].value * 1e-6) : 0
    const X = XL - XC
    const Z = Math.sqrt(R * R + X * X)
    const pf = R / Z
    return `<h3>Power Factor</h3><p>R = ${R}Ω, X_L = ${XL.toFixed(1)}Ω, X_C = ${XC.toFixed(1)}Ω</p><p>Z = ${Z.toFixed(1)}Ω</p><p>cos(φ) = R/Z = ${pf.toFixed(3)}</p>`
  }
  if (exp === 'ac_resonance') {
    const L = ctx.inductors.length > 0 ? ctx.inductors[0].value * 1e-3 : 0
    const C = ctx.capacitors.length > 0 ? ctx.capacitors[0].value * 1e-6 : 0
    const f0 = C > 0 && L > 0 ? 1 / (2 * Math.PI * Math.sqrt(L * C)) : 0
    return `<h3>RLC Resonance</h3><p>L = ${(L * 1000).toFixed(0)}mH, C = ${(C * 1e6).toFixed(0)}µF</p><p>f₀ = 1/(2π√(LC)) = ${f0.toFixed(1)} Hz</p><p>At resonance: X_L = X_C, Z = R (minimum), I = V/R (maximum)</p>`
  }
  return ''
}
