<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <span>&#x2753; مساعدة</span>
        <button class="modal-close" @click="emit('close')">&#x2715;</button>
      </div>
      <div class="modal-body">
        <p><strong>اختصارات لوحة المفاتيح:</strong></p>
        <ul>
          <li><kbd>Space</kbd> بدء / توقف</li>
          <li><kbd>R</kbd> إعادة تعيين</li>
          <li><kbd>S</kbd> تسجيل قراءة</li>
          <li><kbd>Ctrl+Z</kbd> تراجع</li>
          <li><kbd>Ctrl+Y</kbd> إعادة</li>
          <li><kbd>?</kbd> هذه النافذة</li>
        </ul>
        <p><strong>استخدام الفأرة:</strong></p>
        <ul>
          <li>انقر على نقطة فارغة = إضافة ثقل</li>
          <li>اسحب ثقلاً = نقله</li>
          <li>انقر مرتين على ثقل = تغيير كتلته</li>
        </ul>
        <p><strong>قانون الروافع:</strong></p>
        <p>τ = m · g · x. عند التوازن: Στ = 0</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal-box { background:#161B22; border:1px solid #2D3645; border-radius:12px; width:min(480px,90vw); max-height:80vh; overflow:auto; }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:.8rem 1rem; border-bottom:1px solid #2D3645; font-weight:700; color:#5B8DB8; }
.modal-close { background:none; border:none; color:#8B95A5; cursor:pointer; font-size:1.1rem; }
.modal-body { padding:1rem; font-size:.82rem; color:#D1D7E0; line-height:1.6; }
.modal-body ul { margin:.4rem 0; padding-right:1.2rem; }
.modal-body li { margin:.25rem 0; color:#94a3b8; }
kbd { background:#252D3A; border:1px solid #2D3645; border-radius:4px; padding:.1rem .35rem; font-size:.75rem; color:#e2e8f0; }
</style>
