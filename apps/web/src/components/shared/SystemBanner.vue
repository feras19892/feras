<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getSystemStatus, type SystemStatus } from '../services/system-status.service';

const status = ref<SystemStatus | null>(null);
let pollTimer: ReturnType<typeof setInterval> | null = null;

async function loadStatus() {
  try {
    const res = await getSystemStatus();
    if (res.success) status.value = res;
  } catch {
    // silent
  }
}

onMounted(() => {
  loadStatus();
  pollTimer = setInterval(loadStatus, 30000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <div v-if="status && (status.maintenance_mode || status.stop_registration || status.freeze_all_classes)" class="system-banner">
    <div v-if="status.maintenance_mode" class="banner-item maintenance">
      <span class="banner-icon">🔧</span>
      <span class="banner-text">النظام في وضع الصيانة حالياً — قد تكون بعض الخدمات غير متاحة</span>
    </div>
    <div v-if="status.stop_registration" class="banner-item registration">
      <span class="banner-icon">🛑</span>
      <span class="banner-text">تم إيقاف تسجيل المستخدمين الجدد مؤقتاً</span>
    </div>
    <div v-if="status.freeze_all_classes" class="banner-item freeze">
      <span class="banner-icon">❄️</span>
      <span class="banner-text">تم تجميد جميع الفصول — لا يمكن إجراء تعديلات حتى إشعار آخر</span>
    </div>
  </div>
</template>

<style scoped>
.system-banner {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 100;
}
.banner-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
}
.banner-item.maintenance {
  background: rgba(251, 146, 60, 0.12);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.2);
}
.banner-item.registration {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.banner-item.freeze {
  background: rgba(103, 232, 249, 0.12);
  color: #67e8f9;
  border: 1px solid rgba(103, 232, 249, 0.2);
}
.banner-icon { font-size: 1rem; flex-shrink: 0; }
.banner-text { line-height: 1.4; }

@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.system-banner { animation: slideDown 0.3s ease; }
</style>
