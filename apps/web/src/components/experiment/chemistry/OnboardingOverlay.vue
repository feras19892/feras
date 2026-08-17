<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../../../composables/useI18n';
const { t } = useI18n();

const STORAGE_KEY = 'chem-lab-onboarding-v1';
const visible = ref(!localStorage.getItem(STORAGE_KEY));
const step = ref(0);

const steps = computed(() => [
  { icon: '👋', title: t('chemistryLab.onboardingWelcomeTitle'), desc: t('chemistryLab.onboardingWelcomeDesc') },
  { icon: '🧪', title: t('chemistryLab.onboardingToolsTitle'), desc: t('chemistryLab.onboardingToolsDesc') },
  { icon: '⚗️', title: t('chemistryLab.onboardingChemicalsTitle'), desc: t('chemistryLab.onboardingChemicalsDesc') },
  { icon: '📋', title: t('chemistryLab.onboardingExperimentTitle'), desc: t('chemistryLab.onboardingExperimentDesc') },
  { icon: '🔬', title: t('chemistryLab.onboardingSimulateTitle'), desc: t('chemistryLab.onboardingSimulateDesc') },
]);

const total = computed(() => steps.value.length);
const isLast = computed(() => step.value === total.value - 1);

function next() {
  if (isLast.value) dismiss();
  else step.value++;
}
function skip() { dismiss(); }
function dismiss() {
  localStorage.setItem(STORAGE_KEY, '1');
  visible.value = false;
}
</script>

<template>
  <div v-if="visible" class="onboarding-overlay">
    <div class="onboarding-card">
      <button class="skip-btn" @click="skip">{{ t('chemistryLab.onboardingSkip') }}</button>
      <div class="onboarding-icon">{{ steps[step].icon }}</div>
      <h3>{{ steps[step].title }}</h3>
      <p>{{ steps[step].desc }}</p>
      <div class="onboarding-dots">
        <span
          v-for="i in total"
          :key="i"
          :class="['dot', { active: i - 1 === step }]"
        />
      </div>
      <div class="onboarding-actions">
        <button v-if="step > 0" class="back-btn" @click="step--">{{ t('chemistryLab.onboardingBack') }}</button>
        <button class="next-btn" @click="next">
          {{ isLast ? t('chemistryLab.onboardingStart') : t('chemistryLab.onboardingNext') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.onboarding-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  padding: 2rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  position: relative;
  animation: cardIn 0.35s ease;
}
@keyframes cardIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.skip-btn {
  position: absolute;
  top: 0.75rem;
  inset-inline-end: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.72rem;
  cursor: pointer;
  font-family: inherit;
  padding: 0.25rem 0.5rem;
}
.skip-btn:hover { color: #64748b; }
.onboarding-icon {
  font-size: 3rem;
  line-height: 1;
  animation: bounce 1.5s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.onboarding-card h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
}
.onboarding-card p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
  max-width: 320px;
}
.onboarding-dots {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.25rem;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.2s;
}
.dot.active {
  background: #10b981;
  width: 24px;
  border-radius: 4px;
}
.onboarding-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.back-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
}
.next-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.next-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
</style>
