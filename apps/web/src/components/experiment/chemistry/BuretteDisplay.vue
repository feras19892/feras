<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { BuretteWarning } from '../../../composables/chemistry/useLabSimulation';

const props = defineProps<{
  remaining: number;
  initial: number;
  totalConsumed: number;
  warning: BuretteWarning;
}>();
</script>

<template>
  <div class="burette-display">
    <div class="burette-display-inner">
      <div class="burette-row">
        <span class="burette-label">{{ t('chemistryLab.buretteRemaining') }}</span>
        <span class="burette-value">{{ remaining.toFixed(1) }} / {{ initial.toFixed(1) }} mL</span>
      </div>
      <div class="burette-row">
        <span class="burette-label">{{ t('chemistryLab.totalConsumed') }}</span>
        <span class="burette-value total">{{ totalConsumed.toFixed(2) }} mL</span>
      </div>
      <div v-if="warning" class="burette-row warning" :class="warning">
        <span class="burette-label">{{ t('chemistryLab.alert') }}</span>
        <span class="burette-value">
          {{ warning === 'approaching' ? t('chemistryLab.approachingEquivalence') : warning === 'equivalence' ? t('chemistryLab.equivalencePointReached') : t('chemistryLab.exceededEquivalence') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.burette-display {
  position: absolute;
  top: 0.5rem;
  left: calc(var(--left-width, 300px) + 1rem);
  z-index: 20;
}
.burette-display-inner {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.6rem 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 220px;
}
.burette-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}
.burette-label {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 600;
}
.burette-value {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
}
.burette-value.total {
  color: #2563eb;
}
.burette-row.warning.approaching {
  background: #fef3c7;
  border-radius: 0.35rem;
  padding: 0.2rem 0.4rem;
  margin-top: 0.2rem;
}
.burette-row.warning.approaching .burette-value {
  color: #d97706;
}
.burette-row.warning.equivalence {
  background: #d1fae5;
  border-radius: 0.35rem;
  padding: 0.2rem 0.4rem;
  margin-top: 0.2rem;
}
.burette-row.warning.equivalence .burette-value {
  color: #059669;
}
.burette-row.warning.exceeded {
  background: #fee2e2;
  border-radius: 0.35rem;
  padding: 0.2rem 0.4rem;
  margin-top: 0.2rem;
}
.burette-row.warning.exceeded .burette-value {
  color: #dc2626;
}
</style>
