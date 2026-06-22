import { ref } from 'vue';
import { useI18n } from '../useI18n';
import {
  getAdminUsers,
  deleteUser,
  updateUserRole,
  createAdminUser,
  banUser,
  unbanUser,
  addAdminNote,
  sendAdminWarning,
  type AdminUser,
} from '../../services/admin.service';

export function useAdminUsers() {
  const { t } = useI18n();
  const users = ref<AdminUser[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const res = await getAdminUsers();
      if (res.success) users.value = res.users;
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number) {
    if (!confirm(t('admin.confirmDeleteUser'))) return;
    const res = await deleteUser(id);
    if (res.success) load();
  }

  async function changeRole(id: number, role: string) {
    const res = await updateUserRole(id, role);
    if (res.success) load();
  }

  async function add(name: string, email: string, password: string, role: string) {
    const res = await createAdminUser(name, email, password, role);
    if (res.success) load();
  }

  async function ban(id: number, reason: string) {
    const res = await banUser(id, reason);
    if (res.success) load();
  }

  async function unban(id: number) {
    const res = await unbanUser(id);
    if (res.success) load();
  }

  async function sendWarning(userId: number, title: string, message: string, severity: string) {
    return sendAdminWarning(userId, title, message, severity);
  }

  async function addNote(userId: number, note: string) {
    return addAdminNote(userId, note);
  }

  return { users, loading, error, load, remove, changeRole, add, ban, unban, sendWarning, addNote };
}
