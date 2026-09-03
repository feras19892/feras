<template>
  <Transition name="broadcast-fade">
    <div v-if="visible" class="broadcast-overlay" @click="dismiss">
      <div class="broadcast-card" :class="broadcastType">
        <span class="broadcast-icon">{{ icon }}</span>
        <div class="broadcast-body">
          <div class="broadcast-title">{{ title }}</div>
          <div class="broadcast-message">{{ message }}</div>
        </div>
        <div class="broadcast-timer">
          <div class="broadcast-timer-bar" :style="{ animationDuration: duration + 's' }"></div>
        </div>
        <button class="broadcast-close" @click="dismiss">✕</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { eventBus } from '@/composables/shared/useEventBus'

const { notifications } = useNotifications()
const visible = ref(false)
const title = ref('')
const message = ref('')
const broadcastType = ref('info')
const duration = 30
let timer: ReturnType<typeof setTimeout> | null = null

const icon = computed(() => {
  const map: Record<string, string> = { info: '📢', warning: '⚠️', success: '✅', urgent: '🚨' }
  return map[broadcastType.value] || '📢'
})

function show(n: { type: string; title: string; message?: string }) {
  title.value = n.title
  message.value = n.message || ''
  const m = n.type.match(/^broadcast_(\w+)$/)
  broadcastType.value = m ? m[1] : 'info'
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(dismiss, duration * 1000)
}

function dismiss() {
  visible.value = false
  if (timer) { clearTimeout(timer); timer = null }
}

function onNewNotification(n: any) {
  if (n?.type?.startsWith('broadcast_')) show(n)
}

onMounted(() => {
  const latest = notifications.value.find(n => n.type?.startsWith('broadcast_') && !n.is_read)
  if (latest) show(latest)
  eventBus.on('notification:new', onNewNotification)
})

onUnmounted(() => {
  eventBus.off('notification:new', onNewNotification)
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.broadcast-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
}
.broadcast-card {
  position: relative; min-width: 360px; max-width: 500px;
  border-radius: 14px; padding: 24px 32px; display: flex; align-items: center; gap: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: pop 0.3s ease;
}
.broadcast-card.info { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; }
.broadcast-card.warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
.broadcast-card.success { background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; }
.broadcast-card.urgent { background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; animation: pop 0.3s ease, pulse 1.5s ease infinite 0.3s; }
.broadcast-icon { font-size: 36px; flex-shrink: 0; }
.broadcast-body { flex: 1; }
.broadcast-title { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
.broadcast-message { font-size: 15px; opacity: 0.95; line-height: 1.5; }
.broadcast-close { position: absolute; top: 10px; left: 14px; background: none; border: none; color: rgba(255,255,255,0.7); font-size: 16px; cursor: pointer; }
.broadcast-close:hover { color: #fff; }
.broadcast-timer { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.2); border-radius: 0 0 14px 14px; overflow: hidden; }
.broadcast-timer-bar { height: 100%; background: rgba(255,255,255,0.8); animation: shrink linear forwards; }
@keyframes shrink { from { width: 100%; } to { width: 0%; } }
@keyframes pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes pulse { 0%, 100% { box-shadow: 0 20px 60px rgba(220,38,38,0.3); } 50% { box-shadow: 0 20px 80px rgba(220,38,38,0.6); } }
.broadcast-fade-enter-active, .broadcast-fade-leave-active { transition: opacity 0.3s ease; }
.broadcast-fade-enter-from, .broadcast-fade-leave-to { opacity: 0; }
</style>
