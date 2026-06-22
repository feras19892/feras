<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

defineProps<{ open: boolean }>()
const { t } = useI18n()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="help-overlay" @click.self="emit('close')">
      <div class="help-card">
        <div class="help-header">
          <h2>&#x2753; {{ t('experiments.pendulumExperimentGuide') }}</h2>
          <button class="close-btn" @click="emit('close')">&#x2715;</button>
        </div>
        <div class="help-body">
          <section class="help-section">
            <h3>&#x1F4DA; {{ t('experiments.pendulumDefinition') }}</h3>
            <p>{{ t('experiments.pendulumDefinitionDesc') }}</p>
          </section>
          <section class="help-section">
            <h3>&#x2696;&#xFE0F; {{ t('experiments.basicEquations') }}</h3>
            <div class="eq-box">
              <div class="eq-line"><b>T</b> = 2π √(L / g)</div>
              <div class="eq-line"><b>ω₀</b> = √(g / L)</div>
              <div class="eq-line"><b>g</b> = 4π²L / T²</div>
            </div>
            <p class="help-hint">{{ t('experiments.validForSmallAngles') }}</p>
          </section>
          <section class="help-section">
            <h3>&#x1F9EA; {{ t('experiments.methodOfWork') }}</h3>
            <ol>
              <li>{{ t('experiments.pendulumGuideStep1') }}</li>
              <li>{{ t('experiments.pendulumGuideStep2') }}</li>
              <li>{{ t('experiments.pendulumGuideStep3') }}</li>
              <li>{{ t('experiments.pendulumGuideStep4') }}</li>
              <li>{{ t('experiments.pendulumGuideStep5') }}</li>
              <li>{{ t('experiments.pendulumGuideStep6') }}</li>
              <li>{{ t('experiments.pendulumGuideStep7') }}</li>
            </ol>
          </section>
          <section class="help-section">
            <h3>&#x1F4C9; {{ t('experiments.calculateSlopeFromGraph') }}</h3>
            <p>{{ t('experiments.calculateSlopeDesc') }}</p>
            <div class="eq-box">
              <div class="eq-line">T² = (4π²/g) · L</div>
              <div class="eq-note">{{ t('experiments.slopeEquation') }}</div>
              <div class="eq-note">{{ t('experiments.gFromSlope') }}</div>
            </div>
          </section>
          <section class="help-section">
            <h3>&#x1F4BE; {{ t('experiments.controlButtons') }}</h3>
            <div class="btn-help-grid">
              <div class="btn-help-row"><span class="btn-tag primary">▶️ {{ t('experiments.start') }}</span><span>{{ t('experiments.startSimulation') }}</span></div>
              <div class="btn-help-row"><span class="btn-tag">&#x1F504; {{ t('experiments.reset') }}</span><span>{{ t('experiments.resetSimulation') }}</span></div>
              <div class="btn-help-row"><span class="btn-tag">&#x1F4CC; {{ t('experiments.record') }}</span><span>{{ t('experiments.recordCurrentMeasurement') }}</span></div>
              <div class="btn-help-row"><span class="btn-tag speed">&#x1F40D; ×1.0</span><span>{{ t('experiments.simulationSpeed') }}</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.help-overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:99999; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
.help-card { background:#1E2530; border:1px solid #2D3645; border-radius:12px; width:92vw; max-width:640px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,.5); }
.help-header { display:flex; justify-content:space-between; align-items:center; padding:.8rem 1rem; border-bottom:1px solid #2D3645; background:rgba(91,141,184,.06); flex-shrink:0; }
.help-header h2 { margin:0; font-size:1rem; color:#D1D7E0; }
.close-btn { background:transparent; border:1px solid #2D3645; color:#8B95A5; border-radius:6px; width:28px; height:28px; cursor:pointer; font-size:.8rem; }
.close-btn:hover { background:rgba(91,141,184,.1); color:#D1D7E0; }
.help-body { overflow-y:auto; padding:1rem 1.2rem; font-size:.78rem; color:#B8C0CC; line-height:1.7; }
.help-section { margin-bottom:1.2rem; }
.help-section h3 { margin:0 0 .4rem; font-size:.82rem; color:#5B8DB8; border-bottom:1px solid #2D3645; padding-bottom:.2rem; }
.help-section p { margin:.3rem 0; }
.help-section ul, .help-section ol { margin:.3rem 0; padding-right:1.2rem; }
.help-section li { margin-bottom:.25rem; }
.eq-box { background:#161B22; border:1px solid #2D3645; border-radius:6px; padding:.5rem .7rem; margin:.4rem 0; font-family:monospace; }
.eq-line { color:#D1D7E0; font-size:.8rem; margin-bottom:.15rem; }
.eq-note { color:#8B95A5; font-size:.72rem; }
.help-hint { color:#4ade80; font-size:.72rem; margin-top:.3rem; }
.btn-help-grid { display:flex; flex-direction:column; gap:.3rem; margin-top:.3rem; }
.btn-help-row { display:flex; align-items:center; gap:.5rem; padding:.25rem .4rem; background:#161B22; border-radius:4px; border:1px solid #2D3645; }
.btn-tag { background:#252D3A; border:1px solid #2D3645; color:#8B95A5; border-radius:4px; padding:.15rem .35rem; font-size:.68rem; font-family:monospace; min-width:70px; text-align:center; }
.btn-tag.primary { color:#5B8DB8; border-color:rgba(91,141,184,.3); }
.btn-tag.speed { color:#fbbf24; border-color:rgba(251,191,36,.3); }
</style>
