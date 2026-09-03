<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
const props = defineProps<{

  xRayMode: boolean;
  insideView: boolean;
  crossSectionMode: boolean;
  crossSectionOffset: number;
}>();

const emit = defineEmits<{
  (e: 'toggleXRay'): void;
  (e: 'toggleInsideView'): void;
  (e: 'toggleCrossSection'): void;
  (e: 'resetCamera'): void;
  (e: 'resetAll'): void;
  (e: 'crossSectionInput', value: number): void;
}>();

const onCrossSectionInput = (event: Event): void => {
  const value = Number((event.target as HTMLInputElement).value);
  emit('crossSectionInput', value);
};
</script>

<template>
  <div class="controls-card">
    <h2 class="panel-title">{{ t('biology.controlsTitle') }}</h2>
    <div class="controls-grid">
      <button
        type="button"
        class="control-button"
        :class="{ active: xRayMode }"
        @click="emit('toggleXRay')"
      >
        {{ xRayMode ? t('biology.disableXray') : t('biology.enableXray') }}
      </button>
      <button
        type="button"
        class="control-button"
        :class="{ active: insideView }"
        @click="emit('toggleInsideView')"
      >
        {{ insideView ? t('biology.exitInsideView') : t('biology.insideView') }}
      </button>
      <button
        type="button"
        class="control-button"
        :class="{ active: crossSectionMode }"
        @click="emit('toggleCrossSection')"
      >
        {{ crossSectionMode ? t('biology.exitCrossSection') : t('biology.crossSection') }}
      </button>
      <button type="button" class="control-button" @click="emit('resetCamera')">
        {{ t('biology.resetCameraLabel') }}
      </button>
    </div>

    <div v-if="crossSectionMode" class="slider-group">
      <label for="cross-section-slider">{{ t('biology.crossSectionOffset') }}</label>
      <input
        id="cross-section-slider"
        type="range"
        min="-4"
        max="4"
        step="0.1"
        :value="crossSectionOffset"
        @input="onCrossSectionInput"
      />
    </div>

    <button type="button" class="control-button reset-all" @click="emit('resetAll')">
      {{ t('biology.resetAllLabel') }}
    </button>
  </div>
</template>

<style scoped>
.controls-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.panel-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  color: #e2e8f0;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.control-button {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #334155;
  color: #e2e8f0;
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.control-button:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: #475569;
}

.control-button.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: #4ade80;
  color: #4ade80;
}

.slider-group {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.slider-group input[type='range'] {
  width: 100%;
  accent-color: #4ade80;
}

.reset-all {
  width: 100%;
  margin-top: 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #fca5a5;
}

.reset-all:hover {
  background: rgba(239, 68, 68, 0.25);
}
</style>