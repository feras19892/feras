<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { LabItem, ToolDef } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from './InspectorPanel.vue';
import type { PipetteState } from '../../../composables/chemistry/useChemistryLab';
import {
  items, receivingMap, balanceTareMap, itemZoomMap, pourFlowMap,
  getLiquid, getBurette, getPipette, getSepFunnelState, getBurnerState, getItemZoom, buildToolState,
  isContainer, isBeaker, isBurette, isPipette, isSeparatoryFunnel,
  createLabItem, loadSession, clearSession
} from '../../../composables/chemistry/useChemistryLab';
import {
  getPhReading, computeBalanceWeight, getBalanceReading,
  startSimulation, stopSimulation
} from '../../../composables/chemistry/useLabSimulation';
import { pushHistory, undo, redo, canUndo, canRedo, clearHistory } from '../../../composables/chemistry/useChemistryHistory';
import FloatingInspector from './FloatingInspector.vue';
import LabItemRenderer from './LabItemRenderer.vue';
import WorkspaceOverlays from './WorkspaceOverlays.vue';

const emit = defineEmits<{ select: [item: LabItem | null, state: ToolState | null] }>();

const selectedItem = ref<LabItem | null>(null);
const draggingItem = ref<LabItem | null>(null);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const workspaceRef = ref<HTMLDivElement | null>(null);
const hoveredItem = ref<LabItem | null>(null);
const cursorPipette = ref<{ item: LabItem; state: PipetteState } | null>(null);
const cursorX = ref(0);
const cursorY = ref(0);
function sceneX(clientX: number): number {
  if (!workspaceRef.value) return clientX;
  return clientX - workspaceRef.value.getBoundingClientRect().left;
}
function sceneY(clientY: number): number {
  if (!workspaceRef.value) return clientY;
  return clientY - workspaceRef.value.getBoundingClientRect().top;
}

/* ---- Pipette mode ---- */
function enterPipetteMode(item: LabItem) {
  cursorPipette.value = { item, state: getPipette(item.uid) };
}
function exitPipetteMode() {
  cursorPipette.value = null;
}
function getHoveredContainer(): LabItem | null {
  if (!cursorPipette.value || !workspaceRef.value) return null;
  const mx = cursorX.value;
  const my = cursorY.value;
  return items.value.find((i: LabItem) => {
    if (i.uid === cursorPipette.value!.item.uid) return false;
    if (!isContainer(i.id)) return false;
    return Math.abs(mx - (i.x + 42)) < 70 && Math.abs(my - (i.y + 80)) < 100;
  }) || null;
}
function pipetteAction() {
  if (!cursorPipette.value) return;
  const pip = cursorPipette.value.state;
  const target = getHoveredContainer();
  if (!target) return;
  pushHistory();
  const tLiq = getLiquid(target.uid);
  if (pip.volume <= 0) {
    if (tLiq.volume <= 0) return;
    const amount = Math.min(10, tLiq.volume);
    pip.volume = amount; pip.color = tLiq.color; pip.opacity = tLiq.opacity; pip.label = tLiq.label;
    tLiq.volume -= amount;
  } else {
    if (tLiq.volume >= tLiq.maxVolume) return;
    const amount = Math.min(pip.volume, tLiq.maxVolume - tLiq.volume);
    tLiq.volume += amount; tLiq.color = pip.color; tLiq.opacity = pip.opacity;
    tLiq.label = pip.label || 'محلول من الماصة';
    pip.volume -= amount;
    if (pip.volume <= 0.01) { pip.volume = 0; pip.color = '#94a3b8'; pip.label = ''; }
  }
  emit('select', cursorPipette.value.item, buildToolState(cursorPipette.value.item));
  if (selectedItem.value?.uid === target.uid) emit('select', target, buildToolState(target));
}

/* ---- Pour flow ---- */
function stopPourFlow(uid: string) {
  delete pourFlowMap[uid];
}

/* ---- Drag & Drop ---- */
function onDragOver(e: DragEvent) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; }
function onDrop(e: DragEvent) {
  e.preventDefault();
  const data = e.dataTransfer?.getData('application/json');
  if (!data) return;
  const def: ToolDef = JSON.parse(data);
  items.value.push(createLabItem(def, sceneX(e.clientX) - 40, sceneY(e.clientY) - 40));
}

/* ---- Mouse events ---- */
function onItemMouseDown(e: MouseEvent, item: LabItem) {
  e.stopPropagation(); e.preventDefault();
  // Stop pour flow if clicking the source container
  if (pourFlowMap[item.uid]) {
    stopPourFlow(item.uid);
    return;
  }
  draggingItem.value = item;
  dragOffsetX.value = sceneX(e.clientX) - item.x;
  dragOffsetY.value = sceneY(e.clientY) - item.y;
  selectedItem.value = item;
  emit('select', item, buildToolState(item));
}
function onDragMove(e: MouseEvent) {
  cursorX.value = sceneX(e.clientX); cursorY.value = sceneY(e.clientY);
  if (!draggingItem.value) return;
  draggingItem.value.x = sceneX(e.clientX) - dragOffsetX.value;
  draggingItem.value.y = sceneY(e.clientY) - dragOffsetY.value;
}
function onDragUp() { draggingItem.value = null; }
function onWorkspaceClick(e: MouseEvent) {
  // Don't deselect if clicking directly on a lab item (handled by item click)
  if ((e.target as HTMLElement).closest('.lab-item')) return;
  // Don't deselect if clicking inside the FloatingInspector panel
  if ((e.target as HTMLElement).closest('.floating-inspector')) return;

  if (cursorPipette.value) { e.stopPropagation(); pipetteAction(); return; }

  // Deselect when clicking empty workspace
  selectedItem.value = null;
  emit('select', null, null);

  // Stop all pour flows on workspace click
  if (Object.keys(pourFlowMap).length > 0) {
    Object.keys(pourFlowMap).forEach(k => delete pourFlowMap[k]);
  }
}

/* ---- Actions ---- */
function removeItem(uid: string) {
  items.value = items.value.filter(i => i.uid !== uid);
  if (selectedItem.value?.uid === uid) { selectedItem.value = null; emit('select', null, null); }
}
function onMouthInteract(item: LabItem) { console.log('Mouth interact:', item.name); }
function handleSpill(item: LabItem, amount: number) {
  if (isContainer(item.id)) {
    const s = getLiquid(item.uid);
    s.volume = Math.max(0, s.volume - amount);
    if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
  }
}
function toggleBuretteValve(item: LabItem) {
  getBurette(item.uid).valveOpen = !getBurette(item.uid).valveOpen;
  if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
}
function tipInteract(item: LabItem) { console.log('Tip interact:', item.name); }
function execAction(type: 'refill' | 'empty' | 'toggleValve' | 'fill50' | 'fill100' | 'remove50' | 'remove100', uid: string) {
  const item = items.value.find(i => i.uid === uid); if (!item) return;
  pushHistory();
  if (type === 'toggleValve' && isBurette(item.id)) { toggleBuretteValve(item); return; }
  if (type === 'refill' && isBurette(item.id)) getBurette(uid).volume = getBurette(uid).maxVolume;
  if (type === 'empty' && isContainer(item.id)) getLiquid(uid).volume = 0;
  if ((type === 'fill50' || type === 'fill100') && isContainer(item.id)) {
    const s = getLiquid(uid); s.volume = Math.min(s.maxVolume, s.volume + (type === 'fill50' ? 50 : 100));
  }
  if ((type === 'remove50' || type === 'remove100') && isContainer(item.id)) {
    const s = getLiquid(uid); s.volume = Math.max(0, s.volume - (type === 'remove50' ? 50 : 100));
  }
  if (selectedItem.value?.uid === uid) emit('select', item, buildToolState(item));
}
function onWheel(e: WheelEvent) {
  const target = hoveredItem.value || selectedItem.value; if (!target) return;
  const current = getItemZoom(target.uid);
  const delta = e.deltaY < 0 ? 0.15 : -0.15;
  itemZoomMap[target.uid] = Math.max(0.6, Math.min(2.2, +(current + delta).toFixed(2)));
}
function toggleSepFunnelValve(item: LabItem) {
  const s = getSepFunnelState(item.uid); s.valveOpen = !s.valveOpen;
  if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
}
function toggleBurner(item: LabItem) {
  const s = getBurnerState(item.uid); s.on = !s.on;
  if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
}
function tareBalance(item: LabItem) {
  balanceTareMap[item.uid] = computeBalanceWeight(item);
  if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
}

/* ---- Computed ---- */
const balanceReading = computed(() => {
  const balance = items.value.find(i => i.id === 'digital-balance');
  return balance ? getBalanceReading(balance.uid) : null;
});
const selectedState = computed<ToolState | null>(() => buildToolState(selectedItem.value));

/* ---- Lifecycle ---- */
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && cursorPipette.value) { exitPipetteMode(); return; }
  if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); return; }
  if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && e.ctrlKey && e.shiftKey)) { e.preventDefault(); redo(); return; }
}
onMounted(() => {
  loadSession();
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragUp);
  window.addEventListener('keydown', onKeyDown);
  startSimulation((item) => {
    if (selectedItem.value && item && (selectedItem.value.uid === item.uid)) {
      emit('select', selectedItem.value, buildToolState(selectedItem.value));
    }
  });
});
onUnmounted(() => {
  window.removeEventListener('mousemove', onDragMove);
  window.removeEventListener('mouseup', onDragUp);
  window.removeEventListener('keydown', onKeyDown);
  stopSimulation();
});

function resetLab() {
  clearSession();
  clearHistory();
}

defineExpose({
  execAction: execAction as (type: 'refill' | 'empty' | 'toggleValve' | 'fill50' | 'fill100', uid: string) => void,
  removeItem: removeItem as (uid: string) => void,
  resetLab,
  undo,
  redo,
  canUndo,
  canRedo,
});
</script>


<template>
  <div
    ref="workspaceRef"
    class="workspace"
    :class="{ 'pipette-mode': cursorPipette }"
    @dragover="onDragOver"
    @drop="onDrop"
    @click="onWorkspaceClick"
    @wheel.prevent="onWheel"
  >
    <div class="scene">
      <LabItemRenderer
        v-for="item in items"
        :key="item.uid"
        :item="item"
        :selected-uid="selectedItem?.uid || null"
        :hovered-uid="hoveredItem?.uid || null"
        :cursor-pipette-uid="cursorPipette?.item.uid || null"
        :receiving="!!receivingMap[item.uid]"
        @mouseenter="hoveredItem = item"
        @mouseleave="hoveredItem = null"
        @mousedown="onItemMouseDown($event, item)"
        @mouth-interact="onMouthInteract(item)"
        @spill="handleSpill"
        @toggle-valve="toggleBuretteValve(item)"
        @tip-interact="tipInteract(item)"
        @enter-pipette="enterPipetteMode(item)"
        @toggle-stopcock="toggleSepFunnelValve(item)"
        @toggle-burner="toggleBurner(item)"
      />
    </div>
    <FloatingInspector
      v-if="selectedItem && selectedState"
      :item="selectedItem"
      :state="selectedState"
      :cursor-pipette="cursorPipette"
      :can-undo="canUndo()"
      :can-redo="canRedo()"
      @action="(type, uid) => execAction(type, uid)"
      @remove="(uid) => removeItem(uid)"
      @enter-pipette="enterPipetteMode(selectedItem)"
      @exit-pipette="exitPipetteMode()"
      @toggle-burner="toggleBurner(selectedItem)"
      @tare="tareBalance(selectedItem)"
      @undo="undo()"
      @redo="redo()"
      @label-change="(label) => { if(selectedItem){getLiquid(selectedItem.uid).label = label; emit('select', selectedItem, buildToolState(selectedItem));} }"
    />

    <WorkspaceOverlays
      :cursor-pipette="cursorPipette"
      :cursor-x="cursorX"
      :cursor-y="cursorY"
      :pour-flow-map="pourFlowMap"
      :items="items"
    />
  </div>
</template>

<style scoped>
.workspace {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
}
.workspace.pipette-mode {
  cursor: none;
}
.workspace.pour-mode {
  cursor: crosshair;
}
.scene {
  position: relative;
  width: 100%;
  height: 100%;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(0,0,0,0.025) 49px, rgba(0,0,0,0.025) 50px),
    repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(0,0,0,0.025) 49px, rgba(0,0,0,0.025) 50px);
}
</style>
