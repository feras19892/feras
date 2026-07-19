<script setup lang="ts">
import type { useWorkshop } from '../shared/useWorkshop'

defineProps<{
  t: (key: string, vars?: Record<string, string | number>) => string
  workshop: ReturnType<typeof useWorkshop>
  showExperiments: boolean
  currentExperiment: string | null
  elapsedSeconds: number
  energyKWh: number
  hasDanger: boolean
  hasWarning: boolean
  redraw: () => void
}>()

const emit = defineEmits<{
  (e: 'update:showExperiments', v: boolean): void
  (e: 'update:currentExperiment', v: string | null): void
  (e: 'toggleRun'): void
  (e: 'loadExp', name: string): void
  (e: 'explainCalcs'): void
  (e: 'showSaveDialog'): void
  (e: 'openLoadDialog'): void
  (e: 'exportPNG'): void
  (e: 'printCircuit'): void
  (e: 'showHelp'): void
  (e: 'selectFault', fault: any): void
}>()
</script>

<template>
  <div>
    <!-- Bottom Bar -->
    <div class="dc-bottom-bar">
      <button class="bb-run-btn" :class="{ active: workshop.running.value }" @click="emit('toggleRun')">
        {{ workshop.running.value ? t('ew.stop') : t('ew.run') }}
      </button>
      <button class="bb-clear-btn" @click="emit('update:currentExperiment', null); workshop.clearAll(); redraw()">{{ t('ew.clearAll') }}</button>
      <button class="bb-tool-btn" :disabled="!workshop.canUndo.value" @click="workshop.undo(); redraw()">{{ String.fromCharCode(0x21B6) }} {{ t('ew.undo') }}</button>
      <button class="bb-tool-btn" :disabled="!workshop.canRedo.value" @click="workshop.redo(); redraw()">{{ String.fromCharCode(0x21B7) }} {{ t('ew.redo') }}</button>
      <div class="bb-exp-wrap">
        <button class="bb-exp-btn" @click="emit('update:showExperiments', !showExperiments)">{{ t('ew.experiments') }}</button>
        <div class="bb-exp-menu" v-if="showExperiments">
          <button class="bb-exp-item" @click="emit('loadExp', 'ohm')">{{ t('ew.exp.ohm') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'series')">{{ t('ew.exp.series') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'parallel')">{{ t('ew.exp.parallel') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'mixed')">{{ t('ew.exp.mixed') }}</button>
          <div class="bb-exp-divider"></div>
          <button class="bb-exp-item" @click="emit('loadExp', 'kvl')">{{ t('ew.exp.kvl') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'kcl')">{{ t('ew.exp.kcl') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'vdivider')">{{ t('ew.exp.vdivider') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'cdivider')">{{ t('ew.exp.cdivider') }}</button>
          <div class="bb-exp-divider"></div>
          <button class="bb-exp-item" @click="emit('loadExp', 'bseries')">{{ t('ew.exp.bseries') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'bparallel')">{{ t('ew.exp.bparallel') }}</button>
          <div class="bb-exp-divider"></div>
          <button class="bb-exp-item" @click="emit('loadExp', 'relay')">{{ t('ew.exp.relay') }}</button>
          <div class="bb-exp-divider"></div>
          <button class="bb-exp-item" @click="emit('loadExp', 'rc_charge')">{{ t('ew.exp.rc_charge') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'rl_transient')">{{ t('ew.exp.rl_transient') }}</button>
          <div class="bb-exp-divider"></div>
          <button class="bb-exp-item" @click="emit('loadExp', 'wheatstone')">{{ t('ew.exp.wheatstone') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'thevenin')">{{ t('ew.exp.thevenin') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'superposition')">{{ t('ew.exp.superposition') }}</button>
          <button class="bb-exp-item" @click="emit('loadExp', 'maxpower')">{{ t('ew.exp.maxpower') }}</button>
        </div>
      </div>
      <button class="bb-explain-btn" v-if="currentExperiment" @click="emit('explainCalcs')">{{ t('ew.explainCalcs') }}</button>
      <button class="bb-tool-btn" @click="emit('showSaveDialog')">{{ t('ew.save') }}</button>
      <button class="bb-tool-btn" @click="emit('openLoadDialog')">{{ t('ew.load') }}</button>
      <button class="bb-tool-btn" @click="emit('update:currentExperiment', null); workshop.clearAll(); redraw()">{{ t('ew.newWorkspace') }}</button>
      <button class="bb-tool-btn" @click="emit('exportPNG')">{{ t('ew.exportPng') }}</button>
      <button class="bb-tool-btn" @click="emit('printCircuit')">{{ t('ew.print') }}</button>
      <button class="bb-tool-btn" @click="emit('showHelp')">{{ String.fromCharCode(0x2753) }} {{ t('ew.help') }}</button>
      <span class="bb-rd" v-if="workshop.running.value && !workshop.error.value">
        I: {{ workshop.totalCurrent.value.toFixed(3) }}A | V: {{ workshop.totalVoltage.value.toFixed(1) }}V | P: {{ workshop.totalPower.value.toFixed(2) }}W
        <span class="bb-energy" v-if="elapsedSeconds > 0">| {{ String.fromCharCode(0x23F1) }} {{ elapsedSeconds }}s | {{ String.fromCharCode(0x26A1) }} {{ (energyKWh * 1000).toFixed(4) }}mWh</span>
      </span>
      <span class="bb-error" v-if="workshop.error.value">{{ t(workshop.error.value) }}</span>
    </div>

    <!-- Danger Visual Overlay -->
    <div class="danger-overlay" v-if="workshop.running.value && hasDanger">
      <div class="danger-pulse"></div>
      <div class="danger-banner">{{ t('ew.dangerBanner') }}</div>
    </div>

    <!-- Warning Lamps -->
    <div class="warning-lamps" v-if="workshop.running.value">
      <div class="wlamp" :class="{ on: hasDanger, off: !hasDanger }" :title="t('ew.danger')">
        <span class="wl-icon">{{ String.fromCharCode(0x1F534) }}</span>
        <span class="wl-label" v-if="hasDanger">{{ t('ew.danger') }}</span>
      </div>
      <div class="wlamp" :class="{ on: hasWarning && !hasDanger, off: !hasWarning }" :title="t('ew.warning')">
        <span class="wl-icon">{{ String.fromCharCode(0x1F7E1) }}</span>
        <span class="wl-label" v-if="hasWarning && !hasDanger">{{ t('ew.warning') }}</span>
      </div>
      <div class="wlamp" :class="{ on: !hasDanger && !hasWarning }" :title="t('ew.ok')">
        <span class="wl-icon">{{ String.fromCharCode(0x1F7E2) }}</span>
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
        <span class="fi-icon">{{ fault.severity === 'danger' ? String.fromCharCode(0x1F534) : String.fromCharCode(0x1F7E1) }}</span>
        <span class="fi-msg">{{ t(fault.messageKey, fault.vars ?? {}) }}</span>
        <span class="fi-arrow">{{ String.fromCharCode(0x203A) }}</span>
      </div>
    </div>
  </div>
</template>
