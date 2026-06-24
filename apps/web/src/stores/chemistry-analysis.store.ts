import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ChemAnalysisPayload, ChemStudentInfo } from '../types/chemistry';
import { clearAnalysisStorage } from '../composables/chemistry/sendToAnalysis';

export const useChemistryAnalysisStore = defineStore('chemistry-analysis', () => {
  const payload = ref<ChemAnalysisPayload | null>(null);
  const modifiedReadings = ref<Record<string, number>[]>([]);
  const studentInfo = ref<ChemStudentInfo>({ name: '', email: '', grade: '', notes: '' });
  const reportDate = ref<string>(new Date().toLocaleDateString('ar-SA'));
  const mediumType = ref<string>('');
  const calculatedResult = ref<number | null>(null);
  const expectedResult = ref<number | null>(null);

  const hasData = computed(() => payload.value !== null);
  const sourceName = computed(() => payload.value?.sourceNameAr ?? '');

  function loadFromExperiment(data: ChemAnalysisPayload) {
    payload.value = data;
    modifiedReadings.value = data.readings.map(r => ({ ...r })) as Record<string, number>[];
    mediumType.value = data.mediumType ?? '';
    calculatedResult.value = data.calculatedResult ?? null;
    expectedResult.value = data.expectedResult ?? null;
    reportDate.value = new Date().toLocaleDateString('ar-SA');
  }

  function setPayload(data: ChemAnalysisPayload) {
    payload.value = data;
    modifiedReadings.value = data.readings.map(r => ({ ...r })) as Record<string, number>[];
    mediumType.value = data.mediumType ?? '';
    calculatedResult.value = data.calculatedResult ?? null;
    expectedResult.value = data.expectedResult ?? null;
  }

  function updateCell(rowIndex: number, key: string, value: number) {
    if (!modifiedReadings.value[rowIndex]) return;
    modifiedReadings.value[rowIndex][key] = value;
  }

  function clearData() {
    payload.value = null;
    modifiedReadings.value = [];
    studentInfo.value = { name: '', email: '', grade: '', notes: '' };
    mediumType.value = '';
    calculatedResult.value = null;
    expectedResult.value = null;
    clearAnalysisStorage();
  }

  function addRow() {
    if (!payload.value) return;
    const empty: Record<string, number> = {};
    for (const col of payload.value.columns) { empty[col.key] = 0; }
    modifiedReadings.value = [...modifiedReadings.value, empty];
  }

  function removeRow(index: number) {
    modifiedReadings.value = modifiedReadings.value.filter((_, i) => i !== index);
  }

  function updateStudentInfo(info: Partial<ChemStudentInfo>) {
    studentInfo.value = { ...studentInfo.value, ...info };
  }

  function calculateEquivalencePoint(xKey: string, yKey: string): number | null {
    if (!modifiedReadings.value.length) return null;
    const data = modifiedReadings.value
      .map(r => ({ x: Number(r[xKey]) || 0, y: Number(r[yKey]) || 0 }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y))
      .sort((a, b) => a.x - b.x);
    if (data.length < 3) return null;
    let maxSlopeIdx = 0;
    let maxSlope = 0;
    for (let i = 1; i < data.length - 1; i++) {
      const slope = Math.abs(data[i + 1].y - data[i - 1].y) / (data[i + 1].x - data[i - 1].x || 1);
      if (slope > maxSlope) { maxSlope = slope; maxSlopeIdx = i; }
    }
    return data[maxSlopeIdx].x;
  }

  function calculateConcentration(V_eq: number, M_known: number, V_known: number): number | null {
    if (!V_eq || !M_known || !V_known) return null;
    return (M_known * V_known) / V_eq;
  }

  const readings = computed(() => modifiedReadings.value);
  const columns = computed(() => payload.value?.columns ?? []);
  const equations = computed(() => payload.value?.equations ?? []);
  const plots = computed(() => payload.value?.suggestedPlots ?? []);

  return {
    payload,
    hasData,
    sourceName,
    readings,
    columns,
    equations,
    plots,
    studentInfo,
    reportDate,
    mediumType,
    calculatedResult,
    expectedResult,
    loadFromExperiment,
    setPayload,
    updateCell,
    clearData,
    addRow,
    removeRow,
    updateStudentInfo,
    calculateEquivalencePoint,
    calculateConcentration,
  };
});
