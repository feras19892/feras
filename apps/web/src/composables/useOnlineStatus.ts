import { ref, onMounted, onUnmounted } from 'vue';
import { fetchJson } from '../services/http';

export function useOnlineStatus(intervalMs = 30000) {
  const isOnline = ref(true);
  const onlineUserCount = ref(0);
  const onlineUserIds = ref<Set<number>>(new Set());
  let timer: ReturnType<typeof setInterval> | null = null;

  async function check() {
    try {
      await fetchJson<{ status: string }>('/api/health');
      isOnline.value = true;
    } catch {
      isOnline.value = false;
    }
  }

  async function refreshOnlineCount() {
    try {
      const res = await fetchJson<{ success: boolean; sessions: { user_id: number }[] }>('/api/admin/sessions');
      if (res.success && res.sessions) {
        const ids = new Set(res.sessions.map(s => s.user_id));
        onlineUserIds.value = ids;
        onlineUserCount.value = ids.size;
      }
    } catch {
      /* ignore — keep last value */
    }
  }

  onMounted(() => {
    check();
    refreshOnlineCount();
    timer = setInterval(() => {
      check();
      refreshOnlineCount();
    }, intervalMs);
  });

  onUnmounted(() => { if (timer) clearInterval(timer); });

  return { isOnline, onlineUserCount, onlineUserIds, refreshOnlineCount };
}
