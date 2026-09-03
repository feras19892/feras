<template>
  <div class="admin-shell" data-admin-shell>
    <ApiProgressBar />
    <CommandPalette v-if="config.layout.header?.showSearch !== false" />
    <GlobalConfirmDialog />
    <GlobalAdminPasswordDialog />

    <AdminTopBar
      :title="config.title"
      :icon="config.icon"
    >
      <template #actions>
        <button v-if="showBackToUser" class="btn-sm btn-primary" @click="goToUser">{{ t('admin.topBar.backToUser') }}</button>
        <button v-if="props.role === 'admin'" class="btn-sm btn-ghost" :title="t('admin.topBar.refresh')" @click="refreshDashboard">🔄 {{ t('admin.topBar.refresh') }}</button>
        <LocaleSwitcher />
        <StudentHelpButton v-if="props.role === 'student'" :tab-id="props.currentTabId" />
        <TeacherHelpButton v-if="props.role === 'teacher' && props.currentTabId !== 'quizzes' && props.currentTabId !== 'exp-questions'" :tab-id="props.currentTabId" />
        <SchoolHelpButton v-if="props.role === 'school'" :tab-id="props.currentTabId" />
        <button
          v-if="props.role === 'admin'"
          class="admin-notif-bell"
          :title="t('common.notifications')"
          @click="switchTab('notifications')"
        >
          🔔
          <span v-if="notifUnread > 0" class="admin-notif-badge">{{ notifUnread > 99 ? '99+' : notifUnread }}</span>
        </button>
        <NotificationBell v-else />
        <div class="conn-indicator" :class="connType" :title="connLabel">
          <span class="conn-dot"></span>
          <span class="conn-text">{{ connLabel }}</span>
        </div>
      </template>
    </AdminTopBar>

    <aside class="admin-sidebar">
      <AdminSidebar :items="navItems" :groups="sidebarGroups" :active-id="currentTabId" @select="switchTab" />
    </aside>

    <main class="admin-main">
      <slot />
    </main>
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
import AdminTopBar from '@/components/admin/AdminTopBar.vue'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { AdminNavItem } from '@/components/admin/AdminSidebar.vue'
import { eventBus } from '@/composables/shared/useEventBus'
import type { AppEvents } from '@/composables/shared/useEventBus'
import { useSelectedUser } from '@/composables/shared/useSelectedUser'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

import { useAdminStore } from '@/stores/admin.store'
import { useRealtime } from '@/composables/shared/useRealtime'
import NotificationBell from '@/components/shared/NotificationBell.vue'
import LocaleSwitcher from '@/components/shared/LocaleSwitcher.vue'
import StudentHelpButton from '@/components/student/StudentHelpButton.vue'
import TeacherHelpButton from '@/components/teacher/TeacherHelpButton.vue'
import SchoolHelpButton from '@/components/school/SchoolHelpButton.vue'
import { getUnreadChatCounts } from '@/services/chat.service'
import { useNotifications } from '@/composables/shared/useNotifications'





const { connectionType } = useRealtime()
const connType = computed(() => connectionType.value)
const connLabel = computed(() => {
  if (connType.value === 'sse') return t('admin.topBar.connection.live')
  if (connType.value === 'polling') return t('admin.topBar.connection.polling')
  return t('admin.topBar.connection.offline')
})

const props = defineProps<{
  config: DashboardConfig
  currentTabId: string
  role: string
}>()

const { selectedUserId } = useSelectedUser()
const adminStore = useAdminStore()
// العدّاد المركزي المشترك مع NotificationBell — مصدر واحد بلا polling مكرر
const { unreadCount: notifUnread, markAllAsRead } = useNotifications()
const chatUnread = ref(0)

const showBackToUser = computed(() => props.role === 'admin' && selectedUserId.value && props.currentTabId !== 'user-detail')
let pollTimer: ReturnType<typeof setInterval> | null = null
let onVisibility: (() => void) | null = null

const supportsChat = computed(() => props.role === 'teacher' || props.role === 'student')

async function refreshBadges() {
  // الإشعارات العامة تُدار مركزياً عبر useNotifications (SSE + polling واحد)
  // هنا نحدّث عدّاد الشات فقط (لأنه خاص بالأدوار teacher/student)
  if (!supportsChat.value) return
  try {
    const cRes = await getUnreadChatCounts().catch(() => null)
    if (cRes?.success) {
      const counts = cRes.counts as Record<string, number>
      chatUnread.value = Object.values(counts).reduce((s: number, n: number) => s + n, 0)
    }
  } catch { /* silent */ }
}

onMounted(() => {
  if (props.role === 'admin') adminStore.fetchRequests()
  refreshBadges()
  const startPolling = () => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = setInterval(refreshBadges, 60000)
  }
  startPolling()
  onVisibility = () => {
    const visible = !document.hidden
    if (visible) { refreshBadges(); startPolling() } else if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }
  document.addEventListener('visibilitychange', onVisibility)
  // 'notification:new' يُعالج داخل useNotifications — لا اشتراك مزدوج
  eventBus.on('chat:unread-updated', refreshBadges)
  window.addEventListener('keydown', onTabShortcut)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  eventBus.off('chat:unread-updated', refreshBadges)
  window.removeEventListener('keydown', onTabShortcut)
})

watch(() => props.currentTabId, async (tabId) => {
  if (tabId === 'notifications' && notifUnread.value > 0) {
    notifUnread.value = 0
    markAllAsRead().catch(() => {})
  }
  if (tabId === 'chat') chatUnread.value = 0
})

const navItems = computed<AdminNavItem[]>(() =>
  props.config.layout.sidebar.items.map(i => {
    const item: AdminNavItem = { id: i.id, label: i.label, icon: i.icon, tabId: i.tabId }
    if (i.tabId === 'notifications' && notifUnread.value > 0) item.badge = notifUnread.value
    if (i.tabId === 'chat' && chatUnread.value > 0) item.badge = chatUnread.value
    if (i.tabId === 'requests-approvals' && adminStore.requests.length > 0) {
      const pending = adminStore.requests.filter(r => r.status === 'pending').length
      if (pending > 0) item.badge = pending
    }
    return item
  })
)

const sidebarGroups = computed(() => {
  if (props.role === 'admin') {
    return [
      { title: 'admin.groups.monitoring', ids: ['overview', 'experiments'] },
      { title: 'admin.groups.management', ids: ['users', 'schools', 'classes'] },
      { title: 'admin.groups.review', ids: ['reports', 'requests-approvals'] },
      { title: 'admin.groups.subscriptions', ids: ['subscriptions'] },
      { title: 'admin.groups.communications', ids: ['notifications', 'chat'] },
      { title: 'admin.groups.system', ids: ['system'] },
    ]
  }
  return [{ title: props.config.title, ids: navItems.value.map(i => i.id) }]
})

const switchTabEvent = computed(() => `${props.role}:switch-tab` as keyof AppEvents)

function switchTab(tabId: string) {
  eventBus.emit(switchTabEvent.value, { tabId } as any)
}

function goToUser() {
  switchTab('user-detail')
}

function refreshDashboard() {
  eventBus.emit('dashboard:refresh')
}

function onTabShortcut(e: KeyboardEvent) {
  if (!e.altKey) return
  const num = parseInt(e.key, 10)
  if (isNaN(num) || num < 1) return
  const items = navItems.value
  if (num > items.length) return
  e.preventDefault()
  const target = items[num - 1]
  if (target?.tabId) switchTab(target.tabId)
}
</script>

<style scoped>
.conn-indicator { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.conn-indicator.sse { background: rgba(16,185,129,0.12); color: var(--as-success, #10b981); }
.conn-indicator.polling { background: rgba(245,158,11,0.12); color: var(--as-warning, #f59e0b); }
.conn-indicator.offline { background: rgba(239,68,68,0.12); color: var(--as-danger, #ef4444); }
.conn-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.admin-notif-bell { background: none; border: none; cursor: pointer; font-size: 1.1rem; position: relative; padding: 0.3rem; color: var(--as-text, #e2e8f0); display: inline-flex; align-items: center; justify-content: center; }
.admin-notif-badge { position: absolute; top: -3px; inset-inline-end: -3px; min-width: 16px; height: 16px; padding: 0 4px; background: var(--as-danger, #ef4444); color: #fff; border-radius: 999px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg-primary, rgba(15, 23, 42, 0.9)); }
</style>
