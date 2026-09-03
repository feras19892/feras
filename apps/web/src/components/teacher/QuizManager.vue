<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { getMyQuizzes, publishQuiz, closeQuiz, deleteQuiz, type Quiz } from '@/services/quiz.service'
import { getMyClasses } from '@/services/class.service'
import type { ClassItem } from '@/services/class.service'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ create: []; edit: [id: number]; results: [] }>()

const toast = useToast()
const { confirmDialog } = useConfirmDialog()

const quizzes = ref<Quiz[]>([])
const classes = ref<ClassItem[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const filterClass = ref('')
const filterStatus = ref('')
const sortBy = ref<'date' | 'title' | 'avg' | 'participants'>('date')

function exportCSV() {
  const rows = filteredQuizzes.value
  if (!rows.length) { toast.error('لا توجد بيانات للتصدير'); return }
  const headers = ['العنوان', 'النوع', 'الفصل', 'الحالة', 'الأسئلة', 'المشاركين', 'متوسط الدرجة', 'المدة (دقيقة)', 'الوزن', 'تاريخ الإنشاء']
  const lines = [headers.join(',')]
  for (const q of rows) {
    const vals = [
      `"${q.title}"`,
      typeLabel(q.quiz_type),
      q.class_name || '—',
      statusLabel(q.status),
      String(q.question_count ?? 0),
      String(q.participant_count ?? 0),
      q.avg_score !== null && q.avg_score !== undefined ? String(q.avg_score) : '—',
      String(q.time_limit_minutes),
      String(q.weight),
      formatDate(q.created_at),
    ]
    lines.push(vals.join(','))
  }
  const csv = '\uFEFF' + lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `quizzes-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('تم تصدير النتائج')
}

const summaryStats = computed(() => {
  const total = quizzes.value.length
  const drafts = quizzes.value.filter(q => q.status === 'draft').length
  const published = quizzes.value.filter(q => q.status === 'published').length
  const closed = quizzes.value.filter(q => q.status === 'closed').length
  return { total, drafts, published, closed }
})

const filteredQuizzes = computed(() => {
  let list = [...quizzes.value]
  if (filterClass.value) list = list.filter(q => q.class_id === filterClass.value)
  if (filterStatus.value) list = list.filter(q => q.status === filterStatus.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(quiz => quiz.title.toLowerCase().includes(q))
  }
  if (sortBy.value === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'ar'))
  else if (sortBy.value === 'avg') list.sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))
  else if (sortBy.value === 'participants') list.sort((a, b) => (b.participant_count ?? 0) - (a.participant_count ?? 0))
  else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return list
})

function performanceLevel(q: Quiz): 'excellent' | 'good' | 'average' | 'weak' | 'none' {
  const avg = q.avg_score
  if (avg === null || avg === undefined) return 'none'
  if (avg >= 85) return 'excellent'
  if (avg >= 70) return 'good'
  if (avg >= 50) return 'average'
  return 'weak'
}

function statusLabel(s: string): string {
  if (s === 'draft') return 'مسودة'
  if (s === 'published') return 'منشور'
  if (s === 'closed') return 'منتهي'
  return s
}

function typeLabel(t: string): string {
  if (t === 'midterm') return 'فصلي'
  if (t === 'final') return 'نهائي'
  return 'اختبار قصير'
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [qRes, cRes] = await Promise.allSettled([getMyQuizzes(), getMyClasses()])
    if (qRes.status === 'fulfilled' && qRes.value.success) quizzes.value = qRes.value.quizzes
    if (cRes.status === 'fulfilled' && cRes.value.success) classes.value = cRes.value.classes
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'فشل التحميل'
  }
  loading.value = false
}

async function publish(id: number) {
  try { await publishQuiz(id); toast.success('تم نشر الامتحان'); await load() }
  catch { toast.error('فشل النشر') }
}

async function reopen(id: number) {
  try { await publishQuiz(id); toast.success('تمت إعادة نشر الامتحان'); await load() }
  catch { toast.error('فشل إعادة النشر') }
}

async function close(id: number) {
  try { await closeQuiz(id); toast.success('تم إغلاق الامتحان'); await load() }
  catch { toast.error('فشل الإغلاق') }
}

async function remove(id: number) {
  const ok = await confirmDialog({ message: 'هل أنت متأكد من حذف هذا الامتحان؟', variant: 'danger' })
  if (!ok) return
  try { await deleteQuiz(id); toast.success('تم الحذف'); await load() }
  catch { toast.error('فشل الحذف') }
}

function viewResults() { emit('results') }

onMounted(load)
</script>

<template>
  <div class="quiz-manager">
    <div class="qm-header">
      <h3>📝 الامتحانات</h3>
      <div class="qm-header-actions">
        <button class="btn-results" @click="exportCSV">📥 تصدير CSV</button>
        <button class="btn-results" @click="viewResults">📊 النتائج</button>
        <button class="btn-create" @click="emit('create')">＋ امتحان جديد</button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="qm-summary" v-if="!loading && quizzes.length > 0">
      <div class="qm-summary-card"><span class="qm-summary-val">{{ summaryStats.total }}</span><span class="qm-summary-lbl">إجمالي</span></div>
      <div class="qm-summary-card draft"><span class="qm-summary-val">{{ summaryStats.drafts }}</span><span class="qm-summary-lbl">مسودة</span></div>
      <div class="qm-summary-card published"><span class="qm-summary-val">{{ summaryStats.published }}</span><span class="qm-summary-lbl">منشور</span></div>
      <div class="qm-summary-card closed"><span class="qm-summary-val">{{ summaryStats.closed }}</span><span class="qm-summary-lbl">منتهي</span></div>
    </div>

    <div v-if="loading" class="qm-loading">جاري التحميل...</div>
    <div v-else-if="error" class="qm-error">❌ {{ error }}</div>
    <div v-else-if="filteredQuizzes.length === 0" class="qm-empty">لا توجد امتحانات</div>

    <template v-else>
      <div class="qm-filters">
        <input v-model="searchQuery" class="qm-search" placeholder="🔍 بحث بالعنوان..." />
        <select v-model="filterClass" class="qm-filter-select">
          <option value="">كل الفصول</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="filterStatus" class="qm-filter-select">
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="closed">منتهي</option>
        </select>
        <select v-model="sortBy" class="qm-filter-select">
          <option value="date">الأحدث</option>
          <option value="title">العنوان</option>
          <option value="avg">متوسط الدرجات</option>
          <option value="participants">عدد المشاركين</option>
        </select>
      </div>

      <div class="qm-grid">
        <div v-for="q in filteredQuizzes" :key="q.id" class="qm-card" :class="performanceLevel(q)">
          <div class="qm-card-header">
            <h4>{{ q.title }}</h4>
            <span class="qm-status-badge" :class="q.status">{{ statusLabel(q.status) }}</span>
          </div>
          <div class="qm-card-type">
            <span class="qm-type-badge">{{ typeLabel(q.quiz_type) }}</span>
            <span v-if="q.class_name" class="qm-class-name">📚 {{ q.class_name }}</span>
          </div>
          <p v-if="q.description" class="qm-desc">{{ q.description }}</p>
          <div class="qm-card-stats">
            <div class="qm-stat"><span class="qm-stat-val">{{ q.question_count ?? 0 }}</span><span class="qm-stat-lbl">أسئلة</span></div>
            <div class="qm-stat"><span class="qm-stat-val">{{ q.participant_count ?? 0 }}</span><span class="qm-stat-lbl">مشارك</span></div>
            <div class="qm-stat"><span class="qm-stat-val">{{ q.avg_score !== null && q.avg_score !== undefined ? q.avg_score + '%' : '—' }}</span><span class="qm-stat-lbl">المتوسط</span></div>
            <div class="qm-stat"><span class="qm-stat-val">{{ q.time_limit_minutes }}</span><span class="qm-stat-lbl">دقيقة</span></div>
          </div>
          <div class="qm-card-meta">
            <span>📅 {{ formatDate(q.created_at) }}</span>
            <span>⚖️ وزن: {{ q.weight }}%</span>
          </div>
          <div class="qm-card-actions">
            <button v-if="q.status === 'draft'" class="qm-btn edit" @click="emit('edit', q.id)">✏️ تعديل</button>
            <button v-if="q.status === 'draft'" class="qm-btn publish" @click="publish(q.id)">📤 نشر</button>
            <button v-if="q.status === 'published'" class="qm-btn close" @click="close(q.id)">🔒 إغلاق</button>
            <button v-if="q.status === 'closed'" class="qm-btn publish" @click="reopen(q.id)">🔄 إعادة نشر</button>
            <button class="qm-btn delete" @click="remove(q.id)">🗑️</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped src="./quiz-manager.css"></style>
