<template>
  <div class="hud-shell" data-hud="admin">
    <ApiProgressBar />
    <CommandPalette v-if="config.layout.header?.showSearch !== false" />
    <GlobalConfirmDialog />
    <GlobalAdminPasswordDialog />

    <header class="hud-header">
      <div class="hud-brand">
        <span class="hud-brand-icon">{{ config.icon }}</span>
        <span class="hud-brand-title">{{ config.title }}</span>
      </div>
      <div class="hud-actions">
        <span class="hud-conn" :class="connectionType">
          {{ connLabel }}
        </span>
        <NotificationBell v-if="config.layout.header?.showNotifications !== false" />
        <AccountSettingsModal />
      </div>
    </header>

    <ActionDock :items="dockItems" @action="onDockAction" />

    <main class="hud-main">
      <slot />
    </main>

    <FloatingCommandBar :items="items" :active-id="currentTabId" @select="switchTab" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { DashboardConfig } from '@/core/types/dashboard.types'
import ApiProgressBar from '@/components/shared/ApiProgressBar.vue'
import CommandPalette from '@/components/shared/CommandPalette.vue'
import GlobalConfirmDialog from '@/components/shared/GlobalConfirmDialog.vue'
import GlobalAdminPasswordDialog from '@/components/shared/GlobalAdminPasswordDialog.vue'
import NotificationBell from '@/components/shared/NotificationBell.vue'
import AccountSettingsModal from '@/components/shared/AccountSettingsModal.vue'
import { computed } from 'vue'
import { useRealtime } from '@/composables/shared/useRealtime'

import { eventBus } from '@/composables/shared/useEventBus'
import FloatingCommandBar from '@/components/hud/FloatingCommandBar.vue'
import ActionDock from '@/components/hud/ActionDock.vue'
import { useFloatingCommandBar } from '@/composables/hud/useFloatingCommandBar'
import { useActionDock } from '@/composables/hud/useActionDock'





const props = defineProps<{
  config: DashboardConfig
  currentTabId: string
}>()

const { connectionType } = useRealtime()
const { items } = useFloatingCommandBar(props.config, props.currentTabId)
const { items: dockItems } = useActionDock(props.config, props.currentTabId)

function switchTab(tabId: string) {
  eventBus.emit('admin:switch-tab', { tabId })
}

function onDockAction(id: string) {
  if (id === 'schools' || id === 'users' || id === 'reports' || id === 'classes' || id === 'notifications') {
    switchTab(id)
    return
  }

  const addMap: Record<string, string> = {
    'add-school': 'schools',
    'add-user': 'users',
    'add-class': 'classes',
    'send-alert': 'notifications',
    'new-announcement': 'notifications',
  }

  if (addMap[id]) {
    switchTab(addMap[id])
  }

  eventBus.emit('admin:action', { id, tabId: props.currentTabId })
}

const connLabel = computed(() => {
  if (connectionType.value === 'sse') return t('dashboard.dashNew.connectedLive')
  if (connectionType.value === 'polling') return t('dashboard.dashNew.connectedPolling')
  return t('dashboard.dashNew.disconnected')
})
</script>
