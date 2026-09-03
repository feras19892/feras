import { ref } from 'vue';
import { useI18n } from '../useI18n';
import { useToast } from '../useToast';
import { useAdminStore } from '../../stores/admin.store';
import { getAdminUserFull, addAdminNote, sendAdminWarning, type AdminUserFull } from '../../services/admin.service';

export function useAdminUserDetail() {
  const { t } = useI18n();
  const toast = useToast();
  const adminStore = useAdminStore();
  const profile = ref<AdminUserFull | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function load(userId: number) {
    loading.value = true;
    error.value = '';
    try {
      const res = await getAdminUserFull(userId);
      if (res.success) profile.value = res;
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : '') || t('admin.loadError');
      toast.error(error.value);
    } finally {
      loading.value = false;
    }
  }

  async function ban(userId: number, reason: string) {
    const ok = await adminStore.banUser(userId, reason);
    if (ok) load(userId);
  }

  async function unban(userId: number) {
    const ok = await adminStore.unbanUser(userId);
    if (ok) load(userId);
  }

  async function sendWarning(userId: number, title: string, message: string, severity: string) {
    try {
      const res = await sendAdminWarning(userId, title, message, severity);
      if (res.success) {
        load(userId);
        toast.success(t('admin.warningSent', 'تم إرسال التحذير'));
      } else {
        toast.error(t('admin.warningFailed', 'فشل إرسال التحذير'));
      }
    } catch {
      toast.error(t('admin.warningFailed', 'فشل إرسال التحذير'));
    }
  }

  async function addNote(userId: number, note: string) {
    try {
      const res = await addAdminNote(userId, note);
      if (res.success) {
        load(userId);
        toast.success(t('admin.noteAdded', 'تمت إضافة الملاحظة'));
      } else {
        toast.error(t('admin.noteFailed', 'فشل إضافة الملاحظة'));
      }
    } catch {
      toast.error(t('admin.noteFailed', 'فشل إضافة الملاحظة'));
    }
  }

  return { profile, loading, error, load, ban, unban, sendWarning, addNote };
}
