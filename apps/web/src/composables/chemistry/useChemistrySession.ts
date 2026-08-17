import {
  liquidMap, buretteMap, items, pipetteMap, sepFunnelMap, burnerMap,
  balanceTareMap, containerTareMap, simSpeed, itemZoomMap, phProbeTipMap,
  solidMap, stopperMap, pourFlowMap, tiltAngleMap, rackSlotsMap,
  buretteInitialVolumeMap, buretteTotalConsumedMap, buretteConsumedThisRefill,
  hasSelectedChemicalMap, beakerClampMap, hotPlateMap, woodenBaseMap,
  retortStandMap, spillParticles, receivingMap, resetUid
} from './useChemistryLab';
import { buretteWarning } from './useLabSimulation';

const STORAGE_KEY = 'chem-lab-session-v20';

export function saveSession(): void {
  try {
    const data = {
      items: items.value,
      liquids: { ...liquidMap },
      burettes: { ...buretteMap },
      pipettes: { ...pipetteMap },
      sepFunnels: { ...sepFunnelMap },
      burners: { ...burnerMap },
      balanceTares: { ...balanceTareMap },
      containerTares: { ...containerTareMap },
      simSpeed: simSpeed.value,
      itemZooms: { ...itemZoomMap },
      phProbeTips: { ...phProbeTipMap },
      solids: { ...solidMap },
      stoppers: { ...stopperMap },
      pourFlows: { ...pourFlowMap },
      tiltAngles: { ...tiltAngleMap },
      rackSlots: { ...rackSlotsMap },
      buretteInitialVolumes: { ...buretteInitialVolumeMap },
      buretteTotalConsumeds: { ...buretteTotalConsumedMap },
      buretteConsumedThisRefills: { ...buretteConsumedThisRefill },
      hasSelectedChemicals: { ...hasSelectedChemicalMap },
      beakerClamps: { ...beakerClampMap },
      hotPlates: { ...hotPlateMap },
      woodenBases: { ...woodenBaseMap },
      retortStands: { ...retortStandMap },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore storage errors */
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced version of saveSession — waits 500ms of inactivity before saving */
export function saveSessionDebounced(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveSession(); saveTimer = null; }, 500);
}

export function loadSession(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return;
    if (!Array.isArray(data.items)) return;
    // Clear existing state before loading to avoid stale keys
    items.value = [];
    Object.keys(liquidMap).forEach(k => delete liquidMap[k]);
    Object.keys(buretteMap).forEach(k => delete buretteMap[k]);
    Object.keys(pipetteMap).forEach(k => delete pipetteMap[k]);
    Object.keys(sepFunnelMap).forEach(k => delete sepFunnelMap[k]);
    Object.keys(burnerMap).forEach(k => delete burnerMap[k]);
    Object.keys(balanceTareMap).forEach(k => delete balanceTareMap[k]);
    Object.keys(containerTareMap).forEach(k => delete containerTareMap[k]);
    Object.keys(itemZoomMap).forEach(k => delete itemZoomMap[k]);
    Object.keys(phProbeTipMap).forEach(k => delete phProbeTipMap[k]);
    Object.keys(solidMap).forEach(k => delete solidMap[k]);
    Object.keys(stopperMap).forEach(k => delete stopperMap[k]);
    Object.keys(pourFlowMap).forEach(k => delete pourFlowMap[k]);
    Object.keys(tiltAngleMap).forEach(k => delete tiltAngleMap[k]);
    Object.keys(rackSlotsMap).forEach(k => delete rackSlotsMap[k]);
    Object.keys(buretteInitialVolumeMap).forEach(k => delete buretteInitialVolumeMap[k]);
    Object.keys(buretteTotalConsumedMap).forEach(k => delete buretteTotalConsumedMap[k]);
    Object.keys(buretteConsumedThisRefill).forEach(k => delete buretteConsumedThisRefill[k]);
    Object.keys(hasSelectedChemicalMap).forEach(k => delete hasSelectedChemicalMap[k]);
    Object.keys(beakerClampMap).forEach(k => delete beakerClampMap[k]);
    Object.keys(hotPlateMap).forEach(k => delete hotPlateMap[k]);
    Object.keys(woodenBaseMap).forEach(k => delete woodenBaseMap[k]);
    Object.keys(retortStandMap).forEach(k => delete retortStandMap[k]);
    Object.keys(receivingMap).forEach(k => delete receivingMap[k]);
    spillParticles.splice(0, spillParticles.length);
    // Now load saved data
    if (data.items) items.value = data.items;
    if (data.liquids) Object.assign(liquidMap, data.liquids);
    if (data.burettes) Object.assign(buretteMap, data.burettes);
    if (data.pipettes) Object.assign(pipetteMap, data.pipettes);
    if (data.sepFunnels) Object.assign(sepFunnelMap, data.sepFunnels);
    if (data.burners) Object.assign(burnerMap, data.burners);
    if (data.balanceTares) Object.assign(balanceTareMap, data.balanceTares);
    if (data.containerTares) Object.assign(containerTareMap, data.containerTares);
    if (typeof data.simSpeed === 'number') simSpeed.value = data.simSpeed;
    if (data.itemZooms) Object.assign(itemZoomMap, data.itemZooms);
    if (data.phProbeTips) Object.assign(phProbeTipMap, data.phProbeTips);
    if (data.solids) Object.assign(solidMap, data.solids);
    if (data.stoppers) Object.assign(stopperMap, data.stoppers);
    if (data.pourFlows) Object.assign(pourFlowMap, data.pourFlows);
    if (data.tiltAngles) Object.assign(tiltAngleMap, data.tiltAngles);
    if (data.rackSlots) Object.assign(rackSlotsMap, data.rackSlots);
    if (data.buretteInitialVolumes) Object.assign(buretteInitialVolumeMap, data.buretteInitialVolumes);
    if (data.buretteTotalConsumeds) Object.assign(buretteTotalConsumedMap, data.buretteTotalConsumeds);
    if (data.buretteConsumedThisRefills) Object.assign(buretteConsumedThisRefill, data.buretteConsumedThisRefills);
    if (data.hasSelectedChemicals) Object.assign(hasSelectedChemicalMap, data.hasSelectedChemicals);
    if (data.beakerClamps) Object.assign(beakerClampMap, data.beakerClamps);
    if (data.hotPlates) Object.assign(hotPlateMap, data.hotPlates);
    if (data.woodenBases) Object.assign(woodenBaseMap, data.woodenBases);
    if (data.retortStands) Object.assign(retortStandMap, data.retortStands);
  } catch {
    /* ignore corrupted session */
  }
}

export function clearSession(): void {
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
  Object.keys(rackSlotsMap).forEach(k => delete rackSlotsMap[k]);
  Object.keys(buretteInitialVolumeMap).forEach(k => delete buretteInitialVolumeMap[k]);
  Object.keys(buretteTotalConsumedMap).forEach(k => delete buretteTotalConsumedMap[k]);
  Object.keys(buretteConsumedThisRefill).forEach(k => delete buretteConsumedThisRefill[k]);
  Object.keys(beakerClampMap).forEach(k => delete beakerClampMap[k]);
  Object.keys(hotPlateMap).forEach(k => delete hotPlateMap[k]);
  Object.keys(woodenBaseMap).forEach(k => delete woodenBaseMap[k]);
  Object.keys(retortStandMap).forEach(k => delete retortStandMap[k]);
  Object.keys(receivingMap).forEach(k => delete receivingMap[k]);
  spillParticles.splice(0, spillParticles.length);
  buretteWarning.value = null;
  resetUid();
  localStorage.removeItem(STORAGE_KEY);
}
