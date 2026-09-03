import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAdminStore } from '../stores/admin.store';

export function useAdmin() {
  const store = useAdminStore();
  const {
    loading, errorMsg,
    users, classes, reports, feedback, stats,
    userSearch, userPage, classSearch, reportSearch, reportPage, reportStatusFilter,
  } = storeToRefs(store);

  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    store.loadAll();
    refreshTimer = setInterval(() => { if (document.visibilityState === 'visible') store.loadAll(); }, 300000);
  });
  onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer); });

  return {
    loading, errorMsg,
    users, classes, reports, feedback, stats,
    userSearch, userPage, classSearch, reportSearch, reportPage, reportStatusFilter,
    loadAll: () => store.loadAll(true),
    handleRemoveUser: store.handleRemoveUser,
    handleBulkDelete: store.handleBulkDelete,
    handleChangeRole: store.handleChangeRole,
    handleBulkChangeRole: store.handleBulkChangeRole,
    handleAddUser: store.handleAddUser,
    handleRemoveClass: store.handleRemoveClass,
  };
}
