<template>
  <div class="dash-page">
    <h2>إدارة الاشتراكات</h2>
    <div class="sub-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        :class="['sub-tab', { active: activeTab === t.id }]"
        @click="activeTab = t.id"
      >
        {{ t.label }}
      </button>
    </div>
    <div class="sub-tab-content">
      <component :is="currentComponent" v-if="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'

const activeTab = ref('overview')

const tabs = [
  { id: 'overview', label: '📊 نظرة عامة', component: defineAsyncComponent(() => import('./SubscriptionOverview.vue')) },
  { id: 'list', label: '💳 الاشتراكات', component: defineAsyncComponent(() => import('./SubscriptionList.vue')) },
  { id: 'plans', label: '🏷️ الخطط', component: defineAsyncComponent(() => import('./SubscriptionPlans.vue')) },
  { id: 'settings', label: '⚙️ الإعدادات', component: defineAsyncComponent(() => import('./SubscriptionSettings.vue')) },
]

const currentComponent = computed(() => tabs.find(t => t.id === activeTab.value)?.component)
</script>

<style scoped>
.dash-page { padding: 1rem; }
h2 { margin: 0 0 1rem; color: #f1f5f9; }
.sub-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.sub-tab { padding: 0.5rem 1rem; border: none; border-radius: 8px; background: #1e293b; color: #94a3b8; cursor: pointer; font-family: inherit; }
.sub-tab.active { background: #6366f1; color: #fff; }
.sub-tab-content { background: #0f172a; border-radius: 12px; padding: 1rem; min-height: 300px; }
</style>
