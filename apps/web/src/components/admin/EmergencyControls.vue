<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { fetchJson } from '../../services/http';
import { getSystemStatus, type SystemStatus } from '../../services/system-status.service';
import EmergencyPasswordDialog from './EmergencyPasswordDialog.vue';

interface SystemAlert {
  id: number; type: string; severity: string; title: string;
  message: string; is_resolved: number; created_at: string;
}

type AlertFilter = 'all' | 'unresolved' | 'critical';

const { t, locale } = useI18n();
const alerts = ref<SystemAlert[]>([]);
const loading = ref(false);
const acting = ref('');
const status = ref<SystemStatus | null>(null);
const statusError = ref(false);
const actionResult = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const pendingAction = ref<{ action: string; label: string } | null>(null);
const alertFilter = ref<AlertFilter>('all');
const resolvingIds = ref<Set<number>>(new Set());
const selectedAlertIds = ref<Set<number>>(new Set());
let pollTimer: ReturnType<typeof setInterval> | null = null;

const filteredAlerts = computed(() => {
  if (alertFilter.value === 'unresolved') return alerts.value.filter(a => !a.is_resolved);
  if (alertFilter.value === 'critical') return alerts.value.filter(a => a.severity === 'critical' && !a.is_resolved);
  return alerts.value;
});

const unresolvedCount = computed(() => alerts.value.filter(a => !a.is_resolved).length);
const criticalCount = computed(() => alerts.value.filter(a => a.severity === 'critical' && !a.is_resolved).length);

async function loadStatus() {
  try {
    const res = await getSystemStatus();
    if (res.success) { status.value = res; statusError.value = false; }
  } catch { statusError.value = true; }
}

async function loadAlerts() {
  loading.value = true;
  try {
    const res = await fetchJson<{ success: boolean; alerts: SystemAlert[] }>('/api/admin/alerts');
    if (res.success) alerts.value = res.alerts;
  } catch { /* ignore */ }
  loading.value = false;
}

async function resolveAlert(id: number) {
  if (resolvingIds.value.has(id)) return;
  resolvingIds.value = new Set([...resolvingIds.value, id]);
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>(`/api/admin/alerts/${id}/resolve`, { method: 'PATCH' });
    if (res.success) {
      alerts.value = alerts.value.map(a => a.id === id ? { ...a, is_resolved: 1 } : a);
    } else {
      actionResult.value = { type: 'error', message: res.message || t('admin.emgFailed') };
    }
  } catch (e: unknown) {
    actionResult.value = { type: 'error', message: e instanceof Error ? e.message : t('admin.emgFailed') };
  } finally {
    const next = new Set(resolvingIds.value); next.delete(id); resolvingIds.value = next;
  }
}

async function bulkResolve() {
  if (selectedAlertIds.value.size === 0) return;
  const ids = [...selectedAlertIds.value];
  for (const id of ids) {
    await resolveAlert(id);
  }
  selectedAlertIds.value = new Set();
}

function toggleAlertSelection(id: number) {
  const next = new Set(selectedAlertIds.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  selectedAlertIds.value = next;
}

function dismissActionResult() {
  actionResult.value = null;
}

function requestEmergencyAction(action: string, label: string) {
  pendingAction.value = { action, label };
}

function cancelEmergencyAction() {
  pendingAction.value = null;
}

async function confirmEmergencyAction(action: string, password: string) {
  pendingAction.value = null;
  acting.value = action;
  actionResult.value = null;
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>(`/api/admin/emergency/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emergency_password: password }),
    });
    if (res.success) {
      actionResult.value = { type: 'success', message: res.message || t('admin.emgExecuted') };
      await loadStatus();
    } else {
      actionResult.value = { type: 'error', message: res.message || t('admin.emgFailed') };
    }
  } catch (e: unknown) {
    actionResult.value = { type: 'error', message: e instanceof Error ? e.message : String(e) || t('admin.emgFailed') };
  }
  acting.value = '';
  setTimeout(() => { actionResult.value = null; }, 5000);
}

function severityColor(severity: string): string {
  if (severity === 'critical') return '#ef4444';
  if (severity === 'high') return '#f59e0b';
  if (severity === 'warning') return '#f59e0b';
  if (severity === 'normal') return '#3b82f6';
  return '#64748b';
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (acting.value) { e.preventDefault(); e.returnValue = ''; }
}

onMounted(() => {
  loadAlerts(); loadStatus();
  pollTimer = setInterval(() => { loadAlerts(); loadStatus(); }, 30000);
  window.addEventListener('beforeunload', onBeforeUnload);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  window.removeEventListener('beforeunload', onBeforeUnload);
});
</script>

<template>
  <div class="admin-emergency">
    <div v-if="actionResult" :class="['action-result', actionResult.type]">
      <span>{{ actionResult.type === 'success' ? '✅' : '❌' }}</span>
      <span>{{ actionResult.message }}</span>
      <button class="action-dismiss" @click="dismissActionResult">✕</button>
    </div>

    <div v-if="statusError" class="status-error-banner">⚠️ {{ t('admin.emgStatusError') }}</div>
    <div v-if="status" class="status-section">
      <h3>{{ t('admin.emgSystemStatus') }}</h3>
      <div class="status-grid">
        <div :class="['status-card', status.stop_registration ? 'active-danger' : 'inactive']">
          <span class="status-icon">{{ status.stop_registration ? '🚫' : '✅' }}</span>
          <div class="status-info"><span class="status-label">{{ t('admin.emgRegistration') }}</span><span class="status-value">{{ status.stop_registration ? t('admin.emgRegistrationSuspended') : t('admin.emgRegistrationAvailable') }}</span></div>
        </div>
        <div :class="['status-card', status.maintenance_mode ? 'active-warning' : 'inactive']">
          <span class="status-icon">{{ status.maintenance_mode ? '🔧' : '✅' }}</span>
          <div class="status-info"><span class="status-label">{{ t('admin.emgMaintenance') }}</span><span class="status-value">{{ status.maintenance_mode ? t('admin.emgMaintenanceActive') : t('admin.emgMaintenanceInactive') }}</span></div>
        </div>
        <div :class="['status-card', status.freeze_all_classes ? 'active-freeze' : 'inactive']">
          <span class="status-icon">{{ status.freeze_all_classes ? '❄️' : '🔥' }}</span>
          <div class="status-info"><span class="status-label">{{ t('admin.emgClasses') }}</span><span class="status-value">{{ status.freeze_all_classes ? t('admin.emgClassesFrozen') : t('admin.emgClassesActive') }}</span></div>
        </div>
      </div>
    </div>

    <div class="alerts-section">
      <div class="alerts-header">
        <h3>{{ t('admin.emgAlerts') }}</h3>
        <div class="alert-filters">
          <button :class="['filter-btn', { active: alertFilter === 'all' }]" @click="alertFilter = 'all'">{{ t('admin.emgFilterAll') }} ({{ alerts.length }})</button>
          <button :class="['filter-btn', { active: alertFilter === 'unresolved' }]" @click="alertFilter = 'unresolved'">{{ t('admin.emgFilterUnresolved') }} ({{ unresolvedCount }})</button>
          <button :class="['filter-btn', { active: alertFilter === 'critical' }]" @click="alertFilter = 'critical'">{{ t('admin.emgFilterCritical') }} ({{ criticalCount }})</button>
        </div>
      </div>
      <div v-if="loading" class="loading">{{ t('admin.loading') }}</div>
      <div v-else-if="filteredAlerts.length === 0" class="empty">{{ t('admin.emgNoAlerts') }}</div>
      <div v-else class="alerts-list">
        <div v-if="selectedAlertIds.size > 0" class="bulk-bar">
          <span>{{ selectedAlertIds.size }} {{ t('admin.emgSelected') }}</span>
          <button class="bulk-resolve-btn" @click="bulkResolve">{{ t('admin.emgBulkResolve') }}</button>
          <button class="bulk-clear-btn" @click="selectedAlertIds = new Set()">✕</button>
        </div>
        <div v-for="a in filteredAlerts" :key="a.id" :class="['alert-item', { resolved: a.is_resolved, selected: selectedAlertIds.has(a.id) }]">
          <input v-if="!a.is_resolved" type="checkbox" :checked="selectedAlertIds.has(a.id)" @change="toggleAlertSelection(a.id)" class="alert-checkbox" />
          <div class="alert-indicator" :style="{ background: severityColor(a.severity) }"></div>
          <div class="alert-content">
            <div class="alert-title">{{ a.title }}</div>
            <div class="alert-message">{{ a.message }}</div>
            <div class="alert-time">{{ new Date(a.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale) }}</div>
          </div>
          <button v-if="!a.is_resolved" class="resolve-btn" :disabled="resolvingIds.has(a.id)" @click="resolveAlert(a.id)">{{ resolvingIds.has(a.id) ? '⏳' : t('admin.emgResolve') }}</button>
          <span v-else class="resolved-badge">{{ t('admin.emgResolved') }}</span>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <h3>{{ t('admin.emgControls') }}</h3>
      <p class="controls-hint">{{ t('admin.emgControlsHint') }}</p>
      <div class="controls-grid">
        <button @click="requestEmergencyAction('stop-registration', t('admin.emgStopRegistration'))" :disabled="acting === 'stop-registration' || status?.stop_registration" class="ctrl-btn warning">{{ acting === 'stop-registration' ? t('admin.emgProcessing') : t('admin.emgStopRegistration') }}</button>
        <button @click="requestEmergencyAction('resume-registration', t('admin.emgResumeRegistration'))" :disabled="acting === 'resume-registration' || !status?.stop_registration" class="ctrl-btn success">{{ acting === 'resume-registration' ? t('admin.emgProcessing') : t('admin.emgResumeRegistration') }}</button>
        <button @click="requestEmergencyAction('maintenance-on', t('admin.emgMaintenanceOn'))" :disabled="acting === 'maintenance-on' || status?.maintenance_mode" class="ctrl-btn warning">{{ acting === 'maintenance-on' ? t('admin.emgProcessing') : t('admin.emgMaintenanceOn') }}</button>
        <button @click="requestEmergencyAction('maintenance-off', t('admin.emgMaintenanceOff'))" :disabled="acting === 'maintenance-off' || !status?.maintenance_mode" class="ctrl-btn success">{{ acting === 'maintenance-off' ? t('admin.emgProcessing') : t('admin.emgMaintenanceOff') }}</button>
        <button @click="requestEmergencyAction('freeze-all', t('admin.emgFreezeAll'))" :disabled="acting === 'freeze-all' || status?.freeze_all_classes" class="ctrl-btn danger">{{ acting === 'freeze-all' ? t('admin.emgProcessing') : t('admin.emgFreezeAll') }}</button>
        <button @click="requestEmergencyAction('unfreeze-all', t('admin.emgUnfreezeAll'))" :disabled="acting === 'unfreeze-all' || !status?.freeze_all_classes" class="ctrl-btn success">{{ acting === 'unfreeze-all' ? t('admin.emgProcessing') : t('admin.emgUnfreezeAll') }}</button>
      </div>
    </div>

    <EmergencyPasswordDialog
      :pending-action="pendingAction"
      @cancel="cancelEmergencyAction"
      @confirmed="confirmEmergencyAction"
    />
  </div>
</template>

<style scoped src='./EmergencyControls.css'></style>
