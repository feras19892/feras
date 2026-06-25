import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import {
  items, pourFlowMap, phProbeTipMap, stopperMap, retortStandMap, itemZoomMap,
  createLabItem, isContainer, isBurette, isPipette, isRetortStandAssembly,
  getPipette
} from './useChemistryLab';
import { pipetteDraw, pipetteDispense } from './usePipetteActions';
import { findContainerBelow } from './useLabSimulation';
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
    // Sync attached items when dragging retort stand assembly
    if (isRetortStandAssembly(draggingItem.value.id)) {
      const st = retortStandMap[draggingItem.value.uid];
      if (st) {
        const attachedUids = [st.leftBuretteUid, st.rightBuretteUid, st.leftContainerUid, st.rightContainerUid, st.heatingDeviceUid].filter(Boolean) as string[];
        for (const uid of attachedUids) {
          const attached = items.value.find(i => i.uid === uid);
          if (attached) { attached.x += dx; attached.y += dy; }
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

    // Retort stand assembly: snap burettes and containers
    const stands = items.value.filter(i => isRetortStandAssembly(i.id));

    // Burette snap to stand top clamp
    if (isBurette(item.id)) {
      for (const stand of stands) {
        const st = retortStandMap[stand.uid];
        if (!st) continue;
        // Simple center-based snap: stand center vs burette center
        const standCX = stand.x + 90;  // half of 180
        const standCY = stand.y + 146;   // half of 293
        const buretteCX = item.x + 42;
        const buretteCY = item.y + 100;
        const dx = buretteCX - standCX;
        const dy = buretteCY - standCY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          // Snap to closest side
          const snapLeft = dx < 0;
          if (snapLeft && !st.leftBuretteUid) {
            st.leftBuretteUid = item.uid;
            item.x = stand.x + 15;
            item.y = stand.y - 30;
            break;
          }
          if (!snapLeft && !st.rightBuretteUid) {
            st.rightBuretteUid = item.uid;
            item.x = stand.x + 165;
            item.y = stand.y - 30;
            break;
          }
        }
        // Detach if dragged far away
        if (item.uid === st.leftBuretteUid && dist > 150) st.leftBuretteUid = null;
        if (item.uid === st.rightBuretteUid && dist > 150) st.rightBuretteUid = null;
      }
      // Legacy: auto-align above nearest container if not attached
      const container = findContainerBelow(item);
      if (container) {
        item.x = container.x + (container.id === 'beaker' ? 25 : container.id === 'test-tube' ? 5 : 15);
        item.y = container.y - 220;
      }
    }

    // Container snap to stand bottom clamps (left and right)
    if (isContainer(item.id) && item.id !== 'test-tube-rack') {
      for (const stand of stands) {
        const st = retortStandMap[stand.uid];
        if (!st) continue;
        const standCX = stand.x + 90;
        const clampY = stand.y + (st.bottomClampY || 160) + 6;
        const leftClampX = standCX - 50;
        const rightClampX = standCX + 50;
        const itemCX = item.x + 30;
        const itemCY = item.y + 20;
        const distLeft = Math.abs(itemCX - leftClampX) + Math.abs(itemCY - clampY);
        const distRight = Math.abs(itemCX - rightClampX) + Math.abs(itemCY - clampY);
        if (distLeft < 70 && !st.leftContainerUid) {
          st.leftContainerUid = item.uid;
          item.x = stand.x + 20;
          item.y = stand.y + (st.bottomClampY || 160) + 14;
          break;
        }
        if (distRight < 70 && !st.rightContainerUid) {
          st.rightContainerUid = item.uid;
          item.x = stand.x + 140;
          item.y = stand.y + (st.bottomClampY || 160) + 14;
          break;
        }
        if (item.uid === st.leftContainerUid && distLeft > 100) { st.leftContainerUid = null; delete itemZoomMap[item.uid]; }
        if (item.uid === st.rightContainerUid && distRight > 100) { st.rightContainerUid = null; delete itemZoomMap[item.uid]; }
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
