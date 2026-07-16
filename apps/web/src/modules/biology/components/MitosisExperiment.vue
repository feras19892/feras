<script setup lang="ts">
import { computed, ref } from 'vue';
import * as THREE from 'three';
import { useI18n } from '../../../composables/useI18n';
import { useMitosis3D } from '../../../composables/biology/useMitosis3D';
import { mitosisExperiment, mitosisStages } from '../../../services/mitosis-data';
import type { HotspotState } from '../../../types/biology.types';
import InfoPanel from './InfoPanel.vue';
import StageExperimentLayout from './StageExperimentLayout.vue';
import StageStepper from './StageStepper.vue';

const { t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);
const { currentStageIndex, setStage, error } = useMitosis3D(containerRef);

const stage = computed(() => mitosisStages[currentStageIndex.value]);

const stageHotspot = computed<HotspotState>(() => ({
  organelleId: stage.value.id,
  label: t(stage.value.titleKey),
  description: t(stage.value.descriptionKey),
  longDescription: t(stage.value.longDescriptionKey),
  facts: stage.value.factsKeys.map((key) => t(key)),
  position: new THREE.Vector3(0, 0, 0),
}));

const stageItems = computed(() =>
  mitosisStages.map((s) => ({
    id: s.id,
    label: t(s.titleKey),
    description: t(s.descriptionKey),
  }))
);

const nextStage = (): void => {
  setStage(currentStageIndex.value + 1);
};

const previousStage = (): void => {
  setStage(currentStageIndex.value - 1);
};

const isFirstStage = computed(() => currentStageIndex.value === 0);
const isLastStage = computed(() => currentStageIndex.value === mitosisStages.length - 1);
</script>

<template>
  <StageExperimentLayout
    :title-key="mitosisExperiment.titleKey"
    :subtitle-key="mitosisExperiment.subtitleKey"
    back-route="/biology/cell"
  >
    <template #canvas>
      <div ref="containerRef" class="mitosis-canvas" />
      <div v-if="error" class="webgl-error" role="alert">
        {{ error }}
      </div>
    </template>

    <template #info>
      <InfoPanel :hotspot="stageHotspot">
        <template #empty>
          <p>{{ t('biology.selectOrganelleHint') }}</p>
        </template>
      </InfoPanel>
    </template>

    <template #stages>
      <div class="stage-panel">
        <h3 class="stage-title">{{ t('biology.mitosisStageLabel') }}</h3>
        <StageStepper
          :model-value="currentStageIndex"
          :stages="stageItems"
          :aria-label="t('biology.mitosisStageLabel')"
          @update:model-value="setStage"
        />
      </div>
    </template>

    <template #actions>
      <button
        class="action-button secondary"
        :disabled="isFirstStage"
        @click="previousStage"
      >
        {{ t('biology.previousStage') }}
      </button>
      <button
        class="action-button secondary"
        :disabled="isLastStage"
        @click="nextStage"
      >
        {{ t('biology.nextStage') }}
      </button>
    </template>
  </StageExperimentLayout>
</template>

<style scoped>
.mitosis-canvas {
  width: 100%;
  height: 100%;
  min-height: 480px;
  cursor: grab;
}

.mitosis-canvas:active {
  cursor: grabbing;
}
</style>
