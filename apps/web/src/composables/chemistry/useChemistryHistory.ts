import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from '@my-modern-app/chemistry-engine';
import {
  items, liquidMap, buretteMap, pipetteMap,
  sepFunnelMap, burnerMap, balanceTareMap, itemZoomMap,
  buretteInitialVolumeMap, buretteTotalConsumedMap, buretteConsumedThisRefill
} from './useChemistryLab';

const MAX_MACRO = 100;
const MAX_MICRO = 1000;

interface HistorySnapshot {
  items: LabItem[];
  liquids: Record<string, LiquidState>;
  burettes: Record<string, BuretteState>;
  pipettes: Record<string, PipetteState>;
  sepFunnels: Record<string, SepFunnelState>;
  burners: Record<string, { on: boolean; intensity: number }>;
  tares: Record<string, number>;
  zoomMap: Record<string, number>;
  buretteInitial: Record<string, number>;
  buretteTotal: Record<string, number>;
  buretteConsumed: Record<string, number>;
}

/* ── Macro history (big actions: fill, remove, toggle, etc.) ── */
const macroPast = ref<HistorySnapshot[]>([]);
const macroFuture = ref<HistorySnapshot[]>([]);

/* ── Micro history (individual drops: 0.05 mL steps) ── */
const microPast = ref<HistorySnapshot[]>([]);
const microFuture = ref<HistorySnapshot[]>([]);

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
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
    zoomMap: clone(itemZoomMap),
    buretteInitial: clone(buretteInitialVolumeMap),
    buretteTotal: clone(buretteTotalConsumedMap),
    buretteConsumed: clone(buretteConsumedThisRefill),
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
  Object.assign(itemZoomMap, clone(snap.zoomMap));
  Object.assign(buretteInitialVolumeMap, clone(snap.buretteInitial));
  Object.assign(buretteTotalConsumedMap, clone(snap.buretteTotal));
  Object.assign(buretteConsumedThisRefill, clone(snap.buretteConsumed));
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
  for (const uid of Object.keys(buretteMap)) buretteMap[uid].valveOpen = false;
  for (const uid of Object.keys(sepFunnelMap)) sepFunnelMap[uid].valveOpen = false;
  return true;
}

export function redoMicro(): boolean {
  if (!canMicroRedo()) return false;
  const current = capture();
  const snap = microFuture.value.pop()!;
  microPast.value.push(current);
  restore(snap);
  for (const uid of Object.keys(buretteMap)) buretteMap[uid].valveOpen = false;
  for (const uid of Object.keys(sepFunnelMap)) sepFunnelMap[uid].valveOpen = false;
  return true;
}

/* ════════════════════════════════════════════
   BACKWARD COMPAT
   ════════════════════════════════════════════ */

/** @deprecated Use pushMacroHistory() or pushMicroHistory() explicitly */
export function pushHistory() {
  pushMacroHistory();
}

export function clearHistory() {
  macroPast.value = [];
  macroFuture.value = [];
  microPast.value = [];
  microFuture.value = [];
}
