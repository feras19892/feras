import {
  items,
  getLiquid, getPipette, buildToolState,
  isContainer, selectedChemical, hasSelectedChemicalMap, pendingChemicalFill
} from './useChemistryLab';
import { applyIndicator } from './useReactionEngine';
import { pushMicroHistory } from './useChemistryHistory';
import { mixColor } from '@my-modern-app/chemistry-engine';
import { isIndicator, type PipetteState, type LiquidState } from '@my-modern-app/chemistry-engine';
import type { LabItem } from './useChemistryTools';
import type { ToolState } from './chemLabTypes';

type EmitFn = (name: 'select', item: LabItem | null, state: ToolState | null) => void;
type SelectedItemRef = { value: LabItem | null };

function applyDispenseToTarget(
  pip: PipetteState,
  tLiq: LiquidState,
  targetUid: string,
  amount: number,
  pipItem: LabItem,
  target: LabItem,
  selectedItemRef: SelectedItemRef,
  emit: EmitFn,
) {
  const oldVolume = tLiq.volume;
  tLiq.volume += amount;
  if (oldVolume > 0) {
    tLiq.color = mixColor(tLiq.color, oldVolume, pip.color, amount);
    tLiq.opacity = Math.min(1, (tLiq.opacity * oldVolume + pip.opacity * amount) / tLiq.volume);
  } else {
    tLiq.color = pip.color;
    tLiq.opacity = pip.opacity;
  }
  const pipChemicalId = pip.chemicalId;
  const isInd = pipChemicalId && isIndicator(pipChemicalId);
  if (isInd && pipChemicalId) {
    if (!tLiq.indicators) tLiq.indicators = [];
    if (!tLiq.indicators.includes(pipChemicalId)) {
      tLiq.indicators.push(pipChemicalId);
      applyIndicator(pipChemicalId, targetUid);
    }
    if (!tLiq.label) { tLiq.label = pip.label; }
    else if (!tLiq.label.includes(pip.label)) { tLiq.label = tLiq.label + ' + ' + pip.label; }
  } else {
    if (!tLiq.label) { tLiq.label = pip.label || 'PIPETTE_SOLUTION'; }
    else if (pip.label && !tLiq.label.includes(pip.label)) { tLiq.label = tLiq.label + ' + ' + pip.label; }
  }
  pip.volume -= amount;
  if (pip.volume <= 0.01) { pip.volume = 0; pip.color = '#94a3b8'; pip.label = ''; pip.chemicalId = undefined; }
  emit('select', pipItem, buildToolState(pipItem));
  if (selectedItemRef.value?.uid === target.uid) emit('select', target, buildToolState(target));
}

function getNearestContainer(pipItem: LabItem, filterFn: (liq: LiquidState) => boolean): LabItem | null {
  const candidates = items.value.filter((i: LabItem) => {
    if (i.uid === pipItem.uid) return false;
    if (!isContainer(i.id)) return false;
    return filterFn(getLiquid(i.uid));
  });
  if (candidates.length === 0) return null;
  const px = pipItem.x + 25, py = pipItem.y + 115;
  let nearest = candidates[0];
  let minDist = Infinity;
  for (const c of candidates) {
    const cx = c.x + 35, cy = c.y + 60;
    const d = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    if (d < minDist) { minDist = d; nearest = c; }
  }
  return nearest;
}

export function pipetteDraw(pipItem: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const pip = getPipette(pipItem.uid);
  if (pip.volume > 0) return;
  const target = getNearestContainer(pipItem, (liq) => liq.volume > 0);
  if (!target) return;
  pushMicroHistory();
  const tLiq = getLiquid(target.uid);
  const amount = Math.min(10, tLiq.volume);
  pip.volume = amount; pip.color = tLiq.color; pip.opacity = tLiq.opacity; pip.label = tLiq.label;
  pip.chemicalId = tLiq.chemicalId || undefined;
  tLiq.volume = +(tLiq.volume - amount).toFixed(2);
  emit('select', pipItem, buildToolState(pipItem));
  if (selectedItemRef.value?.uid === target.uid) emit('select', target, buildToolState(target));
}

export function pipetteDrawAmount(pipItem: LabItem, amount: number, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const pip = getPipette(pipItem.uid);
  if (pip.volume + amount > pip.maxVolume) return;
  const target = getNearestContainer(pipItem, (liq) => liq.volume > 0);
  if (!target) return;
  pushMicroHistory();
  const tLiq = getLiquid(target.uid);
  const actualAmount = Math.min(amount, tLiq.volume, pip.maxVolume - pip.volume);
  if (actualAmount <= 0) return;
  if (pip.volume === 0) {
    pip.color = tLiq.color; pip.opacity = tLiq.opacity; pip.label = tLiq.label;
    pip.chemicalId = tLiq.chemicalId || undefined;
  }
  pip.volume += actualAmount;
  tLiq.volume = +(tLiq.volume - actualAmount).toFixed(2);
  emit('select', pipItem, buildToolState(pipItem));
  if (selectedItemRef.value?.uid === target.uid) emit('select', target, buildToolState(target));
}

export function pipetteDispenseAmount(pipItem: LabItem, amount: number, selectedItemRef: SelectedItemRef, emit: EmitFn) {
  const pip = getPipette(pipItem.uid);
  if (pip.volume <= 0) return;
  const target = getNearestContainer(pipItem, (liq) => liq.volume < liq.maxVolume);
  if (!target) return;
  pushMicroHistory();
  const tLiq = getLiquid(target.uid);
  const actualAmount = Math.min(amount, pip.volume, tLiq.maxVolume - tLiq.volume);
  if (actualAmount <= 0) return;
  applyDispenseToTarget(pip, tLiq, target.uid, actualAmount, pipItem, target, selectedItemRef, emit);
}

export function pipetteDrawFrom(pipItem: LabItem, targetUid: string, amount: number, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const target = items.value.find(i => i.uid === targetUid);
  if (!target || !isContainer(target.id)) return;
  const pip = getPipette(pipItem.uid);
  if (pip.volume + amount > pip.maxVolume) return;
  pushMicroHistory();
  const tLiq = getLiquid(target.uid);
  const actualAmount = Math.min(amount, tLiq.volume, pip.maxVolume - pip.volume);
  if (actualAmount <= 0) return;
  if (pip.volume === 0) {
    pip.color = tLiq.color; pip.opacity = tLiq.opacity; pip.label = tLiq.label;
    pip.chemicalId = tLiq.chemicalId || undefined;
  }
  pip.volume += actualAmount;
  tLiq.volume = +(tLiq.volume - actualAmount).toFixed(2);
  emit('select', pipItem, buildToolState(pipItem));
  if (selectedItemRef.value?.uid === target.uid) emit('select', target, buildToolState(target));
}

export function pipetteDispenseTo(pipItem: LabItem, targetUid: string, amount: number, selectedItemRef: SelectedItemRef, emit: EmitFn) {
  const target = items.value.find(i => i.uid === targetUid);
  if (!target || !isContainer(target.id)) return;
  const pip = getPipette(pipItem.uid);
  if (pip.volume <= 0) return;
  pushMicroHistory();
  const tLiq = getLiquid(target.uid);
  const actualAmount = Math.min(amount, pip.volume, tLiq.maxVolume - tLiq.volume);
  if (actualAmount <= 0) return;
  applyDispenseToTarget(pip, tLiq, target.uid, actualAmount, pipItem, target, selectedItemRef, emit);
}

export function pipetteFill(pipItem: LabItem, amount: number, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  if (!hasSelectedChemicalMap[pipItem.uid]) {
    pendingChemicalFill.value = { uid: pipItem.uid, amount };
    return;
  }
  const pip = getPipette(pipItem.uid);
  pushMicroHistory();
  pip.volume = Math.min(pip.maxVolume, pip.volume + amount);
  pip.color = selectedChemical.color;
  pip.opacity = selectedChemical.opacity;
  pip.label = selectedChemical.id;
  pip.chemicalId = selectedChemical.id;
  emit('select', pipItem, buildToolState(pipItem));
}

export function pipetteEmpty(pipItem: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const pip = getPipette(pipItem.uid);
  pushMicroHistory();
  pip.volume = 0; pip.color = '#94a3b8'; pip.label = ''; pip.chemicalId = undefined;
  emit('select', pipItem, buildToolState(pipItem));
}

export function pipetteDispense(pipItem: LabItem, selectedItemRef: SelectedItemRef, emit: EmitFn) {
  const pip = getPipette(pipItem.uid);
  if (pip.volume <= 0) return;
  const target = getNearestContainer(pipItem, (liq) => liq.volume < liq.maxVolume);
  if (!target) return;
  pushMicroHistory();
  const tLiq = getLiquid(target.uid);
  const amount = Math.min(pip.volume, tLiq.maxVolume - tLiq.volume);
  if (amount <= 0) return;
  applyDispenseToTarget(pip, tLiq, target.uid, amount, pipItem, target, selectedItemRef, emit);
}
