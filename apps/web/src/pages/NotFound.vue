<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { useRouter } from 'vue-router'

const router = useRouter()

</script>

<template>
  <div class="not-found">
    <div class="nf-icon">🔍</div>
    <h1>404</h1>
    <p>{{ t('common.pageNotFound') }}</p>
    <button class="nf-btn" @click="router.push('/')">{{ t('common.backHome') }}</button>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
}
.nf-icon { font-size: 4rem; }
.not-found h1 {
  font-size: 3rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #f87171, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.not-found p { color: #64748b; font-size: 1.1rem; margin: 0; }
.nf-btn {
  padding: 0.7rem 1.8rem;
  border: none;
  border-radius: 0.6rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.nf-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79,70,229,0.3); }
</style>
