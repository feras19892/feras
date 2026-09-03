<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Quiz, QuizSubmission } from '@/services/quiz.service'

const props = defineProps<{
  quiz: Quiz
  submissions: QuizSubmission[]
  loading: boolean
}>()

const emit = defineEmits<{ back: [] }>()

const subsSortBy = ref<'name' | 'score' | 'date'>('score')
const subsSortDir = ref<'asc' | 'desc'>('desc')

const sortedSubmissions = computed(() => {
  const list = [...props.submissions]
  if (subsSortBy.value === 'name') list.sort((a, b) => a.student_name.localeCompare(b.student_name, 'ar'))
  else if (subsSortBy.value === 'score') list.sort((a, b) => subsSortDir.value === 'desc' ? b.score - a.score : a.score - b.score)
  else if (subsSortBy.value === 'date') list.sort((a, b) => {
    const da = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
    const db = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
    return subsSortDir.value === 'desc' ? db - da : da - db
  })
  return list
})

const subsStats = computed(() => {
  if (props.submissions.length === 0) return null
  const maxScore = props.quiz.max_score
  const scores = props.submissions.map(s => s.score)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const avgPercent = Math.round((avg / maxScore) * 100)
  const highest = Math.max(...scores)
  const lowest = Math.min(...scores)
  const passed = scores.filter(s => s >= maxScore * 0.5).length
  const failed = props.submissions.length - passed
  return { avg: Math.round(avg), avgPercent, highest, lowest, passed, failed, total: props.submissions.length }
})

const gradeDistribution = computed(() => {
  if (!props.submissions.length) return []
  const max = props.quiz.max_score
  const ranges = [
    { label: 'ممتاز (85-100%)', min: 0.85, color: '#16a34a' },
    { label: 'جيد (70-84%)', min: 0.70, color: '#3b82f6' },
    { label: 'متوسط (50-69%)', min: 0.50, color: '#f59e0b' },
    { label: 'ضعيف (<50%)', min: 0, color: '#dc2626' },
  ]
  return ranges.map(r => {
    const count = props.submissions.filter(s => {
      const p = s.score / max
      const upper = ranges.find(rr => rr.min > r.min)?.min ?? 1.01
      return p >= r.min && p < upper
    }).length
    return { ...r, count, percent: Math.round((count / props.submissions.length) * 100) }
  })
})

function studentPercent(s: QuizSubmission): number {
  return Math.round((s.score / props.quiz.max_score) * 100)
}

function studentGrade(s: QuizSubmission): { label: string; color: string } {
  const p = studentPercent(s)
  if (p >= 85) return { label: 'ممتاز', color: '#16a34a' }
  if (p >= 70) return { label: 'جيد', color: '#3b82f6' }
  if (p >= 50) return { label: 'متوسط', color: '#f59e0b' }
  return { label: 'ضعيف', color: '#dc2626' }
}

function toggleSort(col: 'name' | 'score' | 'date') {
  if (subsSortBy.value === col) {
    subsSortDir.value = subsSortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    subsSortBy.value = col
    subsSortDir.value = col === 'name' ? 'asc' : 'desc'
  }
}

function exportCSV() {
  if (props.submissions.length === 0) return
  const max = props.quiz.max_score
  const rows = [['#', 'اسم الطالب', 'الدرجة', 'الحد الأقصى', 'النسبة', 'التقدير', 'تاريخ الإرسال']]
  sortedSubmissions.value.forEach((s, i) => {
    const p = Math.round((s.score / max) * 100)
    rows.push([String(i + 1), s.student_name, String(s.score), String(max), p + '%', studentGrade(s).label, s.submitted_at ? new Date(s.submitted_at).toLocaleString('ar') : '—'])
  })
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `results_${props.quiz.title}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="qr-detail">
    <div class="qr-header">
      <h3>نتائج: {{ quiz.title }}</h3>
      <div class="qr-header-actions">
        <button class="btn-export" @click="exportCSV">📥 تصدير CSV</button>
        <button class="btn-back" @click="emit('back')">← رجوع</button>
      </div>
    </div>

    <div v-if="loading" class="qr-loading">جاري التحميل...</div>
    <div v-else-if="submissions.length === 0" class="qr-empty">لا توجد إجابات بعد</div>

    <template v-else>
      <div class="qr-summary-grid" v-if="subsStats">
        <div class="qr-summary-card avg"><span class="qr-summary-icon">📊</span><span class="qr-summary-val">{{ subsStats.avgPercent }}%</span><span class="qr-summary-lbl">المتوسط</span></div>
        <div class="qr-summary-card high"><span class="qr-summary-icon">🏆</span><span class="qr-summary-val">{{ subsStats.highest }}</span><span class="qr-summary-lbl">الأعلى</span></div>
        <div class="qr-summary-card low"><span class="qr-summary-icon">📉</span><span class="qr-summary-val">{{ subsStats.lowest }}</span><span class="qr-summary-lbl">الأدنى</span></div>
        <div class="qr-summary-card passed"><span class="qr-summary-icon">✅</span><span class="qr-summary-val">{{ subsStats.passed }}</span><span class="qr-summary-lbl">ناجح</span></div>
        <div class="qr-summary-card failed"><span class="qr-summary-icon">❌</span><span class="qr-summary-val">{{ subsStats.failed }}</span><span class="qr-summary-lbl">راسب</span></div>
        <div class="qr-summary-card total"><span class="qr-summary-icon">👥</span><span class="qr-summary-val">{{ subsStats.total }}</span><span class="qr-summary-lbl">مشارك</span></div>
      </div>

      <div class="qr-grade-dist" v-if="gradeDistribution.length">
        <h4>توزيع التقديرات</h4>
        <div v-for="g in gradeDistribution" :key="g.label" class="qr-dist-row">
          <span class="qr-dist-label" :style="{ color: g.color }">{{ g.label }}</span>
          <div class="qr-dist-bar-wrap"><div class="qr-dist-bar" :style="{ width: g.percent + '%', background: g.color }"></div></div>
          <span class="qr-dist-count">{{ g.count }} ({{ g.percent }}%)</span>
        </div>
      </div>

      <div class="qr-table-wrap">
        <div class="qr-table-header">
          <h4>إجابات الطلاب</h4>
          <div class="qr-sort">
            <span>ترتيب:</span>
            <button :class="{ active: subsSortBy === 'score' }" @click="toggleSort('score')">الدرجة {{ subsSortBy === 'score' ? (subsSortDir === 'desc' ? '↓' : '↑') : '' }}</button>
            <button :class="{ active: subsSortBy === 'name' }" @click="toggleSort('name')">الاسم {{ subsSortBy === 'name' ? (subsSortDir === 'desc' ? '↓' : '↑') : '' }}</button>
            <button :class="{ active: subsSortBy === 'date' }" @click="toggleSort('date')">التاريخ {{ subsSortBy === 'date' ? (subsSortDir === 'desc' ? '↓' : '↑') : '' }}</button>
          </div>
        </div>
        <table class="qr-table">
          <thead><tr><th>#</th><th>الطالب</th><th>الدرجة</th><th>النسبة</th><th>التقدير</th><th>التقدم</th><th>تاريخ الإرسال</th></tr></thead>
          <tbody>
            <tr v-for="(s, i) in sortedSubmissions" :key="s.id">
              <td class="qr-rank">{{ i + 1 }}</td>
              <td class="qr-student-name">{{ s.student_name }}</td>
              <td><strong>{{ s.score }}</strong> / {{ quiz.max_score }}</td>
              <td>{{ studentPercent(s) }}%</td>
              <td><span class="qr-grade-pill" :style="{ background: studentGrade(s).color + '20', color: studentGrade(s).color }">{{ studentGrade(s).label }}</span></td>
              <td><div class="qr-row-progress"><div class="qr-row-progress-fill" :style="{ width: studentPercent(s) + '%', background: studentGrade(s).color }"></div></div></td>
              <td class="qr-date-cell">{{ s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('ar', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped src="./quiz-results.css"></style>
