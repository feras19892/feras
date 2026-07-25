import { ref, computed } from 'vue';
import * as THREE from 'three';
import type { Organelle3D, HotspotState } from '../../types/biology.types';
import { useI18n } from '../useI18n';

export function useBiologyHotspots(organelles: Organelle3D[]) {
  const { t } = useI18n();
  const selectedId = ref<string | null>(null);

  const hotspots = computed<HotspotState[]>(() =>
    organelles
      .filter((organelle) => organelle.selectable !== false)
      .map((organelle) => ({
        partId: organelle.id,
        label: t(organelle.nameKey),
        description: t(organelle.descriptionKey),
        longDescription: organelle.longDescriptionKey ? t(organelle.longDescriptionKey) : undefined,
        facts: organelle.factsKeys?.map((key) => t(key)),
        position: new THREE.Vector3(...organelle.hotspotPosition),
      }))
  );

  const selectedHotspot = computed<HotspotState | null>(() => {
    if (!selectedId.value) return null;
    return hotspots.value.find((h) => h.partId === selectedId.value) ?? null;
  });

  const select = (id: string | null): void => {
    selectedId.value = id;
  };

  return {
    selectedId,
    hotspots,
    selectedHotspot,
    select,
  };
}
