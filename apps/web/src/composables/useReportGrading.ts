import { ref } from 'vue';
import {
  getReports,
  gradeReport,
  addComment,
  getComments,
  getGradeHistory,
  markReportSeen,
} from '../services/report.service';
import type { Report, ReportComment, GradeHistoryEntry } from '../services/report.service';

export function useReportGrading() {
  const reports = ref<Report[]>([]);
  const selectedReport = ref<Report | null>(null);
  const comments = ref<ReportComment[]>([]);
  const history = ref<GradeHistoryEntry[]>([]);
  const loading = ref(false);

  async function loadClassReports(classId: string) {
    loading.value = true;
    try {
      const res = await getReports({ class_id: classId });
      if (res.success) reports.value = res.reports;
    } catch (err) {
      if (import.meta.env.DEV) console.error('load class reports failed:', err);
    }
    loading.value = false;
  }

  async function selectReport(report: Report) {
    selectedReport.value = report;
    if (!report.teacher_seen) {
      await markReportSeen(report.id);
    }
    await Promise.all([loadComments(report.id), loadHistory(report.id)]);
  }

  async function grade(reportId: number, gradeValue: number, feedback: string) {
    try {
      const res = await gradeReport(reportId, { grade: gradeValue, feedback });
      if (res.success) await loadClassReports(selectedReport.value?.class_id || '');
    } catch (err) {
      if (import.meta.env.DEV) console.error('grade failed:', err);
    }
  }

  async function submitComment(reportId: number, content: string) {
    try {
      const res = await addComment(reportId, content);
      if (res.success) await loadComments(reportId);
    } catch (err) {
      if (import.meta.env.DEV) console.error('add comment failed:', err);
    }
  }

  async function loadComments(reportId: number) {
    try {
      const res = await getComments(reportId);
      if (res.success) comments.value = res.comments;
    } catch (err) {
      if (import.meta.env.DEV) console.error('load comments failed:', err);
    }
  }

  async function loadHistory(reportId: number) {
    try {
      const res = await getGradeHistory(reportId);
      if (res.success) history.value = res.history;
    } catch (err) {
      if (import.meta.env.DEV) console.error('load history failed:', err);
    }
  }

  return {
    reports,
    selectedReport,
    comments,
    history,
    loading,
    loadClassReports,
    selectReport,
    grade,
    submitComment,
    loadComments,
    loadHistory,
  };
}
