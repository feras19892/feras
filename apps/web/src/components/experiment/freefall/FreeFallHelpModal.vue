<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>📖 {{ t('experiments.freeFallGuide') }}</h3>
        <button class="close-btn" @click="emit('close')">&#x2715;</button>
      </div>
      <div class="modal-body">
        <section>
          <h4>🔬 {{ t('experiments.experimentConcept') }}</h4>
          <p>{{ t('experiments.freeFallConceptDesc1') }}</p>
          <div class="formula">h = ½ · g · t²  &nbsp;&nbsp;→&nbsp;&nbsp;  g = 2h / t²</div>
          <p>{{ t('experiments.freeFallConceptDesc2') }}</p>
        </section>

        <section>
          <h4>⚙️ {{ t('experiments.workspaceElementsTitle') }}</h4>
          <div class="element-grid">
            <div class="element"><b class="tag">🔷 {{ t('experiments.canvasPanel') }}</b> — {{ t('experiments.canvasPanel') }}</div>
            <div class="element"><b class="tag">📋 {{ t('experiments.tablePanel') }}</b> — {{ t('experiments.tablePanel') }}</div>
            <div class="element"><b class="tag">📈 {{ t('experiments.menuScatter') }}</b> — {{ t('experiments.menuScatter') }}</div>
            <div class="element"><b class="tag">📊 {{ t('experiments.fallSignalLabel') }}</b> — {{ t('experiments.fallSignalLabel') }}</div>
            <div class="element"><b class="tag">⚗️ {{ t('experiments.equationsLabel') }}</b> — {{ t('experiments.equationsLabel') }}</div>
            <div class="element"><b class="tag">📊 {{ t('experiments.statisticsLabel') }}</b> — {{ t('experiments.statisticsLabel') }}</div>
            <div class="element"><b class="tag">⚙️ {{ t('experiments.parametersLabel') }}</b> — {{ t('experiments.parametersLabel') }}</div>
          </div>
        </section>

        <section>
          <h4>🎮 {{ t('experiments.controlButtonsTitle') }}</h4>
          <ul>
            <li><b>▶️ {{ t('experiments.releaseStop') }}</b> — {{ t('experiments.releaseStopDesc') }}</li>
            <li><b>🔄 {{ t('experiments.resetLabel') }}</b> — {{ t('experiments.resetSimulationDesc') }}</li>
            <li><b>📌 {{ t('experiments.recordMeasurement') }}</b> — {{ t('experiments.recordMeasurementDesc') }}</li>
            <li><b>↩️ {{ t('experiments.undoRedo') }}</b> — {{ t('experiments.undoRedoDesc') }}</li>
            <li><b>🗑️ {{ t('experiments.clearAllLabel') }}</b> — {{ t('experiments.clearAllDesc') }}</li>
            <li><b>💾 {{ t('experiments.csvExport') }}</b> — {{ t('experiments.csvExportDesc') }}</li>
            <li><b>⚡ {{ t('experiments.relativeError') }}</b> — {{ t('experiments.relativeErrorDesc') }}</li>
            <li><b>⚡ {{ t('experiments.speedMultiplier') }}</b> — {{ t('experiments.speedMultiplierDesc') }}</li>
          </ul>
        </section>

        <section>
          <h4>📐 {{ t('experiments.workStepsTitle') }}</h4>
          <ol>
            <li><b>{{ t('experiments.setParametersStep') }}:</b> {{ t('experiments.setParametersStep') }}</li>
            <li><b>{{ t('experiments.startFallStep') }}:</b> {{ t('experiments.startFallStep') }}</li>
            <li><b>{{ t('experiments.waitCollisionStep') }}:</b> {{ t('experiments.waitCollisionStep') }}</li>
            <li><b>{{ t('experiments.recordMeasurementStep') }}:</b> {{ t('experiments.recordMeasurementStep') }}</li>
            <li><b>{{ t('experiments.repeatExperimentStep') }}:</b> {{ t('experiments.repeatExperimentStep') }}</li>
            <li><b>{{ t('experiments.calcGSingleStep') }}:</b> {{ t('experiments.calcGSingleStep') }}</li>
            <li><b>{{ t('experiments.calcGRegressionStep') }}:</b> {{ t('experiments.calcGRegressionStep') }}</li>
            <li><b>{{ t('experiments.reviewChartStep') }}:</b> {{ t('experiments.reviewChartStep') }}</li>
            <li><b>{{ t('experiments.reviewSignalStep') }}:</b> {{ t('experiments.reviewSignalStep') }}</li>
            <li><b>{{ t('experiments.reviewStatsStep') }}:</b> {{ t('experiments.reviewStatsStep') }}</li>
            <li><b>{{ t('experiments.printReportStep') }}:</b> {{ t('experiments.printReportStep') }}</li>
          </ol>
        </section>

        <section>
          <h4>📊 {{ t('experiments.calcGThreeMethods') }}</h4>
          <div class="method"><b>{{ t('experiments.method1Single') }}:</b> g = 2h / t²</div>
          <div class="method"><b>{{ t('experiments.method2Regression') }}:</b> {{ t('experiments.method2Regression') }}</div>
          <div class="method"><b>{{ t('experiments.method3Average') }}:</b> {{ t('experiments.method3Average') }}</div>
        </section>

        <section>
          <h4>⌨️ {{ t('experiments.keyboardShortcutsTitle') }}</h4>
          <div class="kbd-grid">
            <span><kbd>Space</kbd> {{ t('experiments.shortcutReleaseStop') }}</span>
            <span><kbd>S</kbd> {{ t('experiments.shortcutRecordMeasurement') }}</span>
            <span><kbd>R</kbd> {{ t('experiments.shortcutResetLabel') }}</span>
            <span><kbd>Ctrl</kbd>+<kbd>Z</kbd> {{ t('experiments.shortcutUndoLabel') }}</span>
            <span><kbd>Ctrl</kbd>+<kbd>Y</kbd> {{ t('experiments.shortcutRedoLabel') }}</span>
            <span><kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>Z</kbd> {{ t('experiments.shortcutRedoLabel') }}</span>
            <span><kbd>?</kbd> {{ t('experiments.shortcutToggleHelpLabel') }}</span>
          </div>
        </section>

        <section>
          <h4>⚠️ {{ t('experiments.importantTips') }}</h4>
          <ul>
            <li>{{ t('experiments.importantTips') }}</li>
          </ul>
        </section>

        <section>
          <h4>🔧 {{ t('experiments.topMenuBarButtons') }}</h4>
          <ul>
            <li><b>{{ t('experiments.fileMenu') }}</b> — {{ t('experiments.fileMenuDesc') }}</li>
            <li><b>{{ t('experiments.viewMenu') }}</b> — {{ t('experiments.viewMenuDesc') }}</li>
            <li><b>{{ t('experiments.menuRun') }}</b> — {{ t('experiments.runMenuDesc') }}</li>
            <li><b>📝 {{ t('experiments.printReportLabel') }}</b> — {{ t('experiments.printReportDesc') }}</li>
            <li><b>❓ {{ t('experiments.helpLabel') }}</b> — {{ t('experiments.helpDesc') }}</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.modal { background: #131a25; border: 1px solid #2D3645; border-radius: 12px; max-width: 680px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; border-bottom: 1px solid #2D3645; flex-shrink: 0; }
.modal-header h3 { margin: 0; font-size: 1rem; color: #e2e8f0; }
.close-btn { background: transparent; border: 1px solid #2D3645; color: #8B95A5; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; padding: 0; }
.close-btn:hover { background: rgba(91,141,184,.1); color: #5B8DB8; }
.modal-body { overflow-y: auto; padding: 1.2rem; font-size: .82rem; color: #cbd5e1; line-height: 1.8; }
.modal-body section { margin-bottom: 1.2rem; }
.modal-body h4 { margin: 0 0 .4rem; font-size: .88rem; color: #5B8DB8; border-bottom: 1px solid #2D3645; padding-bottom: .25rem; }
.modal-body p { margin: .3rem 0; }
.modal-body ol, .modal-body ul { margin: .3rem 0; padding-right: 1.2rem; }
.modal-body li { margin-bottom: .15rem; }
.formula { background: #1a2332; border: 1px solid #2D3645; border-radius: 6px; padding: .5rem .8rem; font-family: monospace; font-size: .9rem; color: #5B8DB8; text-align: center; margin: .4rem 0; direction: ltr; }
.element-grid { display: flex; flex-direction: column; gap: .25rem; }
.element { background: #1a2332; border-radius: 6px; padding: .35rem .5rem; font-size: .78rem; }
.tag { color: #5B8DB8; }
.method { background: #1a2332; border-radius: 6px; padding: .4rem .6rem; margin-bottom: .3rem; font-size: .78rem; }
.kbd-grid { display: flex; flex-wrap: wrap; gap: .4rem; }
.kbd-grid span { background: #1a2332; border: 1px solid #2D3645; border-radius: 5px; padding: .25rem .5rem; font-size: .75rem; }
kbd { background: #252D3A; border: 1px solid #475569; border-radius: 4px; padding: .05rem .3rem; font-family: monospace; font-size: .7rem; color: #D1D7E0; }
</style>
