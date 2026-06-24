<script setup lang="ts">
import type { Experiment } from '../../../composables/chemistry/useExperiments';

const props = defineProps<{
  experiment: Experiment | null;
  stepCompletion: boolean[];
}>();

const emit = defineEmits<{
  clear: [];
}>();
</script>

<template>
  <div class="right-exp-panel">
    <div v-if="experiment" class="right-exp-content">
      <div class="right-exp-header">
        <span class="right-exp-title">📋 {{ experiment.nameAr }}</span>
        <button class="right-exp-reset" @click="emit('clear')">❌</button>
      </div>
      <ol class="right-exp-list">
        <li
          v-for="(step, idx) in experiment.steps"
          :key="step.id"
          :class="[
            'right-exp-step',
            { completed: stepCompletion[idx] },
            { active: !stepCompletion[idx] && (idx === 0 || stepCompletion[idx - 1]) }
          ]"
        >
          <span class="right-exp-num">
            <span v-if="stepCompletion[idx]">✓</span>
            <span v-else>{{ step.id }}</span>
          </span>
          <span class="right-exp-text">{{ step.text }}</span>
        </li>
      </ol>
    </div>
    <div v-else class="right-exp-empty">
      <span class="right-exp-empty-icon">📋</span>
      <span>لم تختر تجربة</span>
      <span class="right-exp-empty-hint">اضغط "اختر تجربة" أعلاه</span>
    </div>
  </div>
</template>

<style scoped>
.right-exp-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
}
.right-exp-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.right-exp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.5rem;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #a7f3d0;
  border-radius: 0.4rem;
}
.right-exp-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #065f46;
}
.right-exp-reset {
  background: #fff;
  border: 1px solid #6ee7b7;
  border-radius: 0.3rem;
  padding: 0.05rem 0.3rem;
  font-size: 0.6rem;
  cursor: pointer;
  color: #065f46;
}
.right-exp-list {
  margin: 0;
  padding-right: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.right-exp-step {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.15s;
}
.right-exp-step.active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  font-weight: 600;
}
.right-exp-step.completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}
.right-exp-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.05rem;
}
.right-exp-step.completed .right-exp-num {
  background: #22c55e;
  color: #fff;
}
.right-exp-text {
  flex: 1;
  line-height: 1.4;
}
.right-exp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 1.5rem 0;
  color: #94a3b8;
  font-size: 0.8rem;
}
.right-exp-empty-icon { font-size: 2rem; }
.right-exp-empty-hint {
  font-size: 0.7rem;
  color: #cbd5e1;
}
</style>
