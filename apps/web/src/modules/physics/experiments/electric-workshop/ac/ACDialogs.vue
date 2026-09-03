<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'
import type { WorkshopComponent, FaultInfo } from '../shared/types'
import type { useWorkshop } from '../shared/useWorkshop'
import { sanitizeHtml } from '../../../../../utils/sanitizeHtml'
const props = defineProps<{
  t: (key: string, vars?: Record<string, string | number>) => string
  workshop: ReturnType<typeof useWorkshop>
  showCalcExplanation: boolean
  calcExplanationHtml: string
  canvasSnapshot: string
  showSaveDialog: boolean
  showLoadDialog: boolean
  circuitName: string
  savedCircuits: string[]
  showResistorTutorial: boolean
  editingComp: WorkshopComponent | null
  resistorBandPreview: string[]
  resistorBandExplanation: string
  resistorColorChart: { name: string; hex: string; digit: number | null; multiplier: string | null; tolerance: number | null }[]
  showHelp: boolean
  selectedFault: FaultInfo | null
  canvasFullscreen: boolean
}>()

const fault = computed(() => props.selectedFault ?? ({} as FaultInfo))
const safeCalcHtml = computed(() => sanitizeHtml(props.calcExplanationHtml))

const emit = defineEmits<{
  (e: 'update:showCalcExplanation', v: boolean): void
  (e: 'update:showSaveDialog', v: boolean): void
  (e: 'update:showLoadDialog', v: boolean): void
  (e: 'update:circuitName', v: string): void
  (e: 'update:showResistorTutorial', v: boolean): void
  (e: 'update:showHelp', v: boolean): void
  (e: 'update:selectedFault', v: FaultInfo | null): void
  (e: 'update:canvasFullscreen', v: boolean): void
  (e: 'doSaveCircuit'): void
  (e: 'doLoadCircuit', name: string): void
  (e: 'doDeleteCircuit', name: string): void
  (e: 'exportPNG'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div class="fs-overlay" v-if="showCalcExplanation" @click.self="emit('update:showCalcExplanation', false)">
      <div class="fs-container">
        <div class="fs-header">
          <span class="fs-title">{{ t('ew.calcExplanationTitle') }}</span>
          <button class="fs-close" @click="emit('update:showCalcExplanation', false)">{{ t('ew.close') }}</button>
        </div>
        <div class="fs-body">
          <div class="fs-canvas-side">
            <img v-if="canvasSnapshot" :src="canvasSnapshot" class="fs-snapshot" alt="circuit" />
          </div>
          <div class="fs-calc-side" v-html="safeCalcHtml"></div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Save Circuit Dialog -->
  <Teleport to="body">
    <div class="dlg-overlay" v-if="showSaveDialog" @click.self="emit('update:showSaveDialog', false)">
      <div class="dlg-box">
        <div class="dlg-header">{{ t('ew.saveCircuit') }}</div>
        <div class="dlg-content">
          <input class="dlg-input" :value="circuitName" @input="emit('update:circuitName', ($event.target as HTMLInputElement).value)" :placeholder="t('ew.circuitNamePlaceholder')" @keyup.enter="emit('doSaveCircuit')" />
        </div>
        <div class="dlg-actions">
          <button class="dlg-btn dlg-cancel" @click="emit('update:showSaveDialog', false)">{{ t('ew.cancel') }}</button>
          <button class="dlg-btn dlg-ok" @click="emit('doSaveCircuit')">{{ t('ew.saveBtn') }}</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Load Circuit Dialog -->
  <Teleport to="body">
    <div class="dlg-overlay" v-if="showLoadDialog" @click.self="emit('update:showLoadDialog', false)">
      <div class="dlg-box">
        <div class="dlg-header">{{ t('ew.loadCircuit') }}</div>
        <div class="dlg-content">
          <div v-if="savedCircuits.length === 0" class="dlg-empty">{{ t('ew.noSavedCircuits') }}</div>
          <div v-else class="dlg-list">
            <div v-for="name in savedCircuits" :key="name" class="dlg-list-item">
              <span class="dlg-item-name" @click="emit('doLoadCircuit', name)">{{ name }}</span>
              <button class="dlg-del" @click="emit('doDeleteCircuit', name)">🗑</button>
            </div>
          </div>
        </div>
        <div class="dlg-actions">
          <button class="dlg-btn dlg-cancel" @click="emit('update:showLoadDialog', false)">{{ t('ew.closeBtn') }}</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Resistor Color Code Tutorial -->
  <Teleport to="body">
    <div class="fs-overlay" v-if="showResistorTutorial" @click.self="emit('update:showResistorTutorial', false)">
      <div class="fs-container" style="max-width: 700px;">
        <div class="fs-header">
          <span class="fs-title">🎨 {{ t('ew.resistorColorTutorial') }}</span>
          <button class="fs-close" @click="emit('update:showResistorTutorial', false)">{{ t('ew.close') }}</button>
        </div>
        <div class="fs-body" style="flex-direction: column; overflow-y: auto; padding: 20px;">
          <!-- Current resistor preview -->
          <div v-if="editingComp" class="rt-current-preview">
            <h4>{{ t('ew.yourResistor') }}: {{ editingComp.value }}Ω</h4>
            <div class="rt-resistor-display">
              <div class="rt-resistor-body">
                <div
                  v-for="(color, i) in resistorBandPreview"
                  :key="i"
                  class="rt-band"
                  :style="{ background: color }"
                ></div>
              </div>
            </div>
            <p class="rt-explanation">{{ resistorBandExplanation }}</p>
          </div>

          <!-- Color code chart -->
          <h4 class="rt-section-title">{{ t('ew.colorCodeChart') }}</h4>
          <table class="rt-color-table">
            <thead>
              <tr>
                <th>{{ t('ew.color') }}</th>
                <th>{{ t('ew.digit') }}</th>
                <th>{{ t('ew.multiplier') }}</th>
                <th>{{ t('ew.tolerance') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in resistorColorChart" :key="row.name">
                <td class="rt-color-cell">
                  <span class="rt-color-swatch" :style="{ background: row.hex }"></span>
                  {{ row.name }}
                </td>
                <td>{{ row.digit !== null ? row.digit : '—' }}</td>
                <td>{{ row.multiplier !== null ? row.multiplier : '—' }}</td>
                <td>{{ row.tolerance !== null ? row.tolerance + '%' : '—' }}</td>
              </tr>
            </tbody>
          </table>

          <!-- How to read -->
          <h4 class="rt-section-title">{{ t('ew.howToRead') }}</h4>
          <div class="rt-steps">
            <div class="rt-step">
              <span class="rt-step-num">1</span>
              <span>{{ t('ew.rtStep1') }}</span>
            </div>
            <div class="rt-step">
              <span class="rt-step-num">2</span>
              <span>{{ t('ew.rtStep2') }}</span>
            </div>
            <div class="rt-step">
              <span class="rt-step-num">3</span>
              <span>{{ t('ew.rtStep3') }}</span>
            </div>
            <div class="rt-step">
              <span class="rt-step-num">4</span>
              <span>{{ t('ew.rtStep4') }}</span>
            </div>
          </div>

          <!-- Example -->
          <h4 class="rt-section-title">{{ t('ew.exampleTitle') }}</h4>
          <div class="rt-example">
            <p>{{ t('ew.exampleDesc') }}</p>
            <div class="rt-example-resistor">
              <div class="rt-resistor-body">
                <div class="rt-band" style="background: #ef4444;"></div>
                <div class="rt-band" style="background: #f97316;"></div>
                <div class="rt-band" style="background: #8B4513;"></div>
                <div class="rt-band" style="background: #d4af37;"></div>
              </div>
            </div>
            <p class="rt-example-calc">{{ t('ew.exampleCalc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Help Panel -->
  <Teleport to="body">
    <div class="fs-overlay" v-if="showHelp" @click.self="emit('update:showHelp', false)">
      <div class="fs-container" style="max-width: 600px;">
        <div class="fs-header">
          <span class="fs-title">❓ {{ t('ew.helpTitle') }}</span>
          <button class="fs-close" @click="emit('update:showHelp', false)">{{ t('ew.close') }}</button>
        </div>
        <div class="fs-body" style="flex-direction: column; overflow-y: auto; padding: 20px;">
          <h4 class="rt-section-title">{{ t('ew.helpGettingStarted') }}</h4>
          <div class="rt-steps">
            <div class="rt-step"><span class="rt-step-num">1</span><span>{{ t('ew.helpStep1') }}</span></div>
            <div class="rt-step"><span class="rt-step-num">2</span><span>{{ t('ew.helpStep2') }}</span></div>
            <div class="rt-step"><span class="rt-step-num">3</span><span>{{ t('ew.helpStep3') }}</span></div>
            <div class="rt-step"><span class="rt-step-num">4</span><span>{{ t('ew.helpStep4') }}</span></div>
            <div class="rt-step"><span class="rt-step-num">5</span><span>{{ t('ew.helpStep5') }}</span></div>
          </div>

          <h4 class="rt-section-title">{{ t('ew.helpShortcuts') }}</h4>
          <table class="rt-color-table">
            <thead>
              <tr><th>{{ t('ew.helpKey') }}</th><th>{{ t('ew.helpAction') }}</th></tr>
            </thead>
            <tbody>
              <tr><td>Space</td><td>{{ t('ew.helpRunStop') }}</td></tr>
              <tr><td>R</td><td>{{ t('ew.helpRotate') }}</td></tr>
              <tr><td>Delete</td><td>{{ t('ew.helpDelete') }}</td></tr>
              <tr><td>Ctrl+Z</td><td>{{ t('ew.undo') }}</td></tr>
              <tr><td>Ctrl+Y</td><td>{{ t('ew.redo') }}</td></tr>
              <tr><td>Double-click</td><td>{{ t('ew.helpDblClick') }}</td></tr>
            </tbody>
          </table>

          <h4 class="rt-section-title">{{ t('ew.helpTips') }}</h4>
          <div class="rt-steps">
            <div class="rt-step"><span class="rt-step-num">💡</span><span>{{ t('ew.helpTip1') }}</span></div>
            <div class="rt-step"><span class="rt-step-num">💡</span><span>{{ t('ew.helpTip2') }}</span></div>
            <div class="rt-step"><span class="rt-step-num">💡</span><span>{{ t('ew.helpTip3') }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Fault Detail Panel -->
  <Teleport to="body">
    <div class="fs-overlay" v-if="selectedFault" @click.self="emit('update:selectedFault', null)">
      <div class="fs-container" style="max-width: 550px;">
        <div class="fs-header" :class="fault.severity">
          <span class="fs-title">
            {{ fault.severity === 'danger' ? '🔴' : '🟡' }}
            {{ t('ew.faultTitle') }}
          </span>
          <button class="fs-close" @click="emit('update:selectedFault', null)">{{ t('ew.close') }}</button>
        </div>
        <div class="fs-body" style="flex-direction: column; overflow-y: auto; padding: 20px;">
          <!-- Fault message -->
          <div class="fault-detail-msg" :class="fault.severity">
            <span class="fd-icon">{{ fault.severity === 'danger' ? '🔴' : '🟡' }}</span>
            <span>{{ t(fault.messageKey, fault.vars ?? {}) }}</span>
          </div>

          <!-- What does it mean -->
          <h4 class="rt-section-title">{{ t('ew.faultWhatIsIt') }}</h4>
          <p class="fault-detail-text">{{ t('ew.faultExplain.' + fault.type, fault.vars ?? {}) }}</p>

          <!-- How to fix -->
          <h4 class="rt-section-title">{{ t('ew.faultHowToFix') }}</h4>
          <p class="fault-detail-text">{{ t('ew.faultFix.' + fault.type, fault.vars ?? {}) }}</p>

          <!-- Component info -->
          <h4 class="rt-section-title">{{ t('ew.faultComponent') }}</h4>
          <div class="fault-detail-comp">
            <template v-if="workshop.components.find(c => c.id === fault.componentId)">
              <span class="fdc-type">{{ t('ew.comp.' + workshop.components.find(c => c.id === fault.componentId)?.type) }}</span>
              <span class="fdc-value" v-if="workshop.components.find(c => c.id === fault.componentId)?.value">
                {{ workshop.components.find(c => c.id === fault.componentId)?.value }}{{ workshop.components.find(c => c.id === fault.componentId)?.unit }}
              </span>
              <span class="fdc-readings">
                V: {{ (workshop.components.find(c => c.id === fault.componentId)?.voltage ?? 0).toFixed(3) }}V |
                A: {{ (workshop.components.find(c => c.id === fault.componentId)?.current ?? 0).toFixed(4) }}A |
                W: {{ workshop.getPower(workshop.components.find(c => c.id === fault.componentId)!).toFixed(3) }}W
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Fullscreen Canvas View -->
  <Teleport to="body">
    <div class="cv-fs-overlay" v-if="canvasFullscreen" @click.self="emit('update:canvasFullscreen', false)">
      <div class="cv-fs-container">
        <div class="cv-fs-header">
          <span class="cv-fs-title">{{ t('ew.fullscreenPreview') }}</span>
          <div class="cv-fs-actions">
            <button class="cv-fs-btn" @click="emit('exportPNG')">{{ t('ew.savePng') }}</button>
            <button class="cv-fs-close" @click="emit('update:canvasFullscreen', false)">{{ t('ew.close') }}</button>
          </div>
        </div>
        <div class="cv-fs-body">
          <img v-if="canvasSnapshot" :src="canvasSnapshot" class="cv-fs-img" alt="circuit fullscreen" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
