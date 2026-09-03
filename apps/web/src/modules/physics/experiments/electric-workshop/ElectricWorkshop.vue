<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, watch } from 'vue'
import DCLab from './dc/DCLab.vue'
import ACLab from './ac/ACLab.vue'
type TabId = 'dc' | 'ac'

const STORAGE_KEY_TAB = 'electric-workshop-active-tab'

const savedTab = (() => {
  try {
    const v = localStorage.getItem(STORAGE_KEY_TAB)
    if (v === 'dc' || v === 'ac') return v
  } catch (e) { /* ignore */ }
  return 'dc'
})()

const activeTab = ref<TabId>(savedTab as TabId)

watch(activeTab, (v) => {
  try { localStorage.setItem(STORAGE_KEY_TAB, v) } catch (e) { /* ignore */ }
})

const tabs: { id: TabId; labelKey: string; icon: string; color: string }[] = [
  { id: 'dc',         labelKey: 'ew.tabDc',         icon: '⚡',  color: '#f59e0b' },
  { id: 'ac',         labelKey: 'ew.tabAc',         icon: '〰️', color: '#3b82f6' },
]
</script>

<template>
  <div class="workshop">
    <header class="workshop-header">
      <h1>🛠️ {{ t('experiments.expElectricWorkshop') }}</h1>
      <span class="workshop-hint">{{ t('ew.workshopHint') }}</span>
    </header>

    <div class="workshop-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="workshop-tab"
        :class="{ active: activeTab === tab.id }"
        :style="activeTab === tab.id ? { borderBottomColor: tab.color, color: tab.color } : {}"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ t(tab.labelKey) }}</span>
      </button>
    </div>

    <div class="workshop-body">
      <DCLab v-if="activeTab === 'dc'" />

      <ACLab v-else-if="activeTab === 'ac'" />

    </div>
  </div>
</template>

<style scoped>
.workshop {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
}

.workshop-header {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.workshop-header h1 {
  margin: 0;
  font-size: 1.1rem;
  color: #f59e0b;
}

.workshop-hint {
  font-size: 0.78rem;
  color: #64748b;
}

.workshop-tabs {
  display: flex;
  gap: 0;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: #0d1526;
}

.workshop-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s;
}

.workshop-tab:hover {
  color: #94a3b8;
  background: rgba(255,255,255,0.03);
}

.workshop-tab.active {
  background: rgba(255,255,255,0.04);
}

.tab-icon {
  font-size: 1rem;
}

.tab-label {
  font-size: 0.82rem;
}

.workshop-body {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.tab-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coming-soon {
  text-align: center;
  padding: 2rem;
}

.cs-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.coming-soon h2 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
  color: #e2e8f0;
}

.coming-soon p {
  margin: 0.3rem 0;
  color: #64748b;
  font-size: 0.85rem;
}

.cs-status {
  margin-top: 1rem !important;
  color: #f59e0b !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
}
</style>
