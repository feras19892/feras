<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { useBiology3D } from '../../../composables/biology/useBiology3D';
import type { Organelle3D } from '../../../types/biology.types';
import HotspotMarker from './HotspotMarker.vue';

const props = defineProps<{
  organelles: Organelle3D[];
  markerLabels: Record<string, string>;
  explodeProgress: number;
  selectedOrganelleId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', id: string | null): void;
}>();

interface MarkerPosition {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

const containerRef = ref<HTMLDivElement | null>(null);
const markers = ref<MarkerPosition[]>([]);
let rafId = 0;
let dragStartX = 0;
let dragStartY = 0;
let dragDistance = 0;
const DRAG_THRESHOLD = 5;

const {
  setExplodeProgress,
  highlightOrganelle,
  pickOrganelle,
  projectToScreen,
  getOrganelleWorldPosition,
  focusOn,
  resetCamera,
  resize,
} = useBiology3D(containerRef, props.organelles);

defineExpose({
  focusOn,
  resetCamera,
  getOrganelleWorldPosition,
  resize,
});

watch(
  () => props.explodeProgress,
  (progress) => setExplodeProgress(progress),
  { immediate: true }
);

watch(
  () => props.selectedOrganelleId,
  (id) => highlightOrganelle(id),
  { immediate: true }
);

const updateMarkers = (): void => {
  markers.value = props.organelles
    .filter((organelle) => organelle.selectable !== false)
    .map((organelle) => {
      const worldPos = getOrganelleWorldPosition(organelle.id);
      const baseOffset = new THREE.Vector3(...organelle.hotspotPosition).sub(
        new THREE.Vector3(...organelle.position)
      );
      const pos = worldPos ? worldPos.clone().add(baseOffset) : new THREE.Vector3(...organelle.hotspotPosition);
      const screen = projectToScreen(pos);
      return {
        id: organelle.id,
        x: screen.x,
        y: screen.y,
        visible: screen.visible,
      };
    });
  rafId = requestAnimationFrame(updateMarkers);
};

watch(
  containerRef,
  (el) => {
    if (el) {
      cancelAnimationFrame(rafId);
      updateMarkers();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  cancelAnimationFrame(rafId);
});

const onPointerDown = (event: PointerEvent): void => {
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragDistance = 0;
};

const onPointerMove = (event: PointerEvent): void => {
  dragDistance = Math.max(
    dragDistance,
    Math.abs(event.clientX - dragStartX),
    Math.abs(event.clientY - dragStartY)
  );
};

const handleCanvasClick = (event: MouseEvent): void => {
  if ((event.target as HTMLElement).closest('.hotspot-marker')) return;
  if (dragDistance > DRAG_THRESHOLD) return;
  const id = pickOrganelle(event.clientX, event.clientY);
  emit('select', id);
};

const handleMarkerClick = (id: string): void => {
  emit('select', id);
};
</script>

<template>
  <div
    ref="containerRef"
    class="biology-canvas"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @click="handleCanvasClick"
  >
    <HotspotMarker
      v-for="marker in markers"
      :key="marker.id"
      :label="props.markerLabels[marker.id] ?? marker.id"
      :x="marker.x"
      :y="marker.y"
      :visible="marker.visible"
      :active="marker.id === selectedOrganelleId"
      @click="handleMarkerClick(marker.id)"
    />
  </div>
</template>

<style scoped>
.biology-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  cursor: grab;
  border-radius: 1rem;
  overflow: hidden;
}

.biology-canvas:active {
  cursor: grabbing;
}
</style>
