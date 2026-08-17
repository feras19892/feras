<script setup lang="ts">
interface Props {
  logins: number;
  signups: number;
  reports: number;
  dbSize: number;
}
const props = defineProps<Props>();

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
</script>

<template>
  <div class="status-bar">
    <div class="status-item"><span class="dot green"></span>النظام يعمل بشكل طبيعي</div>
    <div class="status-item"><strong>{{ logins }}</strong> تسجيل دخول اليوم</div>
    <div class="status-item"><strong>{{ signups }}</strong> تسجيل جديد</div>
    <div class="status-item"><strong>{{ reports }}</strong> تقرير اليوم</div>
    <div class="status-item">DB: {{ formatBytes(dbSize) }}</div>
  </div>
</template>

<style scoped>
.status-bar { display: flex; gap: 1.5rem; padding: 0.8rem 1rem; background: rgba(15,23,42,0.4); border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; }
.status-item { font-size: 0.8rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.4rem; }
.status-item strong { color: #67e8f9; font-weight: 700; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.green { background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.5); }
</style>
