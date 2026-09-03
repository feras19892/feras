<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { FaultInfo } from '../shared/types'
import type { useWorkshop } from '../shared/useWorkshop'
defineProps<{
  t: (key: string, vars?: Record<string, string | number>) => string
  workshop: ReturnType<typeof useWorkshop>
  showExperiments: boolean
  currentExperiment: 'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance' | null
  elapsedSeconds: number
  energyKWh: number
  hasDanger: boolean
  hasWarning: boolean
  redraw: () => void
}>()

const emit = defineEmits<{
  (e: 'update:showExperiments', v: boolean): void
  (e: 'update:currentExperiment', v: 'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance' | null): void
  (e: 'toggleRun'): void
  (e: 'loadExp', name: 'ac_rl' | 'ac_rc' | 'ac_rlc' | 'ac_transformer' | 'ac_filter' | 'ac_powerfactor' | 'ac_resonance'): void
  (e: 'explainCalcs'): void
  (e: 'showSaveDialog'): void
  (e: 'openLoadDialog'): void
  (e: 'exportPNG'): void
  (e: 'printCircuit'): void
  (e: 'showHelp'): void
  (e: 'explainMNA'): void
  (e: 'selectFault', fault: FaultInfo): void
}>()
</script>

<template>
  <div>
    <div class="ac-bottom-bar">
        <button class="bb-run-btn" :class="{ active: workshop.running.value }" @click="emit('toggleRun')">
          {{ workshop.running.value ? t('ew.stop') : t('ew.run') }}
        </button>
        <button class="bb-clear-btn" @click="emit('update:currentExperiment', null); workshop.clearAll(); redraw()">{{ t('ew.clearAll') }}</button>
        <button class="bb-tool-btn" :disabled="!workshop.canUndo.value" @click="workshop.undo(); redraw()">↶ {{ t('ew.undo') }}</button>
        <button class="bb-tool-btn" :disabled="!workshop.canRedo.value" @click="workshop.redo(); redraw()">↷ {{ t('ew.redo') }}</button>
        <div class="bb-exp-wrap">
          <button class="bb-exp-btn" @click="emit('update:showExperiments', !showExperiments)">{{ t('ew.experiments') }}</button>
          <div class="bb-exp-menu" v-if="showExperiments">
            <button class="bb-exp-item" @click="emit('loadExp', 'ac_rl')">RL Circuit</button>
            <button class="bb-exp-item" @click="emit('loadExp', 'ac_rc')">RC Circuit</button>
            <button class="bb-exp-item" @click="emit('loadExp', 'ac_rlc')">RLC Circuit</button>
            <div class="bb-exp-divider"></div>
            <button class="bb-exp-item" @click="emit('loadExp', 'ac_transformer')">Transformer</button>
            <button class="bb-exp-item" @click="emit('loadExp', 'ac_filter')">Low-Pass Filter</button>
            <div class="bb-exp-divider"></div>
            <button class="bb-exp-item" @click="emit('loadExp', 'ac_powerfactor')">{{ t('ew.exp.ac_powerfactor') }}</button>
            <button class="bb-exp-item" @click="emit('loadExp', 'ac_resonance')">{{ t('ew.exp.ac_resonance') }}</button>
          </div>
        </div>
        <button class="bb-explain-btn" v-if="currentExperiment" @click="emit('explainCalcs')">{{ t('ew.explainCalcs') }}</button>
        <button class="bb-tool-btn" @click="emit('showSaveDialog')">{{ t('ew.save') }}</button>
        <button class="bb-tool-btn" @click="emit('openLoadDialog')">{{ t('ew.load') }}</button>
        <button class="bb-tool-btn" @click="emit('exportPNG')">{{ t('ew.exportPng') }}</button>
        <button class="bb-tool-btn" @click="emit('printCircuit')">{{ t('ew.print') }}</button>
        <button class="bb-mna-btn" @click="emit('explainMNA')" :title="t('ew.calc.mnaHint')">{{ t('ew.calc.mnaTitle') }}</button>
        <button class="bb-tool-btn" @click="emit('showHelp')">❓ {{ t('ew.help') }}</button>
        <span class="bb-rd" v-if="workshop.running.value && !workshop.error.value">
          I: {{ workshop.totalCurrent.value.toFixed(3) }}A | V: {{ workshop.totalVoltage.value.toFixed(1) }}V | P: {{ workshop.totalPower.value.toFixed(2) }}W
          <span class="bb-energy" v-if="elapsedSeconds > 0">| ⏱ {{ elapsedSeconds }}s | ⚡ {{ (energyKWh * 1000).toFixed(4) }}mWh</span>
        </span>
        <span class="bb-error" v-if="workshop.error.value">{{ t(workshop.error.value) }}</span>
      </div>

      <!-- Danger Visual Overlay -->
      <div class="danger-overlay" v-if="workshop.running.value && hasDanger">
        <div class="danger-pulse"></div>
        <div class="danger-banner">{{ t('ew.dangerBanner') }}</div>
      </div>

      <!-- Warning Lamps (top-right corner) -->
      <div class="warning-lamps" v-if="workshop.running.value">
        <div class="wlamp clickable" :class="{ on: hasDanger, off: !hasDanger }" :title="t('ew.danger')" @click="() => { const f = workshop.faults.value.find(f => f.severity === 'danger'); if (f) emit('selectFault', f) }">
          <span class="wl-icon">🔴</span>
          <span class="wl-label" v-if="hasDanger">{{ t('ew.danger') }}</span>
        </div>
        <div class="wlamp clickable" :class="{ on: hasWarning && !hasDanger, off: !hasWarning }" :title="t('ew.warning')" @click="() => { const f = workshop.faults.value.find(f => f.severity === 'warning'); if (f) emit('selectFault', f) }">
          <span class="wl-icon">🟡</span>
          <span class="wl-label" v-if="hasWarning && !hasDanger">{{ t('ew.warning') }}</span>
        </div>
        <div class="wlamp" :class="{ on: !hasDanger && !hasWarning }" :title="t('ew.ok')">
          <span class="wl-icon">🟢</span>
          <span class="wl-label" v-if="!hasDanger && !hasWarning">{{ t('ew.ok') }}</span>
        </div>
      </div>

      <!-- Fault Messages -->
      <div class="fault-list" v-if="workshop.running.value && workshop.faults.value.length > 0">
        <div
          v-for="(fault, i) in workshop.faults.value"
          :key="i"
          class="fault-item clickable"
          :class="fault.severity"
          @click="emit('selectFault', fault)"
        >
          <span class="fi-icon">{{ fault.severity === 'danger' ? '🔴' : '🟡' }}</span>
          <span class="fi-msg">{{ t(fault.messageKey, fault.vars ?? {}) }}</span>
          <span class="fi-arrow">›</span>
        </div>
      </div>
  </div>
</template>
