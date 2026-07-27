<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { getAdminAuditLog, type AuditLogEntry } from '../../services/admin.service';

const { t } = useI18n();
const entries = ref<AuditLogEntry[]>([]);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const filterTable = ref('');

const filteredEntries = computed(() => {
  let list = entries.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(e =>
      e.actor_name?.toLowerCase().includes(q) ||
      e.action?.toLowerCase().includes(q) ||
      e.table_name?.toLowerCase().includes(q) ||
      e.record_id?.toLowerCase().includes(q)
    );
  }
  if (filterTable.value) {
    list = list.filter(e => e.table_name === filterTable.value);
  }
  return list;
});

const uniqueTables = computed(() => {
  const set = new Set(entries.value.map(e => e.table_name).filter(Boolean));
  return Array.from(set).sort();
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getAdminAuditLog();
    if (res.success) entries.value = res.audit;
  } catch (err: unknown) {
    error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
  } finally {
    loading.value = false;
  }
}

function actionColor(action: string) {
  switch (action) {
    case 'create': return '#34d399';
    case 'update': return '#fbbf24';
    case 'delete': return '#f87171';
    case 'ban': return '#ef4444';
    case 'unban': return '#34d399';
    case 'impersonate': return '#a78bfa';
    default: return '#94a3b8';
  }
}

function formatValues(json: string | null | undefined) {
  if (!json) return '';
  try {
    const obj = JSON.parse(json);
    return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
  } catch {
    return json;
  }
}

onMounted(load);
</script>

<template>
  <div class="section">
    <div class="section-header">
      <h3>{{ t('admin.auditLog') }}</h3>
      <button class="btn-primary" @click="load">{{ t('admin.refresh') }}</button>
    </div>

    <div class="filters-row">
      <input v-model="searchQuery" class="search-input" :placeholder="t('admin.searchAudit')" />
      <select v-model="filterTable">
        <option value="">{{ t('admin.allTables') }}</option>
        <option v-for="tbl in uniqueTables" :key="tbl" :value="tbl">{{ tbl }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>{{ t('admin.actor') }}</th><th>{{ t('admin.action') }}</th><th>{{ t('admin.table') }}</th><th>{{ t('admin.recordId') }}</th><th>{{ t('admin.changes') }}</th><th>{{ t('admin.date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filteredEntries" :key="e.id">
            <td>{{ e.id }}</td>
            <td>{{ e.actor_name || '—' }}</td>
            <td><span class="action-badge" :style="{ color: actionColor(e.action), background: actionColor(e.action) + '20' }">{{ e.action }}</span></td>
            <td><code>{{ e.table_name }}</code></td>
            <td>{{ e.record_id }}</td>
            <td class="changes-cell">
              <span v-if="e.old_values" class="old-val">- {{ formatValues(e.old_values) }}</span>
              <span v-if="e.new_values" class="new-val">+ {{ formatValues(e.new_values) }}</span>
            </td>
            <td>{{ e.created_at?.slice(0, 19).replace('T', ' ') }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="filteredEntries.length === 0" class="empty">{{ t('admin.noResults') }}</p>
    </div>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }
.btn-primary { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.85rem; }
.filters-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.search-input { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; min-width: 250px; }
.filters-row select { padding: 0.4rem 0.6rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; }
.loading { text-align: center; padding: 2rem; color: #64748b; }
.error { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; text-align: center; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table th { text-align: end; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.data-table code { background: rgba(255,255,255,0.05); padding: 0.15rem 0.35rem; border-radius: 0.3rem; font-size: 0.78rem; }
.action-badge { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.72rem; font-weight: 700; }
.changes-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.old-val { display: block; color: #f87171; font-size: 0.78rem; }
.new-val { display: block; color: #34d399; font-size: 0.78rem; }
.empty { text-align: center; color: #64748b; padding: 2rem; }
</style>
