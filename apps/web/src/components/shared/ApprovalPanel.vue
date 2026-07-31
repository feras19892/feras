<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  type ApprovalRequest,
  getMyApprovals, getPendingApprovals,
  approveApproval, rejectApproval, escalateApproval,
  getSchoolPendingApprovals, schoolApprove, schoolReject,
  adminGetAllApprovals, adminApprove, adminReject,
} from '../../services/approval.service';
import { useAuthStore } from '../../modules/auth/stores/auth';
import { useI18n } from '../../composables/useI18n';

const { t, locale } = useI18n();

const props = defineProps<{
  mode: 'student' | 'teacher' | 'school' | 'admin';
}>();

const auth = useAuthStore();
const loading = ref(true);
const error = ref('');
const approvals = ref<ApprovalRequest[]>([]);
const pendingOnly = ref(true);
const responseModal = ref<{ show: boolean; type: 'approve' | 'reject' | 'escalate'; id: number } | null>(null);
const responseText = ref('');
const submitting = ref(false);
const submitMsg = ref('');
const submitSuccess = ref(false);

const filteredApprovals = computed<ApprovalRequest[]>(() => {
  if (pendingOnly.value) return approvals.value.filter(a => a.status === 'pending');
  return approvals.value;
});

// Escalation only allowed on rejected status — enforce in UI
function canEscalate(a: ApprovalRequest): boolean {
  return (props.mode === 'student' || props.mode === 'teacher') && a.status === 'rejected';
}

const typeLabel = computed<Record<string, string>>(() => ({
  penalty: t('approval.typePenalty'),
  grade_change: t('approval.typeGradeChange'),
  student_removal: t('approval.typeStudentRemoval'),
  grade_appeal: t('approval.typeGradeAppeal'),
}));

const statusLabel = computed<Record<string, string>>(() => ({
  pending: t('approval.statusPending'),
  approved: t('approval.statusApproved'),
  rejected: t('approval.statusRejected'),
  escalated: t('approval.statusEscalated'),
  auto_escalated: t('approval.statusAutoEscalated'),
}));

const approverLabel = computed<Record<string, string>>(() => ({
  teacher: t('approval.approverTeacher'),
  school: t('approval.approverSchool'),
  admin: t('approval.approverAdmin'),
}));

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    if (props.mode === 'admin') {
      const res = await adminGetAllApprovals();
      if (res.success) approvals.value = res.approvals;
    } else if (props.mode === 'school') {
      const [all, pending] = await Promise.all([getMyApprovals(), getSchoolPendingApprovals()]);
      if (all.success) approvals.value = all.approvals;
      if (pending.success) {
        const pendingIds = new Set(pending.pending.map(p => p.id));
        approvals.value.forEach(a => { if (pendingIds.has(a.id)) a.status = 'pending'; });
      }
    } else {
      const [all, pending] = await Promise.all([getMyApprovals(), getPendingApprovals()]);
      if (all.success) approvals.value = all.approvals;
    }
  } catch (err) {
    error.value = t('approval.loadingError');
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function openResponse(type: 'approve' | 'reject' | 'escalate', id: number) {
  responseModal.value = { show: true, type, id };
  responseText.value = '';
  submitMsg.value = '';
  submitSuccess.value = false;
}

async function handleResponse() {
  if (!responseModal.value || !responseText.value.trim()) return;
  submitting.value = true;
  submitMsg.value = '';
  submitSuccess.value = false;
  const { type, id } = responseModal.value;

  try {
    let res;
    if (type === 'approve') {
      if (props.mode === 'school') res = await schoolApprove(id, responseText.value);
      else if (props.mode === 'admin') res = await adminApprove(id, responseText.value);
      else res = await approveApproval(id, responseText.value);
    } else if (type === 'reject') {
      if (props.mode === 'school') res = await schoolReject(id, responseText.value);
      else if (props.mode === 'admin') res = await adminReject(id, responseText.value);
      else res = await rejectApproval(id, responseText.value);
    } else {
      res = await escalateApproval(id, responseText.value);
    }

    if (res.success) {
      submitSuccess.value = true;
      submitMsg.value = type === 'approve' ? t('approval.approveSuccess') : type === 'reject' ? t('approval.rejectSuccess') : t('approval.escalateSuccess');
      responseModal.value = null;
      await loadData();
    } else {
      submitMsg.value = res.message || t('approval.operationFailed');
    }
  } catch {
    submitMsg.value = t('approval.operationFailed');
  } finally {
    submitting.value = false;
  }
}

function fmtDate(s: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

onMounted(loadData);
</script>

<template>
  <div class="approvals-panel">
    <div class="ap-header">
      <h3>{{ t('approval.title') }}</h3>
      <div class="ap-controls">
        <label class="ap-toggle">
          <input type="checkbox" v-model="pendingOnly" />
          <span>{{ t('approval.pendingOnly') }}</span>
        </label>
        <button class="ap-refresh" @click="loadData">{{ t('approval.refresh') }}</button>
      </div>
    </div>

    <div v-if="loading" class="ap-loading"><div class="spinner"></div></div>
    <div v-else-if="error" class="ap-error">❌ {{ error }}</div>

    <div v-else-if="filteredApprovals.length === 0" class="ap-empty">
      <div class="ap-empty-icon">📭</div>
      <p>{{ pendingOnly ? t('approval.emptyPending') : t('approval.empty') }}</p>
    </div>

    <div v-else class="ap-list">
      <div v-for="a in filteredApprovals" :key="a.id" class="ap-card" :class="a.status">
        <div class="ap-card-header">
          <span class="ap-type">{{ typeLabel[a.type] || a.type }}</span>
          <span class="ap-status" :class="a.status">{{ statusLabel[a.status] || a.status }}</span>
        </div>

        <div class="ap-card-body">
          <div class="ap-title">{{ a.title }}</div>
          <p class="ap-desc">{{ a.description }}</p>

          <div class="ap-meta">
            <span class="ap-meta-item"><strong>{{ t('approval.from') }}:</strong> {{ a.requester_name }}</span>
            <span class="ap-meta-item"><strong>{{ t('approval.approver') }}:</strong> {{ approverLabel[a.approver_type] || a.approver_type }}</span>
            <span class="ap-meta-item"><strong>{{ t('approval.target') }}:</strong> {{ a.target_user_name }}</span>
            <span v-if="a.proposed_grade != null" class="ap-meta-item"><strong>{{ t('approval.proposedGrade') }}:</strong> {{ a.proposed_grade }}</span>
            <span v-if="a.severity" class="ap-meta-item"><strong>{{ t('approval.severity') }}:</strong> {{ a.severity }}</span>
          </div>

          <div v-if="a.approver_response" class="ap-response">
            <strong>{{ t('approval.response') }}:</strong> {{ a.approver_response }}
            <span v-if="a.approver_name">— {{ a.approver_name }}</span>
          </div>

          <div v-if="a.escalated_to" class="ap-escalation">
            <strong>{{ t('approval.escalatedTo') }}:</strong> {{ approverLabel[a.escalated_to] || a.escalated_to }}
            <span v-if="a.escalation_reason"> — {{ a.escalation_reason }}</span>
          </div>

          <span class="ap-date">{{ fmtDate(a.created_at) }}</span>
        </div>

        <!-- Actions -->
        <div v-if="a.status === 'pending'" class="ap-actions">
          <button
            v-if="mode === 'admin' || mode === a.approver_type || (mode === 'teacher' && a.approver_type === 'teacher')"
            class="ap-btn approve"
            @click="openResponse('approve', a.id)"
          >{{ t('approval.approve') }}</button>
          <button
            v-if="mode === 'admin' || mode === a.approver_type || (mode === 'teacher' && a.approver_type === 'teacher')"
            class="ap-btn reject"
            @click="openResponse('reject', a.id)"
          >{{ t('approval.reject') }}</button>
          <button
            v-if="canEscalate(a)"
            class="ap-btn escalate"
            @click="openResponse('escalate', a.id)"
          >{{ t('approval.escalate') }}</button>
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <div v-if="responseModal?.show" class="ap-modal-overlay" @click.self="responseModal = null">
      <div class="ap-modal">
        <h3>{{ responseModal.type === 'approve' ? t('approval.approve') : responseModal.type === 'reject' ? t('approval.reject') : t('approval.escalate') }}</h3>
        <textarea v-model="responseText" class="ap-textarea" :placeholder="responseModal.type === 'approve' ? t('approval.approveReason') : responseModal.type === 'reject' ? t('approval.rejectReason') : t('approval.escalateReason')" rows="3"></textarea>
        <p v-if="submitMsg && !submitSuccess" class="ap-form-error">{{ submitMsg }}</p>
        <div class="ap-modal-actions">
          <button class="ap-btn-cancel" @click="responseModal = null">{{ t('approval.cancel') }}</button>
          <button class="ap-btn-confirm" :disabled="submitting" @click="handleResponse">{{ submitting ? '...' : t('approval.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approvals-panel { color: #e2e8f0; }
.ap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.ap-header h3 { margin: 0; font-size: 1.1rem; }
.ap-controls { display: flex; align-items: center; gap: 0.8rem; }
.ap-toggle { display: flex; align-items: center; gap: 0.3rem; font-size: 0.82rem; color: #94a3b8; cursor: pointer; }
.ap-toggle input { cursor: pointer; }
.ap-refresh { padding: 0.35rem 0.7rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(15,23,42,0.6); color: #94a3b8; cursor: pointer; font-size: 0.78rem; font-family: inherit; }
.ap-refresh:hover { background: rgba(255,255,255,0.05); }

.ap-loading { display: flex; justify-content: center; padding: 2rem; }
.spinner { width: 32px; height: 32px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ap-error { text-align: center; color: #f87171; padding: 1.5rem; }
.ap-empty { text-align: center; padding: 2.5rem; color: #475569; }
.ap-empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

.ap-list { display: flex; flex-direction: column; gap: 0.6rem; }
.ap-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; overflow: hidden; }
.ap-card.pending { border-color: rgba(245,158,11,0.15); }
.ap-card.approved { border-color: rgba(34,197,94,0.15); }
.ap-card.rejected { border-color: rgba(239,68,68,0.15); }
.ap-card.escalated, .ap-card.auto_escalated { border-color: rgba(168,85,247,0.15); }

.ap-card-header { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: rgba(0,0,0,0.2); }
.ap-type { font-size: 0.82rem; font-weight: 700; color: #c7d2fe; }
.ap-status { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.72rem; font-weight: 700; }
.ap-status.pending { background: rgba(245,158,11,0.15); color: #fcd34d; }
.ap-status.approved { background: rgba(34,197,94,0.15); color: #86efac; }
.ap-status.rejected { background: rgba(239,68,68,0.15); color: #fca5a5; }
.ap-status.escalated, .ap-status.auto_escalated { background: rgba(168,85,247,0.15); color: #c4b5fd; }

.ap-card-body { padding: 0.7rem 0.8rem; }
.ap-title { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem; }
.ap-desc { font-size: 0.82rem; color: #94a3b8; margin: 0 0 0.5rem; }
.ap-meta { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 0.4rem; }
.ap-meta-item { font-size: 0.75rem; color: #64748b; }
.ap-meta-item strong { color: #94a3b8; }
.ap-response { font-size: 0.78rem; color: #86efac; background: rgba(34,197,94,0.06); padding: 0.3rem 0.5rem; border-radius: 0.3rem; margin-bottom: 0.3rem; }
.ap-escalation { font-size: 0.78rem; color: #c4b5fd; background: rgba(168,85,247,0.06); padding: 0.3rem 0.5rem; border-radius: 0.3rem; margin-bottom: 0.3rem; }
.ap-date { font-size: 0.68rem; color: #475569; }

.ap-actions { display: flex; gap: 0.4rem; padding: 0.5rem 0.8rem; border-top: 1px solid rgba(255,255,255,0.04); }
.ap-btn { padding: 0.35rem 0.7rem; border-radius: 0.35rem; border: none; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.ap-btn.approve { background: rgba(34,197,94,0.15); color: #86efac; }
.ap-btn.approve:hover { background: rgba(34,197,94,0.25); }
.ap-btn.reject { background: rgba(239,68,68,0.15); color: #fca5a5; }
.ap-btn.reject:hover { background: rgba(239,68,68,0.25); }
.ap-btn.escalate { background: rgba(168,85,247,0.15); color: #c4b5fd; }
.ap-btn.escalate:hover { background: rgba(168,85,247,0.25); }

.ap-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.ap-modal { background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 400px; display: flex; flex-direction: column; gap: 0.7rem; }
.ap-modal h3 { margin: 0; font-size: 1rem; color: #f1f5f9; text-align: center; }
.ap-textarea { padding: 0.6rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-size: 0.85rem; font-family: inherit; resize: vertical; }
.ap-form-error { color: #f87171; font-size: 0.78rem; text-align: center; margin: 0; }
.ap-modal-actions { display: flex; gap: 0.5rem; }
.ap-btn-cancel { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.ap-btn-confirm { flex: 1; padding: 0.5rem; border-radius: 0.4rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.ap-btn-confirm:disabled { opacity: 0.6; cursor: wait; }
</style>
