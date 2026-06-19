<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click="emit('close')">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>🚀 دليل تجربة المقذوفات</h3>
          <button @click="emit('close')">×</button>
        </div>
        <div class="modal-body">
          <h4>الهدف</h4>
          <p>دراسة حركة الجسم المقذوف في بُعدين (X و Y) والتحقق من القوانين النظرية.</p>
          <h4>المعادلات</h4>
          <ul>
            <li><b>المدى:</b> R = v₀² sin(2θ) / g</li>
            <li><b>أقصى ارتفاع:</b> H = (v₀ sinθ)² / 2g</li>
            <li><b>زمن التحليق:</b> t = 2v₀ sinθ / g</li>
          </ul>
          <h4>السيناريو 1: R مقابل θ (ثبوت v₀)</h4>
          <ol>
            <li>ثبت v₀ = 10 m/s</li>
            <li>غير الزاوية: 15°, 30°, 45°, 60°, 75°</li>
            <li>سجل المدى R لكل زاوية</li>
            <li>لاحظ: أقصى مدى عند 45°</li>
          </ol>
          <h4>السيناريو 2: R مقابل v₀ (ثبوت θ)</h4>
          <ol>
            <li>ثبت الزاوية عند 45°</li>
            <li>غير السرعة: 5, 10, 15, 20, 25 m/s</li>
            <li>لاحظ: R ∝ v₀²</li>
          </ol>
          <h4>اختصارات</h4>
          <p>مسافة: بدء/إيقاف | R: إعادة | S: تسجيل | Ctrl+Z: تراجع | ?: مساعدة</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal { background: #1A1F27; border: 1px solid #2D3645; border-radius: 12px; width: 90%; max-width: 560px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .8rem; border-bottom: 1px solid #2D3645; }
.modal-header h3 { margin: 0; font-size: .9rem; color: #5B8DB8; }
.modal-header button { background: none; border: none; color: #8B95A5; font-size: 1.3rem; cursor: pointer; }
.modal-body { padding: .8rem; font-size: .78rem; color: #D1D7E0; line-height: 1.6; }
.modal-body h4 { margin: .6rem 0 .2rem; font-size: .8rem; color: #5B8DB8; }
.modal-body p { margin: .2rem 0; }
.modal-body ul, .modal-body ol { margin: .2rem 0; padding-right: 1.2rem; }
</style>
