<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import type { useWorkshop } from '../shared/useWorkshop'
import { componentDefs } from '../shared/componentDefs'
import { getSpec } from '../shared/componentSpecs'
import { computed } from 'vue'

const props = defineProps<{
  t: (key: string, vars?: Record<string, string>) => string
  workshop: ReturnType<typeof useWorkshop>
  selectedCompFault: string | null
  redraw: () => void
}>()

const selectedSpec = computed(() => {
  if (!props.workshop.selectedComponentId.value) return null
  const comp = props.workshop.components.find(c => c.id === props.workshop.selectedComponentId.value)
  if (!comp) return null
  return { comp, spec: getSpec(comp.type) }
})

function selectComponent(id: number) {
  // eslint-disable-next-line vue/no-mutating-props
  props.workshop.selectedComponentId.value = id
  props.redraw()
}
</script>

<template>
  <div class="dc-readings">
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
        @click="selectComponent(comp.id)"
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

    <div v-if="selectedSpec" class="comp-info">
      <div class="comp-info-header">
        <span class="ci-icon">{{ componentDefs.find(d => d.type === selectedSpec?.comp.type)?.icon }}</span>
        <h4>{{ t('ew.comp.' + selectedSpec?.comp.type) }}</h4>
      </div>

      <div class="ci-section" v-if="selectedSpec.spec?.descriptionKey">
        <h5 class="ci-title">{{ t('ew.spec.description') }}</h5>
        <p class="ci-desc-text">{{ t(selectedSpec.spec.descriptionKey) }}</p>
      </div>

      <div class="ci-section" v-if="selectedSpec.spec?.benefitKey">
        <h5 class="ci-title">{{ t('ew.spec.benefit') }}</h5>
        <p class="ci-desc-text">{{ t(selectedSpec.spec.benefitKey) }}</p>
      </div>

      <div class="ci-section" v-if="selectedSpec.spec?.connectionGuide?.length">
        <h5 class="ci-title">{{ t('ew.spec.connectionGuide') }}</h5>
        <table class="ci-table">
          <thead>
            <tr><th>{{ t('ew.spec.terminal') }}</th><th>{{ t('ew.spec.connectionDesc') }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(conn, i) in selectedSpec.spec?.connectionGuide" :key="i">
              <td class="ci-key">{{ conn.terminal }}</td>
              <td class="ci-val">{{ t(conn.descKey) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

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

      <div class="ci-section" v-if="selectedSpec.spec?.formulaKey">
        <h5 class="ci-title">{{ t('ew.formulaTitle') }}</h5>
        <div class="ci-formula">{{ t(selectedSpec.spec.formulaKey) }}</div>
        <div class="ci-formula-desc">{{ t(selectedSpec.spec.formulaDescKey ?? '') }}</div>
      </div>

      <div class="ci-section" v-if="workshop.running.value">
        <h5 class="ci-title">{{ t('ew.liveReadings') }}</h5>
        <table class="ci-table">
          <tbody>
            <tr><td class="ci-key">{{ t('ew.voltage') }}</td><td class="ci-val">{{ selectedSpec?.comp.voltage.toFixed(4) }} V</td></tr>
            <tr><td class="ci-key">{{ t('ew.current') }}</td><td class="ci-val">{{ selectedSpec?.comp.current.toFixed(4) }} A</td></tr>
            <tr><td class="ci-key">{{ t('ew.power') }}</td><td class="ci-val">{{ workshop.getPower(selectedSpec!.comp).toFixed(4) }} W</td></tr>
            <tr><td class="ci-key">{{ t('ew.status') }}</td><td class="ci-val" :class="{ 'ci-ok': !selectedCompFault, 'ci-fault': selectedCompFault }">{{ selectedCompFault ? 'âš  ' + selectedCompFault : t('ew.okStatus') }}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="ci-section">
        <h5 class="ci-title">{{ t('ew.applications') }}</h5>
        <div class="ci-apps">
          <span v-for="(appKey, i) in selectedSpec.spec?.applicationKeys" :key="i" class="ci-app-tag">{{ t(appKey) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
