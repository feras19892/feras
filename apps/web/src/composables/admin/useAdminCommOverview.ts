import { ref, onMounted, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { getAnnouncements, type Announcement } from '@/services/announcement.service'
import { getAdminFeedback, type AdminFeedbackItem, type AdminFeedbackStats } from '@/services/admin.service'
import { getAdminChatStats, getAdminFlaggedMessages, type ClassMessage } from '@/services/chat.service'
import { getConversations, getUnreadMessageCount, type ConversationItem } from '@/services/admin.service'

export function useAdminCommOverview() {
  const { t, locale } = useI18n()
  const loading = ref(true)
  const error = ref('')

  const announcements = ref<Announcement[]>([])
  const feedbackList = ref<AdminFeedbackItem[]>([])
  const feedbackStats = ref<AdminFeedbackStats | null>(null)
  const chatStats = ref<{ total: number; flagged: number; byClass: { id: string; name: string; msg_count: number; flagged_count: number }[] } | null>(null)
  const flaggedMessages = ref<ClassMessage[]>([])
  const conversations = ref<ConversationItem[]>([])
  const unreadMessages = ref(0)

  async function loadData() {
    loading.value = true
    error.value = ''
    try {
      const [ann, fb, cs, fm, conv, unread] = await Promise.all([
        getAnnouncements(),
        getAdminFeedback(),
        getAdminChatStats(),
        getAdminFlaggedMessages(),
        getConversations(),
        getUnreadMessageCount(),
      ])
      if (ann.success) announcements.value = ann.announcements
      if (fb.success) { feedbackList.value = fb.feedback; feedbackStats.value = fb.stats }
      if (cs.success) chatStats.value = cs.stats
      if (fm.success) flaggedMessages.value = fm.messages
      if (conv.success) conversations.value = conv.conversations
      if (unread.success) unreadMessages.value = unread.count
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : '') || 'فشل تحميل البيانات'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)

  const pinnedAnnouncements = computed(() => announcements.value.filter(a => a.is_pinned).length)
  const openFeedback = computed(() => feedbackStats.value?.open ?? feedbackList.value.filter(f => f.status === 'open').length)
  const flaggedChatCount = computed(() => chatStats.value?.flagged ?? 0)
  const totalUnread = computed(() => unreadMessages.value)

  const hasAlerts = computed(() => openFeedback.value > 0 || flaggedChatCount.value > 0 || totalUnread.value > 0)

  const recentAnnouncements = computed(() =>
    [...announcements.value]
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 5)
  )

  const openFeedbackItems = computed(() =>
    feedbackList.value.filter(f => f.status === 'open').slice(0, 5)
  )

  const recentFlagged = computed(() => flaggedMessages.value.slice(0, 5))

  const recentConversations = computed(() =>
    [...conversations.value]
      .sort((a, b) => (b.last_at || '').localeCompare(a.last_at || ''))
      .slice(0, 5)
  )

  const commSections = computed(() => [
    { id: 'announcements', icon: '📢', label: t('shared.navAnnouncements') },
    { id: 'feedback', icon: '💬', label: t('shared.navFeedback') },
    { id: 'chat', icon: '🖥️', label: t('shared.navChat') },
    { id: 'messages', icon: '✉️', label: t('shared.navMessages') },
  ])

  function formatTime(dateStr: string) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    if (diffMin < 1) return t('shared.justNow')
    if (diffMin < 60) return t('shared.minutesAgo').replace('{n}', String(diffMin))
    if (diffHr < 24) return t('shared.hoursAgo').replace('{n}', String(diffHr))
    if (diffDay < 7) return t('shared.daysAgo').replace('{n}', String(diffDay))
    return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value)
  }

  function scopeLabel(scope: string) {
    const labels: Record<string, string> = { global: t('shared.scopeGlobal'), school: t('shared.roleSchool'), class: t('shared.navClasses') }
    return labels[scope] || scope
  }

  function feedbackTypeLabel(type: string) {
    const labels: Record<string, string> = { rating: t('shared.feedbackRating'), complaint: t('shared.feedbackComplaint'), suggestion: t('shared.feedbackSuggestion') }
    return labels[type] || type
  }

  return {
    t, locale, loading, error, announcements, feedbackList, feedbackStats, chatStats,
    flaggedMessages, conversations, unreadMessages, pinnedAnnouncements, openFeedback,
    flaggedChatCount, totalUnread, hasAlerts, recentAnnouncements, openFeedbackItems,
    recentFlagged, recentConversations, commSections, formatTime, scopeLabel, feedbackTypeLabel,
  }
}
