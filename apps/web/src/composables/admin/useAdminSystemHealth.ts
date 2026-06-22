import { ref } from 'vue';
import { getAdminSystemHealth, type AdminSystemHealth } from '../../services/admin.service';

export function useAdminSystemHealth() {
  const health = ref<AdminSystemHealth | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const res = await getAdminSystemHealth();
      if (res.success) health.value = res.health;
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : '') || 'فشل التحميل';
    } finally {
      loading.value = false;
    }
  }

  return { health, loading, error, load };
}
