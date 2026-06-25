import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import {
  items, pourFlowMap, phProbeTipMap, stopperMap, retortStandMap,
  createLabItem, isContainer, isPipette, isBurette, isRetortStandAssembly,
  getPipette
} from './useChemistryLab';
import { pipetteDraw, pipetteDispense } from './usePipetteActions';
import type { ToolDef } from './useChemistryTools';
import type { ToolState } from './chemLabTypes';

export function useWorkspaceDrag(
  workspaceRef: { value: HTMLDivElement | null },
  selectedItemRef: { value: LabItem | null },
  emit: (name: 'select', item: LabItem | null, state: ToolState | null) => void,
  buildToolState: (item: LabItem | null) => ToolState | null
) {
  const draggingItem = ref<LabItem | null>(null);
  const dragOffsetX = ref(0);
  const dragOffsetY = ref(0);

  function sceneX(clientX: number): number {
    if (!workspaceRef.value) return clientX;
    return clientX - workspaceRef.value.getBoundingClientRect().left;
  }
  function sceneY(clientY: number): number {
    if (!workspaceRef.value) return clientY;
    return clientY - workspaceRef.value.getBoundingClientRect().top;
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const data = e.dataTransfer?.getData('application/json');
    if (!data) return;
    const def: ToolDef = JSON.parse(data);
    items.value.push(createLabItem(def, sceneX(e.clientX) - 40, sceneY(e.clientY) - 40));
  }

  function onItemMouseDown(e: MouseEvent, item: LabItem) {
    e.stopPropagation(); e.preventDefault();
    if (pourFlowMap[item.uid]) {
      delete pourFlowMap[item.uid];
      return;
    }
    draggingItem.value = item;
    dragOffsetX.value = sceneX(e.clientX) - item.x;
    dragOffsetY.value = sceneY(e.clientY) - item.y;
    selectedItemRef.value = item;
    emit('select', item, buildToolState(item));
  }

  function onDragMove(e: MouseEvent) {
    if (!draggingItem.value) return;
    const dx = sceneX(e.clientX) - dragOffsetX.value - draggingItem.value.x;
    const dy = sceneY(e.clientY) - dragOffsetY.value - draggingItem.value.y;
    draggingItem.value.x = sceneX(e.clientX) - dragOffsetX.value;
    draggingItem.value.y = sceneY(e.clientY) - dragOffsetY.value;
    if (draggingItem.value.id === 'ph-meter' && phProbeTipMap[draggingItem.value.uid]) {
      phProbeTipMap[draggingItem.value.uid].x += dx;
      phProbeTipMap[draggingItem.value.uid].y += dy;
    }
    // Move attached burettes/containers with stand
    if (isRetortStandAssembly(draggingItem.value.id)) {
      const st = retortStandMap[draggingItem.value.uid];
      if (st) {
        for (const uid of [st.leftBuretteUid, st.rightBuretteUid, st.leftContainerUid, st.rightContainerUid, st.heatingDeviceUid].filter(Boolean) as string[]) {
          const attached = items.value.find(i => i.uid === uid);
          if (attached) { attached.x += dx; attached.y += dy; }
        }
      }
    }
    // Real-time magnetic snap for burette to stand clamp (only for FREE burettes)
    if (isBurette(draggingItem.value.id)) {
      const item = draggingItem.value;
      // Check if already attached to any stand
      const isAttached = Object.values(retortStandMap).some(st => st.leftBuretteUid === item.uid || st.rightBuretteUid === item.uid);
      if (!isAttached) {
        const BURETTE_ATTACH_X = 55;
        const BURETTE_ATTACH_Y = 190;
        const CLAMP_CENTER_X = 125;
        const CLAMP_CENTER_Y = 14;
        for (const stand of items.value.filter(i => isRetortStandAssembly(i.id))) {
          if (!retortStandMap[stand.uid]) {
            retortStandMap[stand.uid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160 };
          }
          const st = retortStandMap[stand.uid];
          const clampWorldX = stand.x + CLAMP_CENTER_X;
          const clampWorldY = stand.y + st.topClampY + CLAMP_CENTER_Y;
          const buretteCX = item.x + BURETTE_ATTACH_X;
          const buretteCY = item.y + BURETTE_ATTACH_Y;
          const dist = Math.sqrt(Math.pow(buretteCX - clampWorldX, 2) + Math.pow(buretteCY - clampWorldY, 2));
          if (dist < 120) {
            item.x = clampWorldX - BURETTE_ATTACH_X;
            item.y = clampWorldY - BURETTE_ATTACH_Y;
            if (!st.leftBuretteUid) st.leftBuretteUid = item.uid;
            else if (!st.rightBuretteUid) st.rightBuretteUid = item.uid;
            break;
          }
        }
      }
    }
  }

  function onDragUp() {
    if (!draggingItem.value) { draggingItem.value = null; return; }
    const item = draggingItem.value;

    // Rubber stopper snap
    if (item.id === 'rubber-stopper') {
      const nearest = items.value.find(i =>
        i.uid !== item.uid && isContainer(i.id) &&
        Math.abs(i.x - item.x) < 50 && Math.abs(i.y - item.y) < 80
      );
      if (nearest) {
        stopperMap[nearest.uid] = item.uid;
        item.x = nearest.x + 20;
        item.y = nearest.y - 5;
      }
    }

    // Pipette drag-to-draw / drag-to-dispense
    if (isPipette(item.id)) {
      const pip = getPipette(item.uid);
      const nearest = items.value.find(i =>
        i.uid !== item.uid && isContainer(i.id) &&
        Math.abs(i.x - item.x) < 60 && Math.abs(i.y - item.y) < 120
      );
      if (nearest) {
        if (pip.volume <= 0) {
          pipetteDraw(item, selectedItemRef, emit);
        } else {
          pipetteDispense(item, selectedItemRef, emit);
        }
      }
    }

    // Burette snap to / detach from retort stand
    if (isBurette(item.id)) {
      const BURETTE_ATTACH_X = 55;  // center of 110px width
      const BURETTE_ATTACH_Y = 190;   // middle of burette (where clamp holds)
      const CLAMP_CENTER_X = 125;   // stand.x + 54 + 71
      const CLAMP_CENTER_Y = 14;    // half of clamp height (28)
      // Detach if dragged far from current stand
      for (const [standUid, st] of Object.entries(retortStandMap)) {
        if (st.leftBuretteUid === item.uid || st.rightBuretteUid === item.uid) {
          if (!st) continue;
          const stand = items.value.find(i => i.uid === standUid);
          if (!stand) {
            if (st.leftBuretteUid === item.uid) st.leftBuretteUid = null;
            if (st.rightBuretteUid === item.uid) st.rightBuretteUid = null;
            continue;
          }
          const clampWorldX = stand.x + CLAMP_CENTER_X;
          const clampWorldY = stand.y + st.topClampY + CLAMP_CENTER_Y;
          const buretteCX = item.x + BURETTE_ATTACH_X;
          const buretteCY = item.y + BURETTE_ATTACH_Y;
          const dist = Math.sqrt(Math.pow(buretteCX - clampWorldX, 2) + Math.pow(buretteCY - clampWorldY, 2));
          if (dist > 80) {
            if (st.leftBuretteUid === item.uid) st.leftBuretteUid = null;
            if (st.rightBuretteUid === item.uid) st.rightBuretteUid = null;
          }
        }
      }
      // Try snap to nearby stand
      for (const stand of items.value.filter(i => isRetortStandAssembly(i.id))) {
        if (!retortStandMap[stand.uid]) {
          retortStandMap[stand.uid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160 };
        }
        const st = retortStandMap[stand.uid];
        const clampWorldX = stand.x + CLAMP_CENTER_X;
        const clampWorldY = stand.y + st.topClampY + CLAMP_CENTER_Y;
        const buretteCX = item.x + BURETTE_ATTACH_X;
        const buretteCY = item.y + BURETTE_ATTACH_Y;
        const dist = Math.sqrt(Math.pow(buretteCX - clampWorldX, 2) + Math.pow(buretteCY - clampWorldY, 2));
        if (dist < 200) {
          item.x = clampWorldX - BURETTE_ATTACH_X;
          item.y = clampWorldY - BURETTE_ATTACH_Y;
          if (!st.leftBuretteUid) st.leftBuretteUid = item.uid;
          else if (!st.rightBuretteUid) st.rightBuretteUid = item.uid;
          else st.leftBuretteUid = item.uid; // override left if both full
        }
      }
    }

    draggingItem.value = null;
  }

  function onWorkspaceClick(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.lab-item')) return;
    if ((e.target as HTMLElement).closest('.floating-inspector')) return;
    selectedItemRef.value = null;
    emit('select', null, null);
    if (Object.keys(pourFlowMap).length > 0) {
      Object.keys(pourFlowMap).forEach(k => delete pourFlowMap[k]);
    }
  }

  return {
    draggingItem,
    dragOffsetX,
    dragOffsetY,
    onDragOver,
    onDrop,
    onItemMouseDown,
    onDragMove,
    onDragUp,
    onWorkspaceClick,
  };
}
