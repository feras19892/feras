<template>
  <div class="dash-page">
    <h2>التحذيرات</h2>
    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث باسم أو بريد..." style="max-width: 240px;" />
      <select v-model="severityFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل المستويات</option>
        <option value="low">منخفضة</option>
        <option value="normal">متوسطة</option>
        <option value="high">عالية</option>
        <option value="critical">حرجة</option>
      </select>
      <button @click="handleExport" class="btn-export">📊 تصدير CSV</button>
    </div>
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else-if="pagedWarnings.length" class="compact-list">
      <div v-for="w in pagedWarnings" :key="w.id" class="compact-row">
        <span class="cr-icon" :style="{ color: severityColor(w.severity) }">⚠️</span>
        <span class="cr-name">{{ w.user_name }}</span>
        <span class="cr-meta">
          <span :class="['st-rate', severityClass(w.severity)]">{{ severityLabel(w.severity) }}</span>
          <span>{{ w.title }}</span>
          <span>{{ formatDate(w.created_at) }}</span>
        </span>
        <span class="cr-action" @click.stop>
          <button class="toolbar-btn" @click="openDetail(w)">تفاصيل</button>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="⚠️" title="لا توجد تحذيرات" />
    <Pagination
      v-if="filteredWarnings.length"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredWarnings.length"
      @change="currentPage = $event"
    />

    <div v-if="active" class="modal-overlay" @click.self="active = null">
      <div class="modal-content">
        <h3>{{ active.title }}</h3>
        <p><strong>المستخدم:</strong> {{ active.user_name }} ({{ active.user_email }})</p>
        <p><strong>الدور:</strong> {{ active.user_role }}</p>
        <p><strong>المستوى:</strong> <span :class="['st-rate', severityClass(active.severity)]">{{ severityLabel(active.severity) }}</span></p>
        <p><strong>التاريخ:</strong> {{ formatDate(active.created_at) }}</p>
        <div class="form-group"><strong>الرسالة:</strong></div>
        <p>{{ active.message }}</p>
        <div class="modal-actions">
          <button @click="active = null" class="btn-sm btn-warn">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getSchoolWarnings, type SchoolWarningItem } from '@/services/school.service'
import { exportToCSV } from '@/composables/shared/useExport'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'

const warnings = ref<SchoolWarningItem[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const severityFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)
const active = ref<SchoolWarningItem | null>(null)

const filteredWarnings = computed(() => {
  let result = warnings.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(w => w.user_name?.toLowerCase().includes(q) || w.user_email?.toLowerCase().includes(q) || w.title?.toLowerCase().includes(q))
  }
  if (severityFilter.value) result = result.filter(w => w.severity === severityFilter.value)
  return result
})

const pagedWarnings = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredWarnings.value.slice(start, start + pageLimit.value)
})

watch([search, severityFilter], () => { currentPage.value = 1 })

function severityLabel(s: string) {
  const labels: Record<string, string> = { low: 'منخفضة', normal: 'متوسطة', high: 'عالية', critical: 'حرجة' }
  return labels[s] || s
}

function severityClass(s: string) {
  if (s === 'critical') return 'st-rate--bad'
  if (s === 'high') return 'st-rate--mid'
  return 'st-rate--good'
}

function severityColor(s: string) {
  if (s === 'critical') return '#ef4444'
  if (s === 'high') return '#f59e0b'
  return '#64748b'
}

function formatDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('ar') : '—'
}

function openDetail(w: SchoolWarningItem) { active.value = w }

function handleExport() {
  exportToCSV(filteredWarnings.value.map(w => ({
    id: w.id, user: w.user_name, email: w.user_email, role: w.user_role, severity: severityLabel(w.severity),
    title: w.title, message: w.message, date: formatDate(w.created_at),
  })), 'school-warnings')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await getSchoolWarnings()
    if (res.success) warnings.value = res.warnings || []
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
.st-rate--mid { color: var(--warning-text); }
.st-rate--bad { color: var(--danger-text); }
.toolbar-btn { padding: 6px 10px; border: 1px solid var(--as-border); border-radius: 8px; background: var(--as-raised); color: var(--as-text); cursor: pointer; font-size: 12px; }
.toolbar-btn:hover { background: var(--as-surface); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: var(--as-surface); border: 1px solid var(--as-border); padding: 24px; border-radius: 16px; max-width: 440px; width: 90%; }
.modal-content h3 { margin: 0 0 12px; }
.form-group { margin-bottom: 8px; }
.modal-actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-sm { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; color: white; }
.btn-warn { background: #f59e0b; }
</style>
