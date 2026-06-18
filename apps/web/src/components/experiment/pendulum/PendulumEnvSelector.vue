<script setup lang="ts">
interface EnvOption { label: string; value: number; icon: string }
const options: EnvOption[] = [
  { label: '🌍 الأرض', value: 9.81, icon: '🌍' },
  { label: '🌑 القمر', value: 1.62, icon: '🌑' },
  { label: '🪐 المشتري', value: 24.79, icon: '🪐' },
  { label: '🛰️ الفضاء', value: 0, icon: '🛰️' },
]
const model = defineModel<number>({ required: true })
function onChange(e: Event) {
  const val = Number((e.target as HTMLSelectElement).value)
  model.value = val
}
</script>

<template>
  <div class="env-selector">
    <label>البيئة</label>
    <select :value="model" @change="onChange">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>

<style scoped>
.env-selector { display:flex; flex-direction:column; gap:.15rem; }
.env-selector label { font-size:.72rem; color:#94a3b8; font-weight:700; }
.env-selector select { padding:.4rem .5rem; border-radius:6px; border:1px solid rgba(71,85,105,0.4); background:rgba(15,23,42,0.6); color:#e2e8f0; font-size:.75rem; cursor:pointer; }
.env-selector select:focus { outline:none; border-color:#60a5fa; box-shadow:0 0 0 2px rgba(96,165,250,0.15); }
</style>
