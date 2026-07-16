import type { AnalysisPayload } from '../../../../types/physics'
import { sendToAnalysis } from '../../../../composables/analysis/sendToAnalysis'
import type { ExportContext } from './electricLabExportBasic'

export function exportNew(router: any, ctx: ExportContext): boolean {
  if (ctx.isInternalResistance.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-internal-resistance', sourceNameAr: 'المقاومة الداخلية للبطارية', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'Vt', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [
        { name: 'Terminal Voltage', formula: 'Vt = ε - I×r', variables: [{ symbol: 'Vt', label: 'Terminal V' }, { symbol: 'epsilon', label: 'EMF' }, { symbol: 'I', label: 'Current' }, { symbol: 'r', label: 'Internal R' }], solveFor: ['Vt'] },
        { name: 'Internal Resistance', formula: 'r = (ε - Vt) / I', variables: [{ symbol: 'r', label: 'Internal R' }, { symbol: 'epsilon', label: 'EMF' }, { symbol: 'Vt', label: 'Terminal V' }, { symbol: 'I', label: 'Current' }], solveFor: ['r'] },
      ],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'Vt (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isSeries.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-series', sourceNameAr: 'دوائر التوالي', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }],
      equations: [
        { name: 'Series Req', formula: 'Req = R1 + R2 + R3', variables: [{ symbol: 'Req', label: 'Equivalent R' }, { symbol: 'R1', label: 'R1' }, { symbol: 'R2', label: 'R2' }, { symbol: 'R3', label: 'R3' }], solveFor: ['Req'] },
        { name: "Ohm's Law", formula: 'I = V / Req', variables: [{ symbol: 'I', label: 'Current' }, { symbol: 'V', label: 'Voltage' }, { symbol: 'Req', label: 'Equivalent R' }], solveFor: ['I'] },
      ],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'V (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isCapacitorsCombo.value) {
    const isSeries = ctx.isCapacitorsSeries?.value ?? false
    sendToAnalysis(router, {
      sourceExperiment: isSeries ? 'electric-lab-capacitors-series' : 'electric-lab-capacitors-parallel',
      sourceNameAr: isSeries ? 'توالي المكثفات' : 'توازي المكثفات', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'τ', unit: 's' }],
      equations: [
        { name: 'Series Ceq', formula: '1/Ceq = 1/C1 + 1/C2', variables: [{ symbol: 'Ceq', label: 'Equivalent C' }, { symbol: 'C1', label: 'C1' }, { symbol: 'C2', label: 'C2' }], solveFor: ['Ceq'] },
        { name: 'Parallel Ceq', formula: 'Ceq = C1 + C2', variables: [{ symbol: 'Ceq', label: 'Equivalent C' }, { symbol: 'C1', label: 'C1' }, { symbol: 'C2', label: 'C2' }], solveFor: ['Ceq'] },
        { name: 'Time Constant', formula: 'τ = R × Ceq', variables: [{ symbol: 'tau', label: 'Time Constant' }, { symbol: 'R', label: 'Resistance' }, { symbol: 'Ceq', label: 'Equivalent C' }], solveFor: ['tau'] },
      ],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'V (V)', type: 'line' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isPotentiometer.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-potentiometer', sourceNameAr: 'البوتانشيوميتر لقياس الجهد', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'Vslide', unit: 'V' }, { key: 'I', label: 'Ig', unit: 'µA' }, { key: 'R', label: 'R1', unit: 'Ω' }],
      equations: [
        { name: 'Potentiometer Balance', formula: 'εx = (Lx/L) × εref', variables: [{ symbol: 'epsilon_x', label: 'Unknown EMF' }, { symbol: 'Lx', label: 'Balance Length' }, { symbol: 'L', label: 'Total Length' }, { symbol: 'epsilon_ref', label: 'Reference EMF' }], solveFor: ['epsilon_x'] },
      ],
      suggestedPlots: [{ xKey: 'R', yKey: 'V', xLabel: 'R1 (Ω)', yLabel: 'Vslide (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isNonOhmic.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-non-ohmic', sourceNameAr: 'المواد اللاأومية', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R_dyn', unit: 'Ω' }],
      equations: [
        { name: "Ohm's Law (Linear)", formula: 'V = I × R', variables: [{ symbol: 'V', label: 'Voltage' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Resistance' }], solveFor: ['R'] },
        { name: 'Dynamic Resistance', formula: 'R_dyn = dV/dI', variables: [{ symbol: 'R_dyn', label: 'Dynamic R' }, { symbol: 'dV', label: 'ΔV' }, { symbol: 'dI', label: 'ΔI' }], solveFor: ['R_dyn'] },
      ],
      suggestedPlots: [{ xKey: 'I', yKey: 'V', xLabel: 'I (A)', yLabel: 'V (V)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isMaxPower.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-max-power', sourceNameAr: 'نقل القدرة العظمى', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance, P: t.current * t.current * t.resistance })),
      columns: [{ key: 'R', label: 'R', unit: 'Ω' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'V', label: 'V', unit: 'V' }, { key: 'P', label: 'P', unit: 'W' }],
      equations: [
        { name: 'Power on Load', formula: 'P = I² × R', variables: [{ symbol: 'P', label: 'Power' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Load R' }], solveFor: ['P'] },
        { name: 'Max Power Condition', formula: 'Pmax = V² / (4r)', variables: [{ symbol: 'Pmax', label: 'Max Power' }, { symbol: 'V', label: 'EMF' }, { symbol: 'r', label: 'Internal R' }], solveFor: ['Pmax'] },
      ],
      suggestedPlots: [{ xKey: 'R', yKey: 'P', xLabel: 'R (Ω)', yLabel: 'P (W)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isJoulesLaw.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-joules', sourceNameAr: 'قانون جول للتسخين', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R: t.resistance, P: t.current * t.current * t.resistance, H: t.current * t.current * t.resistance * 60 })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R', label: 'R', unit: 'Ω' }, { key: 'P', label: 'P', unit: 'W' }, { key: 'H', label: 'H', unit: 'J' }],
      equations: [
        { name: "Joule's Law", formula: 'H = I² × R × t', variables: [{ symbol: 'H', label: 'Heat Energy' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Resistance' }, { symbol: 't', label: 'Time' }], solveFor: ['H'] },
        { name: 'Heating Power', formula: 'P = I² × R', variables: [{ symbol: 'P', label: 'Power' }, { symbol: 'I', label: 'Current' }, { symbol: 'R', label: 'Resistance' }], solveFor: ['P'] },
      ],
      suggestedPlots: [{ xKey: 'I', yKey: 'P', xLabel: 'I (A)', yLabel: 'P (W)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  if (ctx.isAmmeterVoltmeter.value) {
    sendToAnalysis(router, {
      sourceExperiment: 'electric-lab-ammeter-voltmeter', sourceNameAr: 'قياس المقاومة بالأميتر والفولتميتر', hasCalcTab: true,
      readings: ctx.trials.value.map(t => ({ V: t.voltage, I: t.current, R_measured: t.voltage / t.current, R_true: t.resistance })),
      columns: [{ key: 'V', label: 'V', unit: 'V' }, { key: 'I', label: 'I', unit: 'A' }, { key: 'R_measured', label: 'R_measured', unit: 'Ω' }, { key: 'R_true', label: 'R_true', unit: 'Ω' }],
      equations: [
        { name: 'Measured Resistance', formula: 'R_m = V / I', variables: [{ symbol: 'R_m', label: 'Measured R' }, { symbol: 'V', label: 'Voltage' }, { symbol: 'I', label: 'Current' }], solveFor: ['R_m'] },
        { name: 'True Resistance', formula: 'R_true = V / (I - V/Rv)', variables: [{ symbol: 'R_true', label: 'True R' }, { symbol: 'V', label: 'Voltage' }, { symbol: 'I', label: 'Current' }, { symbol: 'Rv', label: 'Voltmeter R' }], solveFor: ['R_true'] },
      ],
      suggestedPlots: [{ xKey: 'R_true', yKey: 'R_measured', xLabel: 'R_true (Ω)', yLabel: 'R_measured (Ω)', type: 'scatter' }],
    } as AnalysisPayload)
    return true
  }
  return false
}
