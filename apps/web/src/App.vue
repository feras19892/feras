<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useI18nStore } from './stores/i18n.store';

const i18n = useI18nStore();
</script>

<template>
  <div class="app" :dir="i18n.direction">
    <RouterView />
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
