<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import type { LatentHeatTrial } from '../../../../composables/latent-heat/useLatentHeatTrials'

const props = defineProps<{ trials: LatentHeatTrial[] }>()
const emit = defineEmits<{ (e: 'remove', id: number): void; (e: 'clear'): void }>()
</script>
<template>
  <div class="panel-body">
    <div class="trials-header">
      <span>#</span>
      <span>الكتلة</span>
      <span>الحرارة</span>
      <span>متحولة</span>
      <span>متبقية</span>
      <span></span>
    </div>
    <div v-for="trial in trials" :key="trial.id" class="trial-row">
      <span>{{ trial.id }}</span>
      <span>{{ trial.mass.toFixed(2) }}</span>
      <span>{{ (trial.Q/1000).toFixed(1) }}</span>
      <span>{{ trial.meltedMass.toFixed(3) }}</span>
      <span>{{ trial.remainingMass.toFixed(3) }}</span>
      <button class="del-btn" @click="emit('remove', trial.id)">&#x2715;</button>
    </div>
    <div v-if="!trials.length" class="no-trials">
      <div class="empty-icon">📋</div>
      <div>لا توجد تجارب</div>
      <div class="empty-hint">اضغط S لتسجيل نتيجة بعد تشغيل التجربة</div>
    </div>
    <div class="trials-actions">
      <button class="clear-btn" @click="emit('clear')">{{ t('experiments.clearAll') }}</button>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.3rem; }
.trials-header { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 24px; gap:.3rem; font-size:.68rem; color:#5B8DB8; font-weight:700; padding:0 .2rem; border-bottom:1px solid #1e2530; padding-bottom:.25rem; }
.trial-row { display:grid; grid-template-columns:30px 1fr 1fr 1fr 1fr 24px; gap:.3rem; align-items:center; padding:.25rem .2rem; font-size:.7rem; color:#D1D7E0; border-bottom:1px solid rgba(30,37,48,.5); }
.del-btn { width:20px; height:20px; border-radius:50%; border:none; background:transparent; color:#8B95A5; cursor:pointer; font-size:.7rem; display:flex; align-items:center; justify-content:center; }
.del-btn:hover { background:rgba(248,113,113,.15); color:#f87171; }
.no-trials { text-align:center; color:#475569; font-size:.75rem; padding:.6rem; }
.empty-icon { font-size:1.5rem; margin-bottom:.3rem; }
.empty-hint { font-size:.65rem; color:#3D4A5C; margin-top:.2rem; }
.trials-actions { display:flex; justify-content:center; padding-top:.3rem; }
.clear-btn { padding:.25rem .6rem; border-radius:5px; border:1px solid rgba(248,113,113,.3); background:rgba(248,113,113,.08); color:#f87171; font-size:.7rem; cursor:pointer; }
.clear-btn:hover { background:rgba(248,113,113,.15); }
</style>
