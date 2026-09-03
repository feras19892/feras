<script setup lang="ts">

import SchoolHelpButton from '@/components/school/SchoolHelpButton.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { getSchoolFeedback, updateSchoolFeedbackStatus, type SchoolFeedbackItem, type SchoolFeedbackStats } from '@/services/school-reports.service'
import { getRatings, type Rating } from '@/services/enhancements.service'
import { exportToCSV } from '@/composables/shared/useExport'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import ComplaintForm from '@/components/shared/ComplaintForm.vue'
import ProjectRating from '@/components/shared/ProjectRating.vue'

const toast = useToast()
const auth = useAuthStore()

const activeTab = ref('incoming')
const tabLabels: Record<string, string> = {
  incoming: 'الواردة',
  ratings: 'تقييم المدرسة',
  send: 'إرسال شكوى',
}

const schoolId = computed(() => auth.schoolSession?.id ?? null)

const feedback = ref<SchoolFeedbackItem[]>([])
const stats = ref<SchoolFeedbackStats | null>(null)
const loading = ref(false)
const error = ref('')

const ratings = ref<Rating[]>([])
const ratingsAvg = ref(0)
const ratingsCount = ref(0)
const ratingsLoading = ref(false)
const ratingsError = ref('')

const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)
const active = ref<SchoolFeedbackItem | null>(null)
const activeStatus = ref('')
const updating = ref(false)

const filteredFeedback = computed(() => {
  let result = feedback.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(f => f.message?.toLowerCase().includes(q) || f.user_name?.toLowerCase().includes(q) || f.experiment_name?.toLowerCase().includes(q))
  }
  if (typeFilter.value) result = result.filter(f => f.type === typeFilter.value)
  if (statusFilter.value) result = result.filter(f => f.status === statusFilter.value)
  return result
})

const pagedFeedback = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredFeedback.value.slice(start, start + pageLimit.value)
})

watch([search, typeFilter, statusFilter], () => { currentPage.value = 1 })

function statusLabel(s: string) {
  const labels: Record<string, string> = { open: 'مفتوحة', resolved: 'مغلقة', dismissed: 'متجاهلة' }
  return labels[s] || s
}

function statusClass(s: string) {
  if (s === 'resolved') return 'st-rate--good'
  if (s === 'open') return 'st-rate--mid'
  return 'st-rate--bad'
}

function typeLabel(t: string) {
  const labels: Record<string, string> = { complaint: 'شكوى', rating: 'تقييم', suggestion: 'اقتراح' }
  return labels[t] || t
}

function formatDate(d?: string | null) { return d ? new Date(d).toLocaleDateString('ar') : '—' }

function openDetail(f: SchoolFeedbackItem) { active.value = f; activeStatus.value = f.status }

function resetFilters() { search.value = ''; typeFilter.value = ''; statusFilter.value = ''; currentPage.value = 1 }

function handleExport() {
  const rows = filteredFeedback.value.map(f => ({
    id: f.id, type: typeLabel(f.type), user: f.user_name, message: f.message,
    status: statusLabel(f.status), rating: f.rating ?? '—', experiment: f.experiment_name ?? '—',
    date: formatDate(f.created_at),
  }))
  exportToCSV(rows, 'school-feedback')
}

async function updateStatus() {
  if (!active.value) return
  updating.value = true
  try {
    const res = await updateSchoolFeedbackStatus(active.value.id, activeStatus.value)
    if (res.success) {
      active.value.status = activeStatus.value
      toast.success('تم تحديث الحالة')
      active.value = null
      await loadFeedback()
    } else toast.error('فشل التحديث')
  } catch (e: any) { toast.error(e?.message || 'فشل التحديث') }
  finally { updating.value = false }
}

async function loadFeedback() {
  loading.value = true
  error.value = ''
  try {
    const res = await getSchoolFeedback()
    if (res.success) {
      feedback.value = res.feedback || []
      stats.value = res.stats || null
    } else error.value = 'فشل التحميل'
  } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
  finally { loading.value = false }
}

async function loadRatings() {
  if (!schoolId.value) return
  ratingsLoading.value = true
  ratingsError.value = ''
  try {
    const res = await getRatings('school', schoolId.value)
    if (res.success) {
      ratings.value = res.ratings || []
      ratingsAvg.value = res.average || 0
      ratingsCount.value = res.count || 0
    } else ratingsError.value = 'فشل التحميل'
  } catch (e: any) { ratingsError.value = e?.message || 'فشل التحميل' }
  finally { ratingsLoading.value = false }
}

async function onCreated() {
  activeTab.value = 'incoming'
  await loadFeedback()
}

onMounted(() => { loadFeedback(); loadRatings() })
</script>

<template>
  <div class="dash-page">
    <h2>الشكاوى والتقييمات</h2>
    <SchoolHelpButton :tab-id="`feedback-${activeTab}`" />
    <ProjectRating />

    <div class="detail-tabs">
      <button v-for="tab in Object.keys(tabLabels)" :key="tab" :class="['detail-tab', { active: activeTab === tab }]" @click="activeTab = tab">
        {{ tabLabels[tab] }}
      </button>
    </div>

    <div v-if="activeTab === 'incoming'" class="tab-panel">
      <div v-if="stats" class="stats-row">
        <div class="stat-card"><span class="stat-value">{{ stats.total }}</span><span class="stat-label">الكل</span></div>
        <div class="stat-card"><span class="stat-value">{{ stats.open }}</span><span class="stat-label">مفتوحة</span></div>
        <div class="stat-card"><span class="stat-value">{{ stats.resolved }}</span><span class="stat-label">مغلقة</span></div>
        <div class="stat-card"><span class="stat-value">{{ Math.round(stats.avg_rating || 0) }}</span><span class="stat-label">متوسط التقييم</span></div>
      </div>

      <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
        <input v-model="search" class="form-input search-input" placeholder="ابحث بمحتوى أو مستخدم..." style="max-width: 240px;" />
        <select v-model="typeFilter" class="form-input" style="min-width: 140px;">
          <option value="">كل الأنواع</option>
          <option value="complaint">شكوى</option>
          <option value="rating">تقييم</option>
          <option value="suggestion">اقتراح</option>
        </select>
        <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
          <option value="">كل الحالات</option>
          <option value="open">مفتوحة</option>
          <option value="resolved">مغلقة</option>
          <option value="dismissed">متجاهلة</option>
        </select>
        <button class="toolbar-btn" @click="resetFilters">↺ إعادة ضبط</button>
        <button class="toolbar-btn" @click="handleExport">📊 تصدير CSV</button>
      </div>

      <SkeletonLoader v-if="loading" type="cards" :count="4" />
      <ErrorState v-else-if="error" :error="error" show-retry @retry="loadFeedback" />
      <div v-else-if="pagedFeedback.length" class="compact-list">
        <div v-for="f in pagedFeedback" :key="f.id" class="compact-row">
          <span class="cr-icon">{{ f.type === 'rating' ? '⭐' : f.type === 'suggestion' ? '💡' : '📢' }}</span>
          <span class="cr-name">{{ f.user_name }}</span>
          <span class="cr-meta">
            <span :class="['st-rate', statusClass(f.status)]">{{ statusLabel(f.status) }}</span>
            <span v-if="f.rating != null">{{ f.rating }}/5</span>
            <span>{{ typeLabel(f.type) }}</span>
            <span>{{ formatDate(f.created_at) }}</span>
          </span>
          <span class="cr-action" @click.stop>
            <button class="toolbar-btn" @click="openDetail(f)">عرض</button>
          </span>
        </div>
      </div>
      <p v-else class="empty">لا توجد ملاحظات</p>

      <Pagination
        v-if="filteredFeedback.length"
        :page="currentPage"
        :limit="pageLimit"
        :total="filteredFeedback.length"
        @change="currentPage = $event"
      />
    </div>

    <div v-if="activeTab === 'ratings'" class="tab-panel">
      <SkeletonLoader v-if="ratingsLoading" type="cards" :count="3" />
      <ErrorState v-else-if="ratingsError" :error="ratingsError" show-retry @retry="loadRatings" />
      <template v-else>
        <div class="stat-cards-grid" style="margin-bottom: 16px;">
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">⭐</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ ratingsAvg.toFixed(1) }}</div>
              <div class="stat-card-modern__label">متوسط التقييم</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">📝</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ ratingsCount }}</div>
              <div class="stat-card-modern__label">عدد التقييمات</div>
            </div>
          </div>
        </div>

        <div v-if="ratings.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead>
              <tr><th>المُقيّم</th><th>التقييم</th><th>التعليق</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in ratings" :key="r.id">
                <td>{{ r.rater_name || 'مستخدم' }}</td>
                <td>{{ r.rating }}/5</td>
                <td>{{ r.comment || '—' }}</td>
                <td>{{ formatDate(r.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty">لا توجد تقييمات بعد</p>
      </template>
    </div>

    <div v-if="activeTab === 'send'" class="tab-panel">
      <ComplaintForm @created="onCreated" @cancel="activeTab = 'incoming'" />
    </div>

    <div v-if="active" class="modal-overlay" @click.self="active = null">
      <div class="modal-content">
        <h3>{{ typeLabel(active.type) }} من {{ active.user_name }}</h3>
        <p><strong>التجربة:</strong> {{ active.experiment_name || '—' }}</p>
        <p><strong>التقييم:</strong> {{ active.rating ?? '—' }}</p>
        <p><strong>التاريخ:</strong> {{ formatDate(active.created_at) }}</p>
        <div class="form-group"><strong>المحتوى:</strong></div>
        <p>{{ active.message }}</p>
        <div v-if="active?.type === 'complaint'" class="form-group"><label>حالة المعالجة</label>
          <select v-model="activeStatus" class="form-input">
            <option value="open">مفتوحة</option>
            <option value="resolved">مغلقة</option>
            <option value="dismissed">متجاهلة</option>
          </select>
        </div>
        <p v-else class="empty">لا يمكن تغيير حالة {{ typeLabel(active.type) }}</p>
        <div class="modal-actions">
          <button v-if="active?.type === 'complaint'" @click="updateStatus" class="btn-sm btn-success" :disabled="updating">{{ updating ? '...' : 'حفظ' }}</button>
          <button @click="active = null" class="btn-sm btn-warn">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.detail-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--as-border); margin: 16px 0; }
.detail-tab { background: transparent; border: none; padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--as-text-muted); cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; transition: color 0.12s; }
.detail-tab.active { color: var(--as-accent); border-bottom-color: var(--as-accent); }
.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.stat-card { background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 12px; padding: 12px; text-align: center; }
.stat-value { font-size: 22px; font-weight: 800; display: block; color: var(--as-text); }
.stat-label { font-size: 12px; color: var(--as-text-muted); }
.empty { text-align: center; color: var(--as-text-muted); padding: 24px; }
.st-rate--good { color: var(--success-text); }
.st-rate--mid { color: var(--warning-text); }
.st-rate--bad { color: var(--danger-text); }
.toolbar-btn { padding: 6px 10px; border: 1px solid var(--as-border); border-radius: 8px; background: var(--as-raised); color: var(--as-text); cursor: pointer; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: var(--as-surface); border: 1px solid var(--as-border); padding: 24px; border-radius: 16px; max-width: 440px; width: 90%; }
.form-input { width: 100%; padding: 10px; border: 1px solid var(--as-border); border-radius: 8px; background: var(--as-raised); color: var(--as-text); box-sizing: border-box; }
.modal-actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-sm { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; color: white; }
.btn-success { background: #22c55e; }
.btn-warn { background: #f59e0b; }
</style>
