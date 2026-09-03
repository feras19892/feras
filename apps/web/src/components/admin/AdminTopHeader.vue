<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed } from 'vue';
import AdminNotificationCenter from './AdminNotificationCenter.vue';
import AccountSettingsModal from '../shared/AccountSettingsModal.vue';
import NameRequestBadge from '../shared/NameRequestBadge.vue';
defineProps<{ title: string; dateStr: string }>();
const emit = defineEmits<{ (e: 'back'): void; (e: 'search', q: string): void }>();
const showBack = computed(() => window.history.state?.back !== null && window.history.state?.back !== undefined);
const searchQuery = ref('');
function onSearch() { emit('search', searchQuery.value); }
</script>

<template>
  <header class="admin-topbar">
    <div class="topbar-left">
      <button v-if="showBack" class="back-btn" @click="emit('back')">← {{ t('shared.backToOverview') }}</button>
      <h1 class="topbar-title">{{ title }}</h1>
      <span class="topbar-date">{{ dateStr }}</span>
    </div>
    <div class="topbar-center">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" type="text" :placeholder="t('admin.quickSearch')" class="search-input" @input="onSearch" />
      </div>
    </div>
    <div class="topbar-right">
      <NameRequestBadge />
      <AdminNotificationCenter />
      <AccountSettingsModal />
    </div>
  </header>
</template>

<style scoped>
.admin-topbar {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.6rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);
  background: #0a0f1c; position: sticky; top: 0; z-index: 50;
}
.topbar-left { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
.back-btn { background: transparent; color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); border-radius: 4px; padding: 0.3rem 0.6rem; cursor: pointer; font-size: 0.78rem; font-weight: 600; font-family: inherit; }
.back-btn:hover { background: rgba(99,102,241,0.08); }
.topbar-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #f1f5f9; }
.topbar-date { font-size: 0.7rem; color: #475569; }

.topbar-center { flex: 1; display: flex; justify-content: center; max-width: 400px; }
.search-box { display: flex; align-items: center; gap: 0.4rem; width: 100%; padding: 0.35rem 0.7rem; background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; }
.search-icon { font-size: 0.8rem; opacity: 0.5; }
.search-input { flex: 1; border: none; background: transparent; color: #e2e8f0; font-size: 0.8rem; outline: none; font-family: inherit; }
.search-input::placeholder { color: #475569; }

.topbar-right { display: flex; align-items: center; gap: 0.3rem; flex-shrink: 0; }

@media (max-width: 768px) {
  .admin-topbar { padding: 0.5rem 0.8rem; gap: 0.5rem; }
  .topbar-center { display: none; }
  .topbar-date { display: none; }
}
</style>
