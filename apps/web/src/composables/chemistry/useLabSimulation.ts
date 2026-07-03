import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import {
  items, getLiquid, getBurette,
  receivingMap, pourFlowMap, tiltAngleMap,
  getBurnerState, simSpeed, phProbeTipMap, stopperMap,
  buretteConsumedThisRefill,
  isContainer, retortStandMap
} from './useChemistryLab';
import { isBeaker, isTestTube } from './chemLabIds';
import { handleDropMixWithRecording } from './useBuretteMixRecorder';
import { getPhReading } from './usePhMeter';
import { pushMicroHistory } from './useChemistryHistory';

// Re-export extracted functions for backward compatibility
export { phColor, getPhReading } from './usePhMeter';
export { computeBalanceWeight, getContainerWeight, getBalanceReading } from './useBalance';
export { stepUndo, stepRedo } from './useStepControl';

// ================== BURETTE WARNING ==================
export type BuretteWarning = 'approaching' | 'equivalence' | 'exceeded' | null;
export const buretteWarning = ref<BuretteWarning>(null);

// ================== BURETTE FIND ==================
export function findContainerBelow(burette: LabItem): LabItem | null {
  const buretteTipX = burette.x + 30; // center of burette tip (width=60)
  const buretteTipY = burette.y + 170; // tip Y position

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

    // Detect if beaker is attached to bottom clamp (scale=0.5, width=70)
    let isBottomSlot = false;
    for (const st of Object.values(retortStandMap)) {
      if (st.bottomSlotOccupant === i.uid) { isBottomSlot = true; break; }
    }

    // Container opening center and radius
    const containerCenterX = i.x + (isBeaker(i.id) ? (isBottomSlot ? 35 : 70) : isTestTube(i.id) ? 20 : 40);
    const dx = Math.abs(containerCenterX - buretteTipX);
    const openingRadius = isBeaker(i.id) ? (isBottomSlot ? 24 : 35) : isTestTube(i.id) ? 20 : 40;

    // Allow tip slightly above or inside the container
    const containerTopY = i.y;
    const containerHeight = isBeaker(i.id) ? (isBottomSlot ? 100 : 200) : isTestTube(i.id) ? 80 : 100;

    return dx <= openingRadius && buretteTipY >= containerTopY - 30 && buretteTipY <= containerTopY + containerHeight;
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
    (other.id === 'bunsen-burner' || other.id === 'heating-mantle') &&
    getBurnerState(other.uid).on &&
    Math.abs(other.x - item.x) < 80 && other.y > item.y && other.y < item.y + 250
  );
}

// ================== SIMULATION LOOP ==================
let simTimer = 0;

export function startSimulation(_onSync: (item: LabItem | null) => void) {
  function run() {
    // Clear receiving state
    Object.keys(receivingMap).forEach(k => delete receivingMap[k]);

    // Burette dripping
    for (const item of items.value) {
      if (item.id !== 'burette') continue;
      const bState = getBurette(item.uid);
      if (!bState.valveOpen || bState.volume <= 0) continue;

      const container = findContainerBelow(item);
      if (!container) continue;
      const bLiquid = getLiquid(container.uid);
      if (bLiquid.volume >= bLiquid.maxVolume) continue;

      // Record micro-history snapshot before each drop
      pushMicroHistory();

      const flowRate = 0.05;
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
        if (bLiquid.ph !== null && bLiquid.ph !== undefined) {
          if (bLiquid.ph >= 9.0) {
            buretteWarning.value = 'exceeded';
          } else if (bLiquid.ph >= 8.0) {
            buretteWarning.value = 'equivalence';
          } else if (bLiquid.ph >= 7.5) {
            buretteWarning.value = 'approaching';
          }
        }
      } else {
        // No chemical in burette, just copy color
        bLiquid.color = bState.color;
        bLiquid.opacity = bState.opacity;
      }
      receivingMap[container.uid] = true;
    }

    // Temperature + pH simulation
    for (const item of items.value) {
      if (!isContainer(item.id)) continue;
      const liq = getLiquid(item.uid);
      const burner = items.value.find((o: LabItem) =>
        o.uid !== item.uid &&
        (o.id === 'bunsen-burner' || o.id === 'heating-mantle') &&
        getBurnerState(o.uid).on &&
        Math.abs(o.x - item.x) < 80 && o.y > item.y && o.y < item.y + 250
      );
      const hasStopper = !!stopperMap[item.uid];
      if (burner) {
        liq.heated = true;
        const intensity = getBurnerState(burner.uid).intensity;
        // Realistic heating: proportional to intensity, ~0.6°C/sec max at 1x
        const rate = 0.01 * intensity * simSpeed.value;
        if (liq.temperature < 100) liq.temperature = Math.min(100, +(liq.temperature + rate).toFixed(2));
        // Evaporation: lose ~1.2mL/min when heated, blocked by rubber stopper
        if (!hasStopper && liq.volume > 0 && liq.temperature > 50) {
          const evapRate = 0.02 * intensity * simSpeed.value;
          liq.volume = Math.max(0, +(liq.volume - evapRate).toFixed(2));
        }
      } else {
        liq.heated = false;
        const coolRate = 0.02 * simSpeed.value;
        if (liq.temperature > 25) liq.temperature = Math.max(25, +(liq.temperature - coolRate).toFixed(2));
      }
      const phItem = items.value.find((other: LabItem) =>
        other.id === 'ph-meter' && phProbeTipMap[other.uid] &&
        Math.abs((item.x + 40) - phProbeTipMap[other.uid].x) < 60 &&
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
        if (!dst.label.includes('+') && src.label !== dst.label) {
          dst.label = dst.label + ' + ' + src.label;
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
}

