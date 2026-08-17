<script setup lang="ts">
import { computed } from 'vue';
import { listExperiments, type ExperimentDefinition, type ExperimentLevel } from '../../../composables/chemistry/experiments';
import { useI18n } from '../../../composables/useI18n';
import '../../../composables/chemistry/experiments'; // side-effect: registers all definitions
const { t, locale } = useI18n();

const emit = defineEmits<{ select: [exp: ExperimentDefinition]; close: [] }>();

const allExperiments = computed(() => listExperiments());

// Group experiments by level
const levelOrder: ExperimentLevel[] = ['middle', 'high', 'university'];
const levelLabels: Record<ExperimentLevel, { ar: string; en: string; es: string; icon: string }> = {
  middle: { ar: 'متوسط', en: 'Middle School', es: 'Secundaria', icon: '📘' },
  high: { ar: 'ثانوي', en: 'High School', es: 'Preparatoria', icon: '📗' },
  university: { ar: 'جامعي', en: 'University', es: 'Universidad', icon: '📕' },
};

const groupedExperiments = computed(() => {
  const groups: { level: ExperimentLevel; label: string; icon: string; items: ExperimentDefinition[] }[] = [];
  for (const level of levelOrder) {
    const items = allExperiments.value.filter((e) => e.level === level);
    if (items.length === 0) continue;
    const lbl = levelLabels[level];
    const label = locale.value === 'ar' ? lbl.ar : locale.value === 'es' ? lbl.es : lbl.en;
    groups.push({ level, label, icon: lbl.icon, items });
  }
  return groups;
});

function onSelect(exp: ExperimentDefinition) {
  emit('select', exp);
}
function onClose() {
  emit('close');
}
</script>

<template>
  <div class="modal-overlay" @click.self="onClose">
    <div class="modal-panel">
      <div class="modal-header">
        <h3>🔬 {{ t('chemistryLab.chooseExperiment') }}</h3>
        <button class="close-btn" @click="onClose">✕</button>
      </div>
      <div class="experiments-scroll">
        <div class="free-play-card" @click="onClose">
          <div class="exp-icon">🔬</div>
          <div class="exp-name">{{ t('chemistryLab.freePlay') }}</div>
          <div class="exp-desc">{{ t('chemistryLab.freePlayDesc') }}</div>
        </div>
        <div v-for="group in groupedExperiments" :key="group.level" class="level-group">
          <div class="level-header">
            <span class="level-icon">{{ group.icon }}</span>
            <span class="level-label">{{ group.label }}</span>
            <span class="level-count">{{ group.items.length }}</span>
          </div>
          <div class="experiments-grid">
            <div
              v-for="exp in group.items"
              :key="exp.id"
              class="exp-card"
              @click="onSelect(exp)"
            >
              <div class="exp-icon">{{ exp.icon }}</div>
              <div class="exp-name">{{ t(exp.nameKey) }}</div>
              <div class="exp-desc">{{ t(exp.descKey) }}</div>
              <div class="exp-steps-count">{{ exp.steps.length }} {{ t('chemistryLab.steps') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal-panel {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  width: 520px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #334155;
}
.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { background: #e2e8f0; }
.experiments-scroll {
  padding: 1.25rem;
  overflow-y: auto;
}
.free-play-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 2px solid #93c5fd;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.free-play-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 16px rgba(59,130,246,0.2);
  transform: translateY(-2px);
}
.level-group {
  margin-bottom: 1.5rem;
}
.level-group:last-child {
  margin-bottom: 0;
}
.level-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}
.level-icon {
  font-size: 1.2rem;
}
.level-label {
  font-size: 0.9rem;
  font-weight: 800;
  color: #1e293b;
}
.level-count {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.15rem 0.45rem;
  border-radius: 0.3rem;
}
.experiments-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.exp-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.exp-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 16px rgba(16,185,129,0.12);
  transform: translateY(-2px);
}
.exp-icon { font-size: 2rem; line-height: 1; }
.exp-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.exp-desc { font-size: 0.72rem; color: #64748b; line-height: 1.5; }
.exp-steps-count {
  font-size: 0.65rem;
  color: #10b981;
  font-weight: 700;
  background: #ecfdf5;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  align-self: flex-start;
}
</style>
