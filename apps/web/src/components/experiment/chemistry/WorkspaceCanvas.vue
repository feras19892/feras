<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { LabItem, ToolDef } from '../../../composables/chemistry/useChemistryTools';
import type { ToolState } from './InspectorPanel.vue';
import {
  items, liquidMap, buretteMap, receivingMap, balanceTareMap, containerTareMap, itemZoomMap, pourFlowMap, phProbeTipMap, stopperMap,
  buretteInitialVolumeMap, buretteTotalConsumedMap, buretteConsumedThisRefill,
  getLiquid, getBurette, getPipette, getSepFunnelState, getBurnerState, getItemZoom, buildToolState,
  isContainer, isBurette,
  selectedChemical,
  pendingChemicalFill,
  hasSelectedChemicalMap,
  createLabItem, loadSession, clearSession
} from '../../../composables/chemistry/useChemistryLab';
import {
  startSimulation, stopSimulation, stepUndo, stepRedo
} from '../../../composables/chemistry/useLabSimulation';
import { handleDropMix, applyIndicator } from '../../../composables/chemistry/useReactionEngine';
import { handleDropExited } from '../../../composables/chemistry/useDropPhysics';
import { pushHistory, undo, redo, canUndo, canRedo, clearHistory } from '../../../composables/chemistry/useChemistryHistory';
import { pipetteDraw, pipetteDispense } from '../../../composables/chemistry/usePipetteActions';
import { execAction, toggleSepFunnelValve, toggleBurner, tareBalance, tareContainer } from '../../../composables/chemistry/useExecActions';
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
  onDragOver, onDrop, onItemMouseDown, onDragMove, onDragUp, onWorkspaceClick
} = useWorkspaceDrag(workspaceRef, selectedItem, emit, buildToolState);

/* ---- Pour flow ---- */
function stopPourFlow(uid: string) {
  delete pourFlowMap[uid];
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
function _handleDropExited(sourceItem: LabItem, wx: number, wy: number, color: string) {
  handleDropExited(sourceItem, wx, wy, color, selectedItem, emit, buildToolState);
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
function toggleBuretteValve(item: LabItem) {
  const b = getBurette(item.uid);
  const wasOpen = b.valveOpen;
  b.valveOpen = !b.valveOpen;

  if (!wasOpen && b.valveOpen) {
    // Valve just opened: record initial volume for this refill
    buretteInitialVolumeMap[item.uid] = b.volume;
    buretteConsumedThisRefill[item.uid] = 0;
  }

  if (wasOpen && !b.valveOpen) {
    // Valve just closed: clear warning
    import('../../../composables/chemistry/useLabSimulation').then(m => { m.buretteWarning.value = null; });
  }

  if (selectedItem.value?.uid === item.uid) emit('select', item, buildToolState(item));
}
function tipInteract(item: LabItem) { console.log('Tip interact:', item.name); }
function onWheel(e: WheelEvent) {
  const target = hoveredItem.value || selectedItem.value; if (!target) return;
  const current = getItemZoom(target.uid);
  const delta = e.deltaY < 0 ? 0.15 : -0.15;
  itemZoomMap[target.uid] = Math.max(0.6, Math.min(2.2, +(current + delta).toFixed(2)));
}

/* ---- Wrappers for external composables ---- */
function _execAction(type: Parameters<typeof execAction>[0], uid: string) {
  execAction(type, uid, selectedItem, emit);
}
function _toggleSepFunnelValve(item: LabItem) { toggleSepFunnelValve(item, selectedItem, emit); }
function _toggleBurner(item: LabItem) { toggleBurner(item, selectedItem, emit); }
function _tareBalance(item: LabItem) { tareBalance(item, selectedItem, emit); }
function _tareContainer(item: LabItem) { tareContainer(item, selectedItem, emit); }
function _pipetteDraw(item: LabItem) { pipetteDraw(item, selectedItem, emit); }
function _pipetteDispense(item: LabItem) { pipetteDispense(item, selectedItem, emit); }

/* ---- Computed ---- */
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
        @drop-exited="_handleDropExited"
        @toggle-valve="toggleBuretteValve(item)"
        @tip-interact="tipInteract(item)"
        @toggle-stopcock="_toggleSepFunnelValve(item)"
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
      @tare="_tareBalance(selectedItem)"
      @tare-container="_tareContainer(selectedItem)"
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
  margin-right: 0.1rem;
  color: #94a3b8;
}
</style>
