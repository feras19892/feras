import {
  items, liquidMap, pipetteMap, selectedChemical,
  getLiquid, getPipette, buildToolState,
  isContainer, isPipette
} from './useChemistryLab';
import { applyIndicator } from './useReactionEngine';
import { pushHistory } from './useChemistryHistory';
import type { LabItem } from './useChemistryTools';
import type { ToolState } from '../../components/experiment/chemistry/InspectorPanel.vue';

function getNearestContainer(pipItem: LabItem, filterFn: (liq: any) => boolean): LabItem | null {
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
  if (!target) { console.warn('pipetteDraw: no target found'); return; }
  pushHistory();
  const tLiq = getLiquid(target.uid);
  const amount = Math.min(10, tLiq.volume);
  pip.volume = amount; pip.color = tLiq.color; pip.opacity = tLiq.opacity; pip.label = tLiq.label;
  pip.chemicalId = tLiq.chemicalId || (tLiq.indicators && tLiq.indicators[0]) || undefined;
  tLiq.volume -= amount;
  emit('select', pipItem, buildToolState(pipItem));
  if (selectedItemRef.value?.uid === target.uid) emit('select', target, buildToolState(target));
}

export function pipetteDispense(pipItem: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const pip = getPipette(pipItem.uid);
  if (pip.volume <= 0) return;
  const target = getNearestContainer(pipItem, (liq) => liq.volume < liq.maxVolume);
  if (!target) { console.warn('pipetteDispense: no target found'); return; }
  pushHistory();
  const tLiq = getLiquid(target.uid);
  const amount = Math.min(pip.volume, tLiq.maxVolume - tLiq.volume);
  tLiq.volume += amount;
  if (tLiq.volume > amount) {
    tLiq.color = pip.color;
    tLiq.opacity = Math.min(1, (tLiq.opacity * (tLiq.volume - amount) + pip.opacity * amount) / tLiq.volume);
  } else {
    tLiq.color = pip.color;
    tLiq.opacity = pip.opacity;
  }
  const pipChemicalId = pip.chemicalId;
  const isInd = pipChemicalId && ['phenolphthalein', 'methyl-orange', 'bromothymol-blue', 'universal-indicator', 'starch'].includes(pipChemicalId);
  if (isInd) {
    if (!tLiq.indicators) tLiq.indicators = [];
    if (!tLiq.indicators.includes(pipChemicalId)) {
      tLiq.indicators.push(pipChemicalId);
      applyIndicator(pipChemicalId, target.uid);
    }
    if (!tLiq.label) { tLiq.label = pip.label; }
    else if (!tLiq.label.includes(pip.label)) { tLiq.label = tLiq.label + ' + ' + pip.label; }
  } else {
    if (!tLiq.label) { tLiq.label = pip.label || 'محلول من الماصة'; }
    else if (pip.label && !tLiq.label.includes(pip.label)) { tLiq.label = tLiq.label + ' + ' + pip.label; }
  }
  pip.volume -= amount;
  if (pip.volume <= 0.01) { pip.volume = 0; pip.color = '#94a3b8'; pip.label = ''; }
  emit('select', pipItem, buildToolState(pipItem));
  if (selectedItemRef.value?.uid === target.uid) emit('select', target, buildToolState(target));
}
