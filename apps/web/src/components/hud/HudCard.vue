<template>
  <article
    class="hud-card"
    :class="{ clickable }"
    @click="clickable && emits('click')"
  >
    <div class="hud-card__header">
      <span v-if="icon" class="hud-card__icon">{{ icon }}</span>
      <div class="hud-card__title-wrap">
        <h3 class="hud-card__title">{{ title }}</h3>
        <span v-if="status" class="hud-orb" :class="status" />
      </div>
    </div>

    <div v-if="stats?.length" class="hud-card__stats">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="hud-card__stat"
        :class="{ highlight: stat.highlight }"
      >
        <span class="hud-card__stat-value">{{ stat.value }}</span>
        <span class="hud-card__stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <div v-if="miniBar" class="hud-mini-bar">
      <div class="hud-mini-bar__fill" :style="barStyle" />
    </div>

    <div v-if="actions?.length" class="hud-card__actions">
      <button
        v-for="action in actions"
        :key="action.id"
        class="hud-card__action"
        :class="action.variant"
        @click.stop="emits('action', action.id)"
      >
        <span v-if="action.icon" aria-hidden="true">{{ action.icon }}</span>
        <span>{{ action.label }}</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface HudCardStat {
  label: string
  value: string | number
  highlight?: boolean
}

export interface HudCardAction {
  id: string
  label: string
  icon?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
}

interface Props {
  title: string
  icon?: string
  status?: string
  stats?: HudCardStat[]
  miniBar?: { value: number; color?: string }
  actions?: HudCardAction[]
  clickable?: boolean
}

const props = defineProps<Props>()
const emits = defineEmits<{ click: []; action: [id: string] }>()

const barStyle = computed(() => ({
  width: `${Math.min(100, Math.max(0, props.miniBar?.value ?? 0))}%`,
  background: props.miniBar?.color || 'var(--hud-accent)',
}))
</script>
