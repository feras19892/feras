import { ref } from 'vue';
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

export function useAdmin() {
  const loading = ref(false);
  const errorMsg = ref('');

  const users = ref<any[]>([]);
  const classes = ref<any[]>([]);
  const reports = ref<any[]>([]);
  const feedback = ref<any[]>([]);
  const stats = ref<any>(null);

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
    } catch (err: any) {
      console.error('admin load failed:', err);
      errorMsg.value = err?.message || 'فشل تحميل البيانات';
    } finally {
      loading.value = false;
    }
  }

  async function handleRemoveUser(id: number) {
    if (!confirm('هل تريد حذف هذا المستخدم؟ لا يمكن التراجع.')) return;
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
    if (!confirm('هل تريد حذف هذا الفصل؟ سيُحذف كل الطلاب والتقارير المرتبطة.')) return;
    const res = await deleteAdminClass(id);
    if (res.success) loadAll();
  }

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
