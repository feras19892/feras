<template>
  <div v-if="!isReady" class="dashboard-layout access-denied">
    <div class="access-denied-content">
      <div class="spinner"></div>
      <p>{{ t('dashboard.dashNew.loading', 'جاري التحميل...') }}</p>
    </div>
  </div>
  <div v-else-if="!isAllowed" class="dashboard-layout access-denied">
    <div class="access-denied-content">
      <h2>{{ t('dashboard.dashNew.accessDenied', 'غير مصرح') }}</h2>
      <button @click="handleLogout" class="logout-btn">{{ t('dashboard.dashNew.logout') }}</button>
    </div>
  </div>
  <AdminAppShell v-else :config="config" :currentTabId="currentTabId" :role="role">
    <TrialBanner v-if="role !== 'admin' && !isCovered" :role="role" :subscription="subscription" />
    <ErrorBoundary>
      <ErrorState v-if="tabError" :error="tabError" show-retry @retry="retryTab" />
      <KeepAlive v-else-if="currentTabComponent">
        <component :is="currentTabComponent" />
      </KeepAlive>
      <SkeletonLoader v-else type="list" :count="3" />
    </ErrorBoundary>
  </AdminAppShell>
  <BroadcastAlert v-if="role === 'student'" />
  <FrozenScreen v-if="role === 'student'" />
  <QuizForceScreen v-if="role === 'student'" />
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { DashboardConfig } from '@/core/types/dashboard.types'
import '@/assets/styles/dashboard-shared.css'
import AdminAppShell from '@/components/admin/AdminAppShell.vue'
import { useDashboard } from '@/composables/shared/useDashboard'
import { useTabs } from '@/composables/shared/useTabs'
import { eventBus } from '@/composables/shared/useEventBus'
import { usePreferences } from '@/composables/shared/usePreferences'
import ErrorBoundary from '@/components/shared/ErrorBoundary.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import BroadcastAlert from '@/components/shared/BroadcastAlert.vue'
import FrozenScreen from '@/components/shared/FrozenScreen.vue'
import QuizForceScreen from '@/components/shared/QuizForceScreen.vue'
import type { AppEvents } from '@/composables/shared/useEventBus'
import { onMounted, onUnmounted, watch, ref, computed } from 'vue'
import TrialBanner from '@/components/shared/TrialBanner.vue'
import { getMySubscription } from '@/services/core/school.api'

const props = defineProps<{
  config: DashboardConfig
  role: 'admin' | 'school' | 'teacher' | 'student'
}>()

const { handleLogout, isAllowed, isReady, user } = useDashboard(props.role, props.config)
const { currentTabId, currentTabComponent, tabError, switchTab } = useTabs(props.config)
const subscription = ref<{ status: string; expires_at?: string | null } | null>(null)
const isCovered = computed(() => (props.role === 'student' || props.role === 'teacher') && !!user?.school_id)

async function loadSubscription() {
  if (props.role === 'admin' || !isAllowed.value) return
  const res = await getMySubscription().catch(() => undefined)
  if (res?.success && res.subscription) {
    subscription.value = res.subscription
  }
}

function retryTab() { switchTab(currentTabId.value) }
const { setLastTab, getLastTab } = usePreferences()

function onSwitchTab(e: { tabId: string }) { switchTab(e.tabId) }

const tabEvent = `${props.role}:switch-tab` as keyof AppEvents

onMounted(() => {
  eventBus.on(tabEvent, onSwitchTab as any)
  const lastTab = getLastTab(props.role)
  if (lastTab && props.config.tabs.find(t => t.id === lastTab)) switchTab(lastTab)
  loadSubscription()
})

watch(isAllowed, (allowed) => {
  if (allowed) loadSubscription()
})

onUnmounted(() => { eventBus.off(tabEvent, onSwitchTab as any) })

watch(currentTabId, (tabId) => {
  if (!isAllowed.value) return
  setLastTab(props.role, tabId)
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-primary, #f5f7fa);
}

.access-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg-primary, #f5f7fa);
}
.access-denied-content {
  text-align: center;
  padding: 24px;
  background: var(--bg-card, white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  max-width: 380px;
  width: 90%;
}
.access-denied-content h2 {
  margin: 0 0 16px;
  color: var(--text-primary, #1a2332);
}
</style>
