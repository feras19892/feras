<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import { useAuthStore } from '../../modules/auth/stores/auth'
import { getClassMessages, sendClassMessage, deleteClassMessage } from '../../services/chat.service'
import type { ClassMessage } from '../../services/chat.service'

const props = defineProps<{
  classId: string
  className: string
}>()

const { t } = useI18n()
const auth = useAuthStore()

const messages = ref<ClassMessage[]>([])
const input = ref('')
const loading = ref(false)
const sending = ref(false)
const warning = ref('')
const chatBody = ref<HTMLElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const sortedMessages = computed(() =>
  [...messages.value].sort((a, b) => a.created_at.localeCompare(b.created_at))
)

async function load() {
  loading.value = true
  try {
    const res = await getClassMessages(props.classId)
    if (res.success) messages.value = res.messages
  } catch (err) {
    console.error('chat load failed:', err)
  }
  loading.value = false
  scrollToBottom()
}

async function send() {
  const text = input.value.trim()
  if (!text || sending.value) return
  sending.value = true
  warning.value = ''
  try {
    const res = await sendClassMessage(props.classId, text)
    if (res.success && res.message) {
      messages.value.unshift(res.message)
      input.value = ''
      if (res.flagged) {
        warning.value = res.warning || t('dashboard.dash.chatFlagged')
        setTimeout(() => { warning.value = '' }, 5000)
      }
      scrollToBottom()
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
  return msg.user_id === auth.user.id || auth.isTeacher || auth.isAdmin
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  })
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}

function roleIcon(role: string): string {
  if (role === 'teacher') return '👨‍🏫'
  if (role === 'admin') return '🛡️'
  return '🎓'
}

onMounted(() => {
  load()
  pollTimer = setInterval(() => load(), 10000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
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

    <div ref="chatBody" class="chat-body">
      <div v-if="loading && messages.length === 0" class="chat-loading">...</div>
      <div v-else-if="sortedMessages.length === 0" class="chat-empty">
        {{ t('dashboard.dash.noMessagesYet') }}
      </div>
      <div v-for="msg in sortedMessages" :key="msg.id" :class="['msg-row', { mine: auth.user?.id === msg.user_id }]">
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
    </div>

    <div class="chat-input-bar">
      <input
        v-model="input"
        type="text"
        :placeholder="t('dashboard.dash.typeMessage')"
        maxlength="500"
        @keyup.enter="send"
        :disabled="sending"
      />
      <button class="send-btn" :disabled="!input.trim() || sending" @click="send">
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
.chat-body { flex: 1; overflow-y: auto; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; min-height: 200px; max-height: 400px; }
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
.chat-input-bar { display: flex; gap: 0.4rem; padding: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06); }
.chat-input-bar input { flex: 1; padding: 0.5rem 0.7rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.25); color: #e2e8f0; font-size: 0.82rem; font-family: inherit; }
.chat-input-bar input::placeholder { color: #475569; }
.chat-input-bar input:focus { outline: none; border-color: rgba(99,102,241,0.3); }
.send-btn { padding: 0.5rem 0.8rem; border: none; border-radius: 0.5rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.9rem; cursor: pointer; transition: all 0.15s; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
</style>
