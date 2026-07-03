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

export function buildTitrationPayload(experimentName: string, t: (key: string) => string): ChemAnalysisPayload {
  const columns: ChemAnalysisColumnMeta[] = [
    { key: 'vAdded', label: t('chemistryLab.addedBaseVolume'), unit: 'mL' },
    { key: 'ph', label: 'pH', unit: '' },
    { key: 'temperature', label: t('chemistryLab.temperatureLabel'), unit: '°C' },
  ];
  const rows = readings.map(r => ({ vAdded: +r.vAdded.toFixed(2), ph: +r.ph.toFixed(2), temperature: +r.temperature.toFixed(1) }));
  const equations: ChemAnalysisEquation[] = [
    {
      name: t('chemistryLab.concentrationCalc'),
      formula: 'M_acid = (M_base * V_eq) / V_acid',
      variables: [
        { symbol: 'M_base', label: t('chemistryLab.baseConcentrationKnown') },
        { symbol: 'V_eq', label: t('chemistryLab.equivalenceVolume') },
        { symbol: 'V_acid', label: t('chemistryLab.acidVolume') },
      ],
      solveFor: ['M_acid'],
    },
    {
      name: t('chemistryLab.phCalc'),
      formula: 'pH = -log10(H)',
      variables: [
        { symbol: 'H', label: t('chemistryLab.hPlusLabel') },
      ],
      solveFor: ['pH'],
    },
  ];
  const plots: ChemAnalysisPlotConfig[] = [
    { xKey: 'vAdded', yKey: 'ph', xLabel: t('chemistryLab.baseVolume'), yLabel: 'pH', type: 'scatter' },
    { xKey: 'vAdded', yKey: 'temperature', xLabel: t('chemistryLab.baseVolume'), yLabel: t('chemistryLab.temperatureLabel'), type: 'line' },
  ];
  return {
    sourceExperiment: 'titration',
    sourceNameAr: experimentName || t('chemistryLab.acidBaseTitration'),
    readings: rows,
    columns,
    equations,
    suggestedPlots: plots,
  };
}
