<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const steps = [
  t('experiments.freefallStep1'),
  t('experiments.freefallStep2'),
  t('experiments.freefallStep3'),
  t('experiments.freefallStep4'),
  t('experiments.freefallStep5'),
  t('experiments.freefallStep6'),
]
</script>

<template>
  <div>
    <h5>📋 {{ t('experiments.experimentGuide') }}</h5>
    <ol>
      <li v-for="(s, i) in steps" :key="i">{{ s }}</li>
    </ol>
  </div>
</template>

<style scoped>
h5 { margin: 0 0 .3rem; font-size: .82rem; color: #5B8DB8; }
ol { margin: 0; padding-right: 1.2rem; font-size: .78rem; color: #cbd5e1; line-height: 1.8; }
</style>
