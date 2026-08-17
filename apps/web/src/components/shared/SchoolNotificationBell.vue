<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../composables/useI18n'
import { useSchoolNotifications } from '../../composables/useSchoolNotifications'
import type { SchoolNotification } from '../../services/school-notification.service'

const { t, locale } = useI18n()
const router = useRouter()
const open = ref(false)
const bellRef = ref<HTMLElement | null>(null)

const { notifications, unreadCount, markAllRead, markOneRead, deleteOne, togglePin } = useSchoolNotifications()

function toggle() {
  open.value = !open.value
  if (open.value && unreadCount.value > 0) {
    markAllRead()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

async function handleNotificationClick(n: SchoolNotification) {
  if (!n.is_read) await markOneRead(n.id)
  if (n.report_id) {
    open.value = false
    router.push(`/report/${n.report_id}`)
  }
}

async function markAll() {
  await markAllRead()
}

async function remove(id: number) {
  await deleteOne(id)
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(locale.value === 'ar' ? 'ar-SA' : locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="notif-bell" ref="bellRef">
    <button class="bell-btn" @click.stop="toggle">
      <span>🔔</span>
      <span v-if="unreadCount > 0" class="bell-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <div v-if="open" class="notif-dropdown" @click.stop>
      <div class="notif-header">
        <span>{{ t('common.notifications') }}</span>
        <button v-if="unreadCount > 0" class="mark-all-btn" @click="markAll">{{ t('common.markAllRead') }}</button>
      </div>
      <div class="notif-list">
        <div v-if="notifications.length === 0" class="notif-empty">{{ t('common.noNotifications') }}</div>
        <div
          v-for="n in notifications.slice(0, 30)"
          :key="n.id"
          :class="['notif-item', { unread: !n.is_read, pinned: n.is_pinned, clickable: n.report_id }]"
          @click="handleNotificationClick(n)"
        >
          <div class="notif-item-header">
            <span class="notif-title">
              <span v-if="n.is_pinned" class="pin-indicator">📌</span>
              {{ n.title }}
            </span>
            <div class="notif-actions" @click.stop>
              <button class="notif-pin" @click.stop="togglePin(n.id)" :title="n.is_pinned ? t('common.unpin') : t('common.pin')">{{ n.is_pinned ? '📌' : '📍' }}</button>
              <button class="notif-del" @click.stop="remove(n.id)">✕</button>
            </div>
          </div>
          <p v-if="n.message" class="notif-msg">{{ n.message }}</p>
          <span class="notif-time">{{ formatTime(n.created_at) }}</span>
          <button v-if="!n.is_read" class="notif-read-btn" @click.stop="markOneRead(n.id)">{{ t('common.markRead') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-bell { position: relative; }
.bell-btn {
  width: 38px; height: 38px;
  border-radius: 0.6rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15,23,42,0.6);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  position: relative;
}
.bell-btn:hover { border-color: rgba(56,189,248,0.3); background: rgba(56,189,248,0.08); }
.bell-badge {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 18px; height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}
.notif-dropdown {
  position: absolute;
  top: 100%; right: 0;
  width: 340px;
  max-height: 420px;
  background: rgba(15,23,42,0.97);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.8rem;
  z-index: 200;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.notif-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.85rem; font-weight: 700; color: #e5e7eb;
}
.mark-all-btn {
  background: none; border: none; color: #38bdf8;
  font-size: 0.72rem; cursor: pointer; font-family: inherit;
}
.mark-all-btn:hover { text-decoration: underline; }
.notif-list { overflow-y: auto; flex: 1; }
.notif-empty { text-align: center; color: #64748b; padding: 1.5rem; font-size: 0.82rem; }
.notif-item {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.12s;
}
.notif-item.unread { background: rgba(56,189,248,0.04); }
.notif-item.clickable { cursor: pointer; }
.notif-item:hover { background: rgba(255,255,255,0.02); }
.notif-item-header { display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; }
.notif-title { font-size: 0.8rem; font-weight: 700; color: #e2e8f0; flex: 1; }
.notif-del { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.7rem; padding: 0.1rem; }
.notif-msg { margin: 0.2rem 0; font-size: 0.75rem; color: #94a3b8; line-height: 1.4; }
.notif-time { font-size: 0.65rem; color: #475569; }
.notif-read-btn {
  background: none; border: 1px solid rgba(56,189,248,0.2);
  border-radius: 0.3rem; padding: 0.15rem 0.5rem;
  color: #38bdf8; font-size: 0.65rem; cursor: pointer;
  margin-top: 0.3rem; font-family: inherit;
}
.notif-item.pinned { border-left: 2px solid #fbbf24; }
.pin-indicator { font-size: 0.7rem; }
.notif-actions { display: flex; gap: 0.2rem; }
.notif-pin { background: none; border: none; color: #fbbf24; cursor: pointer; font-size: 0.65rem; padding: 0.1rem; }
.notif-pin:hover { opacity: 0.7; }
</style>
