import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from './useI18n';
import {
  getAdminUsers,
  getAdminStats,
  getAdminClasses,
  getAdminReports,
  getAdminFeedback,
  deleteUser,
  updateUserRole,
  createAdminUser,
  deleteAdminClass,
} from '../services/admin.service';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

interface AdminClassItem {
  id: string;
  name: string;
  code: string;
  teacher_name: string;
  student_count: number;
  created_at?: string;
}

interface AdminReportItem {
  id: number;
  student_name: string;
  experiment_name: string;
  class_name: string;
  teacher_name: string;
  status: string;
  grade?: number | null;
  submitted_at?: string;
}

interface AdminFeedbackItem {
  id: number;
  type: string;
  user_name: string;
  experiment_name?: string;
  rating?: number | null;
  message: string;
  status: string;
  created_at?: string;
}

interface AdminStats {
  users: { total: number; byRole: { role: string; count: number }[] };
  classes: { total: number };
  reports: { total: number; graded: number; pending: number; resubmitted: number; average: number };
}

export function useAdmin() {
  const { t } = useI18n();
  const loading = ref(false);
  const errorMsg = ref('');

  const users = ref<AdminUser[]>([]);
  const classes = ref<AdminClassItem[]>([]);
  const reports = ref<AdminReportItem[]>([]);
  const feedback = ref<AdminFeedbackItem[]>([]);
  const stats = ref<AdminStats | null>(null);

  async function loadAll() {
    loading.value = true;
    errorMsg.value = '';
    try {
      const [u, s, c, r, f] = await Promise.all([
        getAdminUsers(),
        getAdminStats(),
        getAdminClasses(),
        getAdminReports(),
        getAdminFeedback(),
      ]);
      if (u.success) users.value = u.users as unknown as AdminUser[];
      if (s.success) stats.value = s.stats as unknown as AdminStats;
      if (c.success) classes.value = c.classes as unknown as AdminClassItem[];
      if (r.success) reports.value = r.reports as unknown as AdminReportItem[];
      if (f.success) feedback.value = f.feedback as unknown as AdminFeedbackItem[];
    } catch (err: unknown) {
      console.error('admin load failed:', err);
      errorMsg.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
    } finally {
      loading.value = false;
    }
  }

  async function handleRemoveUser(id: number) {
    if (!confirm(t('admin.confirmDeleteUser'))) return;
    const res = await deleteUser(id);
    if (res.success) loadAll();
  }

  async function handleChangeRole(id: number, role: string) {
    const res = await updateUserRole(id, role);
    if (res.success) loadAll();
  }

  async function handleAddUser(name: string, email: string, password: string, role: string) {
    const res = await createAdminUser(name, email, password, role);
    if (res.success) loadAll();
  }

  async function handleRemoveClass(id: string) {
    if (!confirm(t('admin.confirmDeleteClass'))) return;
    const res = await deleteAdminClass(id);
    if (res.success) loadAll();
  }

  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    refreshTimer = setInterval(() => { loadAll(); }, 60000);
  });
  onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer); });

  return {
    loading,
    errorMsg,
    users,
    classes,
    reports,
    feedback,
    stats,
    loadAll,
    handleRemoveUser,
    handleChangeRole,
    handleAddUser,
    handleRemoveClass,
  };
}
