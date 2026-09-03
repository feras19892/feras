import { ref, type Ref } from 'vue';
import { fetchJson } from '../../services/http';
import { useI18n } from '../../composables/useI18n';
import type { Report } from '../../services/report.service';

export function useGradingKeyboard(
  filteredReports: Ref<Report[]>,
  gradeOpen: Ref<boolean>,
  previewReportId: Ref<number | null>,
  openView: (r: Report) => void,
  openGrade: (r: Report) => void,
  openPreview: (r: Report) => void,
) {
  const focusedIndex = ref(-1);

  function handleKeydown(e: KeyboardEvent) {
    if (gradeOpen.value || previewReportId.value !== null) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const list = filteredReports.value;
    if (list.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex.value = Math.min(list.length - 1, focusedIndex.value + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex.value = Math.max(0, focusedIndex.value - 1);
    } else if (e.key === 'Enter' && focusedIndex.value >= 0) {
      e.preventDefault();
      openView(list[focusedIndex.value]);
    } else if (e.key === 'g' && focusedIndex.value >= 0) {
      e.preventDefault();
      openGrade(list[focusedIndex.value]);
    } else if (e.key === 'p' && focusedIndex.value >= 0) {
      e.preventDefault();
      openPreview(list[focusedIndex.value]);
    }
  }

  return { focusedIndex, handleKeydown };
}

export function useBulkGrading(
  selectedIds: Ref<Set<number>>,
  filteredReports: Ref<Report[]>,
  loadReports: () => void,
  emitGraded: () => void,
) {
  const { t } = useI18n();
  const bulkMode = ref(false);
  const bulkGrade = ref<number | null>(null);
  const bulkFeedback = ref('');
  const bulkSaving = ref(false);
  const bulkError = ref('');

  function toggleSelect(id: number) {
    if (selectedIds.value.has(id)) selectedIds.value.delete(id);
    else selectedIds.value.add(id);
    selectedIds.value = new Set(selectedIds.value);
  }

  function toggleAll() {
    if (selectedIds.value.size === filteredReports.value.length) {
      selectedIds.value = new Set();
    } else {
      selectedIds.value = new Set(filteredReports.value.map(r => r.id));
    }
  }

  async function submitBulkGrade() {
    if (bulkGrade.value === null || selectedIds.value.size === 0) return;
    bulkSaving.value = true;
    bulkError.value = '';
    try {
      const res = await fetchJson<{ success: boolean }>('/api/reports/bulk-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: Array.from(selectedIds.value).map(id => ({
            report_id: id,
            grade: bulkGrade.value!,
            feedback: bulkFeedback.value || undefined,
          })),
        }),
      });
      if (res.success) {
        selectedIds.value = new Set();
        bulkMode.value = false;
        bulkGrade.value = null;
        bulkFeedback.value = '';
        loadReports();
        emitGraded();
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('bulk grade failed:', err);
      bulkError.value = t('teacher.bulkGradeFailed');
    }
    bulkSaving.value = false;
  }

  return {
    bulkMode, bulkGrade, bulkFeedback, bulkSaving, bulkError,
    toggleSelect, toggleAll, submitBulkGrade,
  };
}
