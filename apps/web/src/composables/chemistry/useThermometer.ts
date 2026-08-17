import type { LabItem } from './useChemistryTools';
import { items, liquidMap, burnerMap, hotPlateMap, isContainer } from './useChemistryLab';
import { isBunsenBurner, isHeatingMantle, isHotPlate, getContainerHalfWidth } from './chemLabIds';

const AMBIENT = 25;
const IMMERSION_RADIUS = 50;

export interface ThermEnv {
  temperature: number;
  inLiquid: boolean;
  liquidUid: string | null;
}

export function getEnvironmentTemp(thermometer: LabItem): ThermEnv {
  const tx = thermometer.x + 15;
  const ty = thermometer.y + 50;

  // 1) Check immersion — nearest container with liquid within radius
  let nearestLiqTemp: number | null = null;
  let nearestLiqUid: string | null = null;
  let nearestLiqDist = Infinity;

  for (const i of items.value) {
    if (i.uid === thermometer.uid || !isContainer(i.id)) continue;
    const liq = liquidMap[i.uid];
    if (!liq || liq.volume <= 0) continue;
    const cx = i.x + getContainerHalfWidth(i.id);
    const cy = i.y + 30;
    const d = Math.sqrt((cx - tx) ** 2 + (cy - ty) ** 2);
    if (d < nearestLiqDist) {
      nearestLiqDist = d;
      nearestLiqTemp = liq.temperature;
      nearestLiqUid = i.uid;
    }
  }

  if (nearestLiqTemp !== null && nearestLiqDist < IMMERSION_RADIUS) {
    return { temperature: nearestLiqTemp, inLiquid: true, liquidUid: nearestLiqUid };
  }

  // 2) Not immersed — compute weighted ambient from all heat sources
  let totalHeat = AMBIENT;
  let totalWeight = 1;

  for (const i of items.value) {
    if (i.uid === thermometer.uid) continue;

    const ix = i.x + getContainerHalfWidth(i.id);
    const iy = i.y + 30;
    const dist = Math.sqrt((ix - tx) ** 2 + (iy - ty) ** 2);
    if (dist < 5) continue;

    if (isBunsenBurner(i.id) || isHeatingMantle(i.id)) {
      const b = burnerMap[i.uid];
      if (b && b.on) {
        const flameTemp = 300 + b.intensity * 200;
        const factor = 1 / (1 + dist * 0.015);
        totalHeat += (flameTemp - AMBIENT) * factor;
        totalWeight += factor;
      }
    } else if (isHotPlate(i.id)) {
      const hp = hotPlateMap[i.uid];
      if (hp && hp.on) {
        const plateTemp = 150;
        const factor = 1 / (1 + dist * 0.02);
        totalHeat += (plateTemp - AMBIENT) * factor;
        totalWeight += factor;
      }
    } else if (isContainer(i.id)) {
      const liq = liquidMap[i.uid];
      if (!liq) continue;
      const diff = liq.temperature - AMBIENT;
      if (Math.abs(diff) > 1) {
        const factor = 1 / (1 + dist * 0.025);
        totalHeat += diff * factor;
        totalWeight += factor;
      }
    }
  }

  const result = totalHeat / totalWeight;
  return {
    temperature: Math.max(-10, Math.min(300, Math.round(result * 10) / 10)),
    inLiquid: false,
    liquidUid: null,
  };
}

export function getTemperatureReading(thermometer: LabItem): number | null {
  const env = getEnvironmentTemp(thermometer);
  if (env.inLiquid) return env.temperature;
  if (env.temperature === AMBIENT) return null;
  return env.temperature;
}
