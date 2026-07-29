<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminGetEmailRequests, adminReviewEmailRequest } from '../../services/school.service';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const requests = ref<any[]>([]);
const loading = ref(true);
const errorMsg = ref('');

async function loadRequests() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await adminGetEmailRequests();
    if (res.success) requests.value = res.requests;
  } catch (e) {
    errorMsg.value = 'Failed to load requests';
  } finally {
    loading.value = false;
  }
}

async function review(id: number, status: 'approved' | 'rejected') {
  const res = await adminReviewEmailRequest(id, status);
  if (res.success) await loadRequests();
}

onMounted(loadRequests);
</script>

<template>
  <div class="requests-panel">
    <h2>{{ t('admin.requestsTitle') }}</h2>

    <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
    <div v-else-if="errorMsg" class="error">❌ {{ errorMsg }}</div>
    <div v-else-if="requests.length === 0" class="empty">
      <div class="empty-icon">📭</div>
      <p>{{ t('admin.requestsNoData') }}</p>
    </div>
    <table v-else class="req-table">
      <thead>
        <tr>
          <th>{{ t('admin.requestsType') }}</th>
          <th>{{ t('admin.requestsCurrent') }}</th>
          <th>{{ t('admin.requestsRequested') }}</th>
          <th>{{ t('admin.requestsStatus') }}</th>
          <th>{{ t('admin.requestsDate') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in requests" :key="r.id">
          <td><span class="type-tag" :class="r.requester_type">{{ r.requester_type === 'school' ? t('admin.typeSchool') : t('admin.typeUser') }}</span></td>
          <td>{{ r.current_email }}</td>
          <td>{{ r.requested_email }}</td>
          <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
          <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
          <td v-if="r.status === 'pending'" class="action-cell">
            <button class="mini-btn approve" @click="review(r.id, 'approved')" :title="t('admin.requestsApprove')">✅</button>
            <button class="mini-btn reject" @click="review(r.id, 'rejected')" :title="t('admin.requestsReject')">❌</button>
          </td>
          <td v-else>—</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.requests-panel { color: #e2e8f0; }
.requests-panel h2 { font-size: 1.2rem; margin: 0 0 1rem; }
.loading, .error, .empty { text-align: center; padding: 2rem; color: #64748b; }
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

.req-table { width: 100%; border-collapse: collapse; }
.req-table th { text-align: start; padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); }
.req-table td { padding: 0.6rem 0.8rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.req-table tr:hover { background: rgba(255,255,255,0.02); }

.type-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.type-tag.school { background: rgba(6,182,212,0.15); color: #67e8f9; }
.type-tag.user { background: rgba(129,140,248,0.15); color: #a5b4fc; }

.status-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.status-tag.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.status-tag.approved { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-tag.rejected { background: rgba(239,68,68,0.15); color: #f87171; }

.action-cell { display: flex; gap: 0.3rem; }
.mini-btn { width: 28px; height: 28px; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); cursor: pointer; font-size: 0.8rem; }
.mini-btn.approve:hover { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
.mini-btn.reject:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }
</style>
