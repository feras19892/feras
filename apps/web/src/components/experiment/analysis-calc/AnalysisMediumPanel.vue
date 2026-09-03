<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, watch } from 'vue'

const props = defineProps<{
  currentMedium?: string
  currentN2?: number | null
}>()

const emit = defineEmits<{
  (e: 'select-medium', n2: number): void
}>()

interface MediumOption {
  name: string
  n2: number
}

const mediums: MediumOption[] = [
  { name: 'air', n2: 1.0 },
  { name: 'water', n2: 1.33 },
  { name: 'glass', n2: 1.5 },
  { name: 'diamond', n2: 2.42 },
]

function mediumName(key: string) {
  const map: Record<string, string> = {
    air: t('analysis.air'),
    water: t('analysis.water'),
    glass: t('analysis.glass'),
    diamond: t('analysis.diamond'),
  }
  return map[key] ?? key
}

const selected = ref<number | null>(props.currentN2 ?? null)

watch(() => props.currentN2, (v) => { selected.value = v ?? null })

function onSelect(n2: number) {
  selected.value = n2
  emit('select-medium', n2)
}
</script>

<template>
  <div class="medium-panel">
    <div class="medium-title">{{ t('analysis.mediumTitle') }}</div>
    <div class="medium-current" v-if="currentMedium">
      <span class="medium-label">{{ t('analysis.currentMedium') }}</span>
      <span class="medium-val">{{ currentMedium }} (n₂ = {{ currentN2 }})</span>
    </div>
    <div class="medium-grid">
      <button
        v-for="m in mediums"
        :key="m.n2"
        class="medium-btn"
        :class="{ active: selected === m.n2 }"
        @click="onSelect(m.n2)"
      >
        <span class="medium-name">{{ mediumName(m.name) }}</span>
        <span class="medium-n2">n₂ = {{ m.n2 }}</span>
      </button>
    </div>
    <div class="medium-hint">{{ t('analysis.mediumHint') }}</div>
  </div>
</template>

<style scoped>
.medium-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: .6rem; }
.medium-title { font-size: .82rem; font-weight: 700; color: #67e8f9; margin-bottom: .4rem; }
.medium-current { font-size: .75rem; color: #8B95A5; margin-bottom: .4rem; display: flex; gap: .3rem; }
.medium-label { color: #8B95A5; }
.medium-val { color: #fbbf24; font-weight: 700; }
.medium-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .3rem; }
.medium-btn { display: flex; flex-direction: column; align-items: center; gap: .15rem; padding: .4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #D1D7E0; cursor: pointer; font-family: inherit; transition: all .15s; }
.medium-btn:hover { background: rgba(91,141,184,.1); border-color: rgba(91,141,184,.3); }
.medium-btn.active { background: rgba(91,141,184,.15); border-color: #5B8DB8; color: #5B8DB8; }
.medium-name { font-size: .75rem; font-weight: 600; }
.medium-n2 { font-size: .7rem; color: #8B95A5; font-family: monospace; }
.medium-hint { font-size: .7rem; color: #475569; text-align: center; margin-top: .3rem; }
</style>
