<template>
  <div class="dash-page">
    <h2>الإشعارات</h2>
    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث بعنوان أو محتوى..." style="max-width: 240px;" />
      <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الإشعارات</option>
        <option value="unread">غير مقروء</option>
        <option value="read">مقروء</option>
      </select>
      <button @click="markAllRead" class="btn-export" :disabled="markingAll">تعيين الكل مقروء</button>
    </div>
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else-if="pagedNotifications.length" class="compact-list">
      <div v-for="n in pagedNotifications" :key="n.id" class="compact-row" :class="{ 'row-selected': !isRead(n) }">
        <span class="cr-icon">{{ n.is_pinned ? '📌' : '🔔' }}</span>
        <span class="cr-name" :style="{ opacity: isRead(n) ? 0.6 : 1 }">{{ n.title }}</span>
        <span class="cr-meta">
          <span :class="['st-rate', n.is_pinned ? 'st-rate--bad' : 'st-rate--good']">{{ n.is_pinned ? 'مثبت' : 'عادي' }}</span>
          <span>{{ formatDate(n.created_at) }}</span>
        </span>
        <span class="cr-action" @click.stop>
          <button class="toolbar-btn" @click="openDetail(n)">عرض</button>
          <button class="toolbar-btn" style="margin-right:6px" :disabled="isRead(n)" @click="markRead(n.id)">قراءة</button>
          <button class="toolbar-btn" style="margin-right:6px" @click="togglePin(n)">تثبيت</button>
          <button class="toolbar-btn toolbar-danger" style="margin-right:6px" @click="remove(n.id)">حذف</button>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="🔔" title="لا توجد إشعارات" />
    <Pagination
      v-if="filteredNotifications.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredNotifications.length"
      @change="currentPage = $event"
    />

    <div v-if="active" class="modal-overlay" @click.self="active = null">
      <div class="modal-content">
        <h3>{{ active.title }}</h3>
        <p><strong>النوع:</strong> {{ active.type }}</p>
        <p><strong>الأولوية:</strong> {{ active.priority }}</p>
        <p><strong>التاريخ:</strong> {{ formatDate(active.created_at) }}</p>
        <div class="form-group"><strong>المحتوى:</strong></div>
        <p>{{ active.message }}</p>
        <div class="modal-actions">
          <button v-if="!isRead(active)" @click="markRead(active.id); active = null" class="btn-sm btn-success" :disabled="marking">تعيين مقروء</button>
          <button @click="active = null" class="btn-sm btn-warn">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  getSchoolNotifications, markSchoolNotificationRead, markAllSchoolNotificationsRead,
  deleteSchoolNotification, togglePinSchoolNotification, type SchoolNotification,
} from '@/services/school-notifications.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'

const toast = useToast()
const notifications = ref<SchoolNotification[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)
const active = ref<SchoolNotification | null>(null)
const marking = ref(false)
const markingAll = ref(false)

const filteredNotifications = computed(() => {
  let result = notifications.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(n => n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q) || n.type?.toLowerCase().includes(q))
  }
  if (statusFilter.value === 'unread') result = result.filter(n => !isRead(n))
  if (statusFilter.value === 'read') result = result.filter(n => isRead(n))
  return result
})

const pagedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredNotifications.value.slice(start, start + pageLimit.value)
})

watch([search, statusFilter], () => { currentPage.value = 1 })

function isRead(n: SchoolNotification) { return n.is_read == 1 || n.is_read === true }

function formatDate(d?: string | null) { return d ? new Date(d).toLocaleDateString('ar') : '—' }

function openDetail(n: SchoolNotification) { active.value = n }

async function markRead(id: number) {
  marking.value = true
  try {
    await markSchoolNotificationRead(id)
    const n = notifications.value.find(x => x.id === id)
    if (n) n.is_read = 1
    toast.success('تم تعيين الإشعار مقروءاً')
  } catch (e: any) { toast.error(e?.message || 'فشل التحديث') }
  finally { marking.value = false }
}

async function markAllRead() {
  markingAll.value = true
  try {
    await markAllSchoolNotificationsRead()
    notifications.value.forEach(n => n.is_read = 1)
    toast.success('تم تعيين الكل مقروءاً')
  } catch (e: any) { toast.error(e?.message || 'فشل التحديث') }
  finally { markingAll.value = false }
}

async function togglePin(n: SchoolNotification) {
  try {
    const res = await togglePinSchoolNotification(n.id)
    if (res.success) n.is_pinned = !n.is_pinned
    toast.success('تم تحديث التثبيت')
  } catch (e: any) { toast.error(e?.message || 'فشل التحديث') }
}

async function remove(id: number) {
  try {
    await deleteSchoolNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    toast.success('تم حذف الإشعار')
  } catch (e: any) { toast.error(e?.message || 'فشل الحذف') }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getSchoolNotifications()
    if (res.success) notifications.value = res.notifications || []
    else error.value = 'فشل التحميل'
  } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
  finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.search-input { max-width: 240px; }
.st-rate--good { color: var(--success-text); }
.st-rate--bad { color: var(--danger-text); }
.toolbar-btn { padding: 6px 10px; border: 1px solid var(--as-border); border-radius: 8px; background: var(--as-raised); color: var(--as-text); cursor: pointer; font-size: 12px; }
.toolbar-btn:hover { background: var(--as-surface); }
.toolbar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.toolbar-btn.toolbar-danger { border-color: var(--danger-text); color: var(--danger-text); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: var(--as-surface); border: 1px solid var(--as-border); padding: 24px; border-radius: 16px; max-width: 440px; width: 90%; }
.modal-content h3 { margin: 0 0 12px; }
.form-group { margin-bottom: 8px; }
.modal-actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-sm { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; color: white; }
.btn-success { background: #22c55e; }
.btn-warn { background: #f59e0b; }
</style>
