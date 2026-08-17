<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ t('experiments.ssHelpTitle') }}</h3>
          <button class="close-btn" @click="emit('close')">&#x2715;</button>
        </div>
        <div class="modal-body">

          <!-- 1. Apparatus Description -->
          <section>
            <h4>{{ t('experiments.ssHelpS1Title') }}</h4>
            <ul>
              <li>{{ t('experiments.ssHelpS1L1') }}</li>
              <li>{{ t('experiments.ssHelpS1L2') }}</li>
              <li>{{ t('experiments.ssHelpS1L3') }}</li>
              <li>{{ t('experiments.ssHelpS1L4') }}</li>
              <li>{{ t('experiments.ssHelpS1L5') }}</li>
            </ul>
          </section>

          <!-- 2. Theoretical Background -->
          <section>
            <h4>{{ t('experiments.ssHelpS2Title') }}</h4>
            <p>{{ t('experiments.ssHelpS2P1') }}</p>
            <p>{{ t('experiments.ssHelpS2P2') }}</p>
            <ul>
              <li>{{ t('experiments.ssHelpS2L1') }}</li>
              <li>{{ t('experiments.ssHelpS2L2') }}</li>
            </ul>
            <p>{{ t('experiments.ssHelpS2P3') }}</p>
            <p>{{ t('experiments.ssHelpS2P4') }}</p>
            <div class="formula">L = λ / 4</div>
            <p>{{ t('experiments.ssHelpS2P5') }}</p>
            <div class="formula">L + e = λ / 4 &nbsp;&nbsp;&rArr;&nbsp;&nbsp; L = λ/4 − e</div>
          </section>

          <!-- 3. Mathematical Equations -->
          <section>
            <h4>{{ t('experiments.ssHelpS3Title') }}</h4>
            <p>{{ t('experiments.ssHelpS3P1') }}</p>
            <div class="formula">v = f · λ &nbsp;&nbsp;&rArr;&nbsp;&nbsp; λ = v / f</div>
            <p>{{ t('experiments.ssHelpS3P2') }}</p>
            <p>{{ t('experiments.ssHelpS3P3') }}</p>
            <div class="formula">L = (v/4) · (1/f) − e</div>
            <p>{{ t('experiments.ssHelpS3P4') }}</p>
          </section>

          <!-- 4. Laboratory Procedure -->
          <section>
            <h4>{{ t('experiments.ssHelpS4Title') }}</h4>
            <ol>
              <li>{{ t('experiments.ssHelpS4L1') }}</li>
              <li>{{ t('experiments.ssHelpS4L2') }}</li>
              <li>{{ t('experiments.ssHelpS4L3') }}</li>
              <li>{{ t('experiments.ssHelpS4L4') }}</li>
              <li>{{ t('experiments.ssHelpS4L5') }}</li>
              <li>{{ t('experiments.ssHelpS4L6') }}</li>
              <li>{{ t('experiments.ssHelpS4L7') }}</li>
            </ol>
          </section>

          <!-- 5. Graphical Analysis -->
          <section>
            <h4>{{ t('experiments.ssHelpS5Title') }}</h4>
            <p>{{ t('experiments.ssHelpS5P1') }}</p>
            <ul>
              <li>{{ t('experiments.ssHelpS5L1') }}</li>
              <li>
                {{ t('experiments.ssHelpS5L2') }}
                <div class="formula">Slope = ΔL / Δ(1/f)</div>
              </li>
              <li>
                {{ t('experiments.ssHelpS5L3') }}
                <div class="formula">Slope = v / 4</div>
                <div class="formula">v = 4 × Slope</div>
              </li>
              <li>{{ t('experiments.ssHelpS5L4') }}</li>
            </ul>
          </section>

          <!-- 6. Variables & Constants -->
          <section>
            <h4>{{ t('experiments.ssHelpS6Title') }}</h4>
            <div class="element-grid">
              <div class="element">{{ t('experiments.ssHelpS6E1') }}</div>
              <div class="element">{{ t('experiments.ssHelpS6E2') }}</div>
              <div class="element">{{ t('experiments.ssHelpS6E3') }}</div>
            </div>
          </section>

          <!-- 7. Scientific Importance -->
          <section>
            <h4>{{ t('experiments.ssHelpS7Title') }}</h4>
            <ul>
              <li>{{ t('experiments.ssHelpS7L1') }}</li>
              <li>{{ t('experiments.ssHelpS7L2') }}</li>
            </ul>
          </section>

          <!-- Keyboard shortcuts -->
          <section>
            <h4>{{ t('experiments.helpKbdTitle') }}</h4>
            <div class="kbd-grid">
              <span><kbd>Space</kbd> {{ t('experiments.helpKbdSpace') }}</span>
              <span><kbd>S</kbd> {{ t('experiments.helpKbdS') }}</span>
              <span><kbd>R</kbd> {{ t('experiments.helpKbdR') }}</span>
              <span><kbd>Ctrl</kbd>+<kbd>Z</kbd> {{ t('experiments.helpKbdUndo') }}</span>
              <span><kbd>Ctrl</kbd>+<kbd>Y</kbd> {{ t('experiments.helpKbdRedo') }}</span>
              <span><kbd>?</kbd> {{ t('experiments.helpKbdHelp') }}</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.modal { background: #131a25; border: 1px solid #2D3645; border-radius: 12px; max-width: 720px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; border-bottom: 1px solid #2D3645; flex-shrink: 0; }
.modal-header h3 { margin: 0; font-size: 1rem; color: #e2e8f0; }
.close-btn { background: transparent; border: 1px solid #2D3645; color: #8B95A5; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; padding: 0; }
.close-btn:hover { background: rgba(91,141,184,.1); color: #5B8DB8; }
.modal-body { overflow-y: auto; padding: 1.2rem; font-size: .82rem; color: #cbd5e1; line-height: 1.8; text-align: start; }
.modal-body section { margin-bottom: 1.4rem; }
.modal-body h4 { margin: 0 0 .5rem; font-size: .9rem; color: #5B8DB8; border-bottom: 1px solid #2D3645; padding-bottom: .3rem; }
.modal-body p { margin: .4rem 0; }
.modal-body ol, .modal-body ul { margin: .4rem 0; padding-inline-start: 1.2rem; }
.modal-body li { margin-bottom: .25rem; }
.formula { background: #1a2332; border: 1px solid #2D3645; border-radius: 6px; padding: .6rem .8rem; font-family: monospace; font-size: .9rem; color: #5B8DB8; text-align: center; margin: .6rem 0; direction: ltr; }
.element-grid { display: flex; flex-direction: column; gap: .35rem; }
.element { background: #1a2332; border-radius: 6px; padding: .4rem .6rem; font-size: .78rem; }
.tag { color: #5B8DB8; }
.kbd-grid { display: flex; flex-wrap: wrap; gap: .4rem; }
.kbd-grid span { background: #1a2332; border: 1px solid #2D3645; border-radius: 5px; padding: .3rem .5rem; font-size: .75rem; }
kbd { background: #252D3A; border: 1px solid #475569; border-radius: 4px; padding: .05rem .3rem; font-family: monospace; font-size: .7rem; color: #D1D7E0; }
</style>
