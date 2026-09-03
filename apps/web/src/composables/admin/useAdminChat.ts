import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'
import {
  getChatStats,
  getChatMessages,
  getFlaggedChatMessages,
  deleteChatMessage,
  unflagChatMessage,
  toggleChat,
  type ChatMessage,
  type ChatStats,
} from '@/services/core/admin.api'

export function useAdminChat() {
  const toast = useToast()
  const { t, locale } = useI18n()

  const enabled = ref(true)
  const toggling = ref(false)
  const loading = ref(true)
  const messages = ref<ChatMessage[]>([])
  const flagged = ref<ChatMessage[]>([])
  const stats = ref<ChatStats>({ total: 0, flagged: 0, chatEnabled: true, byClass: [] })
  const activeTab = ref<'all' | 'flagged'>('all')
  const searchQuery = ref('')
  const selectedClass = ref('')
  const page = ref(1)
  const limit = ref(10)

  const dateLocale = computed(() =>
    locale.value === 'ar' ? 'ar-SY' : locale.value === 'es' ? 'es-ES' : 'en-US'
  )

  function roleLabel(role: string) {
    const map: Record<string, string> = {
      student: t('shared.roleStudent'),
      teacher: t('shared.roleTeacher'),
      school: t('shared.roleSchool'),
      admin: t('shared.roleAdmin'),
    }
    return map[role] || role
  }

  function formatDate(d: string) {
    try {
      return new Date(d).toLocaleString(dateLocale.value, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return d
    }
  }

  const allClassOptions = computed(() =>
    stats.value.byClass.map((c) => ({ id: c.id, name: c.name }))
  )

  const baseMessages = computed(() =>
    activeTab.value === 'flagged' ? flagged.value : messages.value
  )

  const filteredMessages = computed(() => {
    let list = baseMessages.value
    if (selectedClass.value) {
      list = list.filter((m) => m.class_id === selectedClass.value)
    }
    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.user_name.toLowerCase().includes(q) ||
          (m.class_name || '').toLowerCase().includes(q) ||
          m.user_role.toLowerCase().includes(q)
      )
    }
    return list
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredMessages.value.length / limit.value)))

  const paginatedMessages = computed(() => {
    const start = (page.value - 1) * limit.value
    return filteredMessages.value.slice(start, start + limit.value)
  })

  function setTab(tab: 'all' | 'flagged') {
    activeTab.value = tab
    page.value = 1
    searchQuery.value = ''
    selectedClass.value = ''
  }

  async function load() {
    loading.value = true
    try {
      const [statsRes, msgsRes, flaggedRes] = await Promise.all([
        getChatStats(),
        getChatMessages(),
        getFlaggedChatMessages(),
      ])
      if (statsRes.success) {
        stats.value = statsRes.stats
        enabled.value = statsRes.stats.chatEnabled
      }
      if (msgsRes.success) messages.value = msgsRes.messages
      if (flaggedRes.success) flagged.value = flaggedRes.messages
    } catch (e: any) {
      toast.error(e.message || t('common.error'))
    } finally {
      loading.value = false
    }
  }

  async function toggle() {
    toggling.value = true
    try {
      const res = await toggleChat(!enabled.value)
      if (res.success) {
        enabled.value = res.enabled
        toast.success(enabled.value ? t('common.chatEnabledSuccess') : t('common.chatDisabledSuccess'))
      }
    } catch (e: any) {
      toast.error(e.message || t('common.error'))
    } finally {
      toggling.value = false
    }
  }

  async function removeMessage(id: number) {
    if (!confirm(t('common.confirmDeleteMessage'))) return
    try {
      const res = await deleteChatMessage(id)
      if (res.success) {
        messages.value = messages.value.filter((m) => m.id !== id)
        flagged.value = flagged.value.filter((m) => m.id !== id)
        toast.success(t('common.deleted'))
      } else {
        toast.error(t('common.deleteFailed'))
      }
    } catch (e: any) {
      toast.error(e.message || t('common.error'))
    }
  }

  async function unflagMsg(msg: ChatMessage) {
    try {
      const res = await unflagChatMessage(msg.id)
      if (res.success) {
        msg.is_flagged = 0
        msg.flagged_reason = null
        flagged.value = flagged.value.filter((m) => m.id !== msg.id)
        const inMessages = messages.value.find((m) => m.id === msg.id)
        if (inMessages) {
          inMessages.is_flagged = 0
          inMessages.flagged_reason = null
        }
        toast.success(t('common.unflagged'))
      } else {
        toast.error(t('common.unflagFailed'))
      }
    } catch (e: any) {
      toast.error(e.message || t('common.error'))
    }
  }

  let pollTimer: ReturnType<typeof setInterval> | null = null

  function startPolling() {
    if (pollTimer) return
    pollTimer = setInterval(load, 15000)
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }

  onMounted(() => { load(); startPolling() })
  onUnmounted(stopPolling)

  return {
    t,
    enabled,
    toggling,
    loading,
    stats,
    activeTab,
    searchQuery,
    selectedClass,
    allClassOptions,
    page,
    limit,
    totalPages,
    paginatedMessages,
    roleLabel,
    formatDate,
    setTab,
    toggle,
    removeMessage,
    unflagMsg,
    load,
  }
}
