import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from '@my-modern-app/chemistry-engine';
import {
  items, liquidMap, buretteMap, pipetteMap,
  sepFunnelMap, burnerMap, balanceTareMap, containerTareMap, itemZoomMap,
  buretteInitialVolumeMap, buretteTotalConsumedMap, buretteConsumedThisRefill,
  retortStandMap, phProbeTipMap, solidMap, stopperMap, rackSlotsMap,
  beakerClampMap, hotPlateMap, woodenBaseMap, hasSelectedChemicalMap,
  pourFlowMap, tiltAngleMap, spillParticles, receivingMap, simSpeed,
  type RetortStandState
} from './useChemistryLab';

const MAX_MACRO = 100;
const MAX_MICRO = 200;

interface HistorySnapshot {
  items: LabItem[];
  liquids: Record<string, LiquidState>;
  burettes: Record<string, BuretteState>;
  pipettes: Record<string, PipetteState>;
  sepFunnels: Record<string, SepFunnelState>;
  burners: Record<string, { on: boolean; intensity: number }>;
  tares: Record<string, number>;
  containerTares: Record<string, number>;
  zoomMap: Record<string, number>;
  buretteInitial: Record<string, number>;
  buretteTotal: Record<string, number>;
  buretteConsumed: Record<string, number>;
  retortStands: Record<string, RetortStandState>;
  phProbeTips: Record<string, { x: number; y: number }>;
  simSpeed: number;
  solids: Record<string, { amount: number; type: string }>;
  stoppers: Record<string, string>;
  rackSlots: Record<string, (string | null)[]>;
  beakerClamps: Record<string, { heldContainerUid: string | null; clampAngle: number }>;
  hotPlates: Record<string, { on: boolean; temperature: number; currentTemp: number }>;
  woodenBases: Record<string, { attachedToolUids: string[] }>;
  hasSelectedChemicals: Record<string, boolean>;
  pourFlows: Record<string, string>;
  tiltAngles: Record<string, number>;
  spillDrops: { x: number; y: number; vx: number; vy: number; size: number; color: string; sourceUid: string }[];
  receiving: Record<string, boolean>;
}

/* ── Macro history (big actions: fill, remove, toggle, etc.) ── */
const macroPast = ref<HistorySnapshot[]>([]);
const macroFuture = ref<HistorySnapshot[]>([]);

/* ── Micro history (individual drops: 0.05 mL steps) ── */
const microPast = ref<HistorySnapshot[]>([]);
const microFuture = ref<HistorySnapshot[]>([]);

function clone<T>(obj: T): T {
  return structuredClone(obj);
}

function capture(): HistorySnapshot {
  return {
    items: clone(items.value),
    liquids: clone(liquidMap),
    burettes: clone(buretteMap),
    pipettes: clone(pipetteMap),
    sepFunnels: clone(sepFunnelMap),
    burners: clone(burnerMap),
    tares: clone(balanceTareMap),
    containerTares: clone(containerTareMap),
    zoomMap: clone(itemZoomMap),
    buretteInitial: clone(buretteInitialVolumeMap),
    buretteTotal: clone(buretteTotalConsumedMap),
    buretteConsumed: clone(buretteConsumedThisRefill),
    retortStands: clone(retortStandMap),
    phProbeTips: clone(phProbeTipMap),
    solids: clone(solidMap),
    stoppers: clone(stopperMap),
    rackSlots: clone(rackSlotsMap),
    beakerClamps: clone(beakerClampMap),
    hotPlates: clone(hotPlateMap),
    woodenBases: clone(woodenBaseMap),
    hasSelectedChemicals: clone(hasSelectedChemicalMap),
    pourFlows: clone(pourFlowMap),
    tiltAngles: clone(tiltAngleMap),
    spillDrops: clone(spillParticles),
    receiving: clone(receivingMap),
    simSpeed: simSpeed.value,
  };
}

function restore(snap: HistorySnapshot) {
  items.value = clone(snap.items);
  Object.keys(liquidMap).forEach(k => delete liquidMap[k]);
  Object.keys(buretteMap).forEach(k => delete buretteMap[k]);
  Object.keys(pipetteMap).forEach(k => delete pipetteMap[k]);
  Object.keys(sepFunnelMap).forEach(k => delete sepFunnelMap[k]);
  Object.keys(burnerMap).forEach(k => delete burnerMap[k]);
  Object.keys(balanceTareMap).forEach(k => delete balanceTareMap[k]);
  Object.keys(itemZoomMap).forEach(k => delete itemZoomMap[k]);
  Object.keys(buretteInitialVolumeMap).forEach(k => delete buretteInitialVolumeMap[k]);
  Object.keys(buretteTotalConsumedMap).forEach(k => delete buretteTotalConsumedMap[k]);
  Object.keys(buretteConsumedThisRefill).forEach(k => delete buretteConsumedThisRefill[k]);
  Object.assign(liquidMap, clone(snap.liquids));
  Object.assign(buretteMap, clone(snap.burettes));
  Object.assign(pipetteMap, clone(snap.pipettes));
  Object.assign(sepFunnelMap, clone(snap.sepFunnels));
  Object.assign(burnerMap, clone(snap.burners));
  Object.assign(balanceTareMap, clone(snap.tares));
  Object.keys(containerTareMap).forEach(k => delete containerTareMap[k]);
  Object.assign(containerTareMap, clone(snap.containerTares));
  Object.assign(itemZoomMap, clone(snap.zoomMap));
  Object.assign(buretteInitialVolumeMap, clone(snap.buretteInitial));
  Object.assign(buretteTotalConsumedMap, clone(snap.buretteTotal));
  Object.assign(buretteConsumedThisRefill, clone(snap.buretteConsumed));
  Object.keys(retortStandMap).forEach(k => delete retortStandMap[k]);
  Object.assign(retortStandMap, clone(snap.retortStands));
  Object.keys(phProbeTipMap).forEach(k => delete phProbeTipMap[k]);
  Object.assign(phProbeTipMap, clone(snap.phProbeTips));
  Object.keys(solidMap).forEach(k => delete solidMap[k]);
  Object.assign(solidMap, clone(snap.solids));
  Object.keys(stopperMap).forEach(k => delete stopperMap[k]);
  Object.assign(stopperMap, clone(snap.stoppers));
  Object.keys(rackSlotsMap).forEach(k => delete rackSlotsMap[k]);
  Object.assign(rackSlotsMap, clone(snap.rackSlots));
  Object.keys(beakerClampMap).forEach(k => delete beakerClampMap[k]);
  Object.assign(beakerClampMap, clone(snap.beakerClamps));
  Object.keys(hotPlateMap).forEach(k => delete hotPlateMap[k]);
  Object.assign(hotPlateMap, clone(snap.hotPlates));
  Object.keys(woodenBaseMap).forEach(k => delete woodenBaseMap[k]);
  Object.assign(woodenBaseMap, clone(snap.woodenBases));
  Object.keys(hasSelectedChemicalMap).forEach(k => delete hasSelectedChemicalMap[k]);
  Object.assign(hasSelectedChemicalMap, clone(snap.hasSelectedChemicals));
  Object.keys(pourFlowMap).forEach(k => delete pourFlowMap[k]);
  Object.assign(pourFlowMap, clone(snap.pourFlows));
  Object.keys(tiltAngleMap).forEach(k => delete tiltAngleMap[k]);
  Object.assign(tiltAngleMap, clone(snap.tiltAngles));
  spillParticles.splice(0, spillParticles.length);
  spillParticles.push(...clone(snap.spillDrops));
  Object.keys(receivingMap).forEach(k => delete receivingMap[k]);
  Object.assign(receivingMap, clone(snap.receiving));
  simSpeed.value = snap.simSpeed;
}

/* ════════════════════════════════════════════
   MACRO  (big actions)
   ════════════════════════════════════════════ */

export function pushMacroHistory() {
  macroPast.value.push(capture());
  if (macroPast.value.length > MAX_MACRO) macroPast.value.shift();
  macroFuture.value = [];
}

export function canUndo(): boolean {
  return macroPast.value.length > 0;
}

export function canRedo(): boolean {
  return macroFuture.value.length > 0;
}

export function undo(): boolean {
  if (!canUndo()) return false;
  const current = capture();
  const snap = macroPast.value.pop()!;
  macroFuture.value.push(current);
  restore(snap);
  microPast.value = [];
  microFuture.value = [];
  return true;
}

export function redo(): boolean {
  if (!canRedo()) return false;
  const current = capture();
  const snap = macroFuture.value.pop()!;
  macroPast.value.push(current);
  restore(snap);
  microPast.value = [];
  microFuture.value = [];
  return true;
}

/* ════════════════════════════════════════════
   MICRO  (individual drops)
   ════════════════════════════════════════════ */

export function pushMicroHistory() {
  microPast.value.push(capture());
  if (microPast.value.length > MAX_MICRO) microPast.value.shift();
  microFuture.value = [];
}

export function canMicroUndo(): boolean {
  return microPast.value.length > 0;
}

export function canMicroRedo(): boolean {
  return microFuture.value.length > 0;
}

export function undoMicro(): boolean {
  if (!canMicroUndo()) return false;
  const current = capture();
  const snap = microPast.value.pop()!;
  microFuture.value.push(current);
  restore(snap);
  return true;
}

export function redoMicro(): boolean {
  if (!canMicroRedo()) return false;
  const current = capture();
  const snap = microFuture.value.pop()!;
  microPast.value.push(current);
  restore(snap);
  return true;
}

/* ════════════════════════════════════════════
   BACKWARD COMPAT
   ════════════════════════════════════════════ */

export function clearHistory() {
  macroPast.value = [];
  macroFuture.value = [];
  microPast.value = [];
  microFuture.value = [];
}
