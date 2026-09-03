<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed, ref } from 'vue'

import PlanManagement from './PlanManagement.vue'
import SubscriptionList from './SubscriptionList.vue'
import ActivationCodes from '../activation-codes/ActivationCodesTab.vue'
import InvoiceList from '../invoices/InvoiceList.vue'
import ActivityLog from '../ActivityLog.vue'
import SubscriptionControls from './SubscriptionControls.vue'
import EmergencyControls from './EmergencyControls.vue'





const activeTab = ref(0)
const tabHistory = ref<number[]>([0])

function setTab(i: number) {
  tabHistory.value.push(i)
  activeTab.value = i
}

function goBack() {
  if (tabHistory.value.length > 1) {
    tabHistory.value.pop()
    activeTab.value = tabHistory.value[tabHistory.value.length - 1]
  }
}

const tabs = computed(() => [
  t('subscriptions.tabPlans'),
  t('subscriptions.tabSubscriptions'),
  t('subscriptions.tabActivationCodes'),
  t('subscriptions.tabInvoices'),
  t('subscriptions.tabActivityLog'),
  t('subscriptions.tabControls'),
  t('subscriptions.tabEmergency'),
])
</script>

<template>
  <div class="subscriptions-shell">
    <div class="sub-tabs-bar">
      <button
        v-if="tabHistory.length > 1"
        type="button"
        class="back-btn"
        @click="goBack"
      >
        ← {{ t('common.back') }}
      </button>
      <nav class="sub-tabs">
        <button
          v-for="(label, i) in tabs"
          :key="i"
          type="button"
          :class="['sub-tab', { active: activeTab === i }]"
          @click="setTab(i)"
        >
          {{ label }}
        </button>
      </nav>
    </div>
    <section class="sub-content">
      <PlanManagement v-if="activeTab === 0" />
      <SubscriptionList v-else-if="activeTab === 1" />
      <ActivationCodes v-else-if="activeTab === 2" />
      <InvoiceList v-else-if="activeTab === 3" />
      <ActivityLog v-else-if="activeTab === 4" />
      <SubscriptionControls v-else-if="activeTab === 5" />
      <EmergencyControls v-else-if="activeTab === 6" />
    </section>
  </div>
</template>

<style scoped>
.subscriptions-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  gap: 1rem;
  color: #e2e8f0;
}
.sub-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.sub-tab {
  flex: 0 0 auto;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}
.sub-tab.active {
  color: #e2e8f0;
  border-bottom-color: #6366f1;
}
.sub-content {
  flex: 1;
}
.sub-tabs-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.back-btn {
  flex: 0 0 auto;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.back-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #e2e8f0;
}
.sub-tabs {
  border-bottom: none;
}
.sub-tabs::-webkit-scrollbar { height: 4px; }
.sub-tabs::-webkit-scrollbar-track { background: transparent; }
.sub-tabs::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.4); border-radius: 2px; }
</style>
