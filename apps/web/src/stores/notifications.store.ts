import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '../modules/auth/stores/auth';
import {
  getPendingApprovals,
  getSchoolPendingApprovals,
  getMyApprovals,
  adminGetAllApprovals,
  type ApprovalRequest,
} from '../services/approval.service';
import { getAdminFlaggedMessages, type ClassMessage } from '../services/chat.service';
import { useSSE, type SSEClientEvent } from '../services/sse.service';

export const useNotificationsStore = defineStore('notifications', () => {
  const auth = useAuthStore();
  const { connectSSE, onEvent } = useSSE();

  const approvals = ref<ApprovalRequest[]>([]);
  const flaggedMessages = ref<(ClassMessage & { class_name?: string })[]>([]);
  const lastApprovalCount = ref(0);
  const lastFlaggedCount = ref(0);
  const loading = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;
  let sseCleanup: (() => void) | null = null;

  const pendingApprovals = computed(() =>
    approvals.value.filter(a => a.status === 'pending')
  );

  const pendingCount = computed(() => pendingApprovals.value.length);

  const escalatedApprovals = computed(() =>
    approvals.value.filter(a => a.status === 'escalated' || a.status === 'auto_escalated')
  );

  const flaggedCount = computed(() => flaggedMessages.value.length);

  const hasNewApprovals = computed(() => pendingCount.value > lastApprovalCount.value);
  const hasNewFlagged = computed(() => flaggedCount.value > lastFlaggedCount.value);

  async function loadApprovals() {
    try {
      if (auth.isSchool) {
        const res = await getSchoolPendingApprovals();
        if (res.success) {
          approvals.value = res.pending;
          lastApprovalCount.value = pendingCount.value;
        }
      } else if (auth.isAdmin) {
        const res = await adminGetAllApprovals();
        if (res.success) {
          approvals.value = res.approvals;
          lastApprovalCount.value = pendingCount.value;
        }
      } else if (auth.isTeacher) {
        const res = await getPendingApprovals();
        if (res.success) {
          approvals.value = res.pending;
          lastApprovalCount.value = pendingCount.value;
        }
      } else if (auth.isStudent) {
        const res = await getMyApprovals();
        if (res.success) {
          approvals.value = res.approvals.filter(
            a => a.status === 'pending' || a.status === 'escalated' || a.status === 'auto_escalated'
          );
          lastApprovalCount.value = pendingCount.value;
        }
      }
    } catch { /* ignore */ }
  }

  async function loadFlagged() {
    if (!auth.isAdmin) return;
    try {
      const res = await getAdminFlaggedMessages();
      if (res.success) {
        flaggedMessages.value = res.messages;
        lastFlaggedCount.value = flaggedCount.value;
      }
    } catch { /* ignore */ }
  }

  async function refresh() {
    if (loading.value) return;
    loading.value = true;
    await Promise.all([loadApprovals(), loadFlagged()]);
    loading.value = false;
  }

  function handleSSEEvent(event: SSEClientEvent) {
    switch (event.type) {
      case 'approval_created':
      case 'approval_escalated':
      case 'approval_resolved':
        loadApprovals();
        window.dispatchEvent(new CustomEvent('approval:changed'));
        break;
      case 'chat_flagged':
        loadFlagged();
        break;
      case 'report_submitted':
      case 'report_resubmitted':
      case 'report_graded':
        window.dispatchEvent(new CustomEvent('report:changed', { detail: event.payload }));
        break;
      case 'class_frozen':
      case 'class_unfrozen':
        window.dispatchEvent(new CustomEvent('class:changed', { detail: event.payload }));
        break;
    }
  }

  function startPolling(intervalMs = 30000) {
    stopPolling();
    refresh();
    connectSSE();
    sseCleanup = onEvent(handleSSEEvent);
    timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, intervalMs);
  }

  function stopPolling() {
    if (timer) { clearInterval(timer); timer = null; }
    if (sseCleanup) { sseCleanup(); sseCleanup = null; }
  }

  function onApprovalChanged() { loadApprovals(); }
  function onFlaggedChanged() { loadFlagged(); }

  return {
    approvals,
    flaggedMessages,
    pendingApprovals,
    pendingCount,
    escalatedApprovals,
    flaggedCount,
    hasNewApprovals,
    hasNewFlagged,
    loading,
    refresh,
    loadApprovals,
    loadFlagged,
    startPolling,
    stopPolling,
    onApprovalChanged,
    onFlaggedChanged,
  };
});
