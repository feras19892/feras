<template>
  <div v-if="visible" class="frozen-overlay">
    <div class="frozen-card">
      <div class="frozen-icon">🔒</div>
      <h2>أنت مجمد من المدرس</h2>
      <p class="frozen-reason">{{ reason || 'تم تجميد حسابك من قبل المدرس' }}</p>
      <p class="frozen-hint">لا يمكنك استخدام النظام حتى يقوم المدرس بإلغاء التجميد</p>
      <button class="frozen-logout" @click="doLogout">تسجيل الخروج</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const reason = ref('')

function show(msg: string) {
  reason.value = msg
  visible.value = true
}

function onBlocked(e: Event) {
  const detail = (e as CustomEvent).detail
  show(detail?.message || 'تم تجميد حسابك من قبل المدرس')
}

function doLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  window.location.replace('/#/')
}

onMounted(() => {
  window.addEventListener('auth:blocked', onBlocked as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('auth:blocked', onBlocked as EventListener)
})
</script>

<style scoped>
.frozen-overlay {
  position: fixed; inset: 0; z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(4px);
}
.frozen-card {
  text-align: center; padding: 48px 56px; border-radius: 16px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #fff; max-width: 420px; box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  animation: pop 0.4s ease;
}
.frozen-icon { font-size: 64px; margin-bottom: 16px; }
.frozen-card h2 { font-size: 22px; margin: 0 0 12px; font-weight: 800; }
.frozen-reason { font-size: 16px; opacity: 0.9; margin: 0 0 8px; line-height: 1.5; }
.frozen-hint { font-size: 13px; opacity: 0.6; margin: 0 0 24px; }
.frozen-logout {
  padding: 10px 28px; border: none; border-radius: 8px;
  background: #ef4444; color: #fff; font-size: 14px; cursor: pointer;
  transition: opacity 0.15s;
}
.frozen-logout:hover { opacity: 0.85; }
@keyframes pop { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
