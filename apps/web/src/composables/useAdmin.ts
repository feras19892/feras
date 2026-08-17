import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from './useI18n';
import { useToast } from './useToast';
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
  type AdminUser,
  type AdminClassItem,
  type AdminReportItem,
  type AdminFeedbackItem,
  type AdminStats,
} from '../services/admin.service';

export function useAdmin() {
  const { t } = useI18n();
  const toast = useToast();
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
      if (u.success) users.value = u.users;
      if (s.success) stats.value = s.stats;
      if (c.success) classes.value = c.classes;
      if (r.success) reports.value = r.reports;
      if (f.success) feedback.value = f.feedback;
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('admin load failed:', err);
      errorMsg.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
    } finally {
      loading.value = false;
    }
  }

  async function handleRemoveUser(id: number) {
    const res = await deleteUser(id);
    if (res.success) {
      loadAll();
      toast.success(t('admin.delete') + ' ✓');
    } else {
      toast.error(res.message || t('admin.loadError'));
    }
  }

  async function handleChangeRole(id: number, role: string) {
    const res = await updateUserRole(id, role);
    if (res.success) {
      loadAll();
    } else {
      toast.error(res.message || t('admin.loadError'));
    }
  }

  async function handleAddUser(name: string, email: string, password: string, role: string) {
    const res = await createAdminUser(name, email, password, role);
    if (res.success) {
      loadAll();
      toast.success('✓');
    } else {
      toast.error(res.message || t('admin.loadError'));
    }
  }

  async function handleRemoveClass(id: string) {
    const res = await deleteAdminClass(id);
    if (res.success) {
      loadAll();
      toast.success(t('admin.delete') + ' ✓');
    } else {
      toast.error(t('admin.loadError'));
    }
  }

  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    loadAll();
    refreshTimer = setInterval(() => { if (document.visibilityState === 'visible') loadAll(); }, 300000);
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
