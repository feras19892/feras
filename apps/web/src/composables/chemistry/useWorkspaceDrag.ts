import { ref } from 'vue';
import type { LabItem } from './useChemistryTools';
import {
  items, pourFlowMap, phProbeTipMap, stopperMap, hasSelectedChemicalMap,
  createLabItem, isContainer
} from './useChemistryLab';
import type { ToolDef } from './useChemistryTools';

export function useWorkspaceDrag(
  workspaceRef: { value: HTMLDivElement | null },
  selectedItemRef: { value: LabItem | null },
  emit: (name: 'select', item: LabItem | null, state: any) => void,
  buildToolState: (item: LabItem | null) => any
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
    if (draggingItem.value?.id === 'rubber-stopper') {
      const stopper = draggingItem.value;
      const nearest = items.value.find(i =>
        i.uid !== stopper.uid && isContainer(i.id) &&
        Math.abs(i.x - stopper.x) < 50 && Math.abs(i.y - stopper.y) < 80
      );
      if (nearest) {
        stopperMap[nearest.uid] = stopper.uid;
        stopper.x = nearest.x + 20;
        stopper.y = nearest.y - 5;
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
