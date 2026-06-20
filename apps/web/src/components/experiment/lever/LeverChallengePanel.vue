<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  challengeSolved: boolean
}>()

const emit = defineEmits<{
  (e: 'startChallenge'): void
  (e: 'checkChallenge', guess: number): void
}>()

const guess = ref('')
const result = ref<string | null>(null)

function onCheck() {
  const num = parseFloat(guess.value)
  if (isNaN(num)) { result.value = 'أدخل رقماً صحيحاً'; return }
  const ok = emit('checkChallenge', num)
  // checkChallenge returns boolean through emit, but we need to know result
  // We'll display a generic message since the parent handles the actual check
  result.value = 'تم التحقق — انظر النتيجة!'
}

function onStart() {
  guess.value = ''
  result.value = null
  emit('startChallenge')
}
</script>

<template>
  <div class="challenge-panel">
    <div class="challenge-title">&#x1F3AF; تحدي: الكتلة المجهولة</div>
    <p class="challenge-desc">سيظهر جسم بكتلة غير معلومة. استخدم قانون الروافع لحسابها!</p>
    <button class="btn-start" @click="onStart">بدء التحدي</button>
    <div class="guess-row">
      <input v-model="guess" type="number" step="0.1" placeholder="الكتلة بالكيلوجرام" />
      <button class="btn-check" @click="onCheck">تحقق</button>
    </div>
    <div v-if="result" class="result-msg">{{ result }}</div>
    <div v-if="challengeSolved" class="success-msg">&#x1F389; أحسنت! إجابة صحيحة!</div>
  </div>
</template>

<style scoped>
.challenge-panel { padding:.6rem; }
.challenge-title { font-size:.9rem; font-weight:700; color:#fbbf24; margin-bottom:.3rem; }
.challenge-desc { font-size:.75rem; color:#94a3b8; margin-bottom:.5rem; line-height:1.4; }
.btn-start { background:rgba(245,158,11,.15); color:#fbbf24; border:1px solid rgba(245,158,11,.3); border-radius:5px; padding:.4rem .8rem; font-size:.8rem; font-weight:700; cursor:pointer; margin-bottom:.5rem; }
.btn-start:hover { background:rgba(245,158,11,.25); }
.guess-row { display:flex; gap:.3rem; }
.guess-row input { flex:1; background:#0f172a; border:1px solid #334155; color:#e2e8f0; border-radius:5px; padding:.35rem; font-size:.8rem; }
.btn-check { background:rgba(34,197,94,.15); color:#22c55e; border:1px solid rgba(34,197,94,.3); border-radius:5px; padding:.35rem .7rem; font-size:.8rem; font-weight:700; cursor:pointer; }
.result-msg { margin-top:.4rem; font-size:.8rem; color:#94a3b8; }
.success-msg { margin-top:.4rem; font-size:.85rem; color:#22c55e; font-weight:700; background:rgba(34,197,94,.1); padding:.4rem; border-radius:5px; text-align:center; }
</style>
