import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus } from './useEventBus'
import { createFetchSSE } from '@/utils/fetchSSE'

const SSE_URL = `${(import.meta.env.VITE_API_BASE_URL as string) ?? ''}/api/sse/events`
const POLL_INTERVAL = 30_000
const MAX_SSE_RETRIES = 3
let _wasVisible = !document.hidden

const _connected = ref(false)
const _connectionType = ref<'sse' | 'polling' | 'disconnected'>('disconnected')
let _sse: { close: () => void } | null = null
let _pollTimer: ReturnType<typeof setInterval> | null = null
let _retryCount = 0
let _retryTimer: ReturnType<typeof setTimeout> | null = null
let _refCount = 0

function connectSSE() {
  if (_sse) return
  if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null }
  try {
    _sse = createFetchSSE({
      url: SSE_URL,
      withCredentials: true,
      onOpen: () => {
        _connected.value = true
        _connectionType.value = 'sse'
        _retryCount = 0
      },
      onMessage: (eventType, data) => {
        try {
          const payload = JSON.parse(data)
          if (eventType === 'notification') {
            eventBus.emit('notification:new', payload)
          } else {
            routeEvent(payload)
          }
        } catch { /* ignore */ }
      },
      onError: () => {
        if (_sse) { _sse.close(); _sse = null }
        _connected.value = false
        if (_retryCount < MAX_SSE_RETRIES) {
          _retryCount++
          _retryTimer = setTimeout(connectSSE, 5000 * _retryCount)
        } else {
          startPolling()
        }
      },
    })
  } catch {
    startPolling()
  }
}

function disconnectSSE() {
  if (_sse) {
    _sse.close()
    _sse = null
  }
  if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null }
  _connected.value = false
}

function startPolling() {
  if (_pollTimer) return
  _connected.value = true
  _connectionType.value = 'polling'
  pollNotifications()
  _pollTimer = setInterval(pollNotifications, POLL_INTERVAL)
}

function stopPolling() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null }
}

function onVisibilityChange() {
  if (document.hidden) {
    // Tab is no longer visible — pause ALL activity to save resources
    if (_sse) {
      _sse.close();
      _sse = null;
    }
    if (_retryTimer) {
      clearTimeout(_retryTimer);
      _retryTimer = null;
    }
    stopPolling();
    _connected.value = false;
    _connectionType.value = 'disconnected';
  } else if (!_wasVisible) {
    // Tab became visible again after being hidden — reconnect
    _wasVisible = true;
    _retryCount = 0;
    connectSSE();
  }
  _wasVisible = !document.hidden;
}

function pollNotifications() {
  eventBus.emit('cache:invalidate', { pattern: 'notifications' })
}

function routeEvent(data: { type?: string; payload?: Record<string, unknown> }) {
  if (!data || !data.type) return
  // أحداث SSE تصل بشكل { type, payload } — الحقول الفعلية داخل payload
  const p = (data.payload ?? {}) as Record<string, unknown>
  const classId = p.class_id ?? p.classId
  switch (data.type) {
    case 'report_graded':
      eventBus.emit('report:graded', { reportId: Number(p.report_id ?? p.reportId ?? 0), studentId: Number(p.student_id ?? p.studentId ?? 0) })
      eventBus.emit('cache:invalidate', { pattern: 'student:reports' })
      break
    case 'report_submitted':
    case 'report_resubmitted':
      eventBus.emit('report:submitted', { reportId: Number(p.report_id ?? p.reportId ?? 0), classId: String(classId ?? '') })
      eventBus.emit('cache:invalidate', { pattern: 'teacher:reports' })
      break
    case 'class_created':
      eventBus.emit('class:created', { classId: String(classId ?? '') })
      eventBus.emit('cache:invalidate', { pattern: 'teacher:classes' })
      eventBus.emit('cache:invalidate', { pattern: 'student:classes' })
      break
    case 'class_updated':
      eventBus.emit('class:updated', { classId: String(classId ?? '') })
      eventBus.emit('cache:invalidate', { pattern: 'teacher:classes' })
      break
    case 'class_frozen':
    case 'class_unfrozen':
      // المعلم يستمع لـ class:updated، والبقية عبر dashboard:refresh
      eventBus.emit('class:updated', { classId: String(classId ?? '') })
      eventBus.emit('dashboard:refresh')
      eventBus.emit('cache:invalidate', { pattern: 'teacher:classes' })
      eventBus.emit('cache:invalidate', { pattern: 'student:classes' })
      break
    case 'user_banned':
      eventBus.emit('user:banned', { userId: Number(p.user_id ?? p.userId ?? 0) })
      eventBus.emit('cache:invalidate', { pattern: 'admin:users' })
      break
    case 'user_unbanned':
      eventBus.emit('user:unbanned', { userId: Number(p.user_id ?? p.userId ?? 0) })
      eventBus.emit('cache:invalidate', { pattern: 'admin:users' })
      break
  }
}

export function useRealtime() {
  onMounted(() => {
    _refCount++
    if (_refCount === 1) connectSSE()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    _refCount = Math.max(0, _refCount - 1)
    if (_refCount === 0) {
      disconnectSSE()
      stopPolling()
      _connected.value = false
      _connectionType.value = 'disconnected'
    }
  })

  return { connected: _connected, connectionType: _connectionType, connect: connectSSE, disconnect: () => {
    disconnectSSE()
    stopPolling()
    _connected.value = false
    _connectionType.value = 'disconnected'
  }}
}
