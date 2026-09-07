<script setup lang="ts">
import { ref } from 'vue'
import LenzLawHelpModal from '../../../../components/experiment/electromagnetism/LenzLawHelpModal.vue'

const helpOpen = ref(false)
</script>

<template>
  <div class="exp-placeholder">
    <div class="placeholder-box">
      <span class="icon">↩️</span>
      <h2>قانون لنز</h2>
      <p>قريباً...</p>
      <button class="help-btn" @click="helpOpen = true">❓</button>
    </div>
  </div>
  <LenzLawHelpModal :open="helpOpen" @close="helpOpen = false" />
</template>

<style scoped>
.exp-placeholder { height: 100vh; background: #0b1220; display: flex; align-items: center; justify-content: center; }
.placeholder-box { text-align: center; position: relative; }
.placeholder-box .icon { font-size: 3rem; }
.placeholder-box h2 { color: #67e8f9; margin: 1rem 0 .5rem; }
.placeholder-box p { color: #64748b; }
.help-btn { position: absolute; top: -2rem; right: -2rem; background: #252D3A; border: 1px solid #2D3645; color: #8B95A5; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; }
.help-btn:hover { background: rgba(91,141,184,.1); color: #5B8DB8; }
</style>
