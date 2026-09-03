<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale } = useI18n();
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { getNotifications, markAllAsRead, markAsRead, deleteNotification } from '@/services/notification.service'
import type { Notification } from '@/services/notification.service'
import { getMyWarnings, markWarningRead as apiMarkWarningRead, markAllWarningsRead as apiMarkAllWarningsRead, type UserWarning } from '@/services/warnings.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import { useToast } from '@/composables/useToast'
import { eventBus } from '@/composables/shared/useEventBus'





const props = defineProps<{ role: 'student' | 'teacher' | 'school' | 'admin' }>()

const toast = useToast()
const router = useRouter()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const error = ref('')
const marking = ref(false)
const typeFilter = ref('')
const notifPage = ref(1)
const notifLimit = ref(15)
const warnings = ref<UserWarning[]>([])
const warningMarking = ref(false)
const warningsRef = ref<HTMLElement | null>(null)

const filterOptions = computed(() => [
  { value: '', label: t('notifications.all', 'الكل') },
  { value: 'report', label: '📄 ' + t('notifications.reports', 'تقارير') },
  { value: 'class', label: '🏫 ' + t('notifications.classes', 'فصول') },
  { value: 'chat', label: '💬 ' + t('notifications.chat', 'دردشة') },
  { value: 'quiz', label: '📝 ' + t('notifications.quizzes', 'امتحانات') },
])

const unread = computed(() => notifications.value.filter(n => !n.is_read).length)
const unreadWarnings = computed(() => warnings.value.filter(w => !w.is_read).length)
const filteredNotifications = computed(() => {
  if (!typeFilter.value) return notifications.value
  return notifications.value.filter(n => {
    if (typeFilter.value === 'report') return !!n.report_id
    if (typeFilter.value === 'class') return !!n.class_id && !n.report_id
    if (typeFilter.value === 'chat') return (n.type || '').includes('chat')
    if (typeFilter.value === 'quiz') return (n.type || '').includes('quiz')
    return true
  })
})
const pagedNotifications = computed(() => {
  const start = (notifPage.value - 1) * notifLimit.value
  return filteredNotifications.value.slice(start, start + notifLimit.value)
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [notifRes, warnRes] = await Promise.all([
      getNotifications(),
      getMyWarnings().catch(() => ({ success: false, warnings: [], unreadCount: 0 })),
    ])
    notifications.value = notifRes.notifications || []
    if (warnRes.success) warnings.value = warnRes.warnings || []
  } catch (e: any) { error.value = e?.message || t('notifications.loadError', 'فشل التحميل') }
  finally { loading.value = false }
}

async function markOne(id: number) {
  marking.value = true
  try {
    await markAsRead(id)
    toast.success(t('notifications.read', 'مقروء'))
    await load()
  } catch (e: any) { toast.error(e?.message || t('common.error', 'فشل')) }
  finally { marking.value = false }
}

async function openNotification(n: Notification) {
  if (!n.is_read) {
    try {
      await markAsRead(n.id)
      n.is_read = true
    } catch { /* ignore */ }
  }
  if (n.report_id) {
    router.push(`/report/${n.report_id}`)
  } else if (n.class_id) {
    eventBus.emit(`${props.role}:switch-tab` as any, { tabId: 'my-classes' })
  }
}

async function markAll() {
  marking.value = true
  try {
    await markAllAsRead()
    toast.success(t('notifications.allRead', 'كل الإشعارات مقروءة'))
    await load()
  } catch (e: any) { toast.error(e?.message || t('common.error', 'فشل')) }
  finally { marking.value = false }
}

async function del(id: number) {
  try {
    await deleteNotification(id)
    toast.success(t('notifications.deleted', 'تم الحذف'))
    await load()
  } catch (e: any) { toast.error(e?.message || t('common.error', 'فشل')) }
}

function severityIcon(severity: string) {
  if (severity === 'high' || severity === 'critical') return '🔴'
  if (severity === 'normal' || severity === 'medium') return '🟡'
  return '🟢'
}

function scrollToWarnings() {
  warningsRef.value?.scrollIntoView({ behavior: 'smooth' })
}

async function markWarning(id: number) {
  warningMarking.value = true
  try {
    await apiMarkWarningRead(id)
    await load()
  } catch (e: any) { toast.error(e?.message || t('common.error', 'فشل')) }
  finally { warningMarking.value = false }
}

async function markAllWarningsRead() {
  warningMarking.value = true
  try {
    await apiMarkAllWarningsRead()
    toast.success(t('notifications.warningsRead', 'تم تعيين جميع التحذيرات كمقروءة'))
    await load()
  } catch (e: any) { toast.error(e?.message || t('common.error', 'فشل')) }
  finally { warningMarking.value = false }
}

onMounted(() => {
  load()
  eventBus.on('notification:new', load)
})

onUnmounted(() => {
  eventBus.off('notification:new', load)
})
</script>

<template>
  <div class="dash-page">
    <h2>{{ t('notifications.title', 'الإشعارات') }}</h2>
    <div v-if="unreadWarnings > 0" class="warnings-banner" @click="scrollToWarnings">
      <span class="warnings-banner__icon">⚠️</span>
      <span>{{ t('notifications.unreadWarnings', 'لديك {count} تحذير غير مقروء من المدرسة / الإدارة', { count: unreadWarnings }) }}</span>
      <span class="warnings-banner__arrow">↓</span>
    </div>
    <div class="notif-toolbar">
      <div class="notif-filters">
        <button v-for="f in filterOptions" :key="f.value"
          :class="['notif-filter-btn', { active: typeFilter === f.value }]"
          @click="typeFilter = f.value">
          {{ f.label }}
        </button>
      </div>
      <button v-if="unread > 0" @click="markAll" class="btn-add" :disabled="marking">{{ t('notifications.markAll', 'تعيين الكل مقروء') }}</button>
    </div>
    <SkeletonLoader v-if="loading" type="list" :count="5" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else-if="filteredNotifications.length" class="compact-list">
      <div v-for="n in pagedNotifications" :key="n.id" class="compact-row clickable" :class="{ unread: !n.is_read }" @click="openNotification(n)">
        <span class="cr-icon">{{ n.is_read ? '✉️' : '🔔' }}</span>
        <span class="cr-name">{{ n.title }}</span>
        <span class="cr-meta">
          <span>{{ n.message || '—' }}</span>
          <span>{{ new Date(n.created_at).toLocaleString(locale) }}</span>
        </span>
        <span class="cr-action">
          <button v-if="!n.is_read" @click.stop="markOne(n.id)" class="btn-sm btn-success" :disabled="marking">{{ t('notifications.read', 'مقروء') }}</button>
          <button @click.stop="del(n.id)" class="btn-sm btn-danger">{{ t('common.delete', 'حذف') }}</button>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="🔔" :title="t('notifications.empty', 'لا توجد إشعارات')" />

    <div v-if="warnings.length" class="warnings-section" ref="warningsRef">
      <div class="warnings-header">
        <h3>⚠️ {{ t('notifications.warningsTitle', 'التحذيرات') }} <span v-if="unreadWarnings > 0" class="warnings-count">{{ unreadWarnings }}</span></h3>
        <button v-if="unreadWarnings > 0" @click="markAllWarningsRead" class="btn-sm btn-warn" :disabled="warningMarking">{{ t('notifications.markAll', 'تعيين الكل مقروء') }}</button>
      </div>
      <div class="compact-list">
        <div v-for="w in warnings" :key="w.id" class="compact-row" :class="{ 'warning-unread': !w.is_read }">
          <span class="cr-icon">{{ severityIcon(w.severity) }}</span>
          <span class="cr-name">{{ w.title }}</span>
          <span class="cr-meta">
            <span>{{ w.message }}</span>
            <span>{{ t('notifications.from', 'من:') }} {{ w.school_issuer_name || w.admin_issuer_name || t('notifications.admin', 'الإدارة') }}</span>
            <span>{{ new Date(w.created_at).toLocaleString(locale) }}</span>
          </span>
          <span class="cr-action">
            <button v-if="!w.is_read" @click.stop="markWarning(w.id)" class="btn-sm btn-success" :disabled="warningMarking">{{ t('notifications.read', 'مقروء') }}</button>
          </span>
        </div>
      </div>
    </div>
    <Pagination
      v-if="filteredNotifications.length > notifLimit"
      :page="notifPage"
      :limit="notifLimit"
      :total="filteredNotifications.length"
      @change="notifPage = $event"
    />
  </div>
</template>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.compact-row.unread { background: rgba(99,102,241,0.08); }
.compact-row.clickable { cursor: pointer; }
.notif-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.notif-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.notif-filter-btn { padding: 4px 12px; border: 1px solid var(--as-border, #e5e7eb); border-radius: 16px; background: var(--bg-card, white); color: var(--as-text-soft, #6b7280); font-size: 12px; cursor: pointer; transition: all 0.15s; }
.notif-filter-btn.active { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3); color: var(--as-accent, #6366f1); font-weight: 600; }
.warnings-banner { display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin-bottom: 12px; background: #fffbeb; border: 1px solid #f59e0b; border-radius: 10px; cursor: pointer; font-size: 13px; color: #92400e; font-weight: 600; }
.warnings-banner:hover { background: #fef3c7; }
.warnings-banner__icon { font-size: 18px; }
.warnings-banner__arrow { margin-inline-start: auto; }
.warnings-section { margin-top: 20px; }
.warnings-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.warnings-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.warnings-count { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 12px; margin-inline-start: 6px; }
.warning-unread { background: rgba(245,158,11,0.08); border-inline-start: 3px solid #f59e0b; }
</style>
