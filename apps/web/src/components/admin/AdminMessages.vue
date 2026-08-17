<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { getConversations, type ConversationItem } from '../../services/admin.service';
import AdminDirectMessage from './AdminDirectMessage.vue';

const { t, locale } = useI18n();

const conversations = ref<ConversationItem[]>([]);
const loading = ref(true);
const error = ref('');
const selectedUserId = ref<number | null>(null);
const selectedUserName = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getConversations();
    if (res.success) conversations.value = res.conversations;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('adminExtras.msgLoadFailed');
  } finally {
    loading.value = false;
  }
}

function openConversation(c: ConversationItem) {
  selectedUserId.value = c.other_id;
  selectedUserName.value = c.other_name;
}

function closeConversation() {
  selectedUserId.value = null;
  selectedUserName.value = '';
  load();
}

function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return t('shared.justNow');
  if (diffMin < 60) return t('shared.minutesAgo').replace('{n}', String(diffMin));
  if (diffHr < 24) return t('shared.hoursAgo').replace('{n}', String(diffHr));
  if (diffDay < 7) return t('shared.daysAgo').replace('{n}', String(diffDay));
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value);
}

let refreshTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  load();
  refreshTimer = setInterval(() => load(), 30000);
});
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer); });
</script>

<template>
  <div class="messages-page">
    <AdminDirectMessage v-if="selectedUserId" :user-id="selectedUserId" :user-name="selectedUserName" @close="closeConversation" />
    <template v-else>
      <div class="section-header">
        <h3>{{ t('adminExtras.msgDirectMessages') }}</h3>
        <button class="btn-primary" @click="load">{{ t('admin.refresh') }}</button>
      </div>

      <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
      <div v-else-if="error" class="error-box">❌ {{ error }}</div>
      <div v-else-if="conversations.length === 0" class="empty">{{ t('adminExtras.msgNoConversations') }}</div>
      <div v-else class="conv-list">
        <div
          v-for="c in conversations"
          :key="c.other_id"
          class="conv-item"
          @click="openConversation(c)"
        >
          <span class="conv-icon">{{ c.other_role === 'teacher' ? '👨‍🏫' : c.other_role === 'student' ? '🎓' : '🛡️' }}</span>
          <div class="conv-info">
            <span class="conv-name">{{ c.other_name }}</span>
            <span class="conv-last">{{ c.last_message?.slice(0, 60) }}{{ (c.last_message?.length ?? 0) > 60 ? '...' : '' }}</span>
          </div>
          <div class="conv-meta">
            <span v-if="c.unread_count > 0" class="conv-unread">{{ c.unread_count }}</span>
            <span class="conv-time">{{ formatTime(c.last_at) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.messages-page { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.btn-primary { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.85rem; }
.loading { text-align: center; color: #64748b; padding: 2rem; }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }
.empty { text-align: center; color: #64748b; padding: 2rem; }
.conv-list { display: flex; flex-direction: column; gap: 0.5rem; }
.conv-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; cursor: pointer; transition: all 0.2s; }
.conv-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.3); }
.conv-icon { font-size: 1.5rem; flex-shrink: 0; }
.conv-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.conv-name { font-size: 0.88rem; font-weight: 600; color: #e2e8f0; }
.conv-last { font-size: 0.75rem; color: #64748b; }
.conv-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; flex-shrink: 0; }
.conv-unread { min-width: 20px; height: 20px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 0.68rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
.conv-time { font-size: 0.7rem; color: #475569; }
</style>
