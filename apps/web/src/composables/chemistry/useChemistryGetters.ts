import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from '@my-modern-app/chemistry-engine';
import {
  liquidMap, buretteMap, pipetteMap, sepFunnelMap,
  burnerMap, balanceTareMap, containerTareMap, itemZoomMap,
  beakerClampMap, hotPlateMap, woodenBaseMap, retortStandMap,
} from './useChemistryLab';
import type {
  BeakerClampState, HotPlateState, WoodenBaseState, RetortStandState,
} from './useChemistryLab';

export function getLiquid(uid: string): LiquidState {
  if (!liquidMap[uid]) {
    liquidMap[uid] = { volume: 0, maxVolume: 250, color: '#3b82f6', opacity: 0.3, label: 'water', stirred: 0, temperature: 25, ph: null, heated: false, viscosity: 0.05, density: 1.0, surfaceTension: 0.3, chemicalId: undefined, indicators: [], baseColor: '#3b82f6' };
  }
  return liquidMap[uid];
}

export function getBurette(uid: string): BuretteState {
  if (!buretteMap[uid]) {
    buretteMap[uid] = { volume: 50, maxVolume: 50, valveOpen: false, color: '#ef4444', opacity: 0.35, chemicalId: undefined, label: '' };
  }
  return buretteMap[uid];
}

export function getPipette(uid: string): PipetteState {
  if (!pipetteMap[uid]) {
    pipetteMap[uid] = { volume: 0, maxVolume: 10, color: '#94a3b8', opacity: 0.35, label: '' };
  }
  return pipetteMap[uid];
}

export function getSepFunnelState(uid: string): SepFunnelState {
  if (!sepFunnelMap[uid]) {
    sepFunnelMap[uid] = { valveOpen: false, bottomLayerVolume: 0, bottomLayerColor: '#92400e' };
  }
  return sepFunnelMap[uid];
}

export function getBurnerState(uid: string) {
  if (!burnerMap[uid]) burnerMap[uid] = { on: false, intensity: 0.75 };
  return burnerMap[uid];
}

export function getBalanceTare(uid: string): number {
  return balanceTareMap[uid] || 0;
}

export function getContainerTare(uid: string): number {
  return containerTareMap[uid] || 0;
}

export function getItemZoom(uid: string): number { return itemZoomMap[uid] || 1; }

export function getBeakerClampState(uid: string): BeakerClampState {
  if (!beakerClampMap[uid]) {
    beakerClampMap[uid] = { heldContainerUid: null, clampAngle: 0 };
  }
  return beakerClampMap[uid];
}

export function getHotPlateState(uid: string): HotPlateState {
  if (!hotPlateMap[uid]) {
    hotPlateMap[uid] = { on: false, temperature: 25, currentTemp: 25 };
  }
  return hotPlateMap[uid];
}

export function getWoodenBaseState(uid: string): WoodenBaseState {
  if (!woodenBaseMap[uid]) {
    woodenBaseMap[uid] = { attachedToolUids: [] };
  }
  return woodenBaseMap[uid];
}

export function getRetortStandState(uid: string): RetortStandState {
  if (!retortStandMap[uid]) {
    retortStandMap[uid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160, bottomClampX: 0, slotOffsets: [30, 79, 128], slotOccupants: [null, null, null], bottomSlotOccupant: null, topClampLocked: true, bottomClampLocked: true, baseLocked: false };
  }
  return retortStandMap[uid];
}
