import {
  items, buretteInitialVolumeMap, buretteTotalConsumedMap, buretteConsumedThisRefill,
  balanceTareMap, containerTareMap, getLiquid, getBurette, getSepFunnelState, getBurnerState, buildToolState,
  isContainer, isBurette,
  selectedChemical, hasSelectedChemicalMap, pendingChemicalFill
} from './useChemistryLab';
import { applyIndicator } from './useReactionEngine';
import { pushMacroHistory } from './useChemistryHistory';
import { computeBalanceWeight, getContainerWeight } from './useLabSimulation';
import type { LabItem } from './useChemistryTools';
import type { ToolState } from '../../components/experiment/chemistry/InspectorPanel.vue';

/** Commit any pending burette consumption to the running total */
function commitBuretteConsumption(uid: string) {
  const consumed = buretteConsumedThisRefill[uid] || 0;
  if (consumed > 0) {
    buretteTotalConsumedMap[uid] = (buretteTotalConsumedMap[uid] || 0) + consumed;
    buretteConsumedThisRefill[uid] = 0;
  }
}

export type ActionType = 'refill' | 'empty' | 'toggleValve' | 'fill5' | 'fill10' | 'fill50' | 'fill100' | 'remove5' | 'remove10' | 'remove50' | 'remove100' | 'addSolid';

export function execAction(type: ActionType, uid: string, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const item = items.value.find(i => i.uid === uid); if (!item) return;
  // Toggle valve is NOT a macro step — it's part of the drip flow (micro history tracks drops)
  if (type === 'toggleValve' && isBurette(item.id)) { toggleBuretteValve(item, selectedItemRef, emit); return; }
  // If fill action and no chemical selected yet, open the picker without recording history
  if ((type === 'fill5' || type === 'fill10' || type === 'fill50' || type === 'fill100') && (isContainer(item.id) || isBurette(item.id)) && !hasSelectedChemicalMap[uid]) {
    const amount = type === 'fill5' ? 5 : type === 'fill10' ? 10 : type === 'fill50' ? 50 : 100;
    pendingChemicalFill.value = { uid, amount };
    return;
  }
  // All other actions are macro steps
  pushMacroHistory();
  if (type === 'refill' && isBurette(item.id)) {
    const b = getBurette(uid);
    commitBuretteConsumption(uid);
    b.volume = b.maxVolume;
    buretteInitialVolumeMap[uid] = b.maxVolume;
  }
  if (type === 'empty' && (isContainer(item.id) || isBurette(item.id))) {
    if (isBurette(item.id)) { const s = getBurette(uid); s.volume = 0; s.chemicalId = undefined; }
    else { const liq = getLiquid(uid); liq.volume = 0; liq.chemicalId = undefined; liq.indicators = []; liq.ph = null; liq.reactants = {}; liq.equation = undefined; liq.precipitate = false; liq.gasEvolution = false; }
  }
  if ((type === 'fill5' || type === 'fill10' || type === 'fill50' || type === 'fill100') && (isContainer(item.id) || isBurette(item.id))) {
    const amount = type === 'fill5' ? 5 : type === 'fill10' ? 10 : type === 'fill50' ? 50 : 100;
    if (isBurette(item.id)) {
        const s = getBurette(uid);
        commitBuretteConsumption(uid);
        s.volume = Math.min(s.maxVolume, s.volume + amount);
        s.color = selectedChemical.color;
        s.opacity = selectedChemical.opacity;
        s.chemicalId = selectedChemical.id;
      } else {
        const s = getLiquid(uid);
        if (selectedChemical.category === 'indicator') {
          const dropAmount = 5;
          s.volume = Math.min(s.maxVolume, s.volume + dropAmount);
          if (!s.indicators) s.indicators = [];
          if (!s.indicators.includes(selectedChemical.id)) s.indicators.push(selectedChemical.id);
          if (!s.chemicalId || s.label === 'ماء') { s.label = selectedChemical.nameAr; }
          else if (!s.label.includes(selectedChemical.nameAr)) { s.label = s.label + ' + ' + selectedChemical.nameAr; }
          applyIndicator(selectedChemical.id, uid);
        } else {
          s.volume = Math.min(s.maxVolume, s.volume + amount);
          s.color = selectedChemical.color;
          s.opacity = selectedChemical.opacity;
          s.label = selectedChemical.nameAr;
          s.chemicalId = selectedChemical.id;
          s.ph = selectedChemical.ph ?? null;
          s.baseColor = selectedChemical.color;
          if (!s.reactants) s.reactants = {};
          s.reactants[selectedChemical.id] = (s.reactants[selectedChemical.id] || 0) + amount;
        }
      }
  }
  if ((type === 'remove5' || type === 'remove10' || type === 'remove50' || type === 'remove100') && (isContainer(item.id) || isBurette(item.id))) {
    const amount = type === 'remove5' ? 5 : type === 'remove10' ? 10 : type === 'remove50' ? 50 : 100;
    if (isBurette(item.id)) { const s = getBurette(uid); s.volume = Math.max(0, s.volume - amount); }
    else { const s = getLiquid(uid); s.volume = Math.max(0, s.volume - amount); }
  }
  if (selectedItemRef.value?.uid === uid) emit('select', item, buildToolState(item));
}

function toggleBuretteValve(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const b = getBurette(item.uid);
  const wasOpen = b.valveOpen;
  b.valveOpen = !b.valveOpen;
  if (!wasOpen && b.valveOpen) {
    // Commit previous consumption before starting a new drip cycle
    commitBuretteConsumption(item.uid);
    buretteInitialVolumeMap[item.uid] = b.volume;
  }
  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
}

export function toggleSepFunnelValve(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const s = getSepFunnelState(item.uid); s.valveOpen = !s.valveOpen;
  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
}

export function toggleBurner(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const s = getBurnerState(item.uid); s.on = !s.on;
  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
}

export function tareBalance(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  balanceTareMap[item.uid] = computeBalanceWeight(item);
  containerTareMap[item.uid] = 0;
  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
}

export function tareContainer(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  containerTareMap[item.uid] = getContainerWeight(item);
  balanceTareMap[item.uid] = 0;
  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
}
