import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useTeacherStore } from '@/stores/teacher.store'
import { eventBus } from '@/composables/shared/useEventBus'
import { getUnreadCount } from '@/services/notification.service'
import { getUnreadChatCounts } from '@/services/chat.service'
import { getComplaintStats, type ComplaintStats } from '@/services/complaint.service'
import { getRatingStats, type RatingStats } from '@/services/enhancements.service'
import { getTeacherQuizStats, type QuizStats } from '@/services/quiz.service'
import type { TeacherClass } from '@/services/core/teacher.api'
import type { Report } from '@/services/report.service'

export function useTeacherHome() {
  const store = useTeacherStore()
  const auth = useAuthStore()
  let isMounted = true
  const unreadNotif = ref(0)
  const unreadChat = ref(0)
  const quizStats = ref<QuizStats | null>(null)
  const complaintStats = ref<ComplaintStats | null>(null)
  const ratingStats = ref<RatingStats | null>(null)

  const teacherName = computed(() => auth.user?.name || 'معلم')
  const today = ref(new Date().toLocaleDateString('ar', { weekday: 'long', month: 'long', day: 'numeric' }))

  const totalStudents = computed(() => store.classes.reduce((sum, c) => sum + (c.student_count ?? 0), 0))
  const pendingCount = computed(() => store.reports.filter(r => r.status === 'submitted').length)
  const gradedCount = computed(() => store.reports.filter(r => r.status === 'graded').length)
  const unreadTotal = computed(() => unreadNotif.value + unreadChat.value)
  const avgReportGrade = computed(() => {
    const graded = store.reports.filter(r => r.status === 'graded' && typeof r.grade === 'number')
    if (!graded.length) return 0
    return Math.round(graded.reduce((s, r) => s + (r.grade ?? 0), 0) / graded.length)
  })
  const quizTotal = computed(() => quizStats.value?.totalQuizzes ?? 0)

  const cards = computed(() => [
    { icon: '📚', value: store.totalClasses, totalLabel: 'الإجمالي', label: 'الفصول', color: 'var(--as-accent)', tab: 'my-classes' },
    { icon: '👥', value: totalStudents.value, totalLabel: 'الإجمالي', label: 'الطلاب', color: 'var(--as-success)', tab: 'my-classes' },
    { icon: '📄', value: store.reports.length, totalLabel: 'الإجمالي', label: 'التقارير', color: 'var(--as-info)', tab: 'grading' },
    { icon: '📝', value: pendingCount.value, totalLabel: 'قيد الانتظار', label: 'تقارير معلّقة', color: 'var(--as-warning)', tab: 'grading' },
    { icon: '✅', value: gradedCount.value, totalLabel: 'الإجمالي', label: 'تقارير مصحّحة', color: 'var(--as-success)', tab: 'grading' },
    { icon: '🧮', value: avgReportGrade.value, totalLabel: 'المعدل', label: 'متوسط الدرجات', color: 'var(--as-accent)', tab: 'grading' },
    { icon: '🎯', value: quizTotal.value, totalLabel: 'الإجمالي', label: 'الامتحانات', color: 'var(--as-danger)', tab: 'quizzes' },
    { icon: '🔔', value: unreadTotal.value, totalLabel: 'غير مقروء', label: 'إشعارات ودردشة', color: 'var(--as-info)', tab: 'notifications' },
    { icon: '⭐', value: Math.round((ratingStats.value?.receivedAvg ?? 0) / 5 * 100), totalLabel: 'نسبة', label: 'التقييمات', color: 'var(--as-warning)', tab: 'complaints' },
  ])

  const barColors = ['var(--as-accent)', 'var(--as-success)', 'var(--as-warning)', 'var(--as-danger)', 'var(--as-info)', 'var(--as-accent-hover)']
  const classBarData = computed(() => {
    const max = Math.max(1, ...store.classes.map(c => c.student_count ?? 0))
    return [...store.classes]
      .sort((a, b) => (b.student_count ?? 0) - (a.student_count ?? 0))
      .slice(0, 6)
      .map((c: TeacherClass, i) => ({
        name: c.name,
        count: c.student_count ?? 0,
        percent: Math.round(((c.student_count ?? 0) / max) * 100),
        color: barColors[i % barColors.length],
      }))
  })

  const lineData = computed(() => {
    const counts: Record<string, number> = {}
    for (const r of store.reports) {
      const key = (r.submitted_at || r.created_at || '').slice(0, 10)
      if (key) counts[key] = (counts[key] || 0) + 1
    }
    const days: { label: string; x: number; y: number }[] = []
    const list: { label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('ar', { day: 'numeric' })
      list.push({ label, count: counts[key] || 0 })
    }
    const max = Math.max(1, ...list.map(x => x.count))
    const step = list.length > 1 ? 260 / (list.length - 1) : 0
    list.forEach((d, i) => {
      days.push({ label: d.label, x: 10 + i * step, y: 90 - (d.count / max) * 70 })
    })
    return days
  })

  const linePoints = computed(() => lineData.value.map(p => `${p.x},${p.y}`).join(' '))
  const gridLines = [20, 45, 70]

  const lastReports = computed(() =>
    [...store.reports]
      .filter((r: Report) => r.submitted_at || r.created_at)
      .sort((a, b) => new Date((b.submitted_at || b.created_at || 0)).getTime() - new Date((a.submitted_at || a.created_at || 0)).getTime())
      .slice(0, 4)
      .map(r => ({ id: r.id, student_name: r.student_name || 'طالب', experiment_name: r.experiment_name, status: r.status, grade: r.grade ?? null }))
  )

  const atRiskStudents = computed(() => {
    const studentMap: Record<number, { name: string; total: number; count: number }> = {}
    for (const r of store.reports) {
      if (r.status !== 'graded' || typeof r.grade !== 'number' || !r.student_id) continue
      const name = r.student_name || 'طالب'
      if (!studentMap[r.student_id]) {
        studentMap[r.student_id] = { name, total: 0, count: 0 }
      }
      studentMap[r.student_id].total += r.grade
      studentMap[r.student_id].count++
    }
    return Object.values(studentMap)
      .map(s => ({ name: s.name, avg: Math.round(s.total / s.count) }))
      .filter(s => s.avg < 50)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5)
  })

  function goToTab(tabId: string) { eventBus.emit('teacher:switch-tab', { tabId }) }

  async function load() {
    try {
      await store.refreshAll()
    } catch (e: any) { /* store handles its own error */ }
    if (!isMounted) return
    const [notifRes, chatRes, quizRes, complaintRes, ratingRes] = await Promise.allSettled([
      getUnreadCount(),
      getUnreadChatCounts(),
      getTeacherQuizStats(),
      getComplaintStats(),
      getRatingStats(),
    ])
    if (!isMounted) return
    if (notifRes.status === 'fulfilled' && notifRes.value.success) unreadNotif.value = notifRes.value.count
    if (chatRes.status === 'fulfilled' && chatRes.value.success) unreadChat.value = Object.values(chatRes.value.counts).reduce((a, b) => a + b, 0)
    if (quizRes.status === 'fulfilled' && quizRes.value.success) quizStats.value = quizRes.value.stats
    if (complaintRes.status === 'fulfilled' && complaintRes.value.success) complaintStats.value = complaintRes.value.stats
    if (ratingRes.status === 'fulfilled' && ratingRes.value.success) ratingStats.value = ratingRes.value.stats
  }

  onMounted(() => {
    isMounted = true
    load()
    eventBus.on('report:graded', load)
    eventBus.on('report:submitted', load)
  })

  onUnmounted(() => {
    isMounted = false
    eventBus.off('report:graded', load)
    eventBus.off('report:submitted', load)
  })

  return {
    store, teacherName, today, unreadNotif, unreadChat, quizStats, complaintStats, ratingStats,
    cards, classBarData, lineData, gridLines, linePoints, lastReports, atRiskStudents,
    goToTab, load,
  }
}
