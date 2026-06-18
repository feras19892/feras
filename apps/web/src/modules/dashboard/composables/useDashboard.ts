import { ref, onMounted } from 'vue';

export function useDashboard() {
  const stats = ref({ users: 0, orders: 0, revenue: 0 });

  onMounted(async () => {
    // TODO: جلب البيانات من API
    stats.value = { users: 120, orders: 45, revenue: 8900 };
  });

  return { stats };
}
