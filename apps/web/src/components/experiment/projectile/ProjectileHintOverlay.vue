<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import { ref, computed } from 'vue'
import { useProjectileHints } from '../../../composables/projectile/useProjectileHints'

const { t } = useI18n()
const props = defineProps<{
  v0: number
  angleDeg: number
  g: number
  targetX: number
  targetMode: boolean
}>()

const open = ref(false)
const guessV0 = ref(20)
const guessAngle = ref(45)
const guessResult = ref('')

const { getHint, checkStudentGuess } = useProjectileHints()
const hint = computed(() => getHint(props.v0, props.angleDeg, props.g, props.targetX))

function onCheck() {
  guessResult.value = checkStudentGuess(guessV0.value, guessAngle.value, props.g, props.targetX)
}
</script>

<template>
  <div class="hint-overlay" v-if="targetMode">
    <button class="hint-btn" @click="open = !open" :class="{open}">💡</button>
    <div class="hint-panel" v-if="open">
      <div class="hint-title">📐 {{ t('experiments.equationLabel') }}</div>
      <div class="hint-eq">{{ hint.equation }}</div>
      <div class="hint-eq hint-sub">{{ hint.sin2theta }}</div>
      <div class="hint-tip">🎯 {{ t('experiments.targetAt') }} {{ hint.targetX }} {{ t('experiments.meter') }}</div>
      <div class="hint-msg">{{ hint.message }}</div>
      <div class="hint-tip">{{ hint.tip }}</div>
      <div class="hint-strat">📌 {{ hint.strategy }}</div>
      <hr />
      <div class="hint-guess">
        <div class="hint-title">🧮 {{ t('experiments.tryItYourself') }}</div>
        <div class="guess-row">
          <label>v₀</label><input type="number" v-model.number="guessV0" step="0.1">
          <label>θ</label><input type="number" v-model.number="guessAngle" step="0.1">
          <button @click="onCheck">{{ t('experiments.verify') }}</button>
        </div>
        <div class="guess-result" v-if="guessResult">{{ guessResult }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hint-overlay { position: absolute; top: 42px; right: 10px; z-index: 20; }
.hint-btn { background: rgba(15,23,42,0.9); border: 1px solid rgba(71,85,105,0.5); border-radius: 8px; padding: .35rem .6rem; font-size: 1rem; cursor: pointer; transition: .2s; }
.hint-btn:hover, .hint-btn.open { background: rgba(91,141,184,.2); border-color: #5B8DB8; }
.hint-panel { position: absolute; top: 40px; right: 0; width: 260px; background: rgba(15,23,42,0.95); border: 1px solid #2D3645; border-radius: 10px; padding: .8rem; backdrop-filter: blur(10px); }
.hint-title { font-size: .8rem; font-weight: 700; color: #5B8DB8; margin-bottom: .3rem; }
.hint-eq { font-family: monospace; font-size: .75rem; color: #D1D7E0; background: #1E2530; padding: .3rem .5rem; border-radius: 4px; margin-bottom: .5rem; text-align: center; }
.hint-row { display: flex; justify-content: space-between; font-size: .72rem; color: #8B95A5; margin-bottom: .15rem; }
.hint-row b { color: #D1D7E0; }
.hint-msg { margin-top: .4rem; font-size: .75rem; color: #f59e0b; background: rgba(245,158,11,.08); padding: .3rem .5rem; border-radius: 4px; }
.hint-tip { margin-top: .3rem; font-size: .72rem; color: #22c55e; }
.hint-strat { margin-top: .3rem; font-size: .72rem; color: #fbbf24; background: rgba(251,191,36,.08); padding: .3rem .5rem; border-radius: 4px; }
.hint-sub { font-size: .7rem; color: #8B95A5; background: transparent; margin-top: -.3rem; }
hr { border: none; border-top: 1px solid #2D3645; margin: .5rem 0; }
.hint-guess .guess-row { display: flex; gap: .3rem; align-items: center; margin-top: .3rem; }
.hint-guess input { width: 50px; padding: .2rem; border-radius: 4px; border: 1px solid #2D3645; background: #252D3A; color: #D1D7E0; font-size: .72rem; text-align: center; }
.hint-guess button { background: #5B8DB8; color: #fff; border: none; border-radius: 4px; padding: .25rem .5rem; font-size: .7rem; cursor: pointer; }
.guess-result { margin-top: .3rem; font-size: .75rem; color: #D1D7E0; }
</style>
