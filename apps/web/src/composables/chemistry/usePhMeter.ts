import type { LabItem } from './useChemistryTools';
import { items, isContainer, getLiquid, phProbeTipMap } from './useChemistryLab';

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
    const dx = Math.abs((i.x + 40) - tip.x);
    const dy = Math.abs((i.y + 10) - tip.y);
    return dx < 60 && dy < 50;
  });
  if (!target) return null;
  const label = getLiquid(target.uid).label;
  if (label.includes('HCl') || label.includes('حمض') || label.includes('acid')) return 1.5 + Math.random() * 0.5;
  if (label.includes('NaOH') || label.includes('قاعدة') || label.includes('base') || label.includes('هيدروكسيد')) return 12.5 + Math.random() * 0.5;
  if (label.includes('ماء') || label.includes('water') || label.includes('H₂O')) return 7.0;
  if (label.includes(' buffer') || label.includes('بفر')) return 7.0;
  return 7.0;
}
