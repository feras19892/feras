import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import {
  items, getLiquid, getBurette,
  receivingMap, pourFlowMap, tiltAngleMap,
  getBurnerState, getHotPlateState, simSpeed, phProbeTipMap, stopperMap,
  buretteConsumedThisRefill,
  isContainer, retortStandMap,
} from './useChemistryLab';
import { isBeaker, isTestTube, isBurette, isBunsenBurner, isHeatingMantle, isHotPlate, isPhMeter, getContainerHalfWidth } from './chemLabIds';
import { handleDropMixWithRecording } from './useBuretteMixRecorder';
import { getPhReading } from './usePhMeter';
import { pushMicroHistory } from './useChemistryHistory';
import { updateBuretteWarning } from './buretteWarningUtils';

// Re-export extracted functions for backward compatibility
export { phColor, getPhReading } from './usePhMeter';
export { computeBalanceWeight, getContainerWeight, getBalanceReading } from './useBalance';
export { getTemperatureReading } from './useThermometer';
export { stepUndo, stepRedo } from './useStepControl';

// ================== BURETTE WARNING ==================
export type BuretteWarning = 'approaching' | 'equivalence' | 'exceeded' | null;
export const buretteWarning = ref<BuretteWarning>(null);

// ================== DRIP RATE MODES ==================
export type DripRateMode = 'drop' | 'slow' | 'fast';
export const dripRateMode = ref<DripRateMode>('drop');
const FLOW_RATES: Record<DripRateMode, number> = { drop: 0.05, slow: 0.3, fast: 1.0 };

// ================== BURETTE FIND ==================
const BURETTE_TIP_OFFSET_X = 30;
const BURETTE_TIP_OFFSET_Y = 170;
const TIP_TOLERANCE_Y = 30;

const CONTAINER_GEOMETRY = {
  beaker:     { halfWidth: 70, openingRadius: 35, height: 200 },
  beakerSlot: { halfWidth: 35, openingRadius: 24, height: 100 },
  testTube:   { halfWidth: 20, openingRadius: 20, height: 80 },
  default:    { halfWidth: 40, openingRadius: 40, height: 100 },
} as const;

export function findContainerBelow(burette: LabItem): LabItem | null {
  const buretteTipX = burette.x + BURETTE_TIP_OFFSET_X;
  const buretteTipY = burette.y + BURETTE_TIP_OFFSET_Y;

  // Check if burette is attached to a retort stand
  let attachedStand: string | null = null;
  for (const [standUid, st] of Object.entries(retortStandMap)) {
    if (st.slotOccupants.includes(burette.uid)) {
      attachedStand = standUid;
      break;
    }
  }

  // Find all containers whose opening horizontally covers the burette tip
  const candidates = items.value.filter((i: LabItem) => {
    if (i.uid === burette.uid || !isContainer(i.id)) return false;

    let isBottomSlot = false;
    for (const st of Object.values(retortStandMap)) {
      if (st.bottomSlotOccupant === i.uid) { isBottomSlot = true; break; }
    }

    const geo = isBeaker(i.id)
      ? (isBottomSlot ? CONTAINER_GEOMETRY.beakerSlot : CONTAINER_GEOMETRY.beaker)
      : isTestTube(i.id)
        ? CONTAINER_GEOMETRY.testTube
        : CONTAINER_GEOMETRY.default;

    const containerCenterX = i.x + geo.halfWidth;
    const dx = Math.abs(containerCenterX - buretteTipX);
    const containerTopY = i.y;

    return dx <= geo.openingRadius
      && buretteTipY >= containerTopY - TIP_TOLERANCE_Y
      && buretteTipY <= containerTopY + geo.height;
  });

  if (candidates.length === 0) return null;

  // If attached to a stand, prefer the beaker on that same stand
  if (attachedStand) {
    const st = retortStandMap[attachedStand];
    const standBeaker = candidates.find(c => c.uid === st?.bottomSlotOccupant);
    if (standBeaker) return standBeaker;
  }

  // Return the closest one to the burette tip vertically
  return candidates.reduce((closest, current) => {
    const closestDy = Math.abs(closest.y - buretteTipY);
    const currentDy = Math.abs(current.y - buretteTipY);
    return currentDy < closestDy ? current : closest;
  });
}

// ================== HEATING ==================
export function isHeated(item: LabItem): boolean {
  if (item.type !== 'container') return false;
  return items.value.some((other: LabItem) =>
    other.uid !== item.uid &&
    ((isBunsenBurner(other.id) || isHeatingMantle(other.id)) || isHotPlate(other.id)) &&
    Math.abs(other.x - item.x) < 80 && other.y > item.y && other.y < item.y + 250 &&
    (isHotPlate(other.id) ? getHotPlateState(other.uid).on : getBurnerState(other.uid).on)
  );
}

// ================== SIMULATION LOOP ==================
let simTimer = 0;
let simRunning = false;

export function startSimulation(_onSync: (item: LabItem | null) => void) {
  if (simRunning) return;
  simRunning = true;
  function run() {
    // Check if any burette is actively dripping this frame
    let anyDripping = false;
    for (const item of items.value) {
      if (!isBurette(item.id)) continue;
      const bState = getBurette(item.uid);
      if (!bState.valveOpen || bState.volume <= 0) continue;
      const container = findContainerBelow(item);
      if (!container) continue;
      const bLiquid = getLiquid(container.uid);
      if (bLiquid.volume >= bLiquid.maxVolume) continue;
      anyDripping = true;
      break;
    }
    // Record a single micro-history snapshot per frame before any drops
    if (anyDripping) pushMicroHistory();

    // Burette dripping
    for (const item of items.value) {
      if (!isBurette(item.id)) continue;
      const bState = getBurette(item.uid);
      if (!bState.valveOpen || bState.volume <= 0) continue;

      const container = findContainerBelow(item);
      if (!container) continue;
      const bLiquid = getLiquid(container.uid);
      if (bLiquid.volume >= bLiquid.maxVolume) continue;

      const flowRate = FLOW_RATES[dripRateMode.value];
      const transfer = Math.min(flowRate, bState.volume, bLiquid.maxVolume - bLiquid.volume);

      bState.volume = +(bState.volume - transfer).toFixed(2);
      // Track burette consumption
      buretteConsumedThisRefill[item.uid] = (buretteConsumedThisRefill[item.uid] || 0) + transfer;

      // Always add volume to target container
      bLiquid.volume = +(bLiquid.volume + transfer).toFixed(2);

      // Trigger chemical reaction via reaction engine
      if (bState.chemicalId) {
        handleDropMixWithRecording({
          sourceUid: item.uid,
          targetUid: container.uid,
          sourceChemicalId: bState.chemicalId,
          targetChemicalId: bLiquid.chemicalId || '',
          dropVolume: transfer,
        });

        // Update burette warning based on target pH
        updateBuretteWarning(bLiquid.ph, bLiquid.indicators);
      } else {
        // No chemical in burette, just copy color
        bLiquid.color = bState.color;
        bLiquid.opacity = bState.opacity;
      }
      receivingMap[container.uid] = true;
    }

    // Clear receiving flags for containers no longer being dripped into
    const activeReceivers = new Set<string>();
    for (const item of items.value) {
      if (!isBurette(item.id)) continue;
      const bState = getBurette(item.uid);
      if (!bState.valveOpen || bState.volume <= 0) continue;
      const container = findContainerBelow(item);
      if (container) activeReceivers.add(container.uid);
    }
    for (const dstUid of Object.keys(pourFlowMap)) activeReceivers.add(dstUid);
    for (const uid of Object.keys(receivingMap)) {
      if (!activeReceivers.has(uid)) delete receivingMap[uid];
    }

    // Temperature + pH simulation — pre-filter heat sources & pH meters once
    const heatSources = items.value.filter((o: LabItem) =>
      (isBunsenBurner(o.id) || isHeatingMantle(o.id) || isHotPlate(o.id))
    );
    const phMeters = items.value.filter((o: LabItem) =>
      isPhMeter(o.id) && phProbeTipMap[o.uid]
    );
    for (const item of items.value) {
      if (!isContainer(item.id)) continue;
      const liq = getLiquid(item.uid);
      const burner = heatSources.find((o: LabItem) => {
        if (o.uid === item.uid) return false;
        if (isBunsenBurner(o.id) || isHeatingMantle(o.id)) {
          return getBurnerState(o.uid).on &&
            Math.abs(o.x - item.x) < 100 && o.y > item.y - 20 && o.y < item.y + 300;
        }
        if (isHotPlate(o.id)) {
          const hp = getHotPlateState(o.uid);
          return hp.on &&
            Math.abs(o.x - item.x) < 100 && o.y > item.y - 20 && o.y < item.y + 300;
        }
        return false;
      });
      const hasStopper = !!stopperMap[item.uid];
      if (burner) {
        liq.heated = true;
        const isHotPlateItem = isHotPlate(burner.id);
        const intensity = isHotPlateItem ? 0.8 : getBurnerState(burner.uid).intensity;
        const volumeFactor = 10 / Math.max(liq.volume, 10);
        const rate = 0.05 * intensity * simSpeed.value * volumeFactor;
        if (liq.temperature < 100) liq.temperature = Math.min(100, +(liq.temperature + rate).toFixed(2));
        if (!hasStopper && liq.volume > 0 && liq.temperature > 50) {
          const evapRate = 0.02 * intensity * simSpeed.value * volumeFactor;
          liq.volume = Math.max(0, +(liq.volume - evapRate).toFixed(2));
        }
      } else {
        liq.heated = false;
        const volumeFactor = 10 / Math.max(liq.volume, 10);
        const coolRate = 0.008 * simSpeed.value * volumeFactor;
        if (liq.temperature > 25) liq.temperature = Math.max(25, +(liq.temperature - coolRate).toFixed(2));
      }
      const phItem = phMeters.find((other: LabItem) =>
        Math.abs((item.x + getContainerHalfWidth(item.id)) - phProbeTipMap[other.uid].x) < 60 &&
        Math.abs((item.y + 10) - phProbeTipMap[other.uid].y) < 50
      );
      if (phItem) {
        liq.ph = getPhReading(phItem);
      }
    }

    // Continuous pour flow between containers
    for (const [srcUid, dstUid] of Object.entries(pourFlowMap)) {
      const src = getLiquid(srcUid);
      const dst = getLiquid(dstUid);
      const flowRate = 0.25; // mL per frame (~15 mL/sec)
      const amount = Math.min(flowRate, src.volume, dst.maxVolume - dst.volume);
      if (amount > 0) {
        src.volume = +(src.volume - amount).toFixed(2);
        dst.volume = +(dst.volume + amount).toFixed(2);
        dst.color = src.color; dst.opacity = src.opacity;
        if (src.label !== dst.label && !dst.label.includes(src.label)) {
          dst.label = dst.label + ' + ' + src.label;
        }
        // Trigger chemical reaction if both have chemical IDs
        if (src.chemicalId && dst.chemicalId && src.chemicalId !== dst.chemicalId) {
          handleDropMixWithRecording({
            sourceUid: srcUid,
            targetUid: dstUid,
            sourceChemicalId: src.chemicalId,
            targetChemicalId: dst.chemicalId,
            dropVolume: amount,
          });
        } else if (src.chemicalId && !dst.chemicalId) {
          dst.chemicalId = src.chemicalId;
          dst.color = src.color; dst.opacity = src.opacity;
          dst.baseColor = src.baseColor || src.color;
          dst.ph = src.ph;
          if (!dst.label || dst.label === 'water') dst.label = src.label;
        }
        receivingMap[dstUid] = true;
      } else {
        // Source empty or destination full → stop flow
        delete pourFlowMap[srcUid];
      }
    }

    // Auto-pour when container is tilted > 45° with liquid and container below
    for (const item of items.value) {
      if (!isContainer(item.id)) continue;
      const angle = tiltAngleMap[item.uid] || 0;
      if (Math.abs(angle) < 45) continue;
      const liq = getLiquid(item.uid);
      if (liq.volume <= 0) continue;
      if (pourFlowMap[item.uid]) continue; // already pouring
      // Find container below
      const below = items.value.find((i: LabItem) =>
        i.uid !== item.uid && isContainer(i.id) &&
        Math.abs(i.x - item.x) < 80 && i.y > item.y + 50 && i.y < item.y + 250
      );
      if (below) {
        pourFlowMap[item.uid] = below.uid;
      }
    }

    simTimer = requestAnimationFrame(run);
  }
  simTimer = requestAnimationFrame(run);
}

export function stopSimulation() {
  cancelAnimationFrame(simTimer);
  simRunning = false;
}

