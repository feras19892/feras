<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import { SUBSTANCES } from '../../../../composables/chemistry/substance-registry'

const { t } = useI18n()

const props = defineProps<{
  selected: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

function onClick(id: string) {
  emit('select', props.selected === id ? '' : id) // toggle
}

const typeLabels: Record<string, string> = {
  acid: t('experiments.chemTypeAcid') ?? 'حمض',
  base: t('experiments.chemTypeBase') ?? 'قاعدة',
  indicator: t('experiments.chemTypeIndicator') ?? 'مؤشر',
  solvent: t('experiments.chemTypeSolvent') ?? 'مذيب',
}

const typeColors: Record<string, string> = {
  acid: '#ef4444',
  base: '#22c55e',
  indicator: '#a855f7',
  solvent: '#3b82f6',
}
</script>

<template>
  <div class="inventory">
    <div
      v-for="s in SUBSTANCES"
      :key="s.id"
      class="substance-card"
      :class="{ selected: selected === s.id }"
      @click="onClick(s.id)"
    >
      <div class="bottle">
        <div class="bottle-body" :style="{ background: s.color + '99' }">
          <div class="liquid" :style="{ background: s.color }" />
        </div>
        <div class="bottle-cap" />
      </div>
      <div class="info">
        <span class="name">{{ s.nameAr }}</span>
        <span class="formula">{{ s.formula }}</span>
        <span class="badge" :style="{ background: typeColors[s.type] + '22', color: typeColors[s.type] }">
          {{ typeLabels[s.type] }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; padding: 0.25rem; }
.substance-card {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 0.6rem; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
  transition: all .15s;
}
.substance-card:hover { background: rgba(255,255,255,0.08); border-color: rgba(91,141,184,0.3); transform: translateY(-1px); }
.substance-card.selected { border-color: #06b6d4; background: rgba(6,182,212,0.08); box-shadow: 0 0 0 1px #06b6d4; }
.substance-card.selected .name { color: #67e8f9; }

.bottle { position: relative; width: 28px; height: 40px; }
.bottle-body {
  position: absolute; bottom: 0; width: 28px; height: 32px;
  border-radius: 0 0 6px 6px; border: 1.5px solid rgba(148,163,184,0.4);
  overflow: hidden; background: rgba(255,255,255,0.05);
}
.liquid { position: absolute; bottom: 0; left: 0; right: 0; height: 70%; border-radius: 0 0 4px 4px; }
.bottle-cap { position: absolute; top: 0; left: 6px; width: 16px; height: 6px; background: #475569; border-radius: 2px; }

.info { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
.name { font-size: 0.72rem; color: #e2e8f0; font-weight: 600; text-align: center; }
.formula { font-size: 0.65rem; color: #5b8db8; font-family: monospace; }
.badge { font-size: 0.6rem; padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 600; margin-top: 0.1rem; }
</style>
