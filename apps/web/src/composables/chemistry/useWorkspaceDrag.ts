import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import {
  items, pourFlowMap, phProbeTipMap, stopperMap,
  createLabItem, isContainer,
  getPipette, retortStandMap,
} from './useChemistryLab';
import { isPipette, isRetortStandAssembly } from './chemLabIds';
import {
  getMagnetOffset, isClampAttachable,
  retortStandSnapUid, bottomClampSnapUid,
  findNearestSlot, findNearestBottomClamp,
  finalizeTopSlotSnap, finalizeBottomClampSnap,
  detachFromTopSlots, detachFromBottomClamp,
} from './workspaceDragSnap';
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
  let workspaceRectLeft = 0;
  let workspaceRectTop = 0;
  let dragStartClientX = 0;
  let dragStartClientY = 0;
  let dragStartItemX = 0;
  let dragStartItemY = 0;
  let dragJustEnded = false;

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
    const item = createLabItem(def, sceneX(e.clientX) - 40, sceneY(e.clientY) - 40);
    items.value.push(item);
    // --- Clamp-attached tool snap on drop to nearest stand slot ---
    if (isClampAttachable(item.id)) {
      const result = findNearestSlot(item.uid, item.x, item.y, item.id);
      if (result) {
        const st = retortStandMap[result.standUid];
        const stand = items.value.find(i => i.uid === result.standUid);
        if (!stand || !st) return;
        const slotWorldX = stand.x + 54 + st.slotOffsets[result.slotIdx];
        const slotWorldY = stand.y + st.topClampY + 14;
        const off = getMagnetOffset(item.id);
        item.x = slotWorldX - off.x;
        item.y = slotWorldY - off.y;
        st.slotOccupants[result.slotIdx] = item.uid;
      }
    }
  }

  function onItemMouseDown(e: MouseEvent, item: LabItem) {
    if (pourFlowMap[item.uid]) {
      delete pourFlowMap[item.uid];
      return;
    }
    draggingItem.value = item;
    if (workspaceRef.value) {
      const rect = workspaceRef.value.getBoundingClientRect();
      workspaceRectLeft = rect.left;
      workspaceRectTop = rect.top;
    }
    dragStartClientX = e.clientX;
    dragStartClientY = e.clientY;
    dragStartItemX = item.x;
    dragStartItemY = item.y;
    dragOffsetX.value = (e.clientX - workspaceRectLeft) - item.x;
    dragOffsetY.value = (e.clientY - workspaceRectTop) - item.y;
    selectedItemRef.value = item;
    emit('select', item, buildToolState(item));
  }

  let rafId: number | null = null;
  let pendingClientX = 0;
  let pendingClientY = 0;
  let lastSnapTime = 0;

  function applyDrag(newClientX: number, newClientY: number) {
    const item = draggingItem.value;
    if (!item) return;
    const prevX = item.x;
    const prevY = item.y;
    const newX = dragStartItemX + (newClientX - dragStartClientX);
    const newY = dragStartItemY + (newClientY - dragStartClientY);
    item.x = newX;
    item.y = newY;
    const dx = newX - prevX;
    const dy = newY - prevY;

    if (item.id === 'ph-meter' && phProbeTipMap[item.uid]) {
      phProbeTipMap[item.uid].x += dx;
      phProbeTipMap[item.uid].y += dy;
    }

    // --- Stand drag syncs attached burette and bottom clamp beaker positions ---
    if (isRetortStandAssembly(item.id)) {
      const st = retortStandMap[item.uid];
      if (st) {
        for (const uid of st.slotOccupants.filter(Boolean) as string[]) {
          const b = items.value.find(i => i.uid === uid);
          if (b) { b.x += dx; b.y += dy; }
        }
        if (st.bottomSlotOccupant) {
          const beaker = items.value.find(i => i.uid === st.bottomSlotOccupant);
          if (beaker) { beaker.x += dx; beaker.y += dy; }
        }
      }
    }

    // --- Clamp-attached tool snap detection (throttled to every 50ms) ---
    if (isClampAttachable(item.id)) {
      const now = performance.now();
      if (now - lastSnapTime > 50) {
        lastSnapTime = now;
        detachFromTopSlots(item.uid);
        const result = findNearestSlot(item.uid, item.x, item.y, item.id);
        retortStandSnapUid.value = result ? result.standUid + '|' + result.slotIdx : null;
      }
    } else {
      retortStandSnapUid.value = null;
    }

    // --- Bottom clamp beaker snap detection (throttled) ---
    if (item.id === 'beaker-100' || item.id === 'beaker-250' || item.id === 'beaker-500') {
      const now = performance.now();
      if (now - lastSnapTime > 50) {
        lastSnapTime = now;
        detachFromBottomClamp(item.uid);
        bottomClampSnapUid.value = findNearestBottomClamp(item.uid, item.x, item.y);
      }
    } else {
      bottomClampSnapUid.value = null;
    }
  }

  function onDragMove(e: MouseEvent) {
    if (!draggingItem.value) return;
    pendingClientX = e.clientX;
    pendingClientY = e.clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      applyDrag(pendingClientX, pendingClientY);
    });
  }

  function onDragUp() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (!draggingItem.value) { draggingItem.value = null; return; }
    const item = draggingItem.value;

    // --- Clamp-attached tool snap to retort stand slot ---
    if (isClampAttachable(item.id)) {
      detachFromTopSlots(item.uid);
      const result = findNearestSlot(item.uid, item.x, item.y, item.id);
      retortStandSnapUid.value = result ? result.standUid + '|' + result.slotIdx : null;
      finalizeTopSlotSnap(item.uid);
    }

    // --- Bottom clamp beaker snap ---
    if (item.id === 'beaker-100' || item.id === 'beaker-250' || item.id === 'beaker-500') {
      detachFromBottomClamp(item.uid);
      bottomClampSnapUid.value = findNearestBottomClamp(item.uid, item.x, item.y);
      finalizeBottomClampSnap(item.uid);
    }

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
      if (pip) {
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
    }

    dragJustEnded = true;
    draggingItem.value = null;
  }

  function onWorkspaceClick(e: MouseEvent) {
    if (dragJustEnded) { dragJustEnded = false; return; }
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
