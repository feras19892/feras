import { liquidMap, buretteMap, items, pipetteMap, sepFunnelMap, burnerMap, balanceTareMap, containerTareMap, simSpeed, itemZoomMap, phProbeTipMap, solidMap, stopperMap, pourFlowMap, tiltAngleMap, buretteInitialVolumeMap, buretteTotalConsumedMap, buretteConsumedThisRefill, hasSelectedChemicalMap } from './useChemistryLab';

const STORAGE_KEY = 'chem-lab-session-v1';

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
      buretteInitialVolumes: { ...buretteInitialVolumeMap },
      buretteTotalConsumeds: { ...buretteTotalConsumedMap },
      buretteConsumedThisRefills: { ...buretteConsumedThisRefill },
      hasSelectedChemicals: { ...hasSelectedChemicalMap },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save session', e);
  }
}

export function loadSession(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.items) items.value = data.items;
    if (data.liquids) Object.assign(liquidMap, data.liquids);
    if (data.burettes) Object.assign(buretteMap, data.burettes);
    if (data.pipettes) Object.assign(pipetteMap, data.pipettes);
    if (data.sepFunnels) Object.assign(sepFunnelMap, data.sepFunnels);
    if (data.burners) Object.assign(burnerMap, data.burners);
    if (data.balanceTares) Object.assign(balanceTareMap, data.balanceTares);
    if (data.containerTares) Object.assign(containerTareMap, data.containerTares);
    if (data.simSpeed) simSpeed.value = data.simSpeed;
    if (data.itemZooms) Object.assign(itemZoomMap, data.itemZooms);
    if (data.phProbeTips) Object.assign(phProbeTipMap, data.phProbeTips);
    if (data.solids) Object.assign(solidMap, data.solids);
    if (data.stoppers) Object.assign(stopperMap, data.stoppers);
    if (data.pourFlows) Object.assign(pourFlowMap, data.pourFlows);
    if (data.tiltAngles) Object.assign(tiltAngleMap, data.tiltAngles);
    if (data.buretteInitialVolumes) Object.assign(buretteInitialVolumeMap, data.buretteInitialVolumes);
    if (data.buretteTotalConsumeds) Object.assign(buretteTotalConsumedMap, data.buretteTotalConsumeds);
    if (data.buretteConsumedThisRefills) Object.assign(buretteConsumedThisRefill, data.buretteConsumedThisRefills);
    if (data.hasSelectedChemicals) Object.assign(hasSelectedChemicalMap, data.hasSelectedChemicals);
  } catch (e) {
    console.warn('Failed to load session', e);
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
  Object.keys(buretteInitialVolumeMap).forEach(k => delete buretteInitialVolumeMap[k]);
  Object.keys(buretteTotalConsumedMap).forEach(k => delete buretteTotalConsumedMap[k]);
  Object.keys(buretteConsumedThisRefill).forEach(k => delete buretteConsumedThisRefill[k]);
  localStorage.removeItem(STORAGE_KEY);
}
