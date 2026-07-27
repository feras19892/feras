<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { fetchJson } from '../../services/http';

const { t } = useI18n();

interface NameRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  requested_name: string;
  created_at: string;
}

const requests = ref<NameRequest[]>([]);
const show = ref(false);
const loading = ref(false);
const error = ref('');
const resolving = ref<number | null>(null);

async function loadRequests() {
  try {
    const data = await fetchJson<{ success: boolean; requests: NameRequest[] }>('/api/dashboard/name-requests');
    if (data.success) requests.value = data.requests;
  } catch {
    // ignore
  }
}

async function resolve(id: number, approved: boolean) {
  resolving.value = id;
  error.value = '';
  try {
    await fetchJson(`/api/dashboard/name-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    requests.value = requests.value.filter(r => r.id !== id);
  } catch {
    error.value = t('account.resolveError');
  }
  resolving.value = null;
}

onMounted(() => {
  loadRequests();
});
</script>

<template>
  <button v-if="requests.length > 0" class="name-req-btn" @click="show = true">
    <span>🔔</span>
    <span class="badge">{{ requests.length }}</span>
  </button>

  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="show = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>🔔 {{ t('account.nameRequests') }}</h3>
          <button class="close-btn" @click="show = false">✕</button>
        </div>

        <div class="req-list">
          <p v-if="error" class="error">{{ error }}</p>
          <div v-if="requests.length === 0" class="empty">{{ t('account.noRequests') }}</div>
          <div v-for="r in requests" :key="r.id" class="req-item">
            <div class="req-info">
              <span class="req-student">{{ r.user_name }}</span>
              <span class="req-email">📧 {{ r.user_email }}</span>
              <div class="req-change">
                <span class="old-name">{{ r.user_name }}</span>
                <span class="arrow">→</span>
                <span class="new-name">{{ r.requested_name }}</span>
              </div>
            </div>
            <div class="req-actions">
              <button class="btn-approve" :disabled="resolving === r.id" @click="resolve(r.id, true)">
                ✅ {{ t('account.approve') }}
              </button>
              <button class="btn-reject" :disabled="resolving === r.id" @click="resolve(r.id, false)">
                ❌ {{ t('account.reject') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.name-req-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 0.6rem;
  border: 1px solid rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.08);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.name-req-btn:hover { border-color: rgba(251,191,36,0.5); background: rgba(251,191,36,0.12); }
.badge {
  position: absolute;
  top: -4px;
  inset-inline-end: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.modal-card {
  width: 100%;
  max-width: 500px;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1.2rem;
  color: #e2e8f0;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #f1f5f9; }
.close-btn {
  width: 30px; height: 30px;
  border-radius: 0.4rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
}
.close-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; }

.req-list { padding: 1rem 1.5rem; max-height: 400px; overflow-y: auto; }
.empty { text-align: center; color: #64748b; padding: 2rem; font-size: 0.85rem; }
.error { color: #fca5a5; font-size: 0.8rem; margin: 0.5rem 0; }

.req-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-radius: 0.6rem;
  background: rgba(15,23,42,0.5);
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 0.6rem;
}
.req-info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.req-student { font-size: 0.88rem; font-weight: 700; color: #f1f5f9; }
.req-email { font-size: 0.72rem; color: #64748b; }
.req-change { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.3rem; }
.old-name { font-size: 0.78rem; color: #94a3b8; text-decoration: line-through; }
.arrow { font-size: 0.75rem; color: #475569; }
.new-name { font-size: 0.82rem; font-weight: 700; color: #67e8f9; }

.req-actions { display: flex; flex-direction: column; gap: 0.3rem; flex-shrink: 0; }
.btn-approve, .btn-reject {
  padding: 0.35rem 0.7rem;
  border-radius: 0.4rem;
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}
.btn-approve { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
.btn-approve:hover { background: rgba(34,197,94,0.25); }
.btn-reject { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.15); }
.btn-reject:hover { background: rgba(239,68,68,0.2); }
.btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: wait; }
</style>
