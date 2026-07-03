<script setup lang="ts">
import { reactive } from 'vue';
import { glasswareSections } from '../../../composables/chemistry/useChemistryTools';
import type { ToolDef } from '../../../composables/chemistry/useChemistryTools';
import type { Chemical } from '../../../composables/chemistry/useChemistryLab';
import { useI18n } from '../../../composables/useI18n';
import ChemicalShelfPanel from './ChemicalShelfPanel.vue';
const { t } = useI18n();

const activeTab = defineModel<string>('activeTab', { default: 'glassware' });

const expandedSections = reactive<Record<string, boolean>>({});

function toggleSection(id: string) {
  expandedSections[id] = !expandedSections[id];
}

function onDragStart(e: DragEvent, item: ToolDef) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  }
}

const emit = defineEmits<{
  chemicalClick: [chem: Chemical];
}>();
</script>

<template>
  <aside class="panel panel-left">
    <div class="tabs">
      <button
        v-for="tab in [
          { id: 'glassware', label: t('chemistryLab.glasswareTools'), icon: '🧪' },
          { id: 'chemicals', label: t('chemistryLab.chemicalShelf'), icon: '🧪' },
        ]"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>
    <div v-if="activeTab === 'glassware'" class="sections-list">
      <div v-for="section in glasswareSections" :key="section.id" class="section">
        <button class="section-header" @click="toggleSection(section.id)">
          <span>{{ expandedSections[section.id] ? '▼' : '▶' }}</span>
          <span>{{ section.icon }} {{ t(section.title) }}</span>
        </button>
        <div v-if="expandedSections[section.id]" class="tools-grid">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="tool-card"
            draggable="true"
            @dragstart="onDragStart($event, item)"
          >
            <div class="tool-icon">{{ item.icon }}</div>
            <span class="tool-name">{{ t(item.name) }}</span>
          </div>
        </div>
      </div>
    </div>
    <ChemicalShelfPanel
      v-else
      @chemical-click="(chem) => emit('chemicalClick', chem)"
    />
  </aside>
</template>

<style scoped>
.panel-left {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  gap: 0.75rem;
}
.tabs {
  display: flex;
  gap: 0.25rem;
  background: #f1f5f9;
  border-radius: 0.5rem;
  padding: 0.25rem;
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
.tool-icon { font-size: 2rem; line-height: 1; }
.tool-name { font-size: 0.75rem; color: #475569; text-align: center; }
</style>
