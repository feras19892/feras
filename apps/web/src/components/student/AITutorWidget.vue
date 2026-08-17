<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAITutor } from '../../composables/useAITutor';

const { t } = useI18n();
const bodyRef = ref<HTMLElement | null>(null);

const {
  MAX_CHARS, open, messages, input, loading, error, connected, copiedId,
  isGuest, charCount, charCountClass, suggestions,
  send, stopGeneration, toggle, clear, copyMsg,
} = useAITutor();

async function scrollToBottom() {
  await nextTick();
  if (bodyRef.value) {
    bodyRef.value.scrollTo({ top: bodyRef.value.scrollHeight, behavior: 'smooth' });
  }
}

watch([messages, loading], () => scrollToBottom());

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}
</script>

<template>
  <div>
    <button class="ai-fab" @click="toggle" :title="t('ai.tutorTitle')">
      <span class="ai-fab-icon">🤖</span>
    </button>

    <Transition name="ai-panel">
      <div v-if="open" class="ai-panel">
        <div class="ai-header">
          <div class="ai-header-info">
            <span class="ai-header-icon">🤖</span>
            <div>
              <h3>{{ t('ai.tutorTitle') }}</h3>
              <span :class="['ai-status', { offline: !connected }]">{{ loading ? '...' : connected ? t('ai.tutorOnline') : '⚠️ ' + t('ai.tutorError') }}</span>
            </div>
          </div>
          <div class="ai-header-actions">
            <button v-if="messages.length > 1" class="ai-clear" @click="clear" :title="t('common.clear')">🗑️</button>
            <button class="ai-close" @click="open = false">✕</button>
          </div>
        </div>

        <div v-if="isGuest" class="ai-guest-block">
          ⚠️ {{ t('ai.tutorError') }}
        </div>

        <template v-else>
        <div ref="bodyRef" class="ai-body">
          <div v-for="(m, i) in messages" :key="i" :class="['ai-msg', m.role]">
            <div class="ai-msg-bubble">{{ m.content }}</div>
            <button
              v-if="m.role === 'assistant' && m.content"
              class="ai-copy-btn"
              @click="copyMsg(i, m.content)"
              :title="copiedId === i ? '✓' : '📋'"
            >{{ copiedId === i ? '✓' : '📋' }}</button>
          </div>
          <div v-if="loading" class="ai-msg assistant">
            <div class="ai-msg-bubble ai-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
          <div v-if="error" class="ai-error">⚠️ {{ error }}</div>
        </div>

        <div v-if="messages.length <= 1 && !loading" class="ai-suggestions">
          <button v-for="s in suggestions" :key="s" class="ai-suggestion" @click="send(s)">{{ s }}</button>
        </div>

        <div class="ai-input-row">
          <textarea
            v-model="input"
            :placeholder="t('ai.tutorPlaceholder')"
            @keydown="onKeydown"
            :disabled="loading"
            rows="1"
            :maxlength="MAX_CHARS"
            class="ai-textarea"
          />
          <span :class="['ai-char-count', charCountClass]">{{ charCount }}/{{ MAX_CHARS }}</span>
          <button v-if="loading" class="ai-stop" @click="stopGeneration" title="⏹️">
            <span>⏹️</span>
          </button>
          <button v-else class="ai-send" @click="send()" :disabled="loading || !input.trim() || charCount > MAX_CHARS">
            <span>➤</span>
          </button>
        </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ai-fab {
  position: fixed;
  bottom: 1.5rem;
  inset-inline-end: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
  z-index: 250;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(79, 70, 229, 0.5); }

.ai-panel {
  position: fixed;
  bottom: 5rem;
  inset-inline-end: 1.5rem;
  width: 380px;
  max-width: calc(100vw - 2rem);
  height: 520px;
  max-height: calc(100vh - 7rem);
  background: rgba(15, 23, 42, 0.97);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  z-index: 260;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  background: rgba(99, 102, 241, 0.08);
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
}
.ai-header-info { display: flex; align-items: center; gap: 0.6rem; }
.ai-header-icon { font-size: 1.4rem; }
.ai-header h3 { margin: 0; font-size: 0.9rem; color: #f1f5f9; }
.ai-status { font-size: 0.68rem; color: #4ade80; }
.ai-status.offline { color: #f87171; }
.ai-header-actions { display: flex; gap: 0.3rem; }
.ai-clear, .ai-close {
  width: 28px; height: 28px; border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.08); background: transparent;
  color: #64748b; cursor: pointer; font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center;
}
.ai-clear:hover { color: #f87171; border-color: rgba(239,68,68,0.3); }
.ai-close:hover { color: #f87171; border-color: rgba(239,68,68,0.3); }

.ai-body { flex: 1; overflow-y: auto; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.6rem; }
.ai-body::-webkit-scrollbar { width: 4px; }
.ai-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

.ai-msg { display: flex; }
.ai-msg.user { justify-content: flex-end; }
.ai-msg.assistant { justify-content: flex-start; }
.ai-msg-bubble {
  max-width: 85%;
  padding: 0.55rem 0.8rem;
  border-radius: 0.7rem;
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.ai-msg.user .ai-msg-bubble {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border-bottom-right-radius: 0.2rem;
}
.ai-msg.assistant .ai-msg-bubble {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom-left-radius: 0.2rem;
}
.ai-copy-btn {
  width: 22px; height: 22px; border-radius: 0.3rem; border: none;
  background: transparent; color: #64748b; cursor: pointer; font-size: 0.7rem;
  display: flex; align-items: center; justify-content: center; opacity: 0;
  transition: opacity 0.15s; flex-shrink: 0; align-self: flex-end;
}
.ai-msg.assistant:hover .ai-copy-btn { opacity: 1; }
.ai-guest-block {
  padding: 1.5rem 1rem; text-align: center; color: #fbbf24; font-size: 0.85rem;
  background: rgba(245,158,11,0.08); margin: 0.8rem; border-radius: 0.5rem;
}

.ai-typing { display: flex; gap: 0.2rem; align-items: center; }
.ai-typing span {
  width: 6px; height: 6px; border-radius: 50%; background: #6366f1;
  animation: typing 1.2s infinite;
}
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }

.ai-error { font-size: 0.75rem; color: #f87171; padding: 0.4rem 0.6rem; background: rgba(239,68,68,0.08); border-radius: 0.4rem; }

.ai-suggestions { padding: 0.5rem 0.8rem; display: flex; flex-wrap: wrap; gap: 0.4rem; border-top: 1px solid rgba(255,255,255,0.04); }
.ai-suggestion {
  padding: 0.3rem 0.7rem; border-radius: 999px;
  border: 1px solid rgba(99,102,241,0.2); background: rgba(99,102,241,0.06);
  color: #a5b4fc; font-size: 0.72rem; cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.ai-suggestion:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); }

.ai-input-row { display: flex; gap: 0.4rem; padding: 0.7rem; border-top: 1px solid rgba(255,255,255,0.06); align-items: flex-end; position: relative; }
.ai-textarea {
  flex: 1; padding: 0.5rem 0.7rem; border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);
  color: #e2e8f0; font-family: inherit; font-size: 0.82rem; resize: none;
  max-height: 100px; overflow-y: auto; line-height: 1.4;
}
.ai-textarea:focus { outline: none; border-color: rgba(99,102,241,0.4); }
.ai-char-count { font-size: 0.6rem; color: #475569; position: absolute; bottom: 0.3rem; inset-inline-start: 0.8rem; }
.ai-char-count.warn { color: #fbbf24; }
.ai-send, .ai-stop {
  width: 38px; height: 38px; border-radius: 0.5rem; border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff;
  cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s; flex-shrink: 0;
}
.ai-stop { background: linear-gradient(135deg, #ef4444, #dc2626); }
.ai-send:disabled, .ai-stop:disabled { opacity: 0.4; cursor: not-allowed; }

.ai-panel-enter-active, .ai-panel-leave-active { transition: all 0.25s ease; }
.ai-panel-enter-from, .ai-panel-leave-to { opacity: 0; transform: translateY(20px); }

@media (max-width: 600px) {
  .ai-panel { width: calc(100vw - 2rem); height: calc(100vh - 7rem); }
}
</style>
