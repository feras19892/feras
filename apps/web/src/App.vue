<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useI18nStore } from './stores/i18n.store';
import { runStartupDiagnostics } from './composables/experiment/useStartupDiagnostics';
import ExperimentMonitorWidget from './components/dev/ExperimentMonitorWidget.vue';

const i18n = useI18nStore();

onMounted(() => {
  runStartupDiagnostics();
});
</script>

<template>
  <div class="app" :dir="i18n.direction">
    <RouterView />
    <ExperimentMonitorWidget />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
