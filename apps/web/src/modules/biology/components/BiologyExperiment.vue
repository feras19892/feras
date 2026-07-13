<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../../composables/useI18n';
import { useBiologyHotspots } from '../../../composables/biology/useBiologyHotspots';
import { useBiologyExplode } from '../../../composables/biology/useBiologyExplode';
import type { BiologyExperiment as BiologyExperimentModel } from '../../../types/biology.types';
import Biology3DCanvas from './Biology3DCanvas.vue';
import InfoPanel from './InfoPanel.vue';
import OrganelleList from './OrganelleList.vue';

const props = defineProps<{
  experiment: BiologyExperimentModel;
  backRoute?: string;
}>();

const router = useRouter();
const { t } = useI18n();
const { hotspots, selectedHotspot, selectedId, select } = useBiologyHotspots(
  props.experiment.organelles
);
const { progress, isExploded, toggle, reset } = useBiologyExplode();
const canvasRef = ref<InstanceType<typeof Biology3DCanvas> | null>(null);

const markerLabels = computed(() =>
  Object.fromEntries(hotspots.value.map((h) => [h.organelleId, h.label]))
);

const goBack = (): void => {
  router.push(props.backRoute ?? '/biology');
};

const selectOrganelle = (id: string | null): void => {
  select(id);
};

const resetCamera = (): void => {
  canvasRef.value?.resetCamera();
};

watch(selectedId, (id) => {
  if (!id) {
    canvasRef.value?.resetCamera();
    return;
  }
  const worldPos = canvasRef.value?.getOrganelleWorldPosition(id);
  if (worldPos) {
    canvasRef.value?.focusOn(worldPos, 6);
  }
});
</script>

<template>
  <div class="experiment-page">
    <header class="experiment-header">
      <button class="back-button" @click="goBack">
        {{ t('biology.backToCellSection') }}
      </button>
      <h1 class="experiment-title">{{ t(experiment.titleKey) }}</h1>
      <p class="experiment-subtitle">{{ t(experiment.subtitleKey) }}</p>
    </header>

    <main class="experiment-body">
      <section class="canvas-section">
        <Biology3DCanvas
          ref="canvasRef"
          :organelles="experiment.organelles"
          :marker-labels="markerLabels"
          :explode-progress="progress"
          :selected-organelle-id="selectedId"
          @select="selectOrganelle"
        />
      </section>

      <section class="controls-section">
        <InfoPanel :hotspot="selectedHotspot">
          <template #empty>
            <p>{{ t('biology.selectOrganelleHint') }}</p>
          </template>
        </InfoPanel>

        <OrganelleList
          :organelles="hotspots"
          :selected-id="selectedId"
          @select="selectOrganelle"
        >
          <template #title>{{ t('biology.organelleListTitle') }}</template>
        </OrganelleList>

        <div class="action-bar">
          <button class="action-button" @click="toggle">
            {{ isExploded ? t('biology.collapseLabel') : t('biology.explodeLabel') }}
          </button>
          <button class="action-button secondary" @click="resetCamera">
            {{ t('biology.resetCameraLabel') }}
          </button>
          <button class="action-button secondary" @click="reset">
            {{ t('biology.resetLabel') }}
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.experiment-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

button {
  font-family: inherit;
}

.experiment-header {
  position: relative;
  text-align: center;
}

.back-button {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  background: transparent;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.back-button:hover {
  background: #1e293b;
}

.experiment-title {
  font-size: 2rem;
  margin: 0 0 0.25rem;
  color: #4ade80;
}

.experiment-subtitle {
  margin: 0;
  color: #94a3b8;
  font-size: 1rem;
}

.experiment-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
}

.canvas-section {
  min-height: 480px;
  border: 1px solid #334155;
  border-radius: 1rem;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.5);
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-bar {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  flex: 1;
  background: #22c55e;
  color: #0f172a;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
}

.action-button.secondary {
  background: transparent;
  color: #e2e8f0;
  border: 1px solid #475569;
}

.action-button:hover {
  filter: brightness(1.1);
}

@media (max-width: 900px) {
  .experiment-body {
    grid-template-columns: 1fr;
  }

  .controls-section {
    flex-direction: column-reverse;
  }
}
</style>
