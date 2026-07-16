import { setActivePinia, createPinia } from 'pinia';
import { useI18n } from '../useI18n';
import { useBiologyHotspots } from './useBiologyHotspots';
import type { Organelle3D } from '../../types/biology.types';

const mockOrganelles: Organelle3D[] = [
  {
    id: 'nucleus',
    nameKey: 'biology.organelle.nucleus.name',
    descriptionKey: 'biology.organelle.nucleus.description',
    geometry: 'sphere',
    size: 1,
    position: [0, 0, 0],
    color: '#a855f7',
    opacity: 1,
    explodeVector: [0, 0, 0],
    hotspotPosition: [0, 1, 0],
  },
  {
    id: 'cytoplasm',
    nameKey: 'biology.organelle.cytoplasm.name',
    descriptionKey: 'biology.organelle.cytoplasm.description',
    geometry: 'sphere',
    size: 1,
    position: [0, 0, 0],
    color: '#1d4ed8',
    opacity: 0.5,
    explodeVector: [0, 0, 0],
    hotspotPosition: [0, 0, 0],
    selectable: false,
  },
];

describe('useBiologyHotspots', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    const { bootstrap } = useI18n();
    await bootstrap();
  });

  it('filters out non-selectable organelles', () => {
    const { hotspots } = useBiologyHotspots(mockOrganelles);
    expect(hotspots.value.length).toBe(1);
    expect(hotspots.value[0].organelleId).toBe('nucleus');
  });

  it('selects and deselects an organelle', () => {
    const { selectedId, selectedHotspot, select } = useBiologyHotspots(mockOrganelles);

    expect(selectedId.value).toBeNull();
    expect(selectedHotspot.value).toBeNull();

    select('nucleus');
    expect(selectedId.value).toBe('nucleus');
    expect(selectedHotspot.value?.organelleId).toBe('nucleus');

    select(null);
    expect(selectedId.value).toBeNull();
    expect(selectedHotspot.value).toBeNull();
  });
});
