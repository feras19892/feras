<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { getAdminFeedback, updateFeedbackStatus } from '../../services/admin.service';

interface FeedbackItem {
  id: number;
  type: string;
  user_name: string;
  experiment_name?: string;
  rating?: number | null;
  message: string;
  status: string;
  created_at?: string;
}
interface FeedbackStats {
  total: number;
  open: number;
  resolved: number;
  average: number;
}

const { t } = useI18n();
const feedbackList = ref<FeedbackItem[]>([]);
const stats = ref<FeedbackStats | null>(null);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const filterType = ref<'all'|'complaint'|'rating'|'suggestion'>('all');
const filterStatus = ref<'all'|'open'|'resolved'|'dismissed'>('all');

const filteredFeedback = computed(() => {
  let list = feedbackList.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) list = list.filter(f => (f.user_name || '').toLowerCase().includes(q) || (f.message || '').toLowerCase().includes(q) || (f.experiment_name || '').toLowerCase().includes(q));
  if (filterType.value !== 'all') list = list.filter(f => f.type === filterType.value);
  if (filterStatus.value !== 'all') list = list.filter(f => f.status === filterStatus.value);
  return list;
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAdminFeedback();
    if (res.success) {
      feedbackList.value = res.feedback;
      stats.value = res.stats;
    }
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
  } finally {
    loading.value = false;
  }
}

async function changeStatus(id: number, status: string) {
  const res = await updateFeedbackStatus(id, status);
  if (res.success) load();
}

function typeLabel(type: string) {
  switch (type) {
    case 'rating': return t('admin.feedbackTypeRating');
    case 'complaint': return t('admin.feedbackTypeComplaint');
    case 'suggestion': return t('admin.feedbackTypeSuggestion');
    default: return type;
  }
}

onMounted(load);
</script>

<template>
  <div class="section">
    <div class="section-header">
      <h3>{{ t('admin.feedbackTitle') }}</h3>
      <button class="btn-primary" @click="load">{{ t('admin.refresh') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error-box">❌ {{ error }}</div>
    <template v-else>
      <!-- Search + Filters -->
      <div class="filters-row">
        <input v-model="searchQuery" class="search-input" :placeholder="t('admin.searchPlaceholder')" />
        <select v-model="filterType">
          <option value="all">{{ t('admin.allTypes') }}</option>
          <option value="complaint">{{ t('admin.complaints') }}</option>
          <option value="rating">{{ t('admin.ratings') }}</option>
          <option value="suggestion">{{ t('admin.suggestions') }}</option>
        </select>
        <select v-model="filterStatus">
          <option value="all">{{ t('admin.allStatuses') }}</option>
          <option value="open">{{ t('admin.statusOpen') }}</option>
          <option value="resolved">{{ t('admin.statusResolved') }}</option>
          <option value="dismissed">🚫 {{ t('admin.dismissed') }}</option>
        </select>
      </div>

      <!-- Stats -->
      <div v-if="stats" class="stats-row">
        <div class="mini-card">
          <div class="mini-value">{{ stats.total }}</div>
          <div class="mini-label">{{ t('admin.all') }}</div>
        </div>
        <div class="mini-card">
          <div class="mini-value">{{ stats.open }}</div>
          <div class="mini-label">{{ t('admin.open') }}</div>
        </div>
        <div class="mini-card">
          <div class="mini-value">{{ stats.resolved }}</div>
          <div class="mini-label">{{ t('admin.resolved') }}</div>
        </div>
        <div class="mini-card">
          <div class="mini-value">{{ stats.average }}</div>
          <div class="mini-label">{{ t('admin.avgRating') }}</div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th><th>{{ t('admin.type') }}</th><th>{{ t('admin.user') }}</th><th>{{ t('admin.experiment') }}</th><th>{{ t('admin.ratingCol') }}</th><th>{{ t('admin.message') }}</th><th>{{ t('admin.status') }}</th><th>{{ t('admin.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in filteredFeedback" :key="f.id">
              <td>{{ f.id }}</td>
              <td>{{ typeLabel(f.type) }}</td>
              <td>{{ f.user_name }}</td>
              <td>{{ f.experiment_name || '—' }}</td>
              <td>{{ f.rating ? '⭐'.repeat(f.rating) : '—' }}</td>
              <td class="msg-cell">{{ f.message }}</td>
              <td>
                <select :value="f.status" @change="changeStatus(f.id, ($event.target as HTMLSelectElement).value)">
                  <option value="open">{{ t('admin.statusOpen') }}</option>
                  <option value="resolved">{{ t('admin.statusResolved') }}</option>
                  <option value="dismissed">🚫 {{ t('admin.dismissed') }}</option>
                </select>
              </td>
              <td>{{ f.created_at?.slice(0, 10) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="filteredFeedback.length === 0" class="empty">{{ t('admin.noResults') }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }
.loading { text-align: center; color: #64748b; padding: 2rem; }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }
.btn-primary { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.85rem; }

.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
.mini-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.8rem; text-align: center; }
.mini-value { font-size: 1.4rem; font-weight: 800; color: #67e8f9; }
.mini-label { font-size: 0.75rem; color: #94a3b8; }

.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: end; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.data-table select { padding: 0.2rem 0.4rem; border-radius: 0.3rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; }
.filters-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.filters-row input { flex: 1; min-width: 200px; padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; }
.filters-row select { padding: 0.4rem 0.6rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; }
.msg-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty { text-align: center; color: #64748b; padding: 2rem; }
</style>
