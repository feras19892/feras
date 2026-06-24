import type { LabItem } from './useChemistryTools';
import { items, isContainer, getLiquid, balanceTareMap, containerTareMap } from './useChemistryLab';

export function computeBalanceWeight(balance: LabItem): number {
  const onTop = items.value.filter((i: LabItem) =>
    i.uid !== balance.uid && Math.abs(i.x - balance.x) < 80 && i.y < balance.y + 50 && i.y > balance.y - 300
  );
  let total = 0;
  for (const item of onTop) {
    total += 5; // container weight
    if (isContainer(item.id)) {
      total += getLiquid(item.uid).volume; // liquid volume ≈ weight in grams
    }
  }
  return total;
}

export function getContainerWeight(balance: LabItem): number {
  const onTop = items.value.filter((i: LabItem) =>
    i.uid !== balance.uid && Math.abs(i.x - balance.x) < 80 && i.y < balance.y + 50 && i.y > balance.y - 300
  );
  return onTop.length * 5;
}

export function getBalanceReading(uid: string): number | null {
  const balance = items.value.find((i: LabItem) => i.uid === uid && i.id === 'digital-balance');
  if (!balance) return null;
  const gross = computeBalanceWeight(balance);
  const fullTare = balanceTareMap[uid] || 0;
  const containerTare = containerTareMap[uid] || 0;
  const effectiveTare = containerTare > 0 ? containerTare : fullTare;
  return +(gross - effectiveTare).toFixed(2);
}
