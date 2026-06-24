import { ref, reactive, watch } from 'vue';
import type { LabItem, ToolDef } from './useChemistryTools';
import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from './chemLabTypes';
import {
  isBeaker, isTestTube, isBurette, isPipette, isErlenmeyer,
  isVolumetricFlask, isRoundBottomFlask, isSeparatoryFunnel,
  isGradCylinder, isHeatingMantle, isBunsenBurner, isBalance, isPhMeter,
  isWatchGlass, isFilterFunnel, isRubberStopper,
  isContainer, getMaxVolume
} from './chemLabIds';
import type { Chemical } from './chemDatabase';
import { chemicals, selectedChemical } from './chemDatabase';
import { saveSession, loadSession, clearSession } from './useChemistrySession';
import { buildToolState } from './useToolStateBuilder';
export {
  isBeaker, isTestTube, isBurette, isPipette, isErlenmeyer,
  isVolumetricFlask, isRoundBottomFlask, isSeparatoryFunnel,
  isGradCylinder, isHeatingMantle, isBunsenBurner, isBalance, isPhMeter,
  isWatchGlass, isFilterFunnel, isRubberStopper,
  isContainer, getMaxVolume
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

// Burette consumption tracking for experiments
export const buretteInitialVolumeMap = reactive<Record<string, number>>({});
export const buretteTotalConsumedMap = reactive<Record<string, number>>({});
export const buretteConsumedThisRefill = reactive<Record<string, number>>({});
// Global spill particles (rendered in workspace-wide canvas)
export interface SpillParticle {
  x: number; y: number; vx: number; vy: number; size: number; color: string; sourceUid: string;
}
export const spillParticles = reactive<SpillParticle[]>([]);

// ================== GETTERS ==================
export function getLiquid(uid: string): LiquidState {
  if (!liquidMap[uid]) {
    liquidMap[uid] = { volume: 0, maxVolume: 250, color: '#3b82f6', opacity: 0.3, label: 'ماء', stirred: 0, temperature: 25, ph: null, heated: false, viscosity: 0.05, density: 1.0, surfaceTension: 0.3, chemicalId: undefined, indicators: [], baseColor: '#3b82f6' };
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

// ================== CREATE ==================
export function createLabItem(def: ToolDef, x: number, y: number): LabItem {
  uid += 1;
  const item: LabItem = { uid: `lab-${uid}`, id: def.id, name: def.name, icon: def.icon, type: def.type, x, y };
  if (isContainer(def.id)) {
    liquidMap[item.uid] = { volume: 0, maxVolume: getMaxVolume(def.id), color: '#3b82f6', opacity: 0.3, label: 'ماء', stirred: 0, temperature: 25, ph: null, heated: false, viscosity: 0.05, density: 1.0, surfaceTension: 0.3, indicators: [], baseColor: '#3b82f6', chemicalId: undefined };
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
  return item;
}

// ================== WATCHER ==================
watch([items, liquidMap, buretteMap, pipetteMap, sepFunnelMap, burnerMap, balanceTareMap, containerTareMap, simSpeed, itemZoomMap, phProbeTipMap, solidMap, stopperMap, pourFlowMap, tiltAngleMap], saveSession, { deep: true });

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
    loadSession,
    clearSession,
  };
}
