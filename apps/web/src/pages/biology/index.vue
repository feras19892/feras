<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { useRouter } from 'vue-router';

import { biologySections } from '../../services/biology-sections';
import type { BiologySection } from '../../types/biology.types';





const router = useRouter();

const goHome = (): void => {
  router.push('/home');
};

const selectSection = (section: BiologySection): void => {
  if (section.available && section.route) {
    router.push(section.route);
  }
};
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
      <div
        v-for="section in biologySections"
        :key="section.id"
        class="section-card"
        :class="{ unavailable: !section.available }"
        @click="selectSection(section)"
      >
        <div class="section-icon" aria-hidden="true">{{ section.icon }}</div>
        <h2 class="section-title">{{ t(section.titleKey) }}</h2>
        <p class="section-desc">{{ t(section.descriptionKey) }}</p>
        <span v-if="!section.available" class="section-badge">
          {{ t('biology.comingSoon') }}
        </span>
        <span v-else class="section-action">{{ t('biology.startExperiment') }}</span>
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
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bio-subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
}

.bio-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.75rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.section-card:hover:not(.unavailable) {
  transform: translateY(-3px);
  border-color: #4ade80;
  background: rgba(30, 41, 59, 0.85);
}

.section-card.unavailable {
  cursor: default;
  opacity: 0.6;
}

.section-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0 0 0.5rem;
  color: #4ade80;
  font-size: 1.25rem;
}

.section-desc {
  color: #94a3b8;
  margin: 0 0 1.25rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.section-action {
  display: inline-block;
  background: #22c55e;
  color: #0f172a;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.section-badge {
  display: inline-block;
  background: #334155;
  color: #94a3b8;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
