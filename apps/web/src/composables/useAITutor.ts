import { ref, computed, watch, onUnmounted } from 'vue';
import { ollamaChat, checkOllamaHealth } from '../services/ollama';
import { useI18n } from './useI18n';
import { useAuthStore } from '../modules/auth/stores/auth';

export interface ChatMsg { role: 'user' | 'assistant'; content: string }

const MAX_CHARS = 2000;
const STORAGE_KEY = 'ai_tutor_chat';
const CONTEXT_MSG_COUNT = 6;

function loadChat(): ChatMsg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatMsg[];
  } catch { /* ignore */ }
  return [];
}

function saveChat(msgs: ChatMsg[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
  } catch { /* ignore */ }
}

export function useAITutor() {
  const { t } = useI18n();
  const auth = useAuthStore();

  const open = ref(false);
  const messages = ref<ChatMsg[]>(loadChat());
  const input = ref('');
  const loading = ref(false);
  const error = ref('');
  const connected = ref(true);
  const copiedId = ref<number | null>(null);
  let abortController: AbortController | null = null;

  const isGuest = computed(() => auth.isGuest);
  const charCount = computed(() => input.value.length);
  const charCountClass = computed(() => charCount.value > MAX_CHARS * 0.9 ? 'warn' : '');

  const suggestions = computed(() => {
    const base = [
      'ما هو قانون أوم؟',
      'شرح حساب المقاومة المكافئة',
      'كيف أحسب القوة الدافعة الكهربائية؟',
      'فرق بين التوالي والتوازي',
    ];
    if (auth.user?.name) {
      return [`ساعدني في تجربة قمت بها`, ...base.slice(0, 3)];
    }
    return base;
  });

  async function checkConnection() {
    connected.value = await checkOllamaHealth();
  }

  async function send(text?: string) {
    if (isGuest.value) {
      error.value = t('ai.tutorError');
      return;
    }
    const msg = (text ?? input.value).trim();
    if (!msg || loading.value || msg.length > MAX_CHARS) return;
    input.value = '';
    error.value = '';
    messages.value.push({ role: 'user', content: msg });
    loading.value = true;

    abortController = new AbortController();

    const context = messages.value
      .slice(-CONTEXT_MSG_COUNT)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: 'أنت مساعد تعليمي للفيزياء والكيمياء. أجب بالعربية بشكل مختصر وواضح.' },
        ...context.map(m => ({ role: m.role, content: m.content }) as { role: 'system' | 'user' | 'assistant'; content: string }),
        { role: 'user', content: msg },
      ];
      const reply = await ollamaChat(chatMessages);
      messages.value.push({ role: 'assistant', content: reply });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        messages.value.push({ role: 'assistant', content: '⏹️ (تم الإيقاف)' });
      } else {
        error.value = err instanceof Error ? err.message : t('ai.tutorError');
      }
    } finally {
      loading.value = false;
      abortController = null;
    }
  }

  function stopGeneration() {
    if (abortController) {
      abortController.abort();
      abortController = null;
      loading.value = false;
    }
  }

  function toggle() {
    open.value = !open.value;
    if (open.value) {
      checkConnection();
      if (messages.value.length === 0) {
        messages.value.push({ role: 'assistant', content: t('ai.tutorGreeting') });
      }
    }
  }

  function clear() {
    messages.value = [];
    error.value = '';
    saveChat([]);
  }

  function copyMsg(idx: number, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      copiedId.value = idx;
      setTimeout(() => { copiedId.value = null; }, 2000);
    }).catch(() => { /* ignore */ });
  }

  watch(messages, (v) => saveChat(v), { deep: true });

  onUnmounted(() => {
    stopGeneration();
    saveChat(messages.value);
  });

  return {
    MAX_CHARS,
    open, messages, input, loading, error, connected, copiedId,
    isGuest, charCount, charCountClass, suggestions,
    send, stopGeneration, toggle, clear, copyMsg,
  };
}
