<script setup lang="ts">
import { componentDefs } from '../shared/componentDefs'
import type { useWorkshop } from '../shared/useWorkshop'

defineProps<{
  t: (key: string, vars?: Record<string, string | number>) => string
  workshop: ReturnType<typeof useWorkshop>
  selectedSpec: { comp: any; spec: any } | null
  selectedCompFault: string | null
}>()

const emit = defineEmits<{
  (e: 'selectComponent', id: number): void
}>()
</script>

<template>
  <div class="ac-readings">
    <h3 class="readings-title">{{ t('ew.readings') }}</h3>
      <div v-if="!workshop.running.value" class="no-readings">
        {{ t('ew.pressRun') }}
      </div>
      <div v-else class="readings-list">
        <div
          v-for="comp in workshop.components"
          :key="comp.id"
          class="reading-item"
          :class="{ selected: workshop.selectedComponentId.value === comp.id }"
          @click="emit('selectComponent', comp.id)"
        >
          <span class="ri-icon">{{ componentDefs.find(d => d.type === comp.type)?.icon }}</span>
          <span class="ri-label">{{ t('ew.comp.' + comp.type) }}</span>
          <span class="ri-v">{{ comp.voltage.toFixed(3) }}V</span>
          <span class="ri-i">{{ comp.current.toFixed(4) }}A</span>
        </div>
      </div>

      <div class="readings-summary" v-if="workshop.running.value">
        <div class="rs-row">
          <span>{{ t('ew.totalCurrent') }}</span>
          <span class="rs-val">{{ workshop.totalCurrent.value.toFixed(4) }} A</span>
        </div>
        <div class="rs-row">
          <span>{{ t('ew.totalVoltage') }}</span>
          <span class="rs-val">{{ workshop.totalVoltage.value.toFixed(2) }} V</span>
        </div>
        <div class="rs-row">
          <span>{{ t('ew.totalPower') }}</span>
          <span class="rs-val">{{ workshop.totalPower.value.toFixed(3) }} W</span>
        </div>
      </div>

      <!-- Component Properties & Mechanism -->
      <div v-if="selectedSpec" class="comp-info">
        <div class="comp-info-header">
          <span class="ci-icon">{{ componentDefs.find(d => d.type === selectedSpec?.comp.type)?.icon }}</span>
          <h4>{{ t('ew.comp.' + selectedSpec?.comp.type) }}</h4>
        </div>

        <!-- Properties Table -->
        <div class="ci-section">
          <h5 class="ci-title">{{ t('ew.properties') }}</h5>
          <table class="ci-table">
            <tbody>
              <tr v-for="(prop, i) in selectedSpec.spec?.properties" :key="i">
                <td class="ci-key">{{ t(prop.labelKey) }}</td>
                <td class="ci-val">{{ t(prop.valueKey) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mechanism Table -->
        <div class="ci-section">
          <h5 class="ci-title">{{ t('ew.mechanism') }}</h5>
          <table class="ci-table">
            <thead>
              <tr><th>{{ t('ew.step') }}</th><th>{{ t('ew.description') }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(step, i) in selectedSpec.spec?.mechanism" :key="i">
                <td class="ci-step">{{ step.step }}</td>
                <td class="ci-desc">{{ t(step.descKey) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Formula -->
        <div class="ci-section" v-if="selectedSpec.spec?.formulaKey">
          <h5 class="ci-title">{{ t('ew.formulaTitle') }}</h5>
          <div class="ci-formula">{{ t(selectedSpec.spec.formulaKey) }}</div>
          <div class="ci-formula-desc">{{ t(selectedSpec.spec.formulaDescKey ?? '') }}</div>
        </div>

        <!-- Live Readings -->
        <div class="ci-section" v-if="workshop.running.value">
          <h5 class="ci-title">{{ t('ew.liveReadings') }}</h5>
          <table class="ci-table">
            <tbody>
              <tr><td class="ci-key">{{ t('ew.voltage') }}</td><td class="ci-val">{{ selectedSpec?.comp.voltage.toFixed(4) }} V</td></tr>
              <tr><td class="ci-key">{{ t('ew.current') }}</td><td class="ci-val">{{ selectedSpec?.comp.current.toFixed(4) }} A</td></tr>
              <tr><td class="ci-key">{{ t('ew.power') }}</td><td class="ci-val">{{ workshop.getPower(selectedSpec!.comp).toFixed(4) }} W</td></tr>
              <tr><td class="ci-key">{{ t('ew.status') }}</td><td class="ci-val" :class="{ 'ci-ok': !selectedCompFault, 'ci-fault': selectedCompFault }">{{ selectedCompFault ? '⚠ ' + selectedCompFault : t('ew.okStatus') }}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Applications -->
        <div class="ci-section">
          <h5 class="ci-title">{{ t('ew.applications') }}</h5>
          <div class="ci-apps">
            <span v-for="(appKey, i) in selectedSpec.spec?.applicationKeys" :key="i" class="ci-app-tag">{{ t(appKey) }}</span>
          </div>
        </div>
      </div>
    </div>
</template>
