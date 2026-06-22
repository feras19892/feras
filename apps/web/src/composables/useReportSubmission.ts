import { ref } from 'vue';
import { createReport, resubmitReport } from '../services/report.service';
import { useI18n } from '../composables/useI18n';
import type { StudentInfo } from '../stores/analysis.store';
import type { AnalysisColumnMeta, AnalysisEquation, AnalysisPlotConfig } from '../types/physics';

export function useReportSubmission() {
  const { t } = useI18n();
  const submitting = ref(false);
  const error = ref('');

  async function submitReport(data: {
    classId: string;
    experimentType: string;
    experimentName: string;
    readings: Record<string, unknown>[];
    params?: Record<string, unknown>;
    studentInfo: StudentInfo;
    conclusion: { conclusion: string; errors: string; improvements: string };
    columns: AnalysisColumnMeta[];
    equations: AnalysisEquation[];
    plots: AnalysisPlotConfig[];
    chartSnapshot?: string;
  }): Promise<boolean> {
    submitting.value = true;
    error.value = '';

    try {
      const res = await createReport({
        class_id: data.classId,
        experiment_type: data.experimentType,
        experiment_name: data.experimentName,
        readings: JSON.stringify(data.readings),
        params: data.params ? JSON.stringify(data.params) : undefined,
        student_info: JSON.stringify(data.studentInfo),
        conclusion: data.conclusion.conclusion,
        conclusion_errors: data.conclusion.errors,
        conclusion_improvements: data.conclusion.improvements,
        columns: JSON.stringify(data.columns),
        equations: JSON.stringify(data.equations),
        plots: JSON.stringify(data.plots),
        chart_snapshot: data.chartSnapshot,
      });

      if (!res.success) {
        error.value = t('analysis.submitFailed');
        return false;
      }
      return true;
    } catch (err) {
      error.value = t('analysis.serverConnectionFailed');
      return false;
    } finally {
      submitting.value = false;
    }
  }

  async function resubmit(reportId: number, data: Parameters<typeof submitReport>[0]): Promise<boolean> {
    submitting.value = true;
    error.value = '';

    try {
      const res = await resubmitReport(reportId, {
        class_id: data.classId,
        experiment_type: data.experimentType,
        experiment_name: data.experimentName,
        readings: JSON.stringify(data.readings),
        params: data.params ? JSON.stringify(data.params) : undefined,
        student_info: JSON.stringify(data.studentInfo),
        conclusion: data.conclusion.conclusion,
        conclusion_errors: data.conclusion.errors,
        conclusion_improvements: data.conclusion.improvements,
        columns: JSON.stringify(data.columns),
        equations: JSON.stringify(data.equations),
        plots: JSON.stringify(data.plots),
        chart_snapshot: data.chartSnapshot,
      });

      if (!res.success) {
        error.value = t('analysis.resubmitFailed');
        return false;
      }
      return true;
    } catch (err) {
      error.value = t('analysis.serverConnectionFailed');
      return false;
    } finally {
      submitting.value = false;
    }
  }

  return { submitting, error, submitReport, resubmit };
}
