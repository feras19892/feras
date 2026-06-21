import { ref } from 'vue';
import { getAdminWarnings, sendAdminWarning } from '../../services/admin.service';

export function useAdminWarnings() {
  const warnings = ref<Record<string, unknown>[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const res = await getAdminWarnings();
      if (res.success) warnings.value = res.warnings;
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : '') || 'فشل التحميل';
    } finally {
      loading.value = false;
    }
  }

  async function send(userId: number, title: string, message: string, severity: string) {
    const res = await sendAdminWarning(userId, title, message, severity);
    if (res.success) load();
  }

  return { warnings, loading, error, load, send };
}
