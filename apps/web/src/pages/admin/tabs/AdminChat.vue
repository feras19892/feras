<template>
  <div class="admin-chat-page">
    <h2 class="page-title">{{ t('common.chatManagement') }}</h2>

    <div class="top-bar">
      <div class="status-card">
        <div class="status-left">
          <span class="status-icon">{{ enabled ? '💬' : '🚫' }}</span>
          <div class="status-text">
            <span class="status-label">{{ t('common.chatStatus') }}</span>
            <span class="status-value">{{ enabled ? t('common.enabled') : t('common.disabled') }}</span>
          </div>
        </div>
        <span :class="['status-badge', enabled ? 'on' : 'off']">
          {{ enabled ? t('common.active') : t('common.inactive') }}
        </span>
        <button :class="['toggle-btn', enabled ? 'disable' : 'enable']" :disabled="toggling" @click="toggle">
          {{ enabled ? t('common.disable') : t('common.enable') }}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">💬</span>
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-lbl">{{ t('common.totalMessages') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🚩</span>
        <span class="stat-num flagged">{{ stats.flagged }}</span>
        <span class="stat-lbl">{{ t('common.violation') }}</span>
      </div>
      <div v-for="c in stats.byClass.slice(0, 3)" :key="c.id" class="stat-card">
        <span class="stat-icon">🏫</span>
        <span class="stat-num">{{ c.msg_count }}</span>
        <span class="stat-lbl">{{ c.name }}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="tabs">
          <button :class="['tab', { active: activeTab === 'all' }]" @click="setTab('all')">{{ t('common.allMessages') }}</button>
          <button :class="['tab', { active: activeTab === 'flagged' }]" @click="setTab('flagged')">{{ t('common.flaggedMessages') }}</button>
        </div>
        <div class="filters">
          <input v-model="searchQuery" class="search-input" :placeholder="t('common.search')" />
          <select v-model="selectedClass" class="class-select">
            <option value="">{{ t('common.allClasses') }}</option>
            <option v-for="c in allClassOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <button class="refresh-btn" @click="load">🔄 {{ t('common.refresh') }}</button>
        </div>
      </div>

      <SkeletonLoader v-if="loading && !paginatedMessages.length" type="cards" :count="3" />
      <div v-else-if="!paginatedMessages.length" class="empty-state">
        <div class="empty-icon">💬</div>
        <p class="empty-title">{{ t('common.noMessages') }}</p>
      </div>
      <div v-else class="message-list">
        <div v-for="msg in paginatedMessages" :key="msg.id" class="message-card" :class="{ flagged: msg.is_flagged }">
          <div class="message-head">
            <span class="message-avatar">{{ roleIcon(msg.user_role) }}</span>
            <span class="message-sender">{{ msg.user_name }}</span>
            <span class="message-role">{{ roleLabel(msg.user_role) }}</span>
            <span class="message-class">{{ msg.class_name || msg.class_id }}</span>
            <span class="message-time">{{ formatDate(msg.created_at) }}</span>
          </div>
          <p class="message-text">{{ msg.content }}</p>
          <p v-if="msg.translated_content && msg.translated_content !== msg.content" class="message-translation">
            <span class="translation-label">الترجمة:</span> {{ msg.translated_content }}
          </p>
          <p v-if="msg.flagged_reason" class="message-reason">{{ msg.flagged_reason }}</p>
          <div class="message-actions">
            <button v-if="msg.is_flagged" class="action-btn unflag" @click="unflagMsg(msg)">{{ t('common.removeWarning') }}</button>
            <button class="action-btn delete" @click="removeMessage(msg.id)">{{ t('common.delete') }}</button>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="page--">{{ t('common.prev') }}</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="page++">{{ t('common.next') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useAdminChat } from '@/composables/admin/useAdminChat'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'


const {
  t,
  enabled,
  toggling,
  stats,
  activeTab,
  searchQuery,
  selectedClass,
  allClassOptions,
  page,
  totalPages,
  paginatedMessages,
  loading,
  roleLabel,
  formatDate,
  setTab,
  toggle,
  removeMessage,
  unflagMsg,
  load,
} = useAdminChat()

function roleIcon(role: string) {
  if (role === 'teacher') return '👨\u200d🏫'
  if (role === 'admin') return '🛡️'
  return '🎓'
}
</script>

<style scoped src="./AdminChat.css"></style>
