import { handleDropMix, type MixEvent } from './useReactionEngine';
import { getLiquid } from './useChemistryLab';
import { recordTitrationStep } from './useTitrationRecorder';

export function handleDropMixWithRecording(event: MixEvent): void {
  const beforePh = getLiquid(event.targetUid)?.ph ?? null;
  handleDropMix(event);
  const after = getLiquid(event.targetUid);
  if (after && after.ph !== null && after.ph !== undefined && beforePh !== after.ph) {
    const totalAdded = Object.values(after.reactants || {}).reduce((a, b) => a + b, 0);
    recordTitrationStep(event.targetUid, totalAdded);
  }
}
