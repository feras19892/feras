import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AnalysisPayload } from '../types/physics';

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

  const hasData = computed(() => payload.value !== null);
  const sourceName = computed(() => payload.value?.sourceNameAr ?? '');

  function loadFromExperiment(data: AnalysisPayload) {
    payload.value = data;
    modifiedReadings.value = data.readings.map(r => ({ ...r }));
    reportDate.value = new Date().toLocaleDateString('ar-SA');
  }

  function setPayload(data: AnalysisPayload) {
    payload.value = data;
    modifiedReadings.value = data.readings.map(r => ({ ...r }));
  }

  function updateCell(rowIndex: number, key: string, value: number) {
    if (!modifiedReadings.value[rowIndex]) return;
    modifiedReadings.value[rowIndex][key] = value;
  }

  function clearData() {
    payload.value = null;
    modifiedReadings.value = [];
    studentInfo.value = { name: '', email: '', grade: '', notes: '' };
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
    loadFromExperiment,
    setPayload,
    updateCell,
    clearData,
    updateStudentInfo,
  };
});
