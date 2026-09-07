import { ref, onMounted, onUnmounted } from 'vue';
import { fetchJson } from '../services/http';

export function useOnlineStatus(intervalMs = 30000) {
  const isOnline = ref(true);
  const onlineUserCount = ref(0);
  const onlineUserIds = ref<Set<number>>(new Set());
  let timer: ReturnType<typeof setInterval> | null = null;
  let isMounted = false;
  const activeControllers: AbortController[] = [];

  async function check() {
    if (!isMounted) return;
    const controller = new AbortController();
    activeControllers.push(controller);
    try {
      await fetchJson<{ status: string }>('/api/health', { signal: controller.signal });
      if (isMounted) isOnline.value = true;
    } catch {
      if (isMounted) isOnline.value = false;
    } finally {
      const i = activeControllers.indexOf(controller);
      if (i !== -1) activeControllers.splice(i, 1);
    }
  }

  async function refreshOnlineCount() {
    if (!isMounted) return;
    const controller = new AbortController();
    activeControllers.push(controller);
    try {
      const res = await fetchJson<{ success: boolean; sessions: { user_id: number }[] }>('/api/admin/sessions', { signal: controller.signal });
      if (res.success && res.sessions) {
        const ids = new Set(res.sessions.map(s => s.user_id));
        if (isMounted) {
          onlineUserIds.value = ids;
          onlineUserCount.value = ids.size;
        }
      }
    } catch {
      /* ignore — keep last value */
    } finally {
      const i = activeControllers.indexOf(controller);
      if (i !== -1) activeControllers.splice(i, 1);
    }
  }

  onMounted(() => {
    isMounted = true;
    check();
    refreshOnlineCount();
    timer = setInterval(() => {
      check();
      refreshOnlineCount();
    }, intervalMs);
  });

  onUnmounted(() => {
    isMounted = false;
    activeControllers.forEach(c => c.abort());
    activeControllers.length = 0;
    if (timer) clearInterval(timer);
  });

  return { isOnline, onlineUserCount, onlineUserIds, refreshOnlineCount };
}
