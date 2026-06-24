<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { LabItem, ToolDef } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from './InspectorPanel.vue';
import {
  items, receivingMap, balanceTareMap, containerTareMap, itemZoomMap, pourFlowMap, phProbeTipMap, stopperMap,
  getLiquid, getBurette, getPipette, getSepFunnelState, getBurnerState, getItemZoom, buildToolState,
  isContainer, isBeaker, isBurette, isPipette, isSeparatoryFunnel,
  selectedChemical,
  pendingChemicalFill,
  hasSelectedChemicalMap,
  createLabItem, loadSession, clearSession
} from '../../../composables/chemistry/useChemistryLab';
import {
  getPhReading, computeBalanceWeight, getBalanceReading, getContainerWeight,
  startSimulation, stopSimulation
} from '../../../composables/chemistry/useLabSimulation';
import { pushHistory, undo, redo, canUndo, canRedo, clearHistory } from '../../../composables/chemistry/useChemistryHistory';
import FloatingInspector from './FloatingInspector.vue';
import LabItemRenderer from './LabItemRenderer.vue';
import WorkspaceOverlays from './WorkspaceOverlays.vue';

const emit = defineEmits<{ select: [item: LabItem | null, state: ToolState | null] }>();

const selectedItem = ref<LabItem | null>(null);
const totalSpilled = ref(0);
const draggingItem = ref<LabItem | null>(null);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const workspaceRef = ref<HTMLDivElement | null>(null);
const hoveredItem = ref<LabItem | null>(null);
function sceneX(clientX: number): number {
  if (!workspaceRef.value) return clientX;
  return clientX - workspaceRef.value.getBoundingClientRect().left;
}
function sceneY(clientY: number): number {
  if (!workspaceRef.value) return clientY;
  return clientY - workspaceRef.value.getBoundingClientRect().top;
}

/* ---- Pipette actions ---- */
function getNearestContainer(pipItem: LabItem, filterFn: (liq: any) => boolean): LabItem | null {
  const candidates = items.value.filter((i: LabItem) => {
    if (i.uid === pipItem.uid) return false;
    if (!isContainer(i.id)) return false;
    return filterFn(getLiquid(i.uid));
  });
  if (candidates.length === 0) return null;
  // Find closest by Euclidean distance (center point)
  const px = pipItem.x + 25, py = pipItem.y + 115; // pipette center approx
  let nearest = candidates[0];
  let minDist = Infinity;
  for (const c of candidates) {
    const cx = c.x + 35, cy = c.y + 60; // container center approx
    const d = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    if (d < minDist) { minDist = d; nearest = c; }
  }
  return nearest;
}
function pipetteDraw(pipItem: LabItem) {
  const pip = getPipette(pipItem.uid);
  if (pip.volume > 0) return;
  const target = getNearestContainer(pipItem, (liq) => liq.volume > 0);
  if (!target) { console.warn('pipetteDraw: no target found'); return; }
  pushHistory();
  const tLiq = getLiquid(target.uid);
  const amount = Math.min(10, tLiq.volume);
  pip.volume = amount; pip.color = tLiq.color; pip.opacity = tLiq.opacity; pip.label = tLiq.label;
  tLiq.volume -= amount;
  emit('select', pipItem, buildToolState(pipItem));
  if (selectedItem.value?.uid === target.uid) emit('select', target, buildToolState(target));
}
function pipetteDispense(pipItem: LabItem) {
  const pip = getPipette(pipItem.uid);
  if (pip.volume <= 0) return;
  const target = getNearestContainer(pipItem, (liq) => liq.volume < liq.maxVolume);
  if (!target) { console.warn('pipetteDispense: no target found'); return; }
  pushHistory();
  const tLiq = getLiquid(target.uid);
  const amount = Math.min(pip.volume, tLiq.maxVolume - tLiq.volume);
  tLiq.volume += amount; tLiq.color = pip.color; tLiq.opacity = pip.opacity;
  tLiq.label = pip.label || 'محلول من الماصة';
  pip.volume -= amount;
  if (pip.volume <= 0.01) { pip.volume = 0; pip.color = '#94a3b8'; pip.label = ''; }
  emit('select', pipItem, buildToolState(pipItem));
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
  if (!draggingItem.value) return;
  const dx = sceneX(e.clientX) - dragOffsetX.value - draggingItem.value.x;
  const dy = sceneY(e.clientY) - dragOffsetY.value - draggingItem.value.y;
  draggingItem.value.x = sceneX(e.clientX) - dragOffsetX.value;
  draggingItem.value.y = sceneY(e.clientY) - dragOffsetY.value;
  // Move probe tip along with pH meter
  if (draggingItem.value.id === 'ph-meter' && phProbeTipMap[draggingItem.value.uid]) {
    phProbeTipMap[draggingItem.value.uid].x += dx;
    phProbeTipMap[draggingItem.value.uid].y += dy;
  }
}
function onDragUp() {
  if (draggingItem.value?.id === 'rubber-stopper') {
    // Try to attach stopper to nearest container
    const stopper = draggingItem.value;
    const nearest = items.value.find(i =>
      i.uid !== stopper.uid && isContainer(i.id) &&
      Math.abs(i.x - stopper.x) < 50 && Math.abs(i.y - stopper.y) < 80
    );
    if (nearest) {
      stopperMap[nearest.uid] = stopper.uid;
      // Snap stopper to container mouth
      stopper.x = nearest.x + 20;
      stopper.y = nearest.y - 5;
    }
  }
  draggingItem.value = null;
}
function onWorkspaceClick(e: MouseEvent) {
  // Don't deselect if clicking directly on a lab item (handled by item click)
  if ((e.target as HTMLElement).closest('.lab-item')) return;
  // Don't deselect if clicking inside the FloatingInspector panel
  if ((e.target as HTMLElement).closest('.floating-inspector')) return;

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
  delete hasSelectedChemicalMap[uid];
  // Clean up stopperMap: remove if container removed, or detach stopper from container
  for (const [containerUid, stopperUid] of Object.entries(stopperMap)) {
    if (containerUid === uid || stopperUid === uid) delete stopperMap[containerUid];
  }
  if (selectedItem.value?.uid === uid) { selectedItem.value = null; emit('select', null, null); }
}
function onMouthInteract(item: LabItem) { console.log('Mouth interact:', item.name); }
function handleSpill(item: LabItem, amount: number) {
  if (isContainer(item.id)) {
    const s = getLiquid(item.uid);
    s.volume = Math.max(0, s.volume - amount);
    totalSpilled.value = +(totalSpilled.value + amount).toFixed(2);
    if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
  }
}
function handleDropExited(sourceItem: LabItem, wx: number, wy: number, color: string) {
  // wx, wy are workspace coordinates where drop passed beaker bottom
  const target = items.value.find((i: LabItem) => {
    if (i.uid === sourceItem.uid) return false;
    if (!isContainer(i.id)) return false;
    // Generous catch: drop must be near beaker horizontally (±65px) and near/above its mouth
    return Math.abs(wx - (i.x + 70)) < 65 && wy >= i.y - 20 && wy <= i.y + 120;
  });
  if (target) {
    const tLiq = getLiquid(target.uid);
    if (tLiq.volume < tLiq.maxVolume) {
      pushHistory();
      const amount = 0.15;
      tLiq.volume = Math.min(tLiq.maxVolume, +(tLiq.volume + amount).toFixed(1));
      tLiq.color = color;
      receivingMap[target.uid] = true;
      setTimeout(() => { receivingMap[target.uid] = false; }, 400);
      if (selectedItem.value?.uid === target.uid) emit('select', target, buildToolState(target));
    }
  }
}
function toggleBuretteValve(item: LabItem) {
  getBurette(item.uid).valveOpen = !getBurette(item.uid).valveOpen;
  if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
}
function tipInteract(item: LabItem) { console.log('Tip interact:', item.name); }
function execAction(type: 'refill' | 'empty' | 'toggleValve' | 'fill50' | 'fill100' | 'remove50' | 'remove100' | 'addSolid', uid: string) {
  const item = items.value.find(i => i.uid === uid); if (!item) return;
  pushHistory();
  if (type === 'toggleValve' && isBurette(item.id)) { toggleBuretteValve(item); return; }
  if (type === 'refill' && isBurette(item.id)) getBurette(uid).volume = getBurette(uid).maxVolume;
  if (type === 'empty' && isContainer(item.id)) getLiquid(uid).volume = 0;
  if ((type === 'fill50' || type === 'fill100') && isContainer(item.id)) {
    const amount = type === 'fill50' ? 50 : 100;
    if (hasSelectedChemicalMap[uid]) {
      const s = getLiquid(uid);
      s.volume = Math.min(s.maxVolume, s.volume + amount);
      s.color = selectedChemical.color;
      s.opacity = selectedChemical.opacity;
      s.label = selectedChemical.nameAr;
    } else {
      pendingChemicalFill.value = { uid, amount };
      return; // first time: go to shelf
    }
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
  containerTareMap[item.uid] = 0; // clear container tare when full tare is used
  if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
}
function tareContainer(item: LabItem) {
  containerTareMap[item.uid] = getContainerWeight(item);
  balanceTareMap[item.uid] = 0; // clear full tare when container tare is used
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
  execAction: execAction as (type: 'refill' | 'empty' | 'toggleValve' | 'fill50' | 'fill100' | 'remove50' | 'remove100' | 'addSolid', uid: string) => void,
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
    @dragover="onDragOver"
    @drop="onDrop"
    @click="onWorkspaceClick"
    @wheel.prevent="onWheel"
  >
    <!-- Digital Volume Meter -->
    <div v-if="selectedItem && selectedState?.type === 'beaker'" class="digital-meter">
      <div class="meter-row">
        <span class="meter-label">الحجم</span>
        <span class="meter-value">{{ selectedState.volume.toFixed(1) }}<small>mL</small></span>
      </div>
      <div class="meter-row spill">
        <span class="meter-label">المنسكب</span>
        <span class="meter-value">{{ totalSpilled.toFixed(2) }}<small>mL</small></span>
      </div>
    </div>

    <div class="scene">
      <LabItemRenderer
        v-for="item in items"
        :key="item.uid"
        :item="item"
        :selected-uid="selectedItem?.uid || null"
        :hovered-uid="hoveredItem?.uid || null"
        :receiving="!!receivingMap[item.uid]"
        @mouseenter="hoveredItem = item"
        @mouseleave="hoveredItem = null"
        @mousedown="onItemMouseDown($event, item)"
        @mouth-interact="onMouthInteract(item)"
        @spill="handleSpill"
        @drop-exited="handleDropExited"
        @toggle-valve="toggleBuretteValve(item)"
        @tip-interact="tipInteract(item)"
        @toggle-stopcock="toggleSepFunnelValve(item)"
      />
    </div>
    <FloatingInspector
      v-if="selectedItem && selectedState"
      :item="selectedItem"
      :state="selectedState"
      :can-undo="canUndo()"
      :can-redo="canRedo()"
      @action="(type, uid) => execAction(type, uid)"
      @remove="(uid) => removeItem(uid)"
      @toggle-burner="toggleBurner(selectedItem)"
      @pipette-draw="pipetteDraw(selectedItem!)"
      @pipette-dispense="pipetteDispense(selectedItem!)"
      @tare="tareBalance(selectedItem)"
      @tare-container="tareContainer(selectedItem)"
      @intensity-change="(val) => { if(selectedItem){getBurnerState(selectedItem.uid).intensity = val; emit('select', selectedItem, buildToolState(selectedItem));} }"
      @undo="undo()"
      @redo="redo()"
      @label-change="(label) => { if(selectedItem){getLiquid(selectedItem.uid).label = label; emit('select', selectedItem, buildToolState(selectedItem));} }"
    />

    <WorkspaceOverlays
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
.digital-meter {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 1.5rem;
  background: linear-gradient(135deg, #1e293b, #334155);
  border: 2px solid #475569;
  border-radius: 0.6rem;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
  font-family: 'Segoe UI', monospace;
}
.meter-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}
.meter-row.spill .meter-value {
  color: #f87171;
}
.meter-label {
  font-size: 0.6rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.meter-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #34d399;
  text-shadow: 0 0 8px rgba(52,211,153,0.4);
}
.meter-value small {
  font-size: 0.65rem;
  font-weight: 600;
  margin-right: 0.1rem;
  color: #94a3b8;
}
</style>
