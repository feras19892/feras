import {
  items, liquidMap, buretteMap, receivingMap,
  buretteConsumedThisRefill,
  getLiquid, isContainer, isBurette
} from './useChemistryLab';
import { applyIndicator } from './useReactionEngine';
import { handleDropMix } from './useReactionEngine';
import { pushHistory } from './useChemistryHistory';
import type { LabItem } from './useChemistryTools';
import type { ToolState } from './chemLabTypes';

export function handleDropExited(
  sourceItem: LabItem,
  wx: number,
  wy: number,
  color: string,
  selectedItemRef: { value: LabItem | null },
  emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void,
  buildToolState: (item: LabItem | null) => ToolState | null
): void {
  const candidates = items.value.filter((i: LabItem) => {
    if (i.uid === sourceItem.uid) return false;
    if (!isContainer(i.id)) return false;
    return Math.abs(wx - (i.x + 70)) < 65 && wy >= i.y - 20 && wy <= i.y + 120;
  });
  let target: LabItem | undefined;
  if (candidates.length > 0) {
    target = candidates.reduce((best, current) => {
      const bestDx = wx - (best.x + 70);
      const bestDy = wy - (best.y + 50);
      const bestDist = bestDx * bestDx + bestDy * bestDy;
      const currDx = wx - (current.x + 70);
      const currDy = wy - (current.y + 50);
      const currDist = currDx * currDx + currDy * currDy;
      return currDist < bestDist ? current : best;
    });
  }
  if (!target) return;
  const tLiq = getLiquid(target.uid);
  if (tLiq.volume >= tLiq.maxVolume) return;

  pushHistory();
  const amount = 0.15;
  tLiq.volume = Math.min(tLiq.maxVolume, +(tLiq.volume + amount).toFixed(1));

  const sLiq = liquidMap[sourceItem.uid];
  const sBur = buretteMap[sourceItem.uid];
  const sourceChemicalId = sLiq?.chemicalId || sBur?.chemicalId || sLiq?.indicators?.[0] || undefined;

  const indicatorIds = new Set(['phenolphthalein', 'methyl-orange', 'bromothymol-blue', 'universal-indicator', 'starch']);
  const isIndicatorId = (id: string) => indicatorIds.has(id);

  if (sourceChemicalId && tLiq.chemicalId) {
    if (isIndicatorId(sourceChemicalId)) {
      if (!tLiq.indicators) tLiq.indicators = [];
      if (!tLiq.indicators.includes(sourceChemicalId)) {
        tLiq.indicators.push(sourceChemicalId);
        applyIndicator(sourceChemicalId, target.uid);
      }
      if (!tLiq.label.includes(sourceChemicalId)) {
        tLiq.label = tLiq.label + ' + ' + sourceChemicalId;
      }
    } else {
      handleDropMix({
        sourceUid: sourceItem.uid,
        targetUid: target.uid,
        sourceChemicalId,
        targetChemicalId: tLiq.chemicalId,
        dropVolume: amount,
      });
    }
  } else if (sourceChemicalId) {
    tLiq.chemicalId = sourceChemicalId;
  }

  if (!tLiq.chemicalId) {
    tLiq.color = color;
  }

  if (isBurette(sourceItem.id)) {
    const consumed = buretteConsumedThisRefill[sourceItem.uid] || 0;
    buretteConsumedThisRefill[sourceItem.uid] = consumed + amount;
  }

  receivingMap[target.uid] = true;
  setTimeout(() => { receivingMap[target.uid] = false; }, 400);
  if (selectedItemRef.value?.uid === target.uid) emit('select', target, buildToolState(target));
}
