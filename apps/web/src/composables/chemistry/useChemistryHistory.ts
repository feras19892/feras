import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import type { LiquidState, BuretteState, PipetteState, SepFunnelState } from './chemLabTypes';
import {
  items, liquidMap, buretteMap, pipetteMap,
  sepFunnelMap, burnerMap, balanceTareMap, itemZoomMap
} from './useChemistryLab';

const MAX_HISTORY = 20;

interface HistorySnapshot {
  items: LabItem[];
  liquids: Record<string, LiquidState>;
  burettes: Record<string, BuretteState>;
  pipettes: Record<string, PipetteState>;
  sepFunnels: Record<string, SepFunnelState>;
  burners: Record<string, { on: boolean; intensity: number }>;
  tares: Record<string, number>;
  zoomMap: Record<string, number>;
}

const past = ref<HistorySnapshot[]>([]);
const future = ref<HistorySnapshot[]>([]);

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
  Object.assign(liquidMap, clone(snap.liquids));
  Object.assign(buretteMap, clone(snap.burettes));
  Object.assign(pipetteMap, clone(snap.pipettes));
  Object.assign(sepFunnelMap, clone(snap.sepFunnels));
  Object.assign(burnerMap, clone(snap.burners));
  Object.assign(balanceTareMap, clone(snap.tares));
  Object.assign(itemZoomMap, clone(snap.zoomMap));
}

export function pushHistory() {
  past.value.push(capture());
  if (past.value.length > MAX_HISTORY) past.value.shift();
  future.value = []; // clear redo stack on new action
}

export function canUndo(): boolean {
  return past.value.length > 0;
}

export function canRedo(): boolean {
  return future.value.length > 0;
}

export function undo() {
  if (!canUndo()) return;
  const current = capture();
  const snap = past.value.pop()!;
  future.value.push(current);
  restore(snap);
}

export function redo() {
  if (!canRedo()) return;
  const current = capture();
  const snap = future.value.pop()!;
  past.value.push(current);
  restore(snap);
}

export function clearHistory() {
  past.value = [];
  future.value = [];
}
