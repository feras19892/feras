<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, onMounted, onUnmounted, onActivated, onDeactivated, nextTick, computed, watch } from 'vue'

import { useAuthStore } from '../../modules/auth/stores/auth'
import { usePreferencesStore } from '../../stores/preferences.store'
import { eventBus } from '../../composables/shared/useEventBus'
import { getClassMessages, sendClassMessage, deleteClassMessage, markChatRead } from '../../services/chat.service'
import type { ClassMessage } from '../../services/chat.service'
import { fetchJson } from '../../services/http'





const props = defineProps({
  classId: { type: String, required: true },
  className: { type: String, required: true },
})

const auth = useAuthStore()
const prefs = usePreferencesStore()

const messages = ref<ClassMessage[]>([])
const input = ref('')
const loading = ref(false)
const sending = ref(false)
const warning = ref('')
const chatBody = ref<HTMLElement | null>(null)
const isFrozen = ref(false)
const searchQuery = ref('')
const lastMsgCount = ref(0)
let pollTimer: ReturnType<typeof setInterval> | null = null
let isInitialLoad = true
let mountedOnce = false

const sortedMessages = computed(() =>
  [...messages.value].sort((a, b) => a.created_at.localeCompare(b.created_at))
)

const filteredMessages = computed(() => {
  if (!searchQuery.value.trim()) return sortedMessages.value
  const q = searchQuery.value.trim().toLowerCase()
  return sortedMessages.value.filter(m =>
    m.content.toLowerCase().includes(q) || m.user_name.toLowerCase().includes(q)
  )
})

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'اليوم'
  if (d.toDateString() === yesterday.toDateString()) return 'أمس'
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value)
}

function shouldShowDateSeparator(idx: number): boolean {
  const msgs = filteredMessages.value
  if (idx === 0) return true
  const prev = msgs[idx - 1]
  const curr = msgs[idx]
  return new Date(prev.created_at).toDateString() !== new Date(curr.created_at).toDateString()
}

function playNotificationSound() {
  if (!prefs.prefs.soundNotifications) return
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch { /* ignore */ }
}

async function load() {
  if (isInitialLoad) loading.value = true
  try {
    const res = await getClassMessages(props.classId)
    if (res.success) {
      if (isInitialLoad) {
        messages.value = res.messages
        isInitialLoad = false
        lastMsgCount.value = res.messages.length
        scrollToBottom()
      } else {
        const existingIds = new Set(messages.value.map(m => m.id))
        const newMsgs = res.messages.filter(m => !existingIds.has(m.id))
        if (newMsgs.length > 0) {
          const hasNewFromOthers = newMsgs.some(m => m.user_id !== auth.user?.id)
          messages.value.push(...newMsgs)
          scrollToBottom()
          if (hasNewFromOthers) playNotificationSound()
        }
      }
      markChatRead(props.classId).then(() => {
        eventBus.emit('chat:unread-updated')
      }).catch(() => {})
    }
  } catch (err) {
    console.error('chat load failed:', err)
  }
  loading.value = false
}

async function send() {
  if (isFrozen.value) return
  const text = input.value.trim()
  if (!text || sending.value) return
  sending.value = true
  warning.value = ''
  try {
    const res = await sendClassMessage(props.classId, text)
    if (res.success) {
      if (res.message && typeof res.message === 'object') {
        messages.value.push(res.message)
        input.value = ''
        scrollToBottom()
      }
      if (res.flagged) {
        warning.value = res.warning || t('dashboard.dash.chatFlagged')
        setTimeout(() => { warning.value = '' }, 5000)
      }
      await load().catch(() => {})
    } else if (typeof res.message === 'string') {
      if (res.message.includes('مُجمّد')) {
        isFrozen.value = true
      }
      warning.value = res.message
      setTimeout(() => { warning.value = '' }, 5000)
    }
  } catch (err) {
    console.error('send failed:', err)
  }
  sending.value = false
}

async function remove(msgId: number) {
  try {
    const res = await deleteClassMessage(msgId)
    if (res.success) {
      messages.value = messages.value.filter(m => m.id !== msgId)
    }
  } catch (err) {
    console.error('delete failed:', err)
  }
}

function canDelete(msg: ClassMessage): boolean {
  if (!auth.user) return false
  return msg.user_id === auth.user.id || auth.isAdmin
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString(locale.value === 'ar' ? 'ar-SA' : locale.value, { hour: '2-digit', minute: '2-digit' })
}

function roleIcon(role: string): string {
  if (role === 'teacher') return '👨‍🏫'
  if (role === 'admin') return '🛡️'
  return '🎓'
}

async function checkFrozen() {
  try {
    const res = await fetchJson<{ is_frozen: number }>(`/api/classes/${props.classId}/frozen-status`)
    isFrozen.value = !!res.is_frozen
  } catch { if (import.meta.env.DEV) console.warn('Failed to check frozen status') }
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

function startPolling() {
  if (!prefs.prefs.autoRefresh || pollTimer) return
  pollTimer = setInterval(() => {
    if (!document.hidden) load() // لا تجلب والتبويب مخفي — تُستأنف بالدورة التالية عند العودة
  }, 3000)
}

onMounted(() => {
  mountedOnce = true
  load()
  checkFrozen()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
  isInitialLoad = true
})

// DashboardLayout يلف التابات بـ KeepAlive — أوقف الاستقصاء عند مغادرة التاب واستأنفه عند العودة
onActivated(() => {
  if (mountedOnce) { mountedOnce = false; return } // أول فتح: onMounted حمّل للتو
  load()
  startPolling()
})

onDeactivated(() => {
  stopPolling()
})

watch(() => props.classId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    messages.value = []
    isInitialLoad = true
    isFrozen.value = false
    load()
    checkFrozen()
  }
})
</script>

<template>
  <div class="chat-panel">
    <div class="chat-header">
      <span class="chat-icon">💬</span>
      <span class="chat-title">{{ t('dashboard.dash.classChat') }} — {{ props.className }}</span>
    </div>

    <div v-if="warning" class="chat-warning">
      ⚠️ {{ warning }}
    </div>

    <div v-if="isFrozen" class="chat-frozen-banner">
      🧊 {{ t('dashboard.dash.classFrozen') }}
    </div>

    <div ref="chatBody" class="chat-body">
      <div v-if="loading && messages.length === 0" class="chat-loading">...</div>
      <div v-else-if="filteredMessages.length === 0" class="chat-empty">
        {{ searchQuery ? 'لا نتائج' : t('dashboard.dash.noMessagesYet') }}
      </div>
      <template v-for="(msg, idx) in filteredMessages" :key="msg.id">
        <div v-if="shouldShowDateSeparator(idx)" class="date-separator">
          <span>{{ dateLabel(msg.created_at) }}</span>
        </div>
        <div :class="['msg-row', { mine: auth.user?.id === msg.user_id }]">
          <span class="msg-avatar">{{ roleIcon(msg.user_role) }}</span>
          <div class="msg-content">
            <div class="msg-meta">
              <span class="msg-name">{{ msg.user_name }}</span>
              <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
            </div>
            <div :class="['msg-text', { flagged: msg.is_flagged }]">
              {{ msg.is_flagged ? '🚫 ' + t('dashboard.dash.messageBlocked') : msg.content }}
            </div>
          </div>
          <button v-if="canDelete(msg)" class="msg-delete" @click="remove(msg.id)">✕</button>
        </div>
      </template>
    </div>

    <div class="chat-search-bar">
      <input v-model="searchQuery" type="text" placeholder="🔍 بحث في الرسائل..." />
    </div>

    <div class="chat-input-bar">
      <input
        v-model="input"
        type="text"
        :placeholder="isFrozen ? t('dashboard.dash.classFrozen') : t('dashboard.dash.typeMessage')"
        maxlength="500"
        @keyup.enter="send"
        :disabled="sending || isFrozen"
      />
      <button class="send-btn" :disabled="!input.trim() || sending || isFrozen" @click="send">
        {{ sending ? '...' : '➤' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-panel { display: flex; flex-direction: column; height: 100%; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; overflow: hidden; }
.chat-header { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(99,102,241,0.06); }
.chat-icon { font-size: 1rem; }
.chat-title { font-size: 0.82rem; font-weight: 700; color: #c7d2fe; }
.chat-warning { padding: 0.5rem 0.8rem; background: rgba(239,68,68,0.1); border-bottom: 1px solid rgba(239,68,68,0.15); color: #f87171; font-size: 0.75rem; font-weight: 600; }
.chat-frozen-banner { padding: 0.5rem 0.8rem; background: rgba(99,102,241,0.1); border-bottom: 1px solid rgba(99,102,241,0.15); color: #a5b4fc; font-size: 0.75rem; font-weight: 600; text-align: center; }
.chat-body { flex: 1; overflow-y: auto; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; min-height: 0; }
.chat-loading { text-align: center; color: #64748b; padding: 1rem; }
.chat-empty { text-align: center; color: #64748b; padding: 1.5rem 1rem; font-size: 0.8rem; }
.msg-row { display: flex; gap: 0.4rem; align-items: flex-start; padding: 0.4rem 0.5rem; border-radius: 0.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); transition: all 0.12s; }
.msg-row.mine { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.1); }
.msg-row:hover .msg-delete { opacity: 1; }
.msg-avatar { font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.msg-content { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.msg-meta { display: flex; align-items: center; gap: 0.4rem; }
.msg-name { font-size: 0.72rem; font-weight: 700; color: #a5b4fc; }
.msg-time { font-size: 0.62rem; color: #475569; }
.msg-text { font-size: 0.8rem; color: #e2e8f0; word-break: break-word; line-height: 1.4; }
.msg-text.flagged { color: #f87171; font-style: italic; font-size: 0.75rem; }
.msg-delete { background: none; border: none; color: #64748b; cursor: pointer; font-size: 0.7rem; opacity: 0; transition: all 0.15s; padding: 0.1rem 0.2rem; }
.msg-delete:hover { color: #f87171; }
.chat-search-bar { padding: 0.3rem 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); }
.chat-search-bar input { width: 100%; padding: 0.35rem 0.6rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.25); color: #e2e8f0; font-size: 0.75rem; font-family: inherit; }
.chat-search-bar input::placeholder { color: #475569; }
.chat-search-bar input:focus { outline: none; border-color: rgba(99,102,241,0.3); }
.date-separator { display: flex; align-items: center; justify-content: center; margin: 0.5rem 0; }
.date-separator span { font-size: 0.65rem; color: #64748b; background: rgba(255,255,255,0.04); padding: 0.2rem 0.8rem; border-radius: 999px; }
.chat-input-bar { display: flex; gap: 0.4rem; padding: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); }
.chat-input-bar input { flex: 1; padding: 0.5rem 0.7rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.25); color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.chat-input-bar input::placeholder { color: #475569; }
.chat-input-bar input:focus { outline: none; border-color: rgba(99,102,241,0.3); }
.send-btn { padding: 0.5rem 0.8rem; border: none; border-radius: 0.5rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.9rem; cursor: pointer; transition: all 0.15s; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
</style>
