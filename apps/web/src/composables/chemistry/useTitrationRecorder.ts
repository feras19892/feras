import { reactive } from 'vue';
import type { ChemAnalysisPayload, ChemAnalysisColumnMeta, ChemAnalysisEquation, ChemAnalysisPlotConfig } from '../../types/chemistry';
import { getLiquid } from './useChemistryLab';

interface TitrationReading {
  vAdded: number; // mL of titrant added
  ph: number;
  temperature: number;
}

const readings = reactive<TitrationReading[]>([]);
let lastPh: number | null = null;

export function recordTitrationStep(targetUid: string, vAdded: number) {
  const liq = getLiquid(targetUid);
  if (!liq || liq.ph == null) return;
  const step = 0.5; // only record if pH changed by at least 0.5 or V changed by 1ml
  if (readings.length === 0 || Math.abs(liq.ph - (lastPh ?? liq.ph)) >= step || readings[readings.length - 1].vAdded + 1 <= vAdded) {
    readings.push({ vAdded, ph: liq.ph, temperature: liq.temperature });
    lastPh = liq.ph;
  }
}

export function clearTitrationReadings() {
  readings.splice(0, readings.length);
  lastPh = null;
}

export function getTitrationReadings(): TitrationReading[] {
  return [...readings];
}

export function hasTitrationData(): boolean {
  return readings.length >= 3;
}

export function buildTitrationPayload(experimentName: string): ChemAnalysisPayload {
  const columns: ChemAnalysisColumnMeta[] = [
    { key: 'vAdded', label: 'حجم القاعدة المضافة', unit: 'mL' },
    { key: 'ph', label: 'pH', unit: '' },
    { key: 'temperature', label: 'درجة الحرارة', unit: '°C' },
  ];
  const rows = readings.map(r => ({ vAdded: +r.vAdded.toFixed(2), ph: +r.ph.toFixed(2), temperature: +r.temperature.toFixed(1) }));
  const equations: ChemAnalysisEquation[] = [
    {
      name: 'حساب التركيز',
      formula: 'M_acid = (M_base * V_eq) / V_acid',
      variables: [
        { symbol: 'M_base', label: 'تركيز القاعدة المعروف' },
        { symbol: 'V_eq', label: 'حجم التعادل' },
        { symbol: 'V_acid', label: 'حجم الحمض' },
      ],
      solveFor: ['M_acid'],
    },
    {
      name: 'حساب pH',
      formula: 'pH = -log10(H)',
      variables: [
        { symbol: 'H', label: 'تركيز H+' },
      ],
      solveFor: ['pH'],
    },
  ];
  const plots: ChemAnalysisPlotConfig[] = [
    { xKey: 'vAdded', yKey: 'ph', xLabel: 'حجم القاعدة (mL)', yLabel: 'pH', type: 'scatter' },
    { xKey: 'vAdded', yKey: 'temperature', xLabel: 'حجم القاعدة (mL)', yLabel: 'درجة الحرارة (°C)', type: 'line' },
  ];
  return {
    sourceExperiment: 'titration',
    sourceNameAr: experimentName || 'تجربة معايرة',
    readings: rows,
    columns,
    equations,
    suggestedPlots: plots,
  };
}
