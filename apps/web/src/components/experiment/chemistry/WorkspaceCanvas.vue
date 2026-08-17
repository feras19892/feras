<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { LabItem } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../../composables/chemistry/chemLabTypes';
import {
  items, receivingMap, itemZoomMap, pourFlowMap, stopperMap, retortStandMap,
  getLiquid, getBurette, getBurnerState, getItemZoom, buildToolState,
  isContainer, isBurette, isRetortStandAssembly,
  hasSelectedChemicalMap,
  loadSession, clearSession, setupInitialLabLayout
} from '../../../composables/chemistry/useChemistryLab';
import {
  startSimulation, stopSimulation, stepUndo, stepRedo
} from '../../../composables/chemistry/useLabSimulation';
import { handleDropExited } from '../../../composables/chemistry/useDropPhysics';
import { undo, redo, canUndo, canRedo, clearHistory } from '../../../composables/chemistry/useChemistryHistory';
import { pipetteDraw, pipetteDispense, pipetteDrawAmount, pipetteDispenseAmount, pipetteDrawFrom, pipetteDispenseTo, pipetteFill, pipetteEmpty } from '../../../composables/chemistry/usePipetteActions';
import { execAction, toggleBuretteValve, toggleSepFunnelValve, toggleBurner, tareBalance, tareContainer, buretteDropOne, spatulaSelectSolid, spatulaAddSolid } from '../../../composables/chemistry/useExecActions';
import { useI18n } from '../../../composables/useI18n';
const { t } = useI18n();
import { useWorkspaceDrag } from '../../../composables/chemistry/useWorkspaceDrag';
import FloatingInspector from './FloatingInspector.vue';
import LabItemRenderer from './LabItemRenderer.vue';
import WorkspaceOverlays from './WorkspaceOverlays.vue';

const emit = defineEmits<{ select: [item: LabItem | null, state: ToolState | null] }>();

const selectedItem = ref<LabItem | null>(null);
const totalSpilled = ref(0);
const workspaceRef = ref<HTMLDivElement | null>(null);
const hoveredItem = ref<LabItem | null>(null);

const {
  onDragOver, onDrop, onItemMouseDown, onDragMove, onDragUp, onWorkspaceClick,
  draggingItem
} = useWorkspaceDrag(workspaceRef, selectedItem, emit, buildToolState);

/* ---- Actions ---- */
function removeItem(uid: string) {
  // Clean up all retort stand references before removing the item
  for (const [standUid, st] of Object.entries(retortStandMap)) {
    const idx = st.slotOccupants.indexOf(uid);
    if (idx >= 0) st.slotOccupants[idx] = null;
    if (st.bottomSlotOccupant === uid) st.bottomSlotOccupant = null;
    if (standUid === uid && isRetortStandAssembly(items.value.find(i => i.uid === uid)?.id || '')) {
      delete retortStandMap[standUid];
    }
  }
  items.value = items.value.filter(i => i.uid !== uid);
  delete hasSelectedChemicalMap[uid];
  // Clean up stopperMap: remove if container removed, or detach stopper from container
  for (const [containerUid, stopperUid] of Object.entries(stopperMap)) {
    if (containerUid === uid || stopperUid === uid) delete stopperMap[containerUid];
  }
  if (selectedItem.value?.uid === uid) { selectedItem.value = null; emit('select', null, null); }
}
function _handleDropExited(sourceItem: LabItem, wx: number, wy: number, color: string) {
  handleDropExited(sourceItem, wx, wy, color, selectedItem, emit, buildToolState);
}
function onMouthInteract(_item: LabItem) { /* placeholder for future mouth interaction */ }
function onSelectBurette(e: MouseEvent, burette: LabItem) {
  onItemMouseDown(e, burette);
}
function handleSpill(item: LabItem, amount: number) {
  if (isContainer(item.id)) {
    const s = getLiquid(item.uid);
    s.volume = Math.max(0, s.volume - amount);
    totalSpilled.value = +(totalSpilled.value + amount).toFixed(2);
    if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
  }
}
function _toggleBuretteValve(item: LabItem) { toggleBuretteValve(item, selectedItem, emit); }
function tipInteract(_item: LabItem) { /* placeholder for future tip interaction */ }
function onWheel(e: WheelEvent) {
  const target = hoveredItem.value; if (!target) return;
  e.preventDefault();
  const current = getItemZoom(target.uid);
  const delta = e.deltaY < 0 ? 0.15 : -0.15;
  const newZoom = Math.max(0.6, Math.min(2.2, +(current + delta).toFixed(2)));
  itemZoomMap[target.uid] = newZoom;
}

/* ---- Wrappers for external composables ---- */
function _execAction(type: Parameters<typeof execAction>[0], uid: string) {
  execAction(type, uid, selectedItem, emit);
}
function _toggleSepFunnelValve(item: LabItem) { toggleSepFunnelValve(item, selectedItem, emit); }
function _toggleBurner(item: LabItem) { toggleBurner(item, selectedItem, emit); }
function _tareBalance(item: LabItem) { tareBalance(item, selectedItem, emit); }
function _tareContainer(item: LabItem) { tareContainer(item, selectedItem, emit); }
function _buretteDropOne(item: LabItem) { buretteDropOne(item, selectedItem, emit); }
function _pipetteDraw(item: LabItem) { pipetteDraw(item, selectedItem, emit); }
function _pipetteDispense(item: LabItem) { pipetteDispense(item, selectedItem, emit); }
function _pipetteDrawAmount(item: LabItem, amount: number) { pipetteDrawAmount(item, amount, selectedItem, emit); }
function _pipetteDispenseAmount(item: LabItem, amount: number) { pipetteDispenseAmount(item, amount, selectedItem, emit); }
function _pipetteDrawFrom(item: LabItem, targetUid: string, amount: number) { pipetteDrawFrom(item, targetUid, amount, selectedItem, emit); }
function _pipetteDispenseTo(item: LabItem, targetUid: string, amount: number) { pipetteDispenseTo(item, targetUid, amount, selectedItem, emit); }
function _pipetteFill(item: LabItem, amount: number) { pipetteFill(item, amount, selectedItem, emit); }
function _pipetteEmpty(item: LabItem) { pipetteEmpty(item, selectedItem, emit); }
function _spatulaSelectSolid() { if (selectedItem.value) spatulaSelectSolid(selectedItem.value.uid); }
function _spatulaAddTo(targetUid: string, grams: number) { if (selectedItem.value) spatulaAddSolid(selectedItem.value.uid, targetUid, grams, selectedItem, emit); }

/* ---- Computed ---- */
const selectedState = computed<ToolState | null>(() => buildToolState(selectedItem.value));

/* ---- Lifecycle ---- */
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); return; }
  if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && e.ctrlKey && e.shiftKey)) { e.preventDefault(); redo(); return; }
}
onMounted(() => {
  loadSession();
  setupInitialLabLayout();
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
  setupInitialLabLayout();
}

defineExpose({
  execAction: execAction as (type: 'refill' | 'empty' | 'toggleValve' | 'fill5' | 'fill10' | 'fill50' | 'fill100' | 'remove5' | 'remove10' | 'remove50' | 'remove100' | 'addSolid', uid: string) => void,
  removeItem: removeItem as (uid: string) => void,
  resetLab,
  undo,
  redo,
  canUndo,
  canRedo,
  stepUndo,
  stepRedo,
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
        <span class="meter-label">{{ t('chemistry.volume') }}</span>
        <span class="meter-value">{{ selectedState.volume.toFixed(1) }}<small>mL</small></span>
      </div>
      <div class="meter-row spill">
        <span class="meter-label">{{ t('chemistryLab.spilled') }}</span>
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
        :dragging-uid="draggingItem?.uid || null"
        :receiving="!!receivingMap[item.uid]"
        @mouseenter="hoveredItem = !draggingItem ? item : hoveredItem"
        @mouseleave="hoveredItem = !draggingItem ? null : hoveredItem"
        @mousedown="onItemMouseDown($event, item)"
        @select-burette="onSelectBurette"
        @mouth-interact="onMouthInteract(item)"
        @spill="handleSpill"
        @drop-exited="_handleDropExited"
        @toggle-valve="_toggleBuretteValve(item)"
        @tip-interact="tipInteract(item)"
        @toggle-stopcock="_toggleSepFunnelValve(item)"
        @toggle-burner="_toggleBurner(item)"
      />
    </div>
    <FloatingInspector
      v-if="selectedItem && selectedState"
      :item="selectedItem"
      :state="selectedState"
      :can-undo="canUndo()"
      :can-redo="canRedo()"
      @action="(type, uid) => _execAction(type, uid)"
      @remove="(uid) => removeItem(uid)"
      @toggle-burner="_toggleBurner(selectedItem)"
      @pipette-draw="_pipetteDraw(selectedItem!)"
      @pipette-dispense="_pipetteDispense(selectedItem!)"
      @pipette-draw-amount="(amount: number) => _pipetteDrawAmount(selectedItem!, amount)"
      @pipette-dispense-amount="(amount: number) => _pipetteDispenseAmount(selectedItem!, amount)"
      @pipette-draw-from="(targetUid: string, amount: number) => _pipetteDrawFrom(selectedItem!, targetUid, amount)"
      @pipette-dispense-to="(targetUid: string, amount: number) => _pipetteDispenseTo(selectedItem!, targetUid, amount)"
      @pipette-fill="(amount: number) => _pipetteFill(selectedItem!, amount)"
      @pipette-empty="_pipetteEmpty(selectedItem!)"
      @burette-drop="_buretteDropOne(selectedItem!)"
      @tare="_tareBalance(selectedItem)"
      @tare-container="_tareContainer(selectedItem)"
      @intensity-change="(val) => { if(selectedItem){getBurnerState(selectedItem.uid).intensity = val; emit('select', selectedItem, buildToolState(selectedItem));} }"
      @undo="undo()"
      @redo="redo()"
      @label-change="(label) => { if(selectedItem){ if (isBurette(selectedItem.id)) { const bur = getBurette(selectedItem.uid); if (bur) bur.label = label; } else { const liq = getLiquid(selectedItem.uid); if (liq) liq.label = label; } emit('select', selectedItem, buildToolState(selectedItem));} }"
      @spatula-select-solid="_spatulaSelectSolid()"
      @spatula-add-to="(targetUid: string, grams: number) => _spatulaAddTo(targetUid, grams)"
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
  background: #e2e8f0;
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
  margin-inline-end: 0.1rem;
  color: #94a3b8;
}
</style>
