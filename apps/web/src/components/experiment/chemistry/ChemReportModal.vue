<script setup lang="ts">
import type { ReportData } from '../../../composables/chemistry/useExperiments';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{
  data: ReportData | null;
}>();

const emit = defineEmits<{
  close: [];
  restart: [];
}>();
</script>

<template>
  <div v-if="data" class="report-overlay" @click.self="emit('close')">
    <div class="report-panel">
      <div class="report-header">
        <h2>{{ t('chemistryReport.reportTitle') }}</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>
      <div class="report-body">
        <div class="report-section">
          <div class="report-row">
            <span class="label">{{ t('chemistryReport.experimentLabel') }}</span>
            <span class="value">{{ data.experimentName }}</span>
          </div>
          <div class="report-row">
            <span class="label">{{ t('chemistryReport.consumedBaseVolume') }}</span>
            <span class="value">{{ data.consumedVolume.toFixed(2) }} mL</span>
          </div>
          <div class="report-row">
            <span class="label">{{ t('chemistryReport.acidVolume') }}</span>
            <span class="value">{{ data.acidVolume.toFixed(0) }} mL</span>
          </div>
          <div class="report-row">
            <span class="label">{{ t('chemistryReport.baseMolarity') }}</span>
            <span class="value">{{ data.baseMolarity.toFixed(2) }} M</span>
          </div>
          <div class="report-row highlight">
            <span class="label">{{ t('chemistryReport.calculatedAcidMolarity') }}</span>
            <span class="value calc">{{ data.calculatedAcidMolarity.toFixed(4) }} M</span>
          </div>
          <div class="report-row">
            <span class="label">{{ t('chemistryReport.phAtEquivalence') }}</span>
            <span class="value">{{ data.phAtEquivalence !== null ? data.phAtEquivalence.toFixed(2) : '--' }}</span>
          </div>
          <div class="report-row">
            <span class="label">{{ t('chemistryReport.colorAtEquivalence') }}</span>
            <span class="value"><span class="color-dot" :style="{ background: data.colorAtEquivalence }" /></span>
          </div>
          <div class="report-row">
            <span class="label">{{ t('chemistryReport.readingsCount') }}</span>
            <span class="value">{{ data.readingsCount }}</span>
          </div>
        </div>
        <div class="report-actions">
          <button class="restart-btn" @click="emit('restart')">{{ t('chemistryReport.restartExperiment') }}</button>
          <button class="close-btn2" @click="emit('close')">{{ t('chemistryReport.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.report-panel {
  background: #ffffff;
  border-radius: 1rem;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}
.report-header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
}
.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
}
.report-body {
  padding: 1.2rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.report-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.report-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  font-size: 0.85rem;
}
.report-row.highlight {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}
.label {
  color: #64748b;
  font-weight: 600;
}
.value {
  color: #1e293b;
  font-weight: 700;
}
.value.calc {
  color: #059669;
  font-size: 1rem;
}
.color-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  vertical-align: middle;
  border: 1px solid rgba(0,0,0,0.15);
}
.report-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.restart-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: #3b82f6;
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}
.restart-btn:hover {
  background: #2563eb;
}
.close-btn2 {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
