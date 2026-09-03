<template>
  <div class="dash-page">
    <h2>{{ t('admin.notifications.title') }}</h2>

    <div class="sub-tabs">
      <button
        v-for="tb in tabs"
        :key="tb.id"
        :class="['sub-tab', { active: activeTab === tb.id }]"
        @click="activeTab = tb.id"
      >
        {{ tb.label }}
      </button>
    </div>

    <div class="sub-tab-content">
      <NotificationsTab v-if="activeTab === 'inbox'" role="admin" />
      <NotificationComposer v-else-if="activeTab === 'compose'" />
      <NotificationHistory v-else-if="activeTab === 'history'" />
      <AnnouncementsPanel v-else-if="activeTab === 'announcements'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, computed } from 'vue'

import NotificationComposer from '@/components/admin/NotificationComposer.vue'
import NotificationHistory from '@/components/admin/NotificationHistory.vue'
import AnnouncementsPanel from '@/components/shared/AnnouncementsPanel.vue'
import NotificationsTab from '@/components/shared/NotificationsTab.vue'





const activeTab = ref('inbox')

const tabs = computed(() => [
  { id: 'inbox', label: 'صندوق الوارد' },
  { id: 'compose', label: t('admin.notifications.tabCompose') },
  { id: 'history', label: t('admin.notifications.tabHistory') },
  { id: 'announcements', label: t('admin.notifications.tabAnnouncements') },
])
</script>

<style scoped>
.dash-page { padding: 1rem; }
h2 { margin: 0 0 1rem; color: #f1f5f9; }
.sub-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.sub-tab { padding: 0.5rem 1rem; border: none; border-radius: 8px; background: #1e293b; color: #94a3b8; cursor: pointer; font-family: inherit; }
.sub-tab.active { background: #6366f1; color: #fff; }
.sub-tab-content { display: flex; flex-direction: column; gap: 1rem; }
</style>
