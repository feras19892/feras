import { ref } from 'vue';
import { items, retortStandMap } from './useChemistryLab';
import { isBurette, isPipette, isGradCylinder, isRetortStandAssembly } from './chemLabIds';

export const retortStandSnapUid = ref<string | null>(null);
export const bottomClampSnapUid = ref<string | null>(null);

const SNAP_DISTANCE = 140;
const BOTTOM_CLAMP_DISTANCE = 90;

export function getMagnetOffset(id: string): { x: number; y: number } {
  if (isBurette(id)) return { x: 30, y: 55 };
  if (isPipette(id)) return { x: 25, y: 82.1 };
  if (isGradCylinder(id)) return { x: 37.5, y: 55 };
  return { x: 0, y: 0 };
}

export function isClampAttachable(id: string): boolean {
  return isBurette(id) || isPipette(id) || isGradCylinder(id);
}

export function findNearestSlot(itemUid: string, itemX: number, itemY: number, itemId: string): { standUid: string; slotIdx: number } | null {
  let nearestStand: string | null = null;
  let nearestSlot = -1;
  let nearestDist = SNAP_DISTANCE;
  const off = getMagnetOffset(itemId);
  for (const standItem of items.value) {
    if (standItem.uid === itemUid) continue;
    if (!isRetortStandAssembly(standItem.id)) continue;
    const st = retortStandMap[standItem.uid];
    if (!st) continue;
    const clampY = st.topClampY;
    for (let i = 0; i < st.slotOffsets.length; i++) {
      if (st.slotOccupants[i]) continue;
      const slotWorldX = standItem.x + 54 + st.slotOffsets[i];
      const slotWorldY = standItem.y + clampY + 14;
      const dist = Math.hypot(itemX + off.x - slotWorldX, itemY + off.y - slotWorldY);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestStand = standItem.uid;
        nearestSlot = i;
      }
    }
  }
  return nearestStand !== null && nearestSlot >= 0 ? { standUid: nearestStand, slotIdx: nearestSlot } : null;
}

export function findNearestBottomClamp(itemUid: string, itemX: number, itemY: number): string | null {
  let nearestStand: string | null = null;
  let nearestDist = BOTTOM_CLAMP_DISTANCE;
  for (const standItem of items.value) {
    if (!isRetortStandAssembly(standItem.id)) continue;
    const st = retortStandMap[standItem.uid];
    if (!st || st.bottomSlotOccupant) continue;
    const clampWorldX = standItem.x + 45 + 132 + st.bottomClampX;
    const clampWorldY = standItem.y + st.bottomClampY + 14;
    const dist = Math.hypot(itemX + 35 - clampWorldX, itemY + 50 - clampWorldY);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestStand = standItem.uid;
    }
  }
  return nearestStand;
}

export function applyTopSlotSnap(itemUid: string, itemX: number, itemY: number, itemId: string): void {
  const result = findNearestSlot(itemUid, itemX, itemY, itemId);
  retortStandSnapUid.value = result ? result.standUid + '|' + result.slotIdx : null;
}

export function applyBottomClampSnap(itemUid: string, itemX: number, itemY: number): void {
  bottomClampSnapUid.value = findNearestBottomClamp(itemUid, itemX, itemY);
}

export function finalizeTopSlotSnap(itemUid: string): void {
  if (!retortStandSnapUid.value) return;
  const [standUid, slotIdxStr] = retortStandSnapUid.value.split('|');
  const slotIdx = parseInt(slotIdxStr, 10);
  const stand = items.value.find(i => i.uid === standUid);
  const st = retortStandMap[standUid];
  const item = items.value.find(i => i.uid === itemUid);
  if (!stand || !st || !item || st.slotOccupants[slotIdx]) return;
  const slotWorldX = stand.x + 54 + st.slotOffsets[slotIdx];
  const slotWorldY = stand.y + st.topClampY + 14;
  const off = getMagnetOffset(item.id);
  item.x = slotWorldX - off.x;
  item.y = slotWorldY - off.y;
  st.slotOccupants[slotIdx] = item.uid;
  retortStandSnapUid.value = null;
}

export function finalizeBottomClampSnap(itemUid: string): void {
  if (!bottomClampSnapUid.value) return;
  const stand = items.value.find(i => i.uid === bottomClampSnapUid.value);
  const st = retortStandMap[bottomClampSnapUid.value];
  const item = items.value.find(i => i.uid === itemUid);
  if (!stand || !st || !item || st.bottomSlotOccupant) return;
  const clampWorldX = stand.x + 45 + 132 + st.bottomClampX;
  const clampWorldY = stand.y + st.bottomClampY + 14;
  item.x = clampWorldX - 35;
  item.y = clampWorldY - 50;
  st.bottomSlotOccupant = item.uid;
  bottomClampSnapUid.value = null;
}

export function detachFromTopSlots(itemUid: string): void {
  for (const st of Object.values(retortStandMap)) {
    const slotIdx = st.slotOccupants.indexOf(itemUid);
    if (slotIdx >= 0) { st.slotOccupants[slotIdx] = null; break; }
  }
}

export function detachFromBottomClamp(itemUid: string): void {
  for (const st of Object.values(retortStandMap)) {
    if (st.bottomSlotOccupant === itemUid) { st.bottomSlotOccupant = null; break; }
  }
}
