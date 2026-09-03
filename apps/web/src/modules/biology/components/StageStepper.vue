<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface StageStep {
  id: string;
  label: string;
  description?: string;
}

const props = defineProps<{
  stages: StageStep[];
  modelValue: number;
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', index: number): void;
}>();

const selectStage = (index: number): void => {
  emit('update:modelValue', index);
};

const handleKeydown = (event: KeyboardEvent, index: number): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectStage(index);
  }
};
</script>

<template>
  <nav class="stage-stepper" :aria-label="ariaLabel">
    <ol class="stage-stepper-list">
      <li
        v-for="(stage, index) in props.stages"
        :key="stage.id"
        class="stage-step"
        :class="{
          completed: index < props.modelValue,
          active: index === props.modelValue,
          pending: index > props.modelValue,
        }"
      >
        <button
          type="button"
          class="stage-step-button"
          :aria-current="index === props.modelValue ? 'step' : undefined"
          :aria-label="stage.label"
          @click="selectStage(index)"
          @keydown="handleKeydown($event, index)"
        >
          <span class="stage-step-marker">
            <span v-if="index < props.modelValue" class="stage-check" aria-hidden="true">&#10003;</span>
            <span v-else class="stage-number" aria-hidden="true">{{ index + 1 }}</span>
          </span>
          <span class="stage-step-content">
            <span class="stage-step-label">{{ stage.label }}</span>
            <span v-if="stage.description" class="stage-step-description">{{ stage.description }}</span>
          </span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.stage-stepper {
  width: 100%;
}

.stage-stepper-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.stage-step {
  position: relative;
  display: flex;
  align-items: flex-start;
}

.stage-step::before {
  content: '';
  position: absolute;
  inset-inline-start: 16px;
  top: 36px;
  width: 2px;
  height: calc(100% - 24px);
  background: #334155;
  border-radius: 1px;
}

.stage-step:last-child::before {
  display: none;
}

.stage-step.completed::before {
  background: linear-gradient(to bottom, #22c55e, #4ade80);
}

.stage-step-button {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.5rem 0.25rem;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  text-align: start;
  border-radius: 0.75rem;
  transition: background 0.2s ease;
}

.stage-step-button:hover {
  background: rgba(255, 255, 255, 0.04);
}

.stage-step-button:focus-visible {
  outline: 2px solid #4ade80;
  outline-offset: 2px;
}

.stage-step-marker {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid #475569;
  background: #0f172a;
  color: #94a3b8;
  transition: all 0.25s ease;
}

.stage-check {
  font-size: 1rem;
  line-height: 1;
}

.stage-step-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding-top: 0.25rem;
}

.stage-step-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
  transition: color 0.2s ease;
}

.stage-step-description {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.3;
}

/* Completed */
.stage-step.completed .stage-step-marker {
  background: #22c55e;
  border-color: #22c55e;
  color: #0f172a;
}

.stage-step.completed .stage-step-label {
  color: #4ade80;
}

/* Active */
.stage-step.active .stage-step-marker {
  background: #4ade80;
  border-color: #4ade80;
  color: #0f172a;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.2), 0 0 18px rgba(74, 222, 128, 0.35);
  transform: scale(1.1);
}

.stage-step.active .stage-step-label {
  color: #4ade80;
}

/* Pending */
.stage-step.pending .stage-step-marker {
  background: #0f172a;
  border-color: #475569;
  color: #64748b;
}

.stage-step.pending .stage-step-label {
  color: #94a3b8;
}
</style>