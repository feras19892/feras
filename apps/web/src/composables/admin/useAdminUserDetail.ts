import { ref } from 'vue';
import { getAdminUserFull, addAdminNote, sendAdminWarning, banUser, unbanUser } from '../../services/admin.service';

export function useAdminUserDetail() {
  const profile = ref<Record<string, unknown> | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function load(userId: number) {
    loading.value = true;
    error.value = '';
    try {
      const res = await getAdminUserFull(userId);
      if (res.success) profile.value = res;
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : '') || 'فشل التحميل';
    } finally {
      loading.value = false;
    }
  }

  async function ban(userId: number, reason: string) {
    const res = await banUser(userId, reason);
    if (res.success) load(userId);
  }

  async function unban(userId: number) {
    const res = await unbanUser(userId);
    if (res.success) load(userId);
  }

  async function sendWarning(userId: number, title: string, message: string, severity: string) {
    const res = await sendAdminWarning(userId, title, message, severity);
    if (res.success) load(userId);
  }

  async function addNote(userId: number, note: string) {
    const res = await addAdminNote(userId, note);
    if (res.success) load(userId);
  }

  return { profile, loading, error, load, ban, unban, sendWarning, addNote };
}
