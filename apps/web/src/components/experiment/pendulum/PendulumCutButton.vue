<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const emit = defineEmits<{ (e: 'cut'): void }>()
</script>

<template>
  <button class="btn-cut" @click="emit('cut')" :title="t('experiments.cutString')">&#x2702;&#xFE0F; {{ t('experiments.cutAction') }}</button>
</template>

<style scoped>
.btn-cut { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border:none; border-radius:7px; padding:.45rem .75rem; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .18s; box-shadow:0 2px 4px rgba(0,0,0,.2); }
.btn-cut:hover { background:linear-gradient(135deg,#f87171,#ef4444); transform:translateY(-1px); }
</style>
