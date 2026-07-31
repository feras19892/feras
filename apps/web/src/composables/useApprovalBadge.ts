import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../modules/auth/stores/auth'
import { getPendingApprovals, getSchoolPendingApprovals } from '../services/approval.service'

export function useApprovalBadge() {
  const auth = useAuthStore()
  const pendingCount = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  async function load() {
    try {
      if (auth.isSchool) {
        const res = await getSchoolPendingApprovals()
        if (res.success) pendingCount.value = res.pending.length
      } else if (auth.isTeacher || auth.isAdmin) {
        const res = await getPendingApprovals()
        if (res.success) pendingCount.value = res.pending.length
      }
    } catch { /* ignore */ }
  }

  onMounted(() => {
    load()
    timer = setInterval(load, 30000)
  })
  onUnmounted(() => { if (timer) clearInterval(timer) })

  return { pendingCount, reload: load }
}
