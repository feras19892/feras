import { ref, reactive, watch } from 'vue';

export const pendingChemicalFill = ref<{ uid: string; amount: number } | null>(null);
export const hasSelectedChemicalMap = reactive<Record<string, boolean>>({});
export const simSpeed = ref(1); // heating simulation speed multiplier (1x or 5x)
import type { LabItem, ToolDef } from './useChemistryTools';
import type { LiquidState, BuretteState, PipetteState, SepFunnelState, SavedSession } from './chemLabTypes';
import {
  isBeaker, isTestTube, isBurette, isPipette, isErlenmeyer,
  isVolumetricFlask, isRoundBottomFlask, isSeparatoryFunnel,
  isGradCylinder, isHeatingMantle, isBunsenBurner, isBalance, isPhMeter,
  isWatchGlass, isFilterFunnel, isRubberStopper,
  isContainer, getMaxVolume
} from './chemLabIds';

// Re-export for backward compatibility
export type { LiquidState, BuretteState, PipetteState, SepFunnelState, SavedSession } from './chemLabTypes';
export {
  isBeaker, isTestTube, isBurette, isPipette, isErlenmeyer,
  isVolumetricFlask, isRoundBottomFlask, isSeparatoryFunnel,
  isGradCylinder, isHeatingMantle, isBunsenBurner, isBalance, isPhMeter,
  isWatchGlass, isFilterFunnel, isRubberStopper,
  isContainer, getMaxVolume
} from './chemLabIds';

const STORAGE_KEY = 'chem-lab-session-v1';

// ================== STATE ==================
let uid = 0;

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
export const stopperMap = reactive<Record<string, string>>({}); // containerUid -> stopperUid
export const pourFlowMap = reactive<Record<string, string>>({});
export const tiltAngleMap = reactive<Record<string, number>>({});

// Chemical shelf (temporary in-memory, will be expanded later)
export interface Chemical {
  id: string;
  nameAr: string;
  color: string;
  opacity: number;
}
export const chemicals: Chemical[] = [
  { id: 'water', nameAr: 'ماء', color: '#3b82f6', opacity: 0.35 },
  { id: 'hcl', nameAr: 'HCl', color: '#ef4444', opacity: 0.4 },
  { id: 'naoh', nameAr: 'NaOH', color: '#f59e0b', opacity: 0.4 },
  { id: 'cuso4', nameAr: 'CuSO₄', color: '#1d4ed8', opacity: 0.5 },
  { id: 'kmno4', nameAr: 'KMnO₄', color: '#7c2d12', opacity: 0.5 },
  { id: 'nacl', nameAr: 'NaCl', color: '#e2e8f0', opacity: 0.3 },
  { id: 'h2so4', nameAr: 'H₂SO₄', color: '#fbbf24', opacity: 0.4 },
  { id: 'phenol', nameAr: 'فينول', color: '#ec4899', opacity: 0.4 },
];
export const selectedChemical = reactive<Chemical>({ ...chemicals[0] });

// Global spill particles (rendered in workspace-wide canvas)
export interface SpillParticle {
  x: number; y: number; vx: number; vy: number; size: number; color: string; sourceUid: string;
}
export const spillParticles = reactive<SpillParticle[]>([]);

// ================== GETTERS ==================
export function getLiquid(uid: string): LiquidState {
  if (!liquidMap[uid]) {
    liquidMap[uid] = { volume: 0, maxVolume: 250, color: '#3b82f6', opacity: 0.3, label: 'ماء', stirred: 0, temperature: 25, ph: null, heated: false, viscosity: 0.05, density: 1.0, surfaceTension: 0.3 };
  }
  return liquidMap[uid];
}

export function getBurette(uid: string): BuretteState {
  if (!buretteMap[uid]) {
    buretteMap[uid] = { volume: 50, maxVolume: 50, valveOpen: false, color: '#ef4444', opacity: 0.35 };
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

export function buildToolState(item: LabItem | null) {
  if (!item) return null;
  if (isContainer(item.id)) {
    const liq = getLiquid(item.uid);
    return { uid: item.uid, type: 'beaker' as const, volume: liq.volume, maxVolume: liq.maxVolume, color: liq.color, label: liq.label };
  }
  if (isBurette(item.id)) {
    const bur = getBurette(item.uid);
    return { uid: item.uid, type: 'burette' as const, volume: bur.volume, maxVolume: bur.maxVolume, valveOpen: bur.valveOpen, color: bur.color };
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
    liquidMap[item.uid] = { volume: 0, maxVolume: getMaxVolume(def.id), color: '#3b82f6', opacity: 0.3, label: 'ماء', stirred: 0, temperature: 25, ph: null, heated: false, viscosity: 0.05, density: 1.0, surfaceTension: 0.3 };
  }
  if (isBurette(def.id)) {
    buretteMap[item.uid] = { volume: 50, maxVolume: 50, valveOpen: false, color: '#ef4444', opacity: 0.35 };
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

// ================== PERSISTENCE ==================
export function saveSession() {
  const data: SavedSession = {
    items: items.value,
    liquids: { ...liquidMap },
    burettes: { ...buretteMap },
    pipettes: { ...pipetteMap },
    sepFunnels: { ...sepFunnelMap },
    burners: { ...burnerMap },
    tares: { ...balanceTareMap },
    zoomMap: { ...itemZoomMap },
    pourFlows: { ...pourFlowMap },
    tiltAngles: { ...tiltAngleMap },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data: SavedSession = JSON.parse(raw);
    items.value = data.items || [];
    Object.assign(liquidMap, data.liquids || {});
    Object.assign(buretteMap, data.burettes || {});
    Object.assign(pipetteMap, data.pipettes || {});
    Object.assign(sepFunnelMap, data.sepFunnels || {});
    Object.assign(burnerMap, data.burners || {});
    Object.assign(balanceTareMap, data.tares || {});
    Object.assign(itemZoomMap, data.zoomMap || {});
    Object.assign(pourFlowMap, data.pourFlows || {});
    Object.assign(tiltAngleMap, data.tiltAngles || {});
    // Restore uid counter to avoid collisions
    const maxUid = items.value.reduce((m, it) => {
      const n = parseInt(it.uid.replace(/^lab-/, ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    uid = maxUid;
  } catch { /* ignore corrupt session */ }
}

export function clearSession() {
  items.value = [];
  Object.keys(liquidMap).forEach(k => delete liquidMap[k]);
  Object.keys(buretteMap).forEach(k => delete buretteMap[k]);
  Object.keys(pipetteMap).forEach(k => delete pipetteMap[k]);
  Object.keys(sepFunnelMap).forEach(k => delete sepFunnelMap[k]);
  Object.keys(burnerMap).forEach(k => delete burnerMap[k]);
  Object.keys(balanceTareMap).forEach(k => delete balanceTareMap[k]);
  Object.keys(containerTareMap).forEach(k => delete containerTareMap[k]);
  Object.keys(hasSelectedChemicalMap).forEach(k => delete hasSelectedChemicalMap[k]);
  simSpeed.value = 1;
  Object.keys(itemZoomMap).forEach(k => delete itemZoomMap[k]);
  Object.keys(phProbeTipMap).forEach(k => delete phProbeTipMap[k]);
  Object.keys(solidMap).forEach(k => delete solidMap[k]);
  Object.keys(stopperMap).forEach(k => delete stopperMap[k]);
  Object.keys(pourFlowMap).forEach(k => delete pourFlowMap[k]);
  Object.keys(tiltAngleMap).forEach(k => delete tiltAngleMap[k]);
  uid = 0;
  localStorage.removeItem(STORAGE_KEY);
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
