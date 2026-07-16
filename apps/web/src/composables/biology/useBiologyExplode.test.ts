import { vi } from 'vitest';
import { useBiologyExplode } from './useBiologyExplode';

describe('useBiologyExplode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts collapsed', () => {
    const { progress, isExploded } = useBiologyExplode();
    expect(progress.value).toBe(0);
    expect(isExploded.value).toBe(false);
  });

  it('toggles to exploded and back', () => {
    const { progress, isExploded, toggle } = useBiologyExplode();

    toggle();
    vi.runAllTimers();
    expect(progress.value).toBe(1);
    expect(isExploded.value).toBe(true);

    toggle();
    vi.runAllTimers();
    expect(progress.value).toBe(0);
    expect(isExploded.value).toBe(false);
  });

  it('resets to collapsed immediately', () => {
    const { progress, isExploded, toggle, reset } = useBiologyExplode();

    toggle();
    vi.runAllTimers();
    expect(progress.value).toBe(1);

    reset();
    expect(progress.value).toBe(0);
    expect(isExploded.value).toBe(false);
  });
});
