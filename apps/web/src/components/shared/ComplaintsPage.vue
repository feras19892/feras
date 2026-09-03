<template>
  <div class="dash-page">
    <h2 class="comp-title">
      <svg class="comp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      التقييم والشكاوى
    </h2>
    <RatingCenter />
    <ProjectRating />

    <div class="comp-section" style="margin-top:1rem">
      <button class="comp-toggle" @click="showComplaint = !showComplaint">
        {{ showComplaint ? 'إخفاء' : '📝 تقديم شكوى' }}
      </button>
      <ComplaintForm v-if="showComplaint" @created="showComplaint = false" @cancel="showComplaint = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RatingCenter from './RatingCenter.vue'
import ProjectRating from './ProjectRating.vue'
import ComplaintForm from './ComplaintForm.vue'

const showComplaint = ref(false)
</script>

<style scoped>
.dash-page { padding: 1rem; }
.comp-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.15rem; color: var(--as-text, #e2e8f0); margin: 0 0 1rem; }
.comp-icon { width: 1.3rem; height: 1.3rem; color: #22c55e; }
.comp-toggle { display: flex; align-items: center; justify-content: center; gap: 0.4rem; width: 100%; padding: 0.7rem; border-radius: 0.5rem; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-surface, rgba(15,23,42,0.6)); color: var(--as-text, #e2e8f0); cursor: pointer; font-weight: 700; font-family: inherit; font-size: 0.95rem; transition: background 0.12s; }
.comp-toggle:hover { background: var(--as-accent, rgba(99,102,241,0.15)); }
.comp-section { margin-top: 1rem; }
</style>
