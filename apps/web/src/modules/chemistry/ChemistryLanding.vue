<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { glasswareSections, chemicalSections } from '../../composables/chemistry/useChemistryTools';
import { pendingChemicalFill, getLiquid, chemicals, selectedChemical, hasSelectedChemicalMap } from '../../composables/chemistry/useChemistryLab';
import type { ToolDef, LabItem } from '../../composables/chemistry/useChemistryTools';
import type { ToolState } from '../../components/experiment/chemistry/InspectorPanel.vue';
import WorkspaceCanvas from '../../components/experiment/chemistry/WorkspaceCanvas.vue';
import NotesPanel from '../../components/experiment/chemistry/NotesPanel.vue';
import GuidePanel from '../../components/experiment/chemistry/GuidePanel.vue';
import LabStatsPanel from '../../components/experiment/chemistry/LabStatsPanel.vue';

const leftWidth = ref(280);
const rightWidth = ref(280);
const resizingLeft = ref(false);
const resizingRight = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const activeTab = ref('glassware');
const selectedItem = ref<LabItem | null>(null);
const selectedState = ref<ToolState | null>(null);
const canvasRef = ref<InstanceType<typeof WorkspaceCanvas> | null>(null);

function onSelect(item: LabItem | null, state: ToolState | null) {
  selectedItem.value = item;
  selectedState.value = state;
}

// Auto-switch to chemical shelf when pending fill is set
watch(pendingChemicalFill, (val) => {
  if (val) {
    activeTab.value = 'chemicals';
    // Expand all chemical sections
    expandedSections.value.liquids = true;
    expandedSections.value.solids = true;
    expandedSections.value.indicators = true;
  }
});

function onChemicalClick(tool: ToolDef) {
  const chem = chemicals.find(c => c.id === tool.id || (tool.id === 'h2o' && c.id === 'water'));
  if (!chem) return;
  selectedChemical.id = chem.id;
  selectedChemical.nameAr = chem.nameAr;
  selectedChemical.color = chem.color;
  selectedChemical.opacity = chem.opacity;
  if (!pendingChemicalFill.value) return;
  const { uid, amount } = pendingChemicalFill.value;
  hasSelectedChemicalMap[uid] = true;
  const liq = getLiquid(uid);
  liq.volume = Math.min(liq.maxVolume, liq.volume + amount);
  liq.color = chem.color;
  liq.opacity = chem.opacity;
  liq.label = chem.nameAr;
  pendingChemicalFill.value = null;
}

const expandedSections = ref<Record<string, boolean>>({
  containers: true, measuring: true, devices: true, helpers: true,
  liquids: true, solids: true, indicators: true,
});

function toggleSection(id: string) { expandedSections.value[id] = !expandedSections.value[id]; }

function onDragStart(e: DragEvent, item: ToolDef) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  }
}

function onLeftDown(e: MouseEvent) {
  resizingLeft.value = true;
  startX.value = e.clientX;
  startWidth.value = leftWidth.value;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

function onRightDown(e: MouseEvent) {
  resizingRight.value = true;
  startX.value = e.clientX;
  startWidth.value = rightWidth.value;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

function onMove(e: MouseEvent) {
  if (resizingLeft.value) {
    const delta = startX.value - e.clientX;
    leftWidth.value = Math.max(160, Math.min(480, startWidth.value + delta));
  }
  if (resizingRight.value) {
    const delta = e.clientX - startX.value;
    rightWidth.value = Math.max(160, Math.min(480, startWidth.value + delta));
  }
}

function onUp() {
  resizingLeft.value = false;
  resizingRight.value = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}

onMounted(() => {
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove);
  window.removeEventListener('mouseup', onUp);
});
</script>

<template>
  <div class="chemistry-landing" :style="{ gridTemplateColumns: `${leftWidth}px 6px 1fr 6px ${rightWidth}px` }">
    <aside class="panel panel-left">
      <div class="tabs">
        <button
          v-for="tab in [
            { id: 'glassware', label: 'الزجاجيات والأدوات', icon: '🧪' },
            { id: 'chemicals', label: 'الرف الكيميائي', icon: '🧪' },
          ]"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>
      <!-- Pending fill banner -->
      <div v-if="pendingChemicalFill" class="pending-banner">
        <span>⚡ اختر محلول للإضافة من الجدول</span>
        <button class="cancel-btn" @click="pendingChemicalFill = null">❌ إلغاء</button>
      </div>
      <div class="sections-list">
        <div v-for="section in (activeTab === 'glassware' ? glasswareSections : chemicalSections)" :key="section.id" class="section">
          <button class="section-header" @click="toggleSection(section.id)">
            <span>{{ expandedSections[section.id] ? '▼' : '▶' }}</span>
            <span>{{ section.icon }} {{ section.title }}</span>
          </button>
          <div v-if="expandedSections[section.id]" class="tools-grid">
            <div
              v-for="item in section.items"
              :key="item.id"
              class="tool-card"
              :class="{ clickable: pendingChemicalFill && ['acid','base','solvent','indicator'].includes(item.type) }"
              draggable="true"
              @dragstart="onDragStart($event, item)"
              @click="onChemicalClick(item)"
            >
              <div class="tool-icon">{{ item.icon }}</div>
              <span class="tool-name">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <div class="resizer resizer-left" @mousedown="onLeftDown" />
    <WorkspaceCanvas ref="canvasRef" @select="onSelect" />
    <div class="resizer resizer-right" @mousedown="onRightDown" />
    <aside class="panel panel-right">
      <div class="panel-header">
        <span>🔬 لوحة المعلومات</span>
        <button class="reset-btn" @click="canvasRef?.resetLab()" title="تصفير المختبر">
          🔄 تصفير
        </button>
      </div>
      <LabStatsPanel :item="selectedItem" />
      <NotesPanel />
      <GuidePanel />
    </aside>
  </div>
</template>

<style scoped>
.chemistry-landing {
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  display: grid;
  overflow: hidden;
}
.panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  overflow-y: auto;
}
.panel-left {
  border-right: none;
  display: flex;
  flex-direction: column;
  padding: 0;
}
.panel-right {
  border-left: none;
  padding: 1.5rem;
}
.panel-right h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #334155;
  text-align: center;
}
.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;
}
.tab-btn {
  flex: 1;
  padding: 0.65rem 0.25rem;
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}
.tab-btn:hover {
  background: rgba(255,255,255,0.5);
}
.tab-btn.active {
  background: #ffffff;
  color: #10b981;
  border-bottom: 2px solid #10b981;
  font-weight: 700;
}
.sections-list {
  overflow-y: auto;
  flex: 1;
}
.section {
  border-bottom: 1px solid #e2e8f0;
}
.section-header {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: #f1f5f9;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  text-align: right;
  font-family: inherit;
}
.section-header:hover {
  background: #e2e8f0;
}
.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
  padding: 0.75rem;
  overflow-y: auto;
}
.tool-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}
.tool-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16,185,129,0.12);
  transform: translateY(-2px);
}
.tool-card:active { cursor: grabbing; }
.tool-card.clickable {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
  animation: pulse 1.5s infinite;
}
.tool-card.clickable:hover {
  background: #ecfdf5;
  transform: translateY(-2px);
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
  50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.1); }
}
.tool-icon { font-size: 2rem; line-height: 1; }
.tool-name { font-size: 0.75rem; color: #475569; text-align: center; }
.pending-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-bottom: 1px solid #a7f3d0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #065f46;
}
.pending-banner .cancel-btn {
  background: #fff;
  border: 1px solid #6ee7b7;
  border-radius: 0.4rem;
  padding: 0.15rem 0.4rem;
  font-size: 0.65rem;
  cursor: pointer;
  color: #065f46;
}
.resizer {
  width: 6px;
  background: #e2e8f0;
  cursor: col-resize;
  transition: background 0.2s;
  z-index: 10;
}
.resizer:hover { background: #94a3b8; }
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}
.reset-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  border: none;
  border-radius: 0.4rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239,68,68,0.25);
}
</style>
