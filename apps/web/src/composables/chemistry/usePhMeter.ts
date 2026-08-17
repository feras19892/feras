import type { LabItem } from './useChemistryTools';
import { items, isContainer, getLiquid, phProbeTipMap } from './useChemistryLab';
import { getContainerHalfWidth } from './chemLabIds';

export function phColor(ph: number | null): string {
  if (ph === null) return '#94a3b8';
  if (ph < 3) return '#ef4444';
  if (ph < 7) return '#f59e0b';
  if (ph === 7) return '#22c55e';
  if (ph < 11) return '#3b82f6';
  return '#8b5cf6';
}

export function getPhReading(phMeter: LabItem): number | null {
  const tip = phProbeTipMap[phMeter.uid];
  if (!tip) return null;
  const target = items.value.find((i: LabItem) => {
    if (i.uid === phMeter.uid || !isContainer(i.id)) return false;
    const cx = i.x + getContainerHalfWidth(i.id);
    const dx = Math.abs(cx - tip.x);
    const dy = Math.abs((i.y + 10) - tip.y);
    return dx < 60 && dy < 50;
  });
  if (!target) return null;
  const liq = getLiquid(target.uid);
  if (liq.ph !== null && liq.ph !== undefined) return liq.ph;
  return 7.0;
}
