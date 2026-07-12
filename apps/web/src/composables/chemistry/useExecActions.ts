import {
  items, buretteInitialVolumeMap, buretteTotalConsumedMap, buretteConsumedThisRefill,
  balanceTareMap, containerTareMap, getLiquid, getBurette, getSepFunnelState, getBurnerState, getHotPlateState, buildToolState,
  isContainer, isBurette,
  selectedChemical, hasSelectedChemicalMap, pendingChemicalFill,
  pendingSolidSelect, spatulaSelectedSolid, solidMap,
} from './useChemistryLab';
import { applyIndicator } from './useReactionEngine';
import { pushMacroHistory, pushMicroHistory } from './useChemistryHistory';
import { computeBalanceWeight, getContainerWeight, findContainerBelow, buretteWarning } from './useLabSimulation';
import { handleDropMixWithRecording } from './useBuretteMixRecorder';
import { isHotPlate } from './chemLabIds';
import type { LabItem } from './useChemistryTools';
import type { ToolState } from './chemLabTypes';

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
    else { const liq = getLiquid(uid); liq.volume = 0; liq.chemicalId = undefined; liq.indicators = []; liq.ph = null; liq.reactants = {}; liq.equation = undefined; liq.precipitate = false; liq.precipitateColor = undefined; liq.gasEvolution = false; liq.baseColor = undefined; liq.label = 'water'; }
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
          if (!s.chemicalId) { s.label = selectedChemical.id; }
          else if (!s.label.includes(selectedChemical.id)) { s.label = s.label + ' + ' + selectedChemical.id; }
          applyIndicator(selectedChemical.id, uid);
        } else {
          s.volume = Math.min(s.maxVolume, s.volume + amount);
          s.color = selectedChemical.color;
          s.opacity = selectedChemical.opacity;
          s.label = selectedChemical.id;
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

export function toggleBuretteValve(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const b = getBurette(item.uid);
  const wasOpen = b.valveOpen;
  b.valveOpen = !b.valveOpen;
  if (!wasOpen && b.valveOpen) {
    // Commit previous consumption before starting a new drip cycle
    commitBuretteConsumption(item.uid);
    buretteInitialVolumeMap[item.uid] = b.volume;
  }
  if (wasOpen && !b.valveOpen) {
    // Valve just closed: clear warning
    buretteWarning.value = null;
  }
  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
}

export function toggleSepFunnelValve(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const s = getSepFunnelState(item.uid); s.valveOpen = !s.valveOpen;
  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
}

export function buretteDropOne(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  const b = getBurette(item.uid);
  if (b.volume <= 0) return;
  const container = findContainerBelow(item);
  if (!container) return;
  const bLiquid = getLiquid(container.uid);
  if (bLiquid.volume >= bLiquid.maxVolume) return;

  pushMicroHistory();
  const flowRate = 0.05;
  const transfer = Math.min(flowRate, b.volume, bLiquid.maxVolume - bLiquid.volume);

  b.volume = +(b.volume - transfer).toFixed(2);
  buretteConsumedThisRefill[item.uid] = (buretteConsumedThisRefill[item.uid] || 0) + transfer;
  bLiquid.volume = +(bLiquid.volume + transfer).toFixed(2);

  if (b.chemicalId) {
    handleDropMixWithRecording({
      sourceUid: item.uid,
      targetUid: container.uid,
      sourceChemicalId: b.chemicalId,
      targetChemicalId: bLiquid.chemicalId || '',
      dropVolume: transfer,
    });
    if (bLiquid.ph !== null && bLiquid.ph !== undefined) {
      if (bLiquid.ph >= 9.0) buretteWarning.value = 'exceeded';
      else if (bLiquid.ph >= 8.0) buretteWarning.value = 'equivalence';
      else if (bLiquid.ph >= 7.5) buretteWarning.value = 'approaching';
      else buretteWarning.value = null;
    }
  } else {
    bLiquid.color = b.color;
    bLiquid.opacity = b.opacity;
  }

  if (selectedItemRef.value?.uid === item.uid) emit('select', item, buildToolState(item));
  if (selectedItemRef.value?.uid === container.uid) emit('select', container, buildToolState(container));
}

export function toggleBurner(item: LabItem, selectedItemRef: { value: LabItem | null }, emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void) {
  if (isHotPlate(item.id)) {
    const hp = getHotPlateState(item.uid);
    hp.on = !hp.on;
  } else {
    const s = getBurnerState(item.uid); s.on = !s.on;
  }
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

export function spatulaSelectSolid(spatulaUid: string) {
  pendingSolidSelect.value = spatulaUid;
}

export function spatulaAddSolid(
  spatulaUid: string,
  targetUid: string,
  grams: number,
  selectedItemRef: { value: LabItem | null },
  emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void,
) {
  if (!spatulaSelectedSolid.value) return;
  const target = items.value.find(i => i.uid === targetUid);
  if (!target || !isContainer(target.id)) return;

  pushMacroHistory();

  const chemId = spatulaSelectedSolid.value.chemicalId;

  // Track solid in solidMap on the target container
  if (!solidMap[targetUid]) {
    solidMap[targetUid] = { amount: 0, type: chemId };
  }
  if (solidMap[targetUid].type !== chemId) {
    solidMap[targetUid] = { amount: 0, type: chemId };
  }
  solidMap[targetUid].amount = +(solidMap[targetUid].amount + grams).toFixed(2);

  // Also track in liquidMap.reactants so reaction engine can detect it
  const liq = getLiquid(targetUid);
  if (!liq.reactants) liq.reactants = {};
  liq.reactants[chemId] = (liq.reactants[chemId] || 0) + grams;

  // If container has a liquid, try to trigger reaction
  if (liq.volume > 0 && liq.chemicalId) {
    // Simulate the solid being added as a "drop" to trigger reaction engine
    handleDropMixWithRecording({
      sourceUid: spatulaUid,
      targetUid: targetUid,
      sourceChemicalId: chemId,
      targetChemicalId: liq.chemicalId,
      dropVolume: grams,
    });
  }

  // Update label to show solid was added
  if (!liq.label || liq.label === 'water') {
    liq.label = chemId;
  } else if (!liq.label.includes(chemId)) {
    liq.label = liq.label + ' + ' + chemId;
  }

  if (selectedItemRef.value?.uid === targetUid) emit('select', target, buildToolState(target));
}
