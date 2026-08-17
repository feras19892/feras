import { handleDropMix, type MixEvent } from './useReactionEngine';
import { getLiquid, items, buretteTotalConsumedMap, buretteConsumedThisRefill } from './useChemistryLab';
import { isBurette } from './chemLabIds';
import { recordTitrationStep } from './useTitrationRecorder';

export function handleDropMixWithRecording(event: MixEvent): void {
  const beforePh = getLiquid(event.targetUid)?.ph ?? null;
  handleDropMix(event);
  const after = getLiquid(event.targetUid);
  if (after && after.ph !== null && after.ph !== undefined && beforePh !== after.ph) {
    let vAdded = 0;
    for (const item of items.value) {
      if (isBurette(item.id) && item.uid === event.sourceUid) {
        vAdded = (buretteTotalConsumedMap[item.uid] || 0) + (buretteConsumedThisRefill[item.uid] || 0);
        break;
      }
    }
    if (vAdded === 0) vAdded = after.reactants?.[event.sourceChemicalId] || 0;
    recordTitrationStep(event.targetUid, vAdded);
  }
}
