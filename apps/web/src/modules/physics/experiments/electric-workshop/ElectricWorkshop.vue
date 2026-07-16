<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import DCLab from './dc/DCLab.vue'

const { t } = useI18n()

type TabId = 'dc' | 'ac' | 'home' | 'industrial'

const activeTab = ref<TabId>('dc')

const tabs: { id: TabId; label: string; icon: string; color: string }[] = [
  { id: 'dc',         label: 'مختبر DC',         icon: '⚡',  color: '#f59e0b' },
  { id: 'ac',         label: 'مختبر AC',         icon: '〰️', color: '#3b82f6' },
  { id: 'home',       label: 'تمديد منزلي',       icon: '🏠', color: '#22c55e' },
  { id: 'industrial', label: 'تمديد صناعي',       icon: '🏭', color: '#ef4444' },
]
</script>

<template>
  <div class="workshop">
    <header class="workshop-header">
      <h1>🛠️ {{ t('experiments.expElectricWorkshop') }}</h1>
      <span class="workshop-hint">مختبر كهرباء حر — ابنِ دائرتك بنفسك</span>
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
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="workshop-body">
      <DCLab v-if="activeTab === 'dc'" />

      <div v-else-if="activeTab === 'ac'" class="tab-content">
        <div class="coming-soon">
          <span class="cs-icon">〰️</span>
          <h2>مختبر AC</h2>
          <p>مصادر مترددة، oscilloscope، impedance، محول</p>
          <p class="cs-status">قيد البناء...</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'home'" class="tab-content">
        <div class="coming-soon">
          <span class="cs-icon">🏠</span>
          <h2>التمديدات المنزلية</h2>
          <p>لوحة توزيع، مفاتيح إضاءة، مقابس، RCD، مصابيح، مروحة</p>
          <p class="cs-status">قيد البناء...</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'industrial'" class="tab-content">
        <div class="coming-soon">
          <span class="cs-icon">🏭</span>
          <h2>التمديدات الصناعية</h2>
          <p>محرك 3 فاز، كونتاكتور، DOL Starter، Star-Delta، قاطع حراري</p>
          <p class="cs-status">قيد البناء...</p>
        </div>
      </div>
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
