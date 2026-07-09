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
          <h3>{{ t('experiments.coHelpTitle') }}</h3>
          <button class="close-btn" @click="emit('close')">&#x2715;</button>
        </div>
        <div class="modal-body">

          <!-- 1. Theoretical Background -->
          <section>
            <h4>{{ t('experiments.coHelpS1Title') }}</h4>
            <p>{{ t('experiments.coHelpS1P1') }}</p>
            <p>{{ t('experiments.coHelpS1P2') }}</p>
            <p>{{ t('experiments.coHelpS1P3') }}</p>
            <ul>
              <li>{{ t('experiments.coHelpS1L1') }}</li>
              <li>{{ t('experiments.coHelpS1L2') }}</li>
            </ul>
          </section>

          <!-- 2. Mathematical Equations -->
          <section>
            <h4>{{ t('experiments.coHelpS2Title') }}</h4>
            <p>{{ t('experiments.coHelpS2P1') }}</p>
            <div class="formula">m₁·v₁ᵢ + m₂·v₂ᵢ = m₁·v₁f + m₂·v₂f</div>
            <p>{{ t('experiments.coHelpS2P2') }}</p>
            <p>{{ t('experiments.coHelpS2P3') }}</p>
            <div class="formula">m₁·v₁ᵢ + m₂·v₂ᵢ = (m₁ + m₂)·v_f</div>
            <p>{{ t('experiments.coHelpS2P4') }}</p>
            <div class="formula">v_f = (m₁·v₁ᵢ + m₂·v₂ᵢ) / (m₁ + m₂)</div>
          </section>

          <!-- 3. Laboratory Procedure -->
          <section>
            <h4>{{ t('experiments.coHelpS3Title') }}</h4>
            <p>{{ t('experiments.coHelpS3P1') }}</p>
            <ol>
              <li>{{ t('experiments.coHelpS3L1') }}</li>
              <li>{{ t('experiments.coHelpS3L2') }}</li>
              <li>{{ t('experiments.coHelpS3L3') }}</li>
              <li>{{ t('experiments.coHelpS3L4') }}</li>
              <li>{{ t('experiments.coHelpS3L5') }}</li>
            </ol>
          </section>

          <!-- 4. Graphical Analysis -->
          <section>
            <h4>{{ t('experiments.coHelpS4Title') }}</h4>
            <p>{{ t('experiments.coHelpS4P1') }}</p>
            <ul>
              <li>{{ t('experiments.coHelpS4L1') }}</li>
              <li>
                {{ t('experiments.coHelpS4L2') }}
                <div class="formula">Slope = Δpᵢ / Δv_f</div>
              </li>
              <li>
                {{ t('experiments.coHelpS4L3') }}
                <div class="formula">Slope = m₁ + m₂</div>
                <div class="formula">m₂ = Slope - m₁</div>
              </li>
            </ul>
          </section>

          <!-- 5. Variables & Constants -->
          <section>
            <h4>{{ t('experiments.coHelpS5Title') }}</h4>
            <div class="element-grid">
              <div class="element">{{ t('experiments.coHelpS5E1') }}</div>
              <div class="element">{{ t('experiments.coHelpS5E2') }}</div>
              <div class="element">{{ t('experiments.coHelpS5E3') }}</div>
            </div>
          </section>

          <!-- 6. Scientific Importance -->
          <section>
            <h4>{{ t('experiments.coHelpS6Title') }}</h4>
            <ul>
              <li>{{ t('experiments.coHelpS6L1') }}</li>
              <li>{{ t('experiments.coHelpS6L2') }}</li>
              <li>{{ t('experiments.coHelpS6L3') }}</li>
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
.modal-body { overflow-y: auto; padding: 1.2rem; font-size: .82rem; color: #cbd5e1; line-height: 1.8; direction: rtl; text-align: right; }
.modal-body section { margin-bottom: 1.4rem; }
.modal-body h4 { margin: 0 0 .5rem; font-size: .9rem; color: #5B8DB8; border-bottom: 1px solid #2D3645; padding-bottom: .3rem; }
.modal-body p { margin: .4rem 0; }
.modal-body ol, .modal-body ul { margin: .4rem 0; padding-right: 1.2rem; }
.modal-body li { margin-bottom: .25rem; }
.formula { background: #1a2332; border: 1px solid #2D3645; border-radius: 6px; padding: .6rem .8rem; font-family: monospace; font-size: .9rem; color: #5B8DB8; text-align: center; margin: .6rem 0; direction: ltr; }
.element-grid { display: flex; flex-direction: column; gap: .35rem; }
.element { background: #1a2332; border-radius: 6px; padding: .4rem .6rem; font-size: .78rem; }
.tag { color: #5B8DB8; }
.kbd-grid { display: flex; flex-wrap: wrap; gap: .4rem; }
.kbd-grid span { background: #1a2332; border: 1px solid #2D3645; border-radius: 5px; padding: .3rem .5rem; font-size: .75rem; }
kbd { background: #252D3A; border: 1px solid #475569; border-radius: 4px; padding: .05rem .3rem; font-family: monospace; font-size: .7rem; color: #D1D7E0; }
</style>
