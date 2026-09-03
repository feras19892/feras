import { ref } from 'vue'
import * as teacherApi from '@/services/core/teacher.api'
import { useToast } from '@/composables/useToast'

export function useStudentActions(props: { classId: string | null; studentId: number | null }, reload: () => Promise<void>, emit: (e: 'updated') => void) {
  const toast = useToast()
  const actionLoading = ref(false)
  const gradeForm = ref({ reportId: 0, grade: 0, feedback: '' })
  const penaltyForm = ref({ type: 'late', reason: '', points: -5 })
  const warnMessage = ref('')
  const rewardBadgeId = ref(0)
  const rewardNote = ref('')
  const ratingValue = ref(5)
  const ratingComment = ref('')

  async function submitGrade() {
    if (!gradeForm.value.reportId || !props.studentId) return
    const g = Number(gradeForm.value.grade)
    if (!Number.isFinite(g) || g < 0 || g > 100) { toast.error('الدرجة يجب أن تكون بين 0 و 100'); return }
    actionLoading.value = true
    try {
      const res = await teacherApi.gradeStudentReport(gradeForm.value.reportId, { grade: g, feedback: gradeForm.value.feedback })
      if (res.success) { toast.success('تم حفظ التقييم'); await reload(); emit('updated') }
      else toast.error('فشل التقييم')
    } catch { toast.error('فشل التقييم') } finally { actionLoading.value = false }
  }

  async function submitPenalty() {
    if (!props.studentId || !props.classId || !penaltyForm.value.reason.trim()) return
    actionLoading.value = true
    try {
      const res = await teacherApi.createPenalty({ student_id: props.studentId, class_id: props.classId, type: penaltyForm.value.type, reason: penaltyForm.value.reason, points: penaltyForm.value.points })
      if (res.success) { toast.success('تم تسجيل العقوبة'); penaltyForm.value = { type: 'late', reason: '', points: -5 }; await reload(); emit('updated') }
      else toast.error(res.message || 'فشل تسجيل العقوبة')
    } catch { toast.error('فشل تسجيل العقوبة') } finally { actionLoading.value = false }
  }

  async function submitFreeze() {
    if (!props.studentId || !props.classId) return
    actionLoading.value = true
    try {
      const res = await teacherApi.freezeStudent(props.classId, props.studentId)
      if (res.success) { toast.success(res.message || (res.frozen ? 'تم تجميد الطالب' : 'تم إلغاء التجميد')); await reload(); emit('updated') }
      else toast.error(res.message || 'فشل التجميد')
    } catch { toast.error('فشل التجميد') } finally { actionLoading.value = false }
  }

  async function submitWarn() {
    if (!warnMessage.value.trim() || !props.studentId) return
    actionLoading.value = true
    try {
      const res = await teacherApi.createPenalty({ student_id: props.studentId, class_id: props.classId || '', type: 'warning', reason: warnMessage.value, points: 0 })
      if (res.success) { toast.success('تم إرسال التنبيه'); warnMessage.value = '' }
      else toast.error('فشل الإرسال')
    } catch { toast.error('فشل الإرسال') } finally { actionLoading.value = false }
  }

  async function submitReward() {
    if (!rewardBadgeId.value || !props.studentId) return
    actionLoading.value = true
    try {
      const res = await teacherApi.awardBadge({ student_id: props.studentId, badge_id: rewardBadgeId.value, note: rewardNote.value || undefined })
      if (res.success) { toast.success('تم منح الوسام'); rewardBadgeId.value = 0; rewardNote.value = ''; await reload(); emit('updated') }
      else toast.error(res.message || 'فشل منح الوسام')
    } catch { toast.error('فشل منح الوسام') } finally { actionLoading.value = false }
  }

  async function submitRating() {
    if (!props.studentId) return
    actionLoading.value = true
    try {
      const res = await teacherApi.createRating({ target_type: 'student', target_id: props.studentId, rating: ratingValue.value, comment: ratingComment.value || undefined })
      if (res.success) { toast.success('تم حفظ التقييم'); ratingValue.value = 5; ratingComment.value = '' }
      else toast.error('فشل التقييم')
    } catch { toast.error('فشل التقييم') } finally { actionLoading.value = false }
  }

  async function submitRemove() {
    if (!props.classId || !props.studentId) return
    actionLoading.value = true
    try {
      const res = await teacherApi.removeStudentFromClass(props.classId, props.studentId)
      if (res.success) { toast.success('تمت إزالة الطالب'); emit('updated') }
      else toast.error(res.message || 'فشل الإزالة')
    } catch { toast.error('فشل الإزالة') } finally { actionLoading.value = false }
  }

  return { actionLoading, gradeForm, penaltyForm, warnMessage, rewardBadgeId, rewardNote, ratingValue, ratingComment, submitGrade, submitPenalty, submitFreeze, submitWarn, submitReward, submitRating, submitRemove }
}
