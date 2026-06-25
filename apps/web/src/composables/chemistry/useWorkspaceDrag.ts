import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import {
  items, pourFlowMap, phProbeTipMap, stopperMap,
  createLabItem, isContainer, isPipette,
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
