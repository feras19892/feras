import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AnalysisPayload } from '../types/physics';
import { clearAnalysisStorage } from '../composables/analysis/sendToAnalysis';

export interface StudentInfo {
  name: string;
  email: string;
  grade: string;
  notes: string;
}

export const useAnalysisStore = defineStore('analysis', () => {
  const payload = ref<AnalysisPayload | null>(null);
  const modifiedReadings = ref<Record<string, number>[]>([]);
  const studentInfo = ref<StudentInfo>({ name: '', email: '', grade: '', notes: '' });
  const reportDate = ref<string>(new Date().toLocaleDateString('ar-SA'));
  const mediumType = ref<string>('');
  const mediumN2 = ref<number | null>(null);
  const calculatedN2 = ref<number | null>(null);
  const expectedN2 = ref<number | null>(null);

  const hasData = computed(() => payload.value !== null);
  const sourceName = computed(() => payload.value?.sourceNameAr ?? '');

  function loadFromExperiment(data: AnalysisPayload) {
    payload.value = data;
    modifiedReadings.value = data.readings.map(r => ({ ...r })) as unknown as Record<string, number>[];
    mediumType.value = data.mediumType ?? '';
    mediumN2.value = data.mediumN2 ?? null;
    calculatedN2.value = data.calculatedN2 ?? null;
    expectedN2.value = data.expectedN2 ?? null;
    reportDate.value = new Date().toLocaleDateString('ar-SA');
  }

  function setPayload(data: AnalysisPayload) {
    payload.value = data;
    modifiedReadings.value = data.readings.map(r => ({ ...r })) as unknown as Record<string, number>[];
    mediumType.value = data.mediumType ?? '';
    mediumN2.value = data.mediumN2 ?? null;
    calculatedN2.value = data.calculatedN2 ?? null;
    expectedN2.value = data.expectedN2 ?? null;
    reportDate.value = new Date().toLocaleDateString('ar-SA');
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
    mediumN2.value = null;
    calculatedN2.value = null;
    expectedN2.value = null;
    clearAnalysisStorage();
  }

  function generateTheoreticalReadings(n2: number) {
    if (!payload.value) return;
    const n1 = 1.0;
    const angles = [10, 20, 30, 40, 50, 60];
    const newReadings = angles.map((thetaI) => {
      const sinT = (n1 / n2) * Math.sin(thetaI * Math.PI / 180);
      const thetaT = sinT <= 1 ? (Math.asin(sinT) * 180 / Math.PI) : 0;
      const row: Record<string, number> = {};
      for (const col of payload.value!.columns) {
        if (col.key === 'theta_i') row[col.key] = thetaI;
        else if (col.key === 'theta_t') row[col.key] = thetaT;
        else if (col.key === 'sin_i') row[col.key] = Math.sin(thetaI * Math.PI / 180);
        else if (col.key === 'sin_t') row[col.key] = Math.sin(thetaT * Math.PI / 180);
        else row[col.key] = 0;
      }
      return row;
    });
    modifiedReadings.value = newReadings;
    mediumN2.value = n2;
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

  function updateStudentInfo(info: Partial<StudentInfo>) {
    studentInfo.value = { ...studentInfo.value, ...info };
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
    mediumN2,
    calculatedN2,
    expectedN2,
    loadFromExperiment,
    setPayload,
    updateCell,
    clearData,
    addRow,
    removeRow,
    updateStudentInfo,
    generateTheoreticalReadings,
  };
});
