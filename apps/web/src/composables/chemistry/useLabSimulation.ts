import type { LabItem } from './useChemistryTools';
import {
  liquidMap, getLiquid,
  buretteMap, getBurette,
  receivingMap, pourFlowMap, tiltAngleMap,
  burnerMap, getBurnerState, balanceTareMap, containerTareMap, simSpeed, phProbeTipMap, stopperMap,
  isContainer
} from './useChemistryLab';
import { items } from './useChemistryLab';

// ================== BURETTE FIND ==================
export function findContainerBelow(burette: LabItem): LabItem | null {
  const tipY = burette.y + 239;
  const candidates = items.value.filter((i: LabItem) => {
    if (i.uid === burette.uid || !isContainer(i.id)) return false;
    const containerTopY = i.y + 8;
    const dy = containerTopY - tipY;
    return dy >= 0 && dy <= 200; // any container below the burette within reasonable range
  });
  if (candidates.length === 0) return null;
  // Pick the closest one horizontally to the burette tip
  const tipX = burette.x + 42;
  return candidates.reduce((closest, current) => {
    const closestDx = Math.abs(closest.x + 50 - tipX);
    const currentDx = Math.abs(current.x + 50 - tipX);
    return currentDx < closestDx ? current : closest;
  }, candidates[0]);
}

// ================== pH ==================
export function phColor(ph: number | null): string {
  if (ph === null) return '#94a3b8';
  if (ph < 3) return '#ef4444';
  if (ph < 7) return '#f59e0b';
  if (ph === 7) return '#22c55e';
  if (ph < 11) return '#3b82f6';
  return '#8b5cf6';
}

export function getPhReading(phMeter: LabItem): number | null {
  const tip = phProbeTipMap[phMeter.uid];
  if (!tip) return null;
  const target = items.value.find((i: LabItem) => {
    if (i.uid === phMeter.uid || !isContainer(i.id)) return false;
    const dx = Math.abs((i.x + 40) - tip.x);
    const dy = Math.abs((i.y + 10) - tip.y);
    return dx < 60 && dy < 50; // probe tip is inside or near the container
  });
  if (!target) return null;
  const label = getLiquid(target.uid).label;
  if (label.includes('HCl') || label.includes('حمض') || label.includes('acid')) return 1.5 + Math.random() * 0.5;
  if (label.includes('NaOH') || label.includes('قاعدة') || label.includes('base') || label.includes('هيدروكسيد')) return 12.5 + Math.random() * 0.5;
  if (label.includes('ماء') || label.includes('water') || label.includes('H₂O')) return 7.0;
  if (label.includes(' buffer') || label.includes('بفر')) return 7.0;
  return 7.0;
}

// ================== BALANCE ==================
export function computeBalanceWeight(balance: LabItem): number {
  const onTop = items.value.filter((i: LabItem) =>
    i.uid !== balance.uid && Math.abs(i.x - balance.x) < 80 && i.y < balance.y + 50 && i.y > balance.y - 300
  );
  let total = 0;
  for (const item of onTop) {
    total += 5; // container weight
    if (isContainer(item.id)) {
      total += getLiquid(item.uid).volume; // liquid volume ≈ weight in grams
    }
  }
  return total;
}

export function getContainerWeight(balance: LabItem): number {
  // Weight of empty containers on the balance (used for container tare)
  const onTop = items.value.filter((i: LabItem) =>
    i.uid !== balance.uid && Math.abs(i.x - balance.x) < 80 && i.y < balance.y + 50 && i.y > balance.y - 300
  );
  return onTop.length * 5;
}

export function getBalanceReading(uid: string): number | null {
  const balance = items.value.find((i: LabItem) => i.uid === uid && i.id === 'digital-balance');
  if (!balance) return null;
  const gross = computeBalanceWeight(balance);
  const fullTare = balanceTareMap[uid] || 0;
  const containerTare = containerTareMap[uid] || 0;
  // If container tare is set, subtract it to show only "liquid" weight
  const effectiveTare = containerTare > 0 ? containerTare : fullTare;
  return +(gross - effectiveTare).toFixed(2);
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

export function startSimulation(onSync: (item: LabItem | null) => void) {
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

      const flowRate = 0.12;
      const transfer = Math.min(flowRate, bState.volume, bLiquid.maxVolume - bLiquid.volume);

      bState.volume = +(bState.volume - transfer).toFixed(2);
      bLiquid.volume = +(bLiquid.volume + transfer).toFixed(2);
      bLiquid.color = bState.color;
      bLiquid.opacity = bState.opacity;
      if (bLiquid.volume <= transfer + 0.1) {
        bLiquid.label = 'محلول من السحاحة';
      } else if (!bLiquid.label.includes('مخلوط')) {
        bLiquid.label = bLiquid.label + ' + مخلوط';
      }
      receivingMap[container.uid] = true;
    }

    // Temperature + pH simulation
    for (const item of items.value) {
      if (!isContainer(item.id)) continue;
      const liq = getLiquid(item.uid);
      const nearBurner = items.value.some((other: LabItem) =>
        other.uid !== item.uid &&
        (other.id === 'bunsen-burner' || other.id === 'heating-mantle') &&
        getBurnerState(other.uid).on &&
        Math.abs(other.x - item.x) < 80 && other.y > item.y && other.y < item.y + 250
      );
      const hasStopper = !!stopperMap[item.uid];
      if (nearBurner) {
        liq.heated = true;
        const burner = items.value.find(o => (o.id === 'bunsen-burner' || o.id === 'heating-mantle') && getBurnerState(o.uid).on && Math.abs(o.x - item.x) < 80 && o.y > item.y && o.y < item.y + 250);
        const intensity = burner ? getBurnerState(burner.uid).intensity : 1;
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
        if (!dst.label.includes('مخلوط') && src.label !== dst.label) {
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
