import { ref } from 'vue'
import { getStudentStats } from '../services/report.service'
import { useAuthStore } from '../modules/auth/stores/auth'

export interface LearningProgress {
  totalReports: number
  gradedReports: number
  pendingReports: number
  averageGrade: number
  progressPercent: number
  level: number
  nextLevelAt: number
  streak: number
}

export function useLearningProgress() {
  const auth = useAuthStore()
  const progress = ref<LearningProgress | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function loadProgress() {
    if (!auth.user?.id) return
    loading.value = true
    error.value = ''
    try {
      const res = await getStudentStats(auth.user.id)
      if (res.success) {
        const s = res.stats
        const total = s.total || 0
        const graded = s.graded || 0
        const avg = s.average || 0
        const level = Math.floor(total / 5) + 1
        const nextLevelAt = level * 5
        const progressPercent = total > 0 ? Math.round((graded / total) * 100) : 0
        progress.value = {
          totalReports: total,
          gradedReports: graded,
          pendingReports: s.pending || 0,
          averageGrade: Math.round(avg),
          progressPercent,
          level,
          nextLevelAt,
          streak: 0,
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed'
    } finally {
      loading.value = false
    }
  }

  return { progress, loading, error, loadProgress }
}
