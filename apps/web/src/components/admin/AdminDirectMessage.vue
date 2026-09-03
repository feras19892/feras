<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction, locale } = useI18n();
import { ref, onMounted, nextTick, watch } from 'vue';
import { getConversation, sendDirectMessage, type DirectMessage } from '../../services/admin.service';




const props = defineProps<{
  userId: number;
  userName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const messages = ref<DirectMessage[]>([]);
const newMsg = ref('');
const loading = ref(false);
const sending = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

async function loadMessages() {
  loading.value = true;
  try {
    const res = await getConversation(props.userId);
    if (res.success) messages.value = res.messages;
    await nextTick();
    scrollToBottom();
  } catch (err) {
    if (import.meta.env.DEV) console.error('Failed to load messages:', err);
  } finally {
    loading.value = false;
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function onSend() {
  if (!newMsg.value.trim()) return;
  sending.value = true;
  try {
    const res = await sendDirectMessage(props.userId, newMsg.value.trim());
    if (res.success && res.message) {
      messages.value.push(res.message);
      newMsg.value = '';
      await nextTick();
      scrollToBottom();
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('Failed to send message:', err);
  } finally {
    sending.value = false;
  }
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const loc = locale.value === 'ar' ? 'ar-SA' : locale.value;
  if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth()) {
    return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(loc) + ' ' + d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
}

watch(() => props.userId, () => {
  if (props.userId) loadMessages();
});

onMounted(() => {
  if (props.userId) loadMessages();
});
</script>

<template>
  <div class="dm-overlay" @click.self="emit('close')">
    <div class="dm-modal">
      <div class="dm-header">
        <div class="dm-user-info">
          <span class="dm-avatar">💬</span>
          <div>
            <h3>{{ userName }}</h3>
            <span class="dm-user-id">#{{ userId }}</span>
          </div>
        </div>
        <button class="dm-close" @click="emit('close')">✕</button>
      </div>

      <div ref="messagesContainer" class="dm-messages">
        <div v-if="loading" class="dm-loading">...</div>
        <div v-else-if="messages.length === 0" class="dm-empty">
          لا توجد رسائل بعد. ابدأ المحادثة بإرسال رسالة.
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="dm-msg"
          :class="{ sent: msg.sender_id !== userId, received: msg.sender_id === userId }"
        >
          <div class="dm-bubble" :class="{ 'dm-sent': msg.sender_id !== userId, 'dm-received': msg.sender_id === userId }">
            <p class="dm-original">{{ msg.content }}</p>
            <p v-if="msg.translated_content && msg.translated_content !== msg.content" class="dm-translation">
              <span class="dm-translation-label">ترجمة:</span> {{ msg.translated_content }}
            </p>
            <span class="dm-time">{{ formatTime(msg.created_at) }}</span>
          </div>
        </div>
      </div>

      <div class="dm-input-area">
        <input
          v-model="newMsg"
          placeholder="اكتب رسالة..."
          @keyup.enter="onSend"
          :disabled="sending"
        />
        <button class="dm-send-btn" :disabled="sending || !newMsg.trim()" @click="onSend">
          {{ sending ? '...' : '➤' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.dm-modal {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 500px;
  height: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.dm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.dm-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dm-avatar {
  font-size: 1.5rem;
}

.dm-user-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #e2e8f0;
}

.dm-user-id {
  font-size: 0.72rem;
  color: #64748b;
}

.dm-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.3rem;
}

.dm-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f87171;
}

.dm-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.dm-loading {
  text-align: center;
  color: #64748b;
  padding: 2rem;
}

.dm-empty {
  text-align: center;
  color: #64748b;
  padding: 2rem;
  font-size: 0.85rem;
}

.dm-msg {
  display: flex;
}

.dm-msg.received {
  justify-content: flex-start;
}

.dm-msg.sent {
  justify-content: flex-end;
}

.dm-bubble {
  max-width: 75%;
  padding: 0.6rem 0.9rem;
  border-radius: 0.75rem;
  word-break: break-word;
}

.dm-bubble p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.dm-original {
  margin: 0;
}

.dm-translation {
  margin: 0.35rem 0 0;
  padding: 0.4rem 0.5rem;
  border-radius: 0.4rem;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.82rem;
  color: #e2e8f0;
  border-right: 3px solid rgba(99, 102, 241, 0.5);
}

.dm-translation-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #a5b4fc;
  margin-inline-end: 0.3rem;
}

.dm-received {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border-bottom-left-radius: 0.25rem;
}

.dm-sent {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border-bottom-right-radius: 0.25rem;
}

.dm-time {
  display: block;
  font-size: 0.65rem;
  opacity: 0.6;
  margin-top: 0.25rem;
}

.dm-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dm-input-area input {
  flex: 1;
  padding: 0.6rem 0.9rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.dm-input-area input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.4);
}

.dm-send-btn {
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
}

.dm-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
