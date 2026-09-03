<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { useAdminNotificationCenter } from '../../composables/admin/useAdminNotificationCenter';
const {
  open,
  filter,
  messageUnread,
  liveToasts,
  filteredNotifications,
  stats,
  totalUnread,
  unreadCount,
  getIcon,
  getTypeColor,
  formatTime,
  togglePanel,
  markAllRead,
  markOneRead,
  deleteOne,
  togglePin,
  handleNotifClick,
} = useAdminNotificationCenter();
</script>

<template>
  <!-- Notification Bell Button -->
  <div class="admin-notif-trigger" @click="togglePanel">
    <span class="bell-icon">🔔</span>
    <Transition name="badge-pop">
      <span v-if="totalUnread > 0" class="notif-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
    </Transition>
  </div>

  <!-- Slide-out Panel -->
  <Transition name="slide-panel">
    <div v-if="open" class="notif-panel-overlay" @click.self="open = false">
      <div class="notif-panel">
        <!-- Header -->
        <div class="panel-header">
          <div class="header-title">
            <span class="header-icon">🔔</span>
            <h2>{{ t('admin.notifCenter') }}</h2>
          </div>
          <button class="close-btn" @click="open = false">✕</button>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">
            <span class="stat-num">{{ stats.total }}</span>
            <span class="stat-lbl">{{ t('admin.notifAll') }}</span>
          </div>
          <div class="stat-chip unread" :class="{ active: filter === 'unread' }" @click="filter = 'unread'">
            <span class="stat-num">{{ stats.unread }}</span>
            <span class="stat-lbl">{{ t('admin.notifUnread') }}</span>
          </div>
          <div class="stat-chip pinned" :class="{ active: filter === 'pinned' }" @click="filter = 'pinned'">
            <span class="stat-num">{{ stats.pinned }}</span>
            <span class="stat-lbl">{{ t('admin.notifPinned') }}</span>
          </div>
          <div class="stat-chip warn" :class="{ active: filter === 'warnings' }" @click="filter = 'warnings'">
            <span class="stat-num">{{ stats.warnings }}</span>
            <span class="stat-lbl">{{ t('admin.notifWarnings') }}</span>
          </div>
          <div class="stat-chip msg" :class="{ active: filter === 'messages' }" @click="filter = 'messages'">
            <span class="stat-num">{{ messageUnread }}</span>
            <span class="stat-lbl">{{ t('admin.notifMessages') }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="panel-actions">
          <button class="action-btn mark-all" @click="markAllRead" :disabled="unreadCount === 0">
            ✓ {{ t('admin.notifMarkAllRead') }}
          </button>
        </div>

        <!-- Notifications List -->
        <div class="notif-list">
          <div v-if="filteredNotifications.length === 0" class="notif-empty">
            <div class="empty-icon">📭</div>
            <p>{{ t('common.noNotifications') }}</p>
          </div>

          <div
            v-for="n in filteredNotifications"
            :key="n.id"
            class="notif-item"
            :class="{ unread: !n.is_read, pinned: n.is_pinned }"
            @click="handleNotifClick(n)"
          >
            <div class="notif-accent" :style="{ background: getTypeColor(n.type) }"></div>
            <div class="notif-icon-wrap">
              <span class="notif-icon">{{ getIcon(n.type) }}</span>
            </div>
            <div class="notif-body">
              <div class="notif-title-row">
                <span v-if="n.is_pinned" class="pin-badge">📌</span>
                <span class="notif-title">{{ n.title }}</span>
              </div>
              <div v-if="n.message" class="notif-msg">{{ n.message }}</div>
              <div class="notif-meta">
                <span class="notif-time">{{ formatTime(n.created_at) }}</span>
                <span v-if="!n.is_read" class="unread-dot"></span>
              </div>
              <div class="notif-item-actions">
                <button class="mini-act pin" @click.stop="togglePin(n.id)" :title="n.is_pinned ? t('common.unpin') : t('common.pin')">
                  {{ n.is_pinned ? '📌' : '📍' }}
                </button>
                <button class="mini-act del" @click.stop="deleteOne(n.id)" :title="t('common.delete')">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Live Toasts -->
  <div class="live-toasts">
    <TransitionGroup name="toast-anim">
      <div
        v-for="toast in liveToasts"
        :key="toast.id"
        class="live-toast"
        :style="{ borderLeftColor: getTypeColor(toast.type) }"
        @click="liveToasts = liveToasts.filter(t => t.id !== toast.id)"
      >
        <span class="toast-icon">{{ toast.icon }}</span>
        <div class="toast-body">
          <div class="toast-title">{{ toast.title }}</div>
          <div v-if="toast.message" class="toast-msg">{{ toast.message }}</div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>


<style scoped src='./AdminNotificationCenter.css'></style>
<style scoped src='./AdminNotificationCenter-extras.css'></style>
