<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchJson } from '../../services/http';

interface SystemAlert {
  id: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  is_resolved: number;
  created_at: string;
}

const alerts = ref<SystemAlert[]>([]);
const loading = ref(false);
const acting = ref('');

async function loadAlerts() {
  loading.value = true;
  try {
    const res = await fetchJson<{ success: boolean; alerts: SystemAlert[] }>('/api/admin/alerts');
    if (res.success) alerts.value = res.alerts;
  } catch {
    // ignore
  }
  loading.value = false;
}

async function resolveAlert(id: number) {
  await fetchJson(`/api/admin/alerts/${id}/resolve`, { method: 'PATCH' });
  alerts.value = alerts.value.map(a => a.id === id ? { ...a, is_resolved: 1 } : a);
}

async function emergencyAction(action: string) {
  acting.value = action;
  try {
    await fetchJson(`/api/admin/emergency/${action}`, { method: 'POST' });
  } catch {
    // ignore
  }
  acting.value = '';
}

function severityColor(severity: string): string {
  if (severity === 'critical') return '#ef4444';
  if (severity === 'warning') return '#f59e0b';
  return '#3b82f6';
}

onMounted(loadAlerts);
</script>

<template>
  <div class="admin-emergency">
    <div class="alerts-section">
      <h3>🚨 تنبيهات النظام</h3>
      <div v-if="loading" class="loading">جاري التحميل...</div>
      <div v-else-if="alerts.length === 0" class="empty">لا توجد تنبيهات</div>
      <div v-else class="alerts-list">
        <div
          v-for="a in alerts"
          :key="a.id"
          :class="['alert-item', { resolved: a.is_resolved }]"
        >
          <div class="alert-indicator" :style="{ background: severityColor(a.severity) }"></div>
          <div class="alert-content">
            <div class="alert-title">{{ a.title }}</div>
            <div class="alert-message">{{ a.message }}</div>
            <div class="alert-time">{{ new Date(a.created_at).toLocaleString('ar-SA') }}</div>
          </div>
          <button v-if="!a.is_resolved" class="resolve-btn" @click="resolveAlert(a.id)">
            حل
          </button>
          <span v-else class="resolved-badge">✓ تم الحل</span>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <h3>⚡ أدوات الطوارئ</h3>
      <div class="controls-grid">
        <button
          @click="emergencyAction('stop-registration')"
          :disabled="acting === 'stop-registration'"
          class="ctrl-btn warning"
        >
          🛑 إيقاف التسجيل
        </button>
        <button
          @click="emergencyAction('resume-registration')"
          :disabled="acting === 'resume-registration'"
          class="ctrl-btn success"
        >
          ✅ استئناف التسجيل
        </button>
        <button
          @click="emergencyAction('maintenance-on')"
          :disabled="acting === 'maintenance-on'"
          class="ctrl-btn warning"
        >
          🔧 وضع الصيانة
        </button>
        <button
          @click="emergencyAction('maintenance-off')"
          :disabled="acting === 'maintenance-off'"
          class="ctrl-btn success"
        >
          ✅ إيقاف الصيانة
        </button>
        <button
          @click="emergencyAction('freeze-all')"
          :disabled="acting === 'freeze-all'"
          class="ctrl-btn danger"
        >
          ❄️ تجميد كل الفصول
        </button>
        <button
          @click="emergencyAction('unfreeze-all')"
          :disabled="acting === 'unfreeze-all'"
          class="ctrl-btn success"
        >
          🔥 إلغاء التجميد
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-emergency { display: flex; flex-direction: column; gap: 1.5rem; }
.alerts-section h3, .controls-section h3 { color: #e2e8f0; font-size: 1rem; margin-bottom: 0.75rem; }
.loading, .empty { text-align: center; color: #64748b; padding: 1rem; }
.alerts-list { display: flex; flex-direction: column; gap: 0.5rem; }
.alert-item {
  display: flex; align-items: flex-start; gap: 0.6rem;
  padding: 0.6rem; border-radius: 0.4rem;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
}
.alert-item.resolved { opacity: 0.5; }
.alert-indicator { width: 4px; height: 100%; min-height: 2rem; border-radius: 2px; flex-shrink: 0; }
.alert-content { flex: 1; }
.alert-title { color: #e2e8f0; font-size: 0.8rem; font-weight: 600; }
.alert-message { color: #94a3b8; font-size: 0.75rem; margin-top: 0.15rem; }
.alert-time { color: #64748b; font-size: 0.7rem; margin-top: 0.15rem; }
.resolve-btn {
  background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3);
  border-radius: 0.25rem; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.7rem;
}
.resolve-btn:hover { background: rgba(99,102,241,0.25); }
.resolved-badge { color: #22c55e; font-size: 0.7rem; }
.controls-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
.ctrl-btn {
  border: none; border-radius: 0.4rem; padding: 0.6rem; cursor: pointer;
  font-size: 0.8rem; font-weight: 500; transition: opacity 0.15s;
}
.ctrl-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ctrl-btn.warning { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.3); }
.ctrl-btn.danger { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
.ctrl-btn.success { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
.ctrl-btn:hover:not(:disabled) { opacity: 0.85; }
</style>
