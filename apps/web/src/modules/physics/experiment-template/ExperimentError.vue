<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.push('/home');
}
</script>

<template>
  <div class="exp-error">
    <div class="error-icon">⚠️</div>
    <h2>{{ t('experiments.loadFailedTitle', 'فشل تحميل التجربة') }}</h2>
    <p>{{ t('experiments.loadFailedMsg', 'تعذر تحميل هذه التجربة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.') }}</p>
    <button class="retry-btn" @click="$router.go(0)">🔄 {{ t('common.retry', 'إعادة المحاولة') }}</button>
    <button class="home-btn" @click="goHome">🏠 {{ t('experiments.backToHome', 'العودة للرئيسية') }}</button>
  </div>
</template>

<style scoped>
.exp-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 0.8rem;
  text-align: center;
  padding: 2rem;
}
.error-icon { font-size: 3rem; }
.exp-error h2 { margin: 0; color: #f87171; font-size: 1.2rem; }
.exp-error p { margin: 0; color: #94a3b8; font-size: 0.88rem; max-width: 400px; line-height: 1.5; }
.retry-btn {
  padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: none;
  background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff;
  cursor: pointer; font-family: inherit; font-size: 0.85rem; font-weight: 700;
}
.home-btn {
  padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);
  background: transparent; color: #94a3b8; cursor: pointer; font-family: inherit; font-size: 0.85rem;
}
</style>
