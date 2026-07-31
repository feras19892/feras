<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchJson } from '../../services/http';
import { getSystemStatus, type SystemStatus } from '../../services/system-status.service';

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
const status = ref<SystemStatus | null>(null);
const actionResult = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const pendingAction = ref<{ action: string; label: string } | null>(null);
const emergencyPassword = ref('');
const passwordError = ref('');

// Change password state
const showChangePwd = ref(false);
const currentPwd = ref('');
const newPwd = ref('');
const confirmPwd = ref('');
const changePwdMsg = ref<{ type: 'success' | 'error'; text: string } | null>(null);
const changingPwd = ref(false);

async function loadStatus() {
  try {
    const res = await getSystemStatus();
    if (res.success) status.value = res;
  } catch { /* ignore */ }
}

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

function requestEmergencyAction(action: string, label: string) {
  pendingAction.value = { action, label };
  emergencyPassword.value = '';
  passwordError.value = '';
}

function cancelEmergencyAction() {
  pendingAction.value = null;
  emergencyPassword.value = '';
  passwordError.value = '';
}

async function confirmEmergencyAction() {
  if (!pendingAction.value) return;
  if (!emergencyPassword.value.trim()) {
    passwordError.value = 'الرجاء إدخال كلمة مرور الطوارئ';
    return;
  }
  const { action, label } = pendingAction.value;
  pendingAction.value = null;
  acting.value = action;
  actionResult.value = null;
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>(`/api/admin/emergency/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emergency_password: emergencyPassword.value.trim() }),
    });
    if (res.success) {
      actionResult.value = { type: 'success', message: res.message || `تم تنفيذ: ${label}` };
      await loadStatus();
    } else {
      actionResult.value = { type: 'error', message: res.message || `فشل: ${label}` };
    }
  } catch (e: any) {
    actionResult.value = { type: 'error', message: e?.message || `فشل: ${label}` };
  }
  acting.value = '';
  emergencyPassword.value = '';
  setTimeout(() => { actionResult.value = null; }, 5000);
}

async function handleChangeEmergencyPwd() {
  if (!currentPwd.value.trim() || !newPwd.value.trim() || !confirmPwd.value.trim()) {
    changePwdMsg.value = { type: 'error', text: 'يرجى ملء جميع الحقول' };
    return;
  }
  if (newPwd.value !== confirmPwd.value) {
    changePwdMsg.value = { type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' };
    return;
  }
  if (newPwd.value.length < 6) {
    changePwdMsg.value = { type: 'error', text: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' };
    return;
  }
  changingPwd.value = true;
  changePwdMsg.value = null;
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/admin/emergency/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPwd.value.trim(), new_password: newPwd.value.trim() }),
    });
    if (res.success) {
      changePwdMsg.value = { type: 'success', text: res.message || 'تم تغيير كلمة المرور بنجاح' };
      currentPwd.value = '';
      newPwd.value = '';
      confirmPwd.value = '';
      showChangePwd.value = false;
    } else {
      changePwdMsg.value = { type: 'error', text: res.message || 'فشل تغيير كلمة المرور' };
    }
  } catch (e: any) {
    changePwdMsg.value = { type: 'error', text: e?.message || 'فشل تغيير كلمة المرور' };
  }
  changingPwd.value = false;
  setTimeout(() => { changePwdMsg.value = null; }, 5000);
}

async function emergencyAction(action: string, label: string) {
  requestEmergencyAction(action, label);
}

function severityColor(severity: string): string {
  if (severity === 'critical') return '#ef4444';
  if (severity === 'warning') return '#f59e0b';
  return '#3b82f6';
}

onMounted(() => {
  loadAlerts();
  loadStatus();
});
</script>

<template>
  <div class="admin-emergency">
    <!-- Action result banner -->
    <div v-if="actionResult" :class="['action-result', actionResult.type]">
      <span>{{ actionResult.type === 'success' ? '✅' : '❌' }}</span>
      <span>{{ actionResult.message }}</span>
    </div>

    <!-- Current system status -->
    <div v-if="status" class="status-section">
      <h3>📊 حالة النظام الحالية</h3>
      <div class="status-grid">
        <div :class="['status-card', status.stop_registration ? 'active-danger' : 'inactive']">
          <span class="status-icon">{{ status.stop_registration ? '�' : '✅' }}</span>
          <div class="status-info">
            <span class="status-label">التسجيل</span>
            <span class="status-value">{{ status.stop_registration ? 'موقوف' : 'متاح' }}</span>
          </div>
        </div>
        <div :class="['status-card', status.maintenance_mode ? 'active-warning' : 'inactive']">
          <span class="status-icon">{{ status.maintenance_mode ? '🔧' : '✅' }}</span>
          <div class="status-info">
            <span class="status-label">الصيانة</span>
            <span class="status-value">{{ status.maintenance_mode ? 'مفعّل' : 'متوقف' }}</span>
          </div>
        </div>
        <div :class="['status-card', status.freeze_all_classes ? 'active-freeze' : 'inactive']">
          <span class="status-icon">{{ status.freeze_all_classes ? '❄️' : '🔥' }}</span>
          <div class="status-info">
            <span class="status-label">الفصول</span>
            <span class="status-value">{{ status.freeze_all_classes ? 'مجمّدة' : 'نشطة' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="alerts-section">
      <h3>�🚨 تنبيهات النظام</h3>
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
      <p class="controls-hint">كل إجراء يرسل إعلاناً عاماً وإشعارات لجميع المستخدمين — يتطلب كلمة مرور</p>
      <div class="controls-grid">
        <button
          @click="emergencyAction('stop-registration', 'إيقاف التسجيل')"
          :disabled="acting === 'stop-registration' || status?.stop_registration"
          class="ctrl-btn warning"
        >
          {{ acting === 'stop-registration' ? '⏳ جاري...' : '🛑 إيقاف التسجيل' }}
        </button>
        <button
          @click="emergencyAction('resume-registration', 'استئناف التسجيل')"
          :disabled="acting === 'resume-registration' || !status?.stop_registration"
          class="ctrl-btn success"
        >
          {{ acting === 'resume-registration' ? '⏳ جاري...' : '✅ استئناف التسجيل' }}
        </button>
        <button
          @click="emergencyAction('maintenance-on', 'وضع الصيانة')"
          :disabled="acting === 'maintenance-on' || status?.maintenance_mode"
          class="ctrl-btn warning"
        >
          {{ acting === 'maintenance-on' ? '⏳ جاري...' : '🔧 وضع الصيانة' }}
        </button>
        <button
          @click="emergencyAction('maintenance-off', 'إيقاف الصيانة')"
          :disabled="acting === 'maintenance-off' || !status?.maintenance_mode"
          class="ctrl-btn success"
        >
          {{ acting === 'maintenance-off' ? '⏳ جاري...' : '✅ إيقاف الصيانة' }}
        </button>
        <button
          @click="emergencyAction('freeze-all', 'تجميد الفصول')"
          :disabled="acting === 'freeze-all' || status?.freeze_all_classes"
          class="ctrl-btn danger"
        >
          {{ acting === 'freeze-all' ? '⏳ جاري...' : '❄️ تجميد كل الفصول' }}
        </button>
        <button
          @click="emergencyAction('unfreeze-all', 'إلغاء التجميد')"
          :disabled="acting === 'unfreeze-all' || !status?.freeze_all_classes"
          class="ctrl-btn success"
        >
          {{ acting === 'unfreeze-all' ? '⏳ جاري...' : '🔥 إلغاء التجميد' }}
        </button>
      </div>
    </div>

    <!-- Change emergency password -->
    <div class="pwd-change-section">
      <button class="pwd-change-toggle" @click="showChangePwd = !showChangePwd">
        🔐 تغيير كلمة مرور الطوارئ
      </button>
      <div v-if="showChangePwd" class="pwd-change-form">
        <div v-if="changePwdMsg" :class="['pwd-change-msg', changePwdMsg.type]">{{ changePwdMsg.text }}</div>
        <input v-model="currentPwd" type="password" placeholder="كلمة المرور الحالية" class="pwd-change-input" />
        <input v-model="newPwd" type="password" placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" class="pwd-change-input" />
        <input v-model="confirmPwd" type="password" placeholder="تأكيد كلمة المرور الجديدة" class="pwd-change-input" />
        <button class="pwd-change-btn" :disabled="changingPwd" @click="handleChangeEmergencyPwd">
          {{ changingPwd ? '⏳ جاري...' : 'تغيير كلمة المرور' }}
        </button>
      </div>
    </div>

    <!-- Password confirmation modal -->
    <Teleport to="body">
      <div v-if="pendingAction" class="pwd-overlay" @click.self="cancelEmergencyAction">
        <div class="pwd-card">
          <div class="pwd-header">
            <h3>🔐 تأكيد إجراء الطوارئ</h3>
            <button class="pwd-close" @click="cancelEmergencyAction">✕</button>
          </div>
          <div class="pwd-body">
            <p class="pwd-warning">⚠️ أنت على وشك تنفيذ: <strong>{{ pendingAction.label }}</strong></p>
            <p class="pwd-hint">هذا إجراء حساس يتطلب كلمة مرور الطوارئ.</p>
            <div class="pwd-field">
              <input
                v-model="emergencyPassword"
                type="password"
                placeholder="كلمة مرور الطوارئ"
                @keyup.enter="confirmEmergencyAction"
                autofocus
              />
            </div>
            <p v-if="passwordError" class="pwd-error">{{ passwordError }}</p>
            <div class="pwd-actions">
              <button class="pwd-btn-cancel" @click="cancelEmergencyAction">إلغاء</button>
              <button class="pwd-btn-confirm" @click="confirmEmergencyAction">تأكيد التنفيذ</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-emergency { display: flex; flex-direction: column; gap: 1.5rem; }

.action-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  animation: slideDown 0.3s ease;
}
.action-result.success { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
.action-result.error { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
@keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.status-section h3, .alerts-section h3, .controls-section h3 { color: #e2e8f0; font-size: 1rem; margin-bottom: 0.75rem; }
.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.5rem; }
.status-card {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.7rem; border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(15,23,42,0.5);
}
.status-card.active-danger { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.06); }
.status-card.active-warning { border-color: rgba(251,146,60,0.3); background: rgba(251,146,60,0.06); }
.status-card.active-freeze { border-color: rgba(103,232,249,0.3); background: rgba(103,232,249,0.06); }
.status-card.inactive { border-color: rgba(34,197,94,0.15); background: rgba(34,197,94,0.04); }
.status-icon { font-size: 1.3rem; }
.status-info { display: flex; flex-direction: column; }
.status-label { font-size: 0.72rem; color: #64748b; }
.status-value { font-size: 0.85rem; font-weight: 700; color: #e2e8f0; }
.status-card.active-danger .status-value { color: #f87171; }
.status-card.active-warning .status-value { color: #fb923c; }
.status-card.active-freeze .status-value { color: #67e8f9; }
.status-card.inactive .status-value { color: #4ade80; }

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

.controls-hint { font-size: 0.75rem; color: #64748b; margin: -0.3rem 0 0.6rem; }
.controls-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
.ctrl-btn {
  border: none; border-radius: 0.4rem; padding: 0.6rem; cursor: pointer;
  font-size: 0.8rem; font-weight: 500; transition: opacity 0.15s;
}
.ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ctrl-btn.warning { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.3); }
.ctrl-btn.danger { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
.ctrl-btn.success { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
.ctrl-btn:hover:not(:disabled) { opacity: 0.85; }

.pwd-change-section { margin-top: 0.5rem; }
.pwd-change-toggle {
  background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2);
  border-radius: 0.4rem; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.8rem; font-weight: 600;
}
.pwd-change-toggle:hover { background: rgba(99,102,241,0.2); }
.pwd-change-form { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.6rem; max-width: 360px; }
.pwd-change-input {
  padding: 0.5rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(15,23,42,0.6); color: #e2e8f0; font-size: 0.82rem; font-family: inherit;
}
.pwd-change-input:focus { outline: none; border-color: rgba(99,102,241,0.5); }
.pwd-change-btn {
  padding: 0.5rem 1rem; border-radius: 0.4rem; border: none;
  background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff;
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
}
.pwd-change-btn:disabled { opacity: 0.6; cursor: wait; }
.pwd-change-msg { padding: 0.4rem 0.6rem; border-radius: 0.3rem; font-size: 0.78rem; }
.pwd-change-msg.success { background: rgba(34,197,94,0.12); color: #4ade80; }
.pwd-change-msg.error { background: rgba(239,68,68,0.12); color: #f87171; }

.pwd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.pwd-card {
  width: 100%;
  max-width: 380px;
  background: #0f172a;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  overflow: hidden;
}
.pwd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.pwd-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #f87171;
}
.pwd-close {
  width: 28px; height: 28px;
  border-radius: 0.35rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8rem;
}
.pwd-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
.pwd-body { padding: 1.2rem; }
.pwd-warning {
  font-size: 0.85rem;
  color: #fbbf24;
  margin: 0 0 0.5rem;
}
.pwd-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 1rem;
}
.pwd-field input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 0.9rem;
  box-sizing: border-box;
}
.pwd-field input:focus { outline: none; border-color: #ef4444; }
.pwd-error { color: #fca5a5; font-size: 0.78rem; margin: 0.5rem 0 0; }
.pwd-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.pwd-btn-cancel {
  flex: 1;
  padding: 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
}
.pwd-btn-cancel:hover { background: rgba(255,255,255,0.08); }
.pwd-btn-confirm {
  flex: 1;
  padding: 0.6rem;
  border-radius: 0.5rem;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
}
.pwd-btn-confirm:hover { opacity: 0.9; }
</style>
