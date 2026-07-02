import { ref, reactive, watch } from 'vue';
import type { LabItem, ToolDef } from './useChemistryTools';
import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from '@my-modern-app/chemistry-engine';
import {
  isBeaker, isTestTube, isBurette, isPipette, isErlenmeyer,
  isVolumetricFlask, isRoundBottomFlask, isSeparatoryFunnel,
  isGradCylinder, isHeatingMantle, isBunsenBurner, isBalance, isPhMeter,
  isWatchGlass, isFilterFunnel, isRubberStopper,
  isRetortStandAssembly, isBeakerClamp, isWoodenBase, isHotPlate,
  isClampAttachable, isContainer, getMaxVolume
} from './chemLabIds';
import { saveSession, loadSession, clearSession, saveSessionDebounced } from './useChemistrySession';
import { chemicals, selectedChemical } from './chemDatabase';
export {
  isBeaker, isTestTube, isTestTubeRack, isBurette, isPipette, isErlenmeyer,
  isVolumetricFlask, isRoundBottomFlask, isSeparatoryFunnel,
  isGradCylinder, isHeatingMantle, isBunsenBurner, isBalance, isPhMeter,
  isWatchGlass, isFilterFunnel, isRubberStopper,
  isRetortStandAssembly, isBeakerClamp, isWoodenBase, isHotPlate,
  isClampAttachable, isContainer, getMaxVolume
} from './chemLabIds';
export type { Chemical, ChemicalCategory, HazardLevel, PhysicalState } from './chemDatabase';
export { chemicals, selectedChemical } from './chemDatabase';
export { saveSession, loadSession, clearSession } from './useChemistrySession';
export { buildToolState } from './useToolStateBuilder';

// ================== STATE ==================
let uid = 0;

export const pendingChemicalFill = ref<{ uid: string; amount: number } | null>(null);
export const hasSelectedChemicalMap = reactive<Record<string, boolean>>({});
export const simSpeed = ref(1);
export const items = ref<LabItem[]>([]);
export const liquidMap = reactive<Record<string, LiquidState>>({});
export const buretteMap = reactive<Record<string, BuretteState>>({});
export const receivingMap = reactive<Record<string, boolean>>({});
export const pipetteMap = reactive<Record<string, PipetteState>>({});
export const sepFunnelMap = reactive<Record<string, SepFunnelState>>({});
export const burnerMap = reactive<Record<string, { on: boolean; intensity: number }>>({});
export const balanceTareMap = reactive<Record<string, number>>({});
export const containerTareMap = reactive<Record<string, number>>({});
export const itemZoomMap = reactive<Record<string, number>>({});
export const phProbeTipMap = reactive<Record<string, { x: number; y: number }>>({});
export const solidMap = reactive<Record<string, { amount: number; type: string }>>({});
export const stopperMap = reactive<Record<string, string>>({});
export const pourFlowMap = reactive<Record<string, string>>({});
export const tiltAngleMap = reactive<Record<string, number>>({});
export const rackSlotsMap = reactive<Record<string, (string | null)[]>>({});

export interface RetortStandState {
  leftBuretteUid: string | null;
  rightBuretteUid: string | null;
  leftContainerUid: string | null;
  rightContainerUid: string | null;
  heatingDeviceUid: string | null;
  topClampY: number;
  bottomClampY: number;
  bottomClampX: number;
  slotOffsets: number[];
  slotOccupants: (string | null)[];
  bottomSlotOccupant: string | null;
}
export const retortStandMap = reactive<Record<string, RetortStandState>>({});

// Burette consumption tracking for experiments
export const buretteInitialVolumeMap = reactive<Record<string, number>>({});
export const buretteTotalConsumedMap = reactive<Record<string, number>>({});
export const buretteConsumedThisRefill = reactive<Record<string, number>>({});


// Legacy states kept for backward compatibility with old sessions
export interface BeakerClampState { heldContainerUid: string | null; clampAngle: number; }
export const beakerClampMap = reactive<Record<string, BeakerClampState>>({});
export interface HotPlateState { on: boolean; temperature: number; currentTemp: number; }
export const hotPlateMap = reactive<Record<string, HotPlateState>>({});
export interface WoodenBaseState { attachedToolUids: string[]; }
export const woodenBaseMap = reactive<Record<string, WoodenBaseState>>({});

// Global spill particles (rendered in workspace-wide canvas)
export interface SpillParticle {
  x: number; y: number; vx: number; vy: number; size: number; color: string; sourceUid: string;
}
export const spillParticles = reactive<SpillParticle[]>([]);

// ================== GETTERS ==================
export function getLiquid(uid: string): LiquidState {
  if (!liquidMap[uid]) {
    liquidMap[uid] = { volume: 0, maxVolume: 250, color: '#3b82f6', opacity: 0.3, label: 'water', stirred: 0, temperature: 25, ph: null, heated: false, viscosity: 0.05, density: 1.0, surfaceTension: 0.3, chemicalId: undefined, indicators: [], baseColor: '#3b82f6' };
  }
  return liquidMap[uid];
}

export function getBurette(uid: string): BuretteState {
  if (!buretteMap[uid]) {
    buretteMap[uid] = { volume: 50, maxVolume: 50, valveOpen: false, color: '#ef4444', opacity: 0.35, chemicalId: undefined };
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
    retortStandMap[uid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160, bottomClampX: 0, slotOffsets: [30, 79, 128], slotOccupants: [null, null, null], bottomSlotOccupant: null };
  }
  return retortStandMap[uid];
}

// ================== CREATE ==================
export function createLabItem(def: ToolDef, x: number, y: number): LabItem {
  uid += 1;
  const item: LabItem = { uid: `lab-${uid}`, id: def.id, name: def.name, icon: def.icon, type: def.type, x, y };
  if (isContainer(def.id)) {
    liquidMap[item.uid] = { volume: 0, maxVolume: getMaxVolume(def.id), color: '#3b82f6', opacity: 0.3, label: 'water', stirred: 0, temperature: 25, ph: null, heated: false, viscosity: 0.05, density: 1.0, surfaceTension: 0.3, indicators: [], baseColor: '#3b82f6', chemicalId: undefined };
  }
  if (isBurette(def.id)) {
    buretteMap[item.uid] = { volume: 50, maxVolume: 50, valveOpen: false, color: '#ef4444', opacity: 0.35, chemicalId: undefined };
  }
  if (isPipette(def.id)) {
    pipetteMap[item.uid] = { volume: 0, maxVolume: 10, color: '#94a3b8', opacity: 0.35, label: '' };
  }
  if (isSeparatoryFunnel(def.id)) {
    sepFunnelMap[item.uid] = { valveOpen: false, bottomLayerVolume: 0, bottomLayerColor: '#92400e' };
  }
  if (isBunsenBurner(def.id) || isHeatingMantle(def.id)) {
    burnerMap[item.uid] = { on: false, intensity: 0.75 };
  }
  if (isBalance(def.id)) {
    balanceTareMap[item.uid] = 0;
  }
  if (isPhMeter(def.id)) {
    phProbeTipMap[item.uid] = { x: x + 40, y: y + 130 }; // probe tip starts below the meter body
  }
  if (isBeakerClamp(def.id)) {
    beakerClampMap[item.uid] = { heldContainerUid: null, clampAngle: 0 };
  }
  if (isHotPlate(def.id)) {
    hotPlateMap[item.uid] = { on: false, temperature: 25, currentTemp: 25 };
  }
  if (isWoodenBase(def.id)) {
    woodenBaseMap[item.uid] = { attachedToolUids: [] };
  }
  if (isRetortStandAssembly(def.id)) {
    retortStandMap[item.uid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160, bottomClampX: 0, slotOffsets: [30, 79, 128], slotOccupants: [null, null, null], bottomSlotOccupant: null };
  }
  return item;
}

// ================== INITIAL LAYOUT ==================
export function setupInitialLabLayout(): void {
  const hasStand = items.value.some(i => isRetortStandAssembly(i.id));
  if (hasStand) return;

  const standDef: ToolDef = { id: 'retort-stand-assembly', name: 'chemistryTools.retortStandAssembly', icon: '🏗️', type: 'helper' };
  const stand = createLabItem(standDef, 200, 100);
  items.value.push(stand);

  retortStandMap[stand.uid] = {
    leftBuretteUid: null,
    rightBuretteUid: null,
    leftContainerUid: null,
    rightContainerUid: null,
    heatingDeviceUid: null,
    topClampY: 60,
    bottomClampY: 160,
    bottomClampX: 0,
    slotOffsets: [30, 79, 128],
    slotOccupants: [null, null, null],
    bottomSlotOccupant: null,
  };
}

// ================== WATCHER ==================
watch([items, liquidMap, buretteMap, pipetteMap, sepFunnelMap, burnerMap, balanceTareMap, containerTareMap, simSpeed, itemZoomMap, phProbeTipMap, solidMap, stopperMap, pourFlowMap, tiltAngleMap, rackSlotsMap, retortStandMap, beakerClampMap, hotPlateMap, woodenBaseMap], saveSessionDebounced, { deep: true });

// ================== EXPORT STATE ==================
export function useChemistryLab() {
  return {
    items,
    liquidMap,
    buretteMap,
    receivingMap,
    pipetteMap,
    sepFunnelMap,
    burnerMap,
    balanceTareMap,
    containerTareMap,
    itemZoomMap,
    pourFlowMap,
    tiltAngleMap,
    createLabItem,
    getLiquid,
    getBurette,
    getPipette,
    getSepFunnelState,
    getBurnerState,
    getBalanceTare,
    getItemZoom,
    getMaxVolume,
    isContainer,
    isBeaker,
    isTestTube,
    isBurette,
    isPipette,
    isErlenmeyer,
    isVolumetricFlask,
    isRoundBottomFlask,
    isSeparatoryFunnel,
    isGradCylinder,
    isHeatingMantle,
    isBunsenBurner,
    isBalance,
    isPhMeter,
    isWatchGlass,
    isFilterFunnel,
    isRubberStopper,
    chemicals,
    selectedChemical,
    pendingChemicalFill,
    hasSelectedChemicalMap,
    simSpeed,
    phProbeTipMap,
    solidMap,
    stopperMap,
    retortStandMap,
    loadSession,
    clearSession,
  };
}
