<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirmDialog } from '../../composables/useConfirmDialog';
import { updateAdminReportGrade, deleteAdminReport } from '../../services/admin.service';
import ReportPreviewModal from '../shared/ReportPreviewModal.vue';
interface AdminReportItem {
  id: number;
  student_name: string;
  student_email?: string;
  experiment_name: string;
  class_name: string;
  teacher_name: string;
  status: string;
  grade?: number | null;
  submitted_at?: string;
}

const props = defineProps<{ reports: AdminReportItem[]; initialSearch?: string }>();
const emit = defineEmits<{ (e: 'refresh'): void; (e: 'delete', id: number): void }>();

const router = useRouter();
const searchQuery = ref(props.initialSearch || '');
watch(() => props.initialSearch, (v) => { if (v !== undefined) searchQuery.value = v; });
const filterStatus = ref<'all' | 'submitted' | 'graded' | 'resubmitted' | 'draft'>('all');
const showGradeModal = ref(false);
const gradeReport = ref<AdminReportItem | null>(null);
const gradeValue = ref<number>(0);
const gradeFeedback = ref('');
const gradeLoading = ref(false);
const gradeError = ref('');

const filteredReports = computed(() => {
  let list = props.reports;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(r =>
      r.student_name?.toLowerCase().includes(q) ||
      r.experiment_name?.toLowerCase().includes(q) ||
      r.class_name?.toLowerCase().includes(q)
    );
  }
  if (filterStatus.value !== 'all') {
    list = list.filter(r => r.status === filterStatus.value);
  }
  return list;
});

function statusLabel(status: string) {
  switch (status) {
    case 'submitted': return t('admin.statusSubmitted');
    case 'graded': return t('admin.statusGraded');
    case 'resubmitted': return t('admin.statusResubmitted');
    case 'draft': return t('admin.statusDraft');
    default: return status;
  }
}

const previewReportId = ref<number | null>(null);
function openPreview(id: number) {
  previewReportId.value = id;
}
function closePreview() {
  previewReportId.value = null;
}
function openFullFromPreview(id: number) {
  closePreview();
  router.push(`/report/${id}`);
}

const { confirmDialog } = useConfirmDialog();

async function onDeleteReport(id: number) {
  const ok = await confirmDialog({ message: t('admin.confirmDeleteReport'), variant: 'danger' });
  if (!ok) return;
  const res = await deleteAdminReport(id);
  if (res.success) emit('refresh');
}

function openGradeModal(r: AdminReportItem) {
  gradeReport.value = r;
  gradeValue.value = r.grade ?? 0;
  gradeFeedback.value = '';
  gradeError.value = '';
  showGradeModal.value = true;
}

async function saveGrade() {
  if (!gradeReport.value) return;
  gradeLoading.value = true;
  gradeError.value = '';
  try {
    const res = await updateAdminReportGrade(gradeReport.value.id, gradeValue.value, gradeFeedback.value);
    if (!res.success) {
      gradeError.value = res.message || 'Failed';
    } else {
      showGradeModal.value = false;
      emit('refresh');
    }
  } catch (err: unknown) {
    gradeError.value = (err instanceof Error ? err.message : '') || 'Failed';
  } finally {
    gradeLoading.value = false;
  }
}
</script>

<template>
  <div class="section">
    <div class="section-header">
      <h3>{{ t('admin.reports', { count: reports.length }) }}</h3>
      <div class="filters-row">
        <input v-model="searchQuery" class="search-input" :placeholder="t('admin.searchReports')" />
        <select v-model="filterStatus">
          <option value="all">{{ t('admin.allStatuses') }}</option>
          <option value="submitted">{{ t('admin.statusSubmitted') }}</option>
          <option value="graded">{{ t('admin.statusGraded') }}</option>
          <option value="resubmitted">{{ t('admin.statusResubmitted') }}</option>
          <option value="draft">{{ t('admin.statusDraft') }}</option>
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>{{ t('adminUser.student') }}</th><th>{{ t('adminUser.experiment') }}</th><th>{{ t('adminUser.classLabel') }}</th><th>{{ t('admin.teacher') }}</th><th>{{ t('admin.status') }}</th><th>{{ t('admin.grade') }}</th><th>{{ t('admin.date') }}</th><th>{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredReports" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.student_name }}</td>
            <td>{{ r.experiment_name }}</td>
            <td>{{ r.class_name }}</td>
            <td>{{ r.teacher_name }}</td>
            <td>{{ statusLabel(r.status) }}</td>
            <td>{{ r.grade ?? '—' }}</td>
            <td>{{ r.submitted_at?.slice(0, 10) }}</td>
            <td class="action-cell">
              <button class="btn-view" @click="openPreview(r.id)">👁️</button>
              <button class="btn-edit" @click="openGradeModal(r)">{{ t('admin.gradeReport') }}</button>
              <button class="btn-danger" @click="onDeleteReport(r.id)">{{ t('admin.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="filteredReports.length === 0" class="empty">{{ t('admin.noResults') }}</p>
    </div>

    <!-- Grade Modal -->
    <div v-if="showGradeModal" class="modal-overlay" @click.self="showGradeModal = false">
      <div class="modal-content">
        <h4>{{ t('admin.gradeReport') }} — #{{ gradeReport?.id }}</h4>
        <p class="modal-subtitle">{{ gradeReport?.student_name }} — {{ gradeReport?.experiment_name }}</p>
        <div class="form-row">
          <label>{{ t('admin.grade') }} (0-100)</label>
          <input v-model.number="gradeValue" type="number" min="0" max="100" />
        </div>
        <div class="form-row">
          <label>{{ t('admin.reportFeedback') }}</label>
          <textarea v-model="gradeFeedback" rows="3" />
        </div>
        <p v-if="gradeError" class="msg error">{{ gradeError }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showGradeModal = false">{{ t('admin.cancel') }}</button>
          <button class="btn-submit" :disabled="gradeLoading" @click="saveGrade">{{ gradeLoading ? '...' : t('admin.save') }}</button>
        </div>
      </div>
    </div>

    <ReportPreviewModal
      :report-id="previewReportId"
      @close="closePreview"
      @open-full="openFullFromPreview"
    />
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }
.filters-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.search-input { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; min-width: 250px; }
.filters-row select { padding: 0.4rem 0.6rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: end; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.action-cell { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.btn-view { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(59,130,246,0.15); color: #60a5fa; cursor: pointer; font-family: inherit; font-size: 0.78rem; }
.btn-view:hover { background: rgba(59,130,246,0.25); }
.btn-edit { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(251,191,36,0.15); color: #fbbf24; cursor: pointer; font-family: inherit; font-size: 0.78rem; }
.btn-edit:hover { background: rgba(251,191,36,0.25); }
.btn-danger { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; font-family: inherit; font-size: 0.78rem; }
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.empty { text-align: center; color: #64748b; padding: 2rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem; width: 100%; max-width: 420px; }
.modal-content h4 { margin: 0 0 0.25rem; color: #e2e8f0; font-size: 1rem; }
.modal-subtitle { margin: 0 0 1rem; font-size: 0.8rem; color: #94a3b8; }
.form-row { margin-bottom: 0.75rem; }
.form-row label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.25rem; }
.form-row input, .form-row textarea { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; box-sizing: border-box; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.modal-actions button { flex: 1; padding: 0.55rem; border-radius: 0.5rem; font-family: inherit; font-weight: 700; cursor: pointer; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.msg.error { color: #f87171; font-size: 0.85rem; margin: 0.5rem 0; }
</style>
