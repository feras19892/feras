import type { LabItem } from './useChemistryTools';
import {
  isBurette, isPipette, isSeparatoryFunnel, isContainer
} from './chemLabIds';
import { getLiquid, getBurette, getPipette, getSepFunnelState } from './useChemistryLab';

export function buildToolState(item: LabItem | null) {
  if (!item) return null;
  if (isContainer(item.id)) {
    const liq = getLiquid(item.uid);
    return { uid: item.uid, type: 'beaker' as const, volume: liq.volume, maxVolume: liq.maxVolume, color: liq.color, opacity: liq.opacity, label: liq.label, stirred: liq.stirred, temperature: liq.temperature, ph: liq.ph ?? undefined, heated: liq.heated, viscosity: liq.viscosity, density: liq.density, surfaceTension: liq.surfaceTension, chemicalId: liq.chemicalId, indicators: liq.indicators, baseColor: liq.baseColor };
  }
  if (isBurette(item.id)) {
    const bur = getBurette(item.uid);
    return { uid: item.uid, type: 'burette' as const, volume: bur.volume, maxVolume: bur.maxVolume, valveOpen: bur.valveOpen, color: bur.color, opacity: bur.opacity, chemicalId: bur.chemicalId };
  }
  if (isPipette(item.id)) {
    const pip = getPipette(item.uid);
    return { uid: item.uid, type: 'pipette' as const, volume: pip.volume, maxVolume: pip.maxVolume, color: pip.color };
  }
  if (isSeparatoryFunnel(item.id)) {
    const liq = getLiquid(item.uid);
    const sep = getSepFunnelState(item.uid);
    return { uid: item.uid, type: 'beaker' as const, volume: liq.volume, maxVolume: liq.maxVolume, color: liq.color, label: liq.label, valveOpen: sep.valveOpen };
  }
  return { uid: item.uid, type: 'other' as const, volume: 0, maxVolume: 0, color: '#94a3b8' };
}
