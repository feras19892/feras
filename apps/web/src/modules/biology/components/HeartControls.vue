<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';

const props = defineProps<{
  xRayMode: boolean;
  crossSectionMode: boolean;
  crossSectionOffset: number;
  heartbeatEnabled: boolean;
  autoRotate: boolean;
  insideView: boolean;
  explodeFactor: number;
  bloodFlowEnabled: boolean;
  isExploded: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleXRay'): void;
  (e: 'toggleCrossSection'): void;
  (e: 'setCrossSectionOffset', value: number): void;
  (e: 'resetCamera'): void;
  (e: 'toggleHeartbeat'): void;
  (e: 'toggleAutoRotate'): void;
  (e: 'toggleInsideView'): void;
  (e: 'setExplodeFactor', value: number): void;
  (e: 'toggleBloodFlow'): void;
  (e: 'resetAll'): void;
}>();

const { t } = useI18n();

const onSliderInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('setCrossSectionOffset', Number(target.value));
};

const onExplodeInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('setExplodeFactor', Number(target.value));
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
        {{ xRayMode ? t('biology.exitXRay') : t('biology.xRayMode') }}
      </button>
      <button
        type="button"
        class="control-button"
        :class="{ active: crossSectionMode }"
        @click="emit('toggleCrossSection')"
      >
        {{ crossSectionMode ? t('biology.exitCrossSection') : t('biology.crossSection') }}
      </button>
      <button
        type="button"
        class="control-button"
        :class="{ active: autoRotate }"
        @click="emit('toggleAutoRotate')"
      >
        {{ autoRotate ? t('biology.stopAutoRotate') : t('biology.autoRotate') }}
      </button>
      <button
        type="button"
        class="control-button"
        :class="{ active: heartbeatEnabled }"
        @click="emit('toggleHeartbeat')"
      >
        {{ heartbeatEnabled ? t('biology.disableHeartbeat') : t('biology.enableHeartbeat') }}
      </button>
      <button type="button" class="control-button" @click="emit('resetCamera')">
        {{ t('biology.resetCameraLabel') }}
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
        :class="{ active: bloodFlowEnabled, disabled: isExploded }"
        :disabled="isExploded"
        @click="emit('toggleBloodFlow')"
      >
        {{ bloodFlowEnabled ? t('biology.hideBloodFlow') : t('biology.showBloodFlow') }}
      </button>
    </div>

    <div v-if="crossSectionMode" class="slider-group">
      <label for="cross-section-slider">{{ t('biology.crossSectionOffset') }}</label>
      <input
        id="cross-section-slider"
        type="range"
        min="-3"
        max="3"
        step="0.05"
        :value="crossSectionOffset"
        @input="onSliderInput"
      />
    </div>

    <div class="slider-group">
      <label for="explode-slider">{{ t('biology.explodeLabel') }}</label>
      <input
        id="explode-slider"
        type="range"
        min="0"
        max="1.5"
        step="0.05"
        :value="explodeFactor"
        @input="onExplodeInput"
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

.control-button:disabled,
.control-button.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.slider-group {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.slider-group label {
  font-size: 0.85rem;
  color: #94a3b8;
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
