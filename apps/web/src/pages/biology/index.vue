<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const { t } = useI18n();

const goHome = () => router.push('/home');
</script>

<template>
  <div class="biology-page">
    <header class="bio-header">
      <button class="back-button" @click="goHome">
        {{ t('biology.backToHome') }}
      </button>
      <h1 class="bio-title">{{ t('biology.title') }}</h1>
      <p class="bio-subtitle">{{ t('biology.subtitle') }}</p>
    </header>

    <main class="bio-content">
      <div class="experiment-card">
        <div class="experiment-icon" aria-hidden="true">🧬</div>
        <h2 class="experiment-title">{{ t('biology.cellSection') }}</h2>
        <p class="experiment-desc">{{ t('biology.cellDesc') }}</p>
        <button class="experiment-button" disabled>
          {{ t('biology.comingSoon') }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.biology-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 2rem;
}

.bio-header {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;
}

.back-button {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  background: transparent;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.back-button:hover {
  background: #1e293b;
}

.bio-title {
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bio-subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
}

.bio-content {
  display: flex;
  justify-content: center;
}

.experiment-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 2rem;
  width: 320px;
  text-align: center;
}

.experiment-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.experiment-title {
  margin: 0 0 0.5rem;
  color: #4ade80;
}

.experiment-desc {
  color: #94a3b8;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.experiment-button {
  background: #22c55e;
  color: #0f172a;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
