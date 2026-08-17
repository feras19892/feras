import type { LabItem } from './useChemistryTools';
import { items, isContainer, getLiquid, balanceTareMap, containerTareMap, solidMap } from './useChemistryLab';
import { isBalance, isBeaker, isTestTube, isErlenmeyer, isVolumetricFlask } from './chemLabIds';

function containerWeight(item: LabItem): number {
  if (isBeaker(item.id)) return 30;
  if (isTestTube(item.id)) return 8;
  if (isErlenmeyer(item.id)) return 25;
  if (isVolumetricFlask(item.id)) return 20;
  return 15;
}

export function computeBalanceWeight(balance: LabItem): number {
  const onTop = items.value.filter((i: LabItem) =>
    i.uid !== balance.uid && Math.abs(i.x - balance.x) < 80 && i.y < balance.y + 50 && i.y > balance.y - 300
  );
  let total = 0;
  for (const item of onTop) {
    total += containerWeight(item);
    if (isContainer(item.id)) {
      total += getLiquid(item.uid).volume;
      const solid = solidMap[item.uid];
      if (solid) total += solid.amount;
    }
  }
  return total;
}

export function getContainerWeight(balance: LabItem): number {
  const onTop = items.value.filter((i: LabItem) =>
    i.uid !== balance.uid && Math.abs(i.x - balance.x) < 80 && i.y < balance.y + 50 && i.y > balance.y - 300
  );
  return onTop.reduce((sum, item) => sum + containerWeight(item), 0);
}

export function getBalanceReading(uid: string): number | null {
  const balance = items.value.find((i: LabItem) => i.uid === uid && isBalance(i.id));
  if (!balance) return null;
  const gross = computeBalanceWeight(balance);
  const fullTare = balanceTareMap[uid] || 0;
  const containerTare = containerTareMap[uid] || 0;
  const effectiveTare = containerTare > 0 ? containerTare : fullTare;
  return +(gross - effectiveTare).toFixed(2);
}
