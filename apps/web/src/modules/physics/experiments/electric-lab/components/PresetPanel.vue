<script setup lang="ts">
import { ref, computed } from 'vue'

interface Preset {
  id: string
  nameAr: string
  level: string
  instructions: string[]
}

const props = defineProps<{
  presets: Preset[]
  activeInstructions: string[]
}>()

const emit = defineEmits<{
  (e: 'load', id: string): void
}>()

const presetSearch = ref('')

const LEVELS = [
  { key: 'beginner',     label: 'مبتدئ',       icon: '🟢', color: '#22c55e' },
  { key: 'intermediate', label: 'متوسط',       icon: '🟡', color: '#fbbf24' },
  { key: 'college',      label: 'جامعي',       icon: '🔵', color: '#3b82f6' },
  { key: 'advanced',     label: 'متقدم',       icon: '🔴', color: '#ef4444' },
]

const filteredPresets = computed(() => {
  const q = presetSearch.value.trim().toLowerCase()
  if (!q) return props.presets
  return props.presets.filter(p =>
    p.nameAr.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q)
  )
})

const groupedPresets = computed(() => {
  return LEVELS.map(l => ({
    ...l,
    items: filteredPresets.value.filter(p => p.level === l.key),
  })).filter(g => g.items.length > 0)
})

const activePresetId = computed(() => {
  return props.presets.find(p => p.instructions === props.activeInstructions)?.id ?? ''
})

const PRESET_ICONS: Record<string, string> = {
  'ohms-law': '📐', 'kirchhoff': '🔀', 'ohms-law-parallel': '∥',
  'power': '⚡', 'resistivity': '📏', 'rc-circuit': '🔌',
  'lamp-circuit': '💡', 'galvanometer': '📐', 'wheatstone': '⚖️',
  'voltage-divider': '📊',
}

function presetIcon(id: string): string {
  return PRESET_ICONS[id] || '⚡'
}

function onLoad(id: string) {
  emit('load', id)
  presetSearch.value = ''
}
</script>

<template>
  <div class="preset-panel">
    <h3 class="preset-panel-title">📋 التجارب</h3>
    <div class="preset-search-wrap">
      <input v-model="presetSearch" class="preset-search" type="text" placeholder="🔍 ابحث عن تجربة..." />
    </div>
    <div class="preset-list">
      <template v-for="group in groupedPresets" :key="group.key">
        <div class="level-header" :style="{ color: group.color }">
          <span>{{ group.icon }}</span>
          <span class="level-label">{{ group.label }}</span>
          <span class="level-count">({{ group.items.length }})</span>
        </div>
        <div
          v-for="p in group.items" :key="p.id"
          class="preset-item" :class="{ active: activePresetId === p.id }"
          @click="onLoad(p.id)"
        >
          <span class="preset-icon">{{ presetIcon(p.id) }}</span>
          <span class="preset-name">{{ p.nameAr }}</span>
          <span class="preset-level-badge" :style="{ background: group.color }">{{ group.label }}</span>
        </div>
      </template>
      <div v-if="groupedPresets.length === 0" class="preset-empty">لا توجد نتائج</div>
    </div>
  </div>
</template>

<style scoped>
.preset-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.75rem;
  overflow: hidden;
  flex-shrink: 0;
  margin-bottom: 0.75rem;
}
.preset-panel-title {
  margin: 0; padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #f59e0b;
  background: rgba(245,158,11,0.08); border-bottom: 1px solid rgba(255,255,255,0.06);
}
.preset-search-wrap { padding: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.preset-search {
  width: 100%; background: #0d1117; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; color: #e2e8f0; padding: 0.4rem 0.6rem; font-size: 0.78rem;
  outline: none; text-align: right;
}
.preset-search:focus { border-color: rgba(245,158,11,0.5); }
.preset-search::placeholder { color: #475569; }
.preset-list { max-height: 280px; overflow-y: auto; }
.level-header {
  display: flex; align-items: center; gap: .3rem; padding: .4rem .6rem;
  font-size: .72rem; font-weight: 700; background: rgba(255,255,255,.03);
  position: sticky; top: 0; z-index: 1;
}
.level-label { flex: 1; }
.level-count { font-size: .65rem; opacity: .6; }
.preset-level-badge {
  font-size: .58rem; color: #fff; padding: .1rem .35rem; border-radius: 3px;
  font-weight: 700; white-space: nowrap; flex-shrink: 0;
}
.preset-empty { padding: 1rem; text-align: center; color: #64748b; font-size: 0.78rem; }
.preset-item {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.7rem;
  cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s;
}
.preset-item.active { background: rgba(245,158,11,0.15); border-right: 3px solid #f59e0b; }
.preset-item:last-child { border-bottom: none; }
.preset-item:hover { background: rgba(245,158,11,0.1); }
.preset-icon { font-size: 1rem; }
.preset-name { font-size: 0.8rem; color: #e2e8f0; }
</style>
