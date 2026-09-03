import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { useGoToBranch } from '@/composables/useGoToBranch'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useStudentDashboard } from '@/composables/student/useStudentDashboard'
import { fetchHomeCards } from '@/services/home.service'
import { getUnreadChatCounts, markChatRead } from '@/services/chat.service'
import type { HomeCard } from '@/types/physics'

export type StudentSection = 'overview' | 'experiments' | 'reports' | 'classes' | 'quizzes' | 'badges' | 'announcements' | 'approvals' | 'settings'

export function useStudentDashboardPage() {
  const router = useRouter()
  const { t, locale } = useI18n()
  const { goToBranch } = useGoToBranch()
  const auth = useAuthStore()
  const { kpi, reportRows, recentReports, overduePending, classes, classStudentsMap, joinClassByCode, leaveClassById, loading } = useStudentDashboard()

  const savedTab = localStorage.getItem('student-active-tab') as StudentSection | null
  const validTabs: StudentSection[] = ['overview','experiments','reports','classes','quizzes','badges','announcements','approvals','settings']
  const active = ref<StudentSection>(savedTab && validTabs.includes(savedTab) ? savedTab : 'overview')
  watch(active, (v) => { localStorage.setItem('student-active-tab', v) })
  const sidebarCollapsed = ref(false)
  const cards = ref<HomeCard[]>([])
  const chatClassId = ref<string | null>(null)
  const chatClassName = ref('')
  const unreadChatCounts = ref<Record<string, number>>({})

  const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')
  const currentDate = ref(new Date())
  const totalUnreadChats = computed(() => Object.values(unreadChatCounts.value).reduce((s, n) => s + n, 0))
  let dateInterval: ReturnType<typeof setInterval> | null = null

  const translatedCards = computed(() => cards.value.map(card => ({
    ...card,
    title: t(`dashboard.${card.id}Title`),
    desc: t(`dashboard.${card.id}Desc`),
    stats: t(`dashboard.${card.id}Stats`),
  })))

  const groups = computed(() => [
    {
      id: 'main',
      title: t('shared.navHome'),
      icon: '🏠',
      items: [
        { id: 'overview', icon: '📊', label: t('shared.navOverview') },
        { id: 'experiments', icon: '🔬', label: t('shared.navExperiments') },
      ],
    },
    {
      id: 'work',
      title: t('shared.navWork'),
      icon: '📚',
      items: [
        { id: 'reports', icon: '📋', label: t('shared.navMyReports'), badge: kpi.value.pendingCount > 0 ? kpi.value.pendingCount : undefined },
        { id: 'classes', icon: '🏫', label: t('shared.navMyClasses'), dot: totalUnreadChats.value > 0 },
        { id: 'quizzes', icon: '📝', label: t('shared.navQuizzes') },
        { id: 'badges', icon: '🏅', label: t('shared.navBadges') },
      ],
    },
    {
      id: 'comm',
      title: t('shared.navComm'),
      icon: '💬',
      items: [
        { id: 'announcements', icon: '📢', label: t('shared.navAnnouncements') },
        { id: 'approvals', icon: '✋', label: t('shared.navObjections') },
        { id: 'settings', icon: '👤', label: t('shared.navSettings') },
      ],
    },
  ])

  const activeLabel = computed(() => {
    for (const g of groups.value) {
      const item = g.items.find(i => i.id === active.value)
      if (item) return item.label
    }
    return ''
  })

  function openChat(cls: { id: string; name: string }) {
    if (chatClassId.value === cls.id) {
      chatClassId.value = null
      chatClassName.value = ''
      loadUnreadCounts()
    } else {
      chatClassId.value = cls.id
      chatClassName.value = cls.name
      markChatRead(cls.id).then(() => {
        unreadChatCounts.value = { ...unreadChatCounts.value, [cls.id]: 0 }
      }).catch(() => {})
    }
  }

  function closeChat() {
    chatClassId.value = null
    chatClassName.value = ''
    loadUnreadCounts()
  }

  async function loadUnreadCounts() {
    try {
      const res = await getUnreadChatCounts()
      if (res.success) unreadChatCounts.value = res.counts
    } catch { /* ignore */ }
  }

  function openReport(id: number) {
    router.push(`/report/${id}`)
  }

  async function loadCards() {
    try { cards.value = await fetchHomeCards() } catch { /* ignore */ }
  }

  onMounted(async () => {
    if (!auth.isStudent && !auth.isGuest) { router.push('/'); return }
    if (!auth.isGuest) { await auth.fetchMe() }
    await loadCards()
    await Promise.all([loadUnreadCounts()])
    dateInterval = setInterval(() => { currentDate.value = new Date() }, 60000)
  })

  onUnmounted(() => {
    if (dateInterval) clearInterval(dateInterval)
  })

  return {
    router, t, locale, goToBranch, auth, kpi, reportRows, recentReports, overduePending,
    classes, classStudentsMap, joinClassByCode, leaveClassById, loading, active,
    sidebarCollapsed, groups, translatedCards, chatClassId, chatClassName, unreadChatCounts,
    dateLocaleStr, currentDate, activeLabel, openChat, closeChat, openReport,
  }
}
