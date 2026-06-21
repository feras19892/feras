<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="help-modal">
      <h3>❓ مساعدة — شعاع الضوء</h3>
      <ul>
        <li><b>Space</b> — بدء/توقف المحاكاة</li>
        <li><b>R</b> — إعادة تعيين</li>
        <li><b>S</b> — تسجيل قراءة</li>
        <li><b>Ctrl+Z</b> — تراجع</li>
        <li><b>Ctrl+Y</b> — إعادة</li>
        <li><b>?</b> — فتح/إغلاق المساعدة</li>
      </ul>
      <p>قانون الانعكاس: θᵣ = θᵢ</p>
      <p>قانون سنل: n₁ sin θᵢ = n₂ sin θₜ</p>
      <button class="btn-close" @click="emit('close')">إغلاق</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.help-modal { background: #1e2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; width: 90%; max-width: 420px; display: flex; flex-direction: column; gap: .75rem; }
.help-modal h3 { margin: 0; font-size: 1rem; color: #fbbf24; }
.help-modal ul { margin: 0; padding-right: 1.2rem; font-size: .85rem; color: #8B95A5; line-height: 1.6; }
.help-modal p { margin: 0; font-size: .85rem; color: #8B95A5; }
.btn-close { padding: .5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #D1D7E0; cursor: pointer; font-family: inherit; margin-top: .5rem; }
</style>
