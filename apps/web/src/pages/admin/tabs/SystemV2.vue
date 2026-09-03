<template>
  <div class="dash-page">
    <div class="sub-tabs">
      <button
        v-for="tab in subTabs"
        :key="tab.id"
        :class="['sub-tab', { active: activeSub === tab.id }]"
        @click="activeSub = tab.id"
      >
        <span class="sub-tab__icon">{{ tab.icon }}</span>
        <span class="sub-tab__label">{{ tab.label }}</span>
      </button>
    </div>

    <SystemMetrics v-if="activeSub === 'metrics'" />

    <SystemAccess v-else-if="activeSub === 'access'" />

    <SystemMaintenance v-else-if="activeSub === 'maintenance'" />

    <SystemBackups v-else-if="activeSub === 'backups'" />

    <SupportTickets v-else-if="activeSub === 'tickets'" />

    <SystemAudit v-else-if="activeSub === 'audit'" />

    <SystemSettings v-else-if="activeSub === 'settings'" />

    <SystemAlerts v-else-if="activeSub === 'alerts'" />

    <SystemEmergency v-else-if="activeSub === 'emergency'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SystemMetrics from '@/pages/admin/tabs/system/SystemMetrics.vue'
import SystemAccess from '@/pages/admin/tabs/system/SystemAccess.vue'
import SystemMaintenance from '@/pages/admin/tabs/system/SystemMaintenance.vue'
import SystemEmergency from '@/pages/admin/tabs/system/SystemEmergency.vue'
import SystemAudit from '@/pages/admin/tabs/system/SystemAudit.vue'
import SystemSettings from '@/pages/admin/tabs/system/SystemSettings.vue'
import SystemAlerts from '@/pages/admin/tabs/system/SystemAlerts.vue'
import SystemBackups from '@/pages/admin/tabs/system/SystemBackups.vue'
import SupportTickets from '@/pages/admin/tabs/system/SupportTickets.vue'

const activeSub = ref('metrics')

const subTabs = [
  { id: 'metrics', label: 'مقاييس مباشرة', icon: '📈' },
  { id: 'access', label: 'الوصول والأمان', icon: '🔐' },
  { id: 'maintenance', label: 'الصيانة والتخزين', icon: '🗄️' },
  { id: 'backups', label: 'النسخ الاحتياطية', icon: '💾' },
  { id: 'tickets', label: 'تذاكر الدعم', icon: '🎫' },
  { id: 'audit', label: 'سجل التدقيق', icon: '📜' },
  { id: 'settings', label: 'إعدادات النظام', icon: '⚙️' },
  { id: 'alerts', label: 'التنبيهات والحوادث', icon: '🚨' },
  { id: 'emergency', label: 'وضع الطوارئ', icon: '🛑' },
]
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.sub-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.sub-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: none; border-radius: 8px;
  background: rgba(15,23,42,0.5); color: #cbd5e1;
  cursor: pointer; font-family: inherit; font-size: 0.85rem;
  transition: all 0.15s;
}
.sub-tab:hover { background: rgba(99,102,241,0.1); color: #fff; }
.sub-tab.active { background: #6366f1; color: #fff; font-weight: 700; }
.sub-tab__icon { font-size: 1rem; }
.sub-tab__label { white-space: nowrap; }

.panel { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; }
.panel__title { margin: 0 0 1rem; font-size: 1.1rem; font-weight: 700; color: #e2e8f0; }
.panel__note { color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem; }

.placeholder { padding: 3rem; text-align: center; color: #64748b; background: rgba(255,255,255,0.02); border-radius: 0.6rem; }
</style>
