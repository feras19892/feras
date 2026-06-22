<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="help-modal" v-if="open" @click.self="emit('close')">
    <div class="help-content">
      <button class="close-btn" @click="emit('close')">✕</button>
      <h2>🎓 {{ t('experiments.inclinedGuide') }}</h2>
      <section>
        <h3>📖 {{ t('experiments.physicalConcept') }}</h3>
        <p>{{ t('experiments.inclinedConceptDesc1') }}</p>
        <p>{{ t('experiments.inclinedConceptDesc2') }}</p>
        <p>{{ t('experiments.inclinedConceptDesc3') }}</p>
      </section>
      <section>
        <h3>📐 {{ t('experiments.basicEquations') }}</h3>
        <ul>
          <li>a = g·sin(θ) − μ·g·cos(θ)</li>
          <li>s = ½·a·t²</li>
          <li>v = a·t</li>
          <li>t = √(2L/a)</li>
          <li>v = √(2aL)</li>
          <li>N = m·g·cos(θ)</li>
          <li>F∥ = m·g·sin(θ)</li>
          <li>f = μ·N = μ·m·g·cos(θ)</li>
        </ul>
      </section>
      <section>
        <h3>🖥️ {{ t('experiments.workspaceElements') }}</h3>
        <ul>
          <li>{{ t('experiments.canvasPanel') }}</li>
          <li>{{ t('experiments.parametersPanel') }}</li>
          <li>{{ t('experiments.tablePanel') }}</li>
          <li>{{ t('experiments.chartsPanel') }}</li>
          <li>{{ t('experiments.calculationsPanel') }}</li>
        </ul>
      </section>
      <section>
        <h3>⌨️ {{ t('experiments.keyboardShortcuts') }}</h3>
        <ul>
          <li>Space — {{ t('experiments.shortcutStartStop') }}</li>
          <li>R — {{ t('experiments.shortcutReset') }}</li>
          <li>S — {{ t('experiments.recordReading') }}</li>
          <li>Ctrl+Z — {{ t('experiments.shortcutUndo') }}</li>
          <li>Ctrl+Shift+Z — {{ t('experiments.shortcutRedo') }}</li>
          <li>? — {{ t('experiments.shortcutToggleHelp') }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.help-modal { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; }
.help-content { background:#161B22; border:1px solid #2D3645; border-radius:12px; padding:1.5rem; max-width:560px; width:90%; max-height:80vh; overflow:auto; position:relative; }
.close-btn { position:absolute; top:.6rem; left:.6rem; background:none; border:none; color:#8B95A5; cursor:pointer; font-size:1.1rem; }
.help-content h2 { color:#5B8DB8; margin:0 0 1rem; font-size:1.1rem; }
.help-content h3 { color:#D1D7E0; margin:1rem 0 .4rem; font-size:.85rem; }
.help-content p { color:#B8C0CC; font-size:.74rem; line-height:1.6; margin:.2rem 0; }
.help-content ul { color:#B8C0CC; font-size:.72rem; line-height:1.7; padding-right:1.2rem; margin:0; }
</style>
