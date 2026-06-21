<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  hasData: boolean;
}>();

const emit = defineEmits<{
  (e: 'print'): void;
  (e: 'exportCsv'): void;
  (e: 'exportPng'): void;
  (e: 'sendToTeacher'): void;
}>();

const sending = ref(false);
const sent = ref(false);

function onSend() {
  sending.value = true;
  setTimeout(() => { sending.value = false; sent.value = true; setTimeout(() => sent.value = false, 3000); }, 1500);
  emit('sendToTeacher');
}
</script>

<template>
  <div class="export-panel">
    <div class="panel-header">📤 إرسال التقرير</div>
    <div class="actions">
      <button class="btn btn-print" :disabled="!hasData" @click="emit('print')">
        🖨️ طباعة / PDF
      </button>
      <button class="btn btn-csv" :disabled="!hasData" @click="emit('exportCsv')">
        📄 CSV
      </button>
      <button class="btn btn-png" :disabled="!hasData" @click="emit('exportPng')">
        🖼️ PNG
      </button>
      <button class="btn btn-send" :disabled="!hasData || sending" @click="onSend">
        {{ sending ? '⏳ جاري الإرسال...' : sent ? '✅ تم الإرسال!' : '📧 إرسال للمعلم' }}
      </button>
    </div>
    <p class="hint">املأ معلومات الطالب أولاً ثم اضغط إرسال للمعلم</p>
  </div>
</template>

<style scoped>
.export-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.panel-header {
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.95rem;
  color: #67e8f9;
  font-weight: 700;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.6rem;
}
.btn {
  flex: 1;
  min-width: 100px;
  padding: 0.5rem 0.7rem;
  border: none;
  border-radius: 0.35rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s;
  color: #fff;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-print { background: linear-gradient(135deg, #475569, #334155); }
.btn-csv { background: linear-gradient(135deg, #059669, #047857); }
.btn-png { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
.btn-send { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.3); }
.hint { font-size: 0.8rem; color: #64748b; padding: 0 0.6rem 0.6rem; text-align: center; margin: 0; }
</style>
