<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, onMounted, computed } from 'vue';

import { useToast } from '@/composables/useToast';
import { getAdminNotifications, getAdminNotificationStats, deleteAdminNotification } from '@/services/admin-notifications.service';
import type { AdminNotificationLog } from '@/services/admin-notifications.service';






const toast = useToast();
const logs = ref<AdminNotificationLog[]>([]);
const stats = ref<Record<number, { read_count: number; total: number }>>({});
const loading = ref(false);
const page = ref(1);
const total = ref(0);

const dateLocale = computed(() => {
  if (locale.value === 'ar') return 'ar-SY';
  if (locale.value === 'es') return 'es-ES';
  return 'en-US';
});

async function load() {
  loading.value = true;
  try {
    const res = await getAdminNotifications(page.value);
    if (res.success) {
      logs.value = res.logs;
      total.value = res.total;
      for (const log of res.logs) {
        const stat = await getAdminNotificationStats(log.id);
        if (stat.success) stats.value[log.id] = stat.stats;
      }
    }
  } catch (e: any) {
    toast.error(e?.message || t('admin.notifications.loadError'));
  } finally {
    loading.value = false;
  }
}

async function remove(id: number) {
  if (!confirm(t('admin.notifications.deleteConfirm'))) return;
  try {
    const res = await deleteAdminNotification(id);
    if (res.success) {
      toast.success(t('admin.notifications.deleted'));
      await load();
    } else {
      toast.error(res.message || t('admin.notifications.deleteFailed'));
    }
  } catch (e: any) {
    toast.error(e?.message || t('admin.notifications.deleteFailed'));
  }
}

function targetLabel(log: AdminNotificationLog) {
  const keyMap: Record<string, string> = {
    all: t('admin.notifications.targetAllLabel'),
    role: t('admin.notifications.targetRoleLabel'),
    school: t('admin.notifications.targetSchoolLabel'),
    class: t('admin.notifications.targetClassLabel'),
    user: t('admin.notifications.targetUserLabel'),
  };
  const base = keyMap[log.target_type] || log.target_type;
  if (log.target_value) return `${base}: ${log.target_value}`;
  return base;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleString(dateLocale.value, { hour12: false }) } catch { return d }
}

onMounted(load);
</script>

<template>
  <div class="history">
    <div class="history__header">
      <h3 class="history__title">{{ t('admin.notifications.historyTitle') }}</h3>
      <button class="reload-btn" :disabled="loading" @click="load">{{ loading ? t('admin.notifications.sending') : t('admin.notifications.reload') }}</button>
    </div>

    <div v-if="loading && !logs.length" class="loading">{{ t('admin.notifications.loading') }}</div>
    <div v-else-if="!logs.length" class="empty">{{ t('admin.notifications.empty') }}</div>
    <div v-else class="list">
      <div v-for="log in logs" :key="log.id" class="log-row">
        <div class="log-main">
          <div class="log-title">{{ log.title }}</div>
          <div class="log-meta">
            <span class="target">{{ targetLabel(log) }}</span>
            <span class="priority" :class="log.priority">{{ log.priority }}</span>
            <span class="date">{{ formatDate(log.created_at) }}</span>
          </div>
        </div>
        <div class="log-stats">
          <span class="stat">{{ t('admin.notifications.recipients', { count: log.recipient_count }) }}</span>
          <span v-if="stats[log.id]" class="stat">{{ t('admin.notifications.read', { count: stats[log.id].read_count }) }}</span>
        </div>
        <button class="del-btn" @click="remove(log.id)">{{ t('admin.notifications.delete') }}</button>
      </div>
    </div>

    <div class="pagination" v-if="total > 20">
      <button :disabled="page <= 1" @click="page--; load()">{{ t('admin.notifications.previous') }}</button>
      <span>{{ t('admin.notifications.page', { page }) }}</span>
      <button :disabled="logs.length < 20" @click="page++; load()">{{ t('admin.notifications.next') }}</button>
    </div>
  </div>
</template>

<style scoped>
.history { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1rem; }
.history__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.history__title { margin: 0; color: #f1f5f9; font-size: 1.05rem; }
.reload-btn { padding: 0.4rem 0.8rem; border: none; border-radius: 8px; background: #6366f1; color: #fff; cursor: pointer; font-size: 0.85rem; }
.loading, .empty { color: #64748b; text-align: center; padding: 1rem; }
.list { display: flex; flex-direction: column; gap: 0.6rem; }
.log-row { display: flex; align-items: center; gap: 0.7rem; padding: 0.7rem; background: rgba(255,255,255,0.03); border-radius: 0.6rem; }
.log-main { flex: 1; }
.log-title { color: #f1f5f9; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.3rem; }
.log-meta { display: flex; gap: 0.5rem; font-size: 0.75rem; color: #94a3b8; }
.target { background: rgba(99,102,241,0.15); color: #a5b4fc; padding: 0.1rem 0.4rem; border-radius: 0.3rem; }
.priority { background: rgba(100,116,139,0.2); color: #94a3b8; padding: 0.1rem 0.4rem; border-radius: 0.3rem; }
.priority.immediate { background: rgba(239,68,68,0.15); color: #fca5a5; }
.priority.low { background: rgba(59,130,246,0.15); color: #93c5fd; }
.log-stats { display: flex; gap: 0.6rem; color: #cbd5e1; font-size: 0.8rem; white-space: nowrap; }
.del-btn { background: transparent; border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 6px; padding: 0.2rem 0.5rem; cursor: pointer; font-size: 0.75rem; }
.pagination { display: flex; justify-content: center; gap: 0.6rem; margin-top: 1rem; color: #94a3b8; }
.pagination button { background: #1e293b; border: none; color: #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }
</style>
