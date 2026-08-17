<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useConfirmDialog } from '../../composables/useConfirmDialog';
import { getAdminAllMessages, getAdminChatStats, deleteClassMessage } from '../../services/chat.service';
import type { ClassMessage } from '../../services/chat.service';

const { t, locale } = useI18n();
const messages = ref<(ClassMessage & { class_name?: string })[]>([]);
const stats = ref<{ total: number; flagged: number; byClass: { id: string; name: string; msg_count: number; flagged_count: number }[] } | null>(null);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const filterFlagged = ref(false);
const selectedClass = ref<string>('');

const filteredMessages = computed(() => {
  let list = messages.value;
  if (filterFlagged.value) {
    list = list.filter(m => m.is_flagged);
  }
  if (selectedClass.value) {
    list = list.filter(m => m.class_id === selectedClass.value);
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(m =>
      m.user_name?.toLowerCase().includes(q) ||
      m.content?.toLowerCase().includes(q) ||
      m.class_name?.toLowerCase().includes(q)
    );
  }
  return list;
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [msgRes, statsRes] = await Promise.all([getAdminAllMessages(), getAdminChatStats()]);
    if (msgRes.success) messages.value = msgRes.messages;
    if (statsRes.success) stats.value = statsRes.stats;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
  } finally {
    loading.value = false;
  }
}

const { confirmDialog } = useConfirmDialog();

async function removeMessage(id: number) {
  const ok = await confirmDialog({ message: t('admin.confirmDeleteMessage'), variant: 'danger' });
  if (!ok) return;
  try {
    await deleteClassMessage(id);
    messages.value = messages.value.filter(m => m.id !== id);
  } catch { /* ignore */ }
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(locale.value === 'ar' ? 'ar-SA' : locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

let refreshTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  load();
  refreshTimer = setInterval(() => load(), 15000);
});
onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer); });
</script>

<template>
  <div class="section">
    <h3>{{ t('admin.chatMonitor') }}</h3>
    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <template v-else>
      <!-- Stats -->
      <div v-if="stats" class="chat-stats">
        <div class="stat-pill">
          <span class="stat-num">{{ stats.total }}</span>
          <span class="stat-text">{{ t('admin.totalMessages') }}</span>
        </div>
        <div class="stat-pill flagged">
          <span class="stat-num">{{ stats.flagged }}</span>
          <span class="stat-text">{{ t('admin.flaggedMessages') }}</span>
        </div>
      </div>

      <!-- By Class -->
      <div v-if="stats?.byClass?.length" class="by-class">
        <h4>{{ t('admin.messagesByClass') }}</h4>
        <div class="class-bars">
          <div v-for="c in stats.byClass" :key="c.id" class="class-bar" :class="{ active: selectedClass === c.id }" @click="selectedClass = selectedClass === c.id ? '' : c.id">
            <span class="class-name">{{ c.name }}</span>
            <div class="class-track">
              <div class="class-fill" :style="{ width: Math.min((c.msg_count / Math.max(stats.byClass[0].msg_count, 1)) * 100, 100) + '%' }"></div>
            </div>
            <span class="class-count">{{ c.msg_count }}</span>
            <span v-if="c.flagged_count" class="class-flagged">⚠️ {{ c.flagged_count }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-row">
        <input v-model="searchQuery" class="search-input" :placeholder="t('admin.searchMessages')" />
        <label class="filter-label">
          <input type="checkbox" v-model="filterFlagged" />
          {{ t('admin.flaggedOnly') }}
        </label>
        <button v-if="selectedClass || filterFlagged" class="btn-clear" @click="selectedClass = ''; filterFlagged = false">✕</button>
      </div>

      <!-- Messages -->
      <div class="messages-list">
        <div v-for="m in filteredMessages" :key="m.id" class="msg-item" :class="{ flagged: m.is_flagged }">
          <div class="msg-header">
            <span class="msg-user">{{ m.user_name }}</span>
            <span class="msg-role" :class="m.user_role">{{ m.user_role }}</span>
            <span class="msg-class">{{ m.class_name || m.class_id }}</span>
            <span class="msg-time">{{ formatTime(m.created_at) }}</span>
          </div>
          <div class="msg-content">{{ m.content }}</div>
          <div v-if="m.is_flagged" class="msg-flagged-reason">⚠️ {{ m.flagged_reason }}</div>
          <button class="btn-delete-msg" @click="removeMessage(m.id)">🗑️</button>
        </div>
        <p v-if="filteredMessages.length === 0" class="empty">{{ t('admin.noMessages') }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section h3 { font-size: 1.1rem; margin: 0 0 1rem; }
.loading { text-align: center; padding: 2rem; color: #64748b; }
.error { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }

.chat-stats { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.stat-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.5rem; }
.stat-pill.flagged { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.08); }
.stat-num { font-size: 1.3rem; font-weight: 800; color: #67e8f9; }
.stat-pill.flagged .stat-num { color: #f87171; }
.stat-text { font-size: 0.8rem; color: #94a3b8; }

.by-class { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; margin-bottom: 1rem; }
.by-class h4 { margin: 0 0 0.75rem; font-size: 0.9rem; }
.class-bars { display: flex; flex-direction: column; gap: 0.4rem; }
.class-bar { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.3rem 0.4rem; border-radius: 0.35rem; transition: background 0.15s; }
.class-bar:hover { background: rgba(255,255,255,0.03); }
.class-bar.active { background: rgba(99,102,241,0.1); }
.class-name { width: 120px; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.class-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.class-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #67e8f9); border-radius: 3px; transition: width 0.4s; }
.class-count { width: 30px; text-align: center; font-size: 0.82rem; font-weight: 700; }
.class-flagged { font-size: 0.72rem; color: #f87171; }

.filter-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.search-input { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; min-width: 220px; }
.filter-label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.82rem; color: #94a3b8; cursor: pointer; }
.filter-label input { cursor: pointer; }
.btn-clear { width: 28px; height: 28px; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-size: 0.8rem; }

.messages-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 500px; overflow-y: auto; }
.msg-item { position: relative; padding: 0.6rem 0.8rem; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 0.5rem; transition: border-color 0.15s; }
.msg-item.flagged { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); }
.msg-item:hover { border-color: rgba(255,255,255,0.1); }
.msg-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
.msg-user { font-weight: 700; font-size: 0.85rem; color: #e2e8f0; }
.msg-role { font-size: 0.68rem; padding: 0.1rem 0.35rem; border-radius: 0.2rem; }
.msg-role.student { background: rgba(52,211,153,0.2); color: #34d399; }
.msg-role.teacher { background: rgba(96,165,250,0.2); color: #60a5fa; }
.msg-role.admin { background: rgba(248,113,113,0.2); color: #f87171; }
.msg-class { font-size: 0.72rem; color: #64748b; }
.msg-time { font-size: 0.7rem; color: #64748b; margin-inline-start: auto; }
.msg-content { font-size: 0.85rem; color: #cbd5e1; word-break: break-word; }
.msg-flagged-reason { margin-top: 0.3rem; font-size: 0.75rem; color: #f87171; }
.btn-delete-msg { position: absolute; top: 0.5rem; inset-inline-end: 0.5rem; background: none; border: none; cursor: pointer; font-size: 0.9rem; opacity: 0.4; transition: opacity 0.15s; padding: 0.2rem; }
.btn-delete-msg:hover { opacity: 1; }
.empty { text-align: center; color: #64748b; padding: 2rem; }
</style>
