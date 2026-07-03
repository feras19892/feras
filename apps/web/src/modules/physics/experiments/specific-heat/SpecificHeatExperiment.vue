<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
</script>

<template>
  <div class="stub-lab">
    <h2>{{ t('experiments.expSpecificHeat') }}</h2>
    <p class="sub">{{ t('experiments.experimentInDevelopment') }}</p>
  </div>
</template>

<style scoped>
.stub-lab { background:#161B22; color:#D1D7E0; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; }
h2 { color:#5B8DB8; margin:0; }
.sub { color:#8B95A5; font-size:.9rem; }
</style>
