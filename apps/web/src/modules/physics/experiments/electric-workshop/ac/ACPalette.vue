<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed } from 'vue'
import { getComponentsByCategory } from '../shared/componentDefs'
import { WIRE_COLOR_NAMES } from '../shared/types'
import ComponentIconCanvas from './ComponentIconCanvas.vue'
import type { useWorkshop } from '../shared/useWorkshop'
const props = defineProps<{
  t: (key: string, vars?: Record<string, string | number>) => string
  workshop: ReturnType<typeof useWorkshop>
}>()

const emit = defineEmits<{
  (e: 'addComponent', type: string): void
}>()

const acComponents = getComponentsByCategory('ac')

function selectWireColor(color: string) {
  // eslint-disable-next-line vue/no-mutating-props
  props.workshop.selectedWireColor.value = color
}
const componentGroups: { key: string; icon: string }[] = [
  { key: 'source', icon: '🔋' },
  { key: 'passive', icon: '🔲' },
  { key: 'active', icon: '🔀' },
  { key: 'measurement', icon: '📊' },
  { key: 'protection', icon: '⚡' },
  { key: 'misc', icon: '💡' },
]
const collapsedGroups = ref<Record<string, boolean>>({
  source: true,
  passive: true,
  active: true,
  measurement: true,
  protection: true,
  misc: true,
})
function toggleGroup(key: string) {
  collapsedGroups.value[key] = !collapsedGroups.value[key]
}
const groupedComponents = computed(() => {
  const map: Record<string, typeof acComponents> = {}
  for (const def of acComponents) {
    const g = (def as any).group || 'misc'
    if (!map[g]) map[g] = []
    map[g].push(def)
  }
  return map
})
</script>

<template>
  <div class="ac-palette">
      <h3 class="palette-title">{{ t('ew.components') }}</h3>
      <div class="palette-groups">
        <div
          v-for="grp in componentGroups"
          :key="grp.key"
          class="palette-group"
          v-show="groupedComponents[grp.key]"
        >
          <button
            class="palette-group-header"
            @click="toggleGroup(grp.key)"
          >
            <span class="pg-icon">{{ grp.icon }}</span>
            <span class="pg-label">{{ t('ew.grp.' + grp.key) }}</span>
            <span class="pg-count">{{ groupedComponents[grp.key]?.length || 0 }}</span>
            <span class="pg-arrow" :class="{ collapsed: collapsedGroups[grp.key] }">▼</span>
          </button>
          <div class="palette-grid" v-show="!collapsedGroups[grp.key]">
            <button
              v-for="def in groupedComponents[grp.key]"
              :key="def.type"
              class="palette-item"
              :style="{ '--accent': def.color }"
              @click="emit('addComponent', def.type)"
            >
              <ComponentIconCanvas :type="def.type" :size="44" :value="def.defaultValue" class="pi-icon-canvas" />
              <span class="pi-label">{{ t('ew.comp.' + def.type) }}</span>
              <span class="pi-unit">{{ def.defaultValue }}{{ def.unit }}</span>
            </button>
          </div>
        </div>
      </div>

      <h3 class="palette-title">{{ t('ew.wireColor') }}</h3>
      <div class="wire-colors">
        <button
          v-for="wc in WIRE_COLOR_NAMES"
          :key="wc.key"
          class="wire-color-btn"
          :class="{ active: workshop.selectedWireColor.value === wc.color }"
          :style="{ '--wc': wc.color }"
          @click="selectWireColor(wc.color)"
        >
          <span class="wc-dot"></span>
          <span class="wc-label">{{ t('ew.wire.' + wc.key) }}</span>
        </button>
      </div>
    </div>
</template>
