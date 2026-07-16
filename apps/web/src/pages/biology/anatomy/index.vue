<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../../composables/useI18n';
import { anatomyTopics } from '../../../services/anatomy-topics';
import type { BiologyTopic } from '../../../types/biology.types';

const router = useRouter();
const { t } = useI18n();

const goBack = (): void => {
  router.push('/biology');
};

const selectTopic = (topic: BiologyTopic): void => {
  if (topic.available && topic.route) {
    router.push(topic.route);
  }
};
</script>

<template>
  <div class="anatomy-page">
    <header class="anatomy-header">
      <button class="back-button" @click="goBack">
        {{ t('biology.backToExperiments') }}
      </button>
      <h1 class="anatomy-title">{{ t('biology.humanAnatomySectionTitle') }}</h1>
      <p class="anatomy-subtitle">{{ t('biology.humanAnatomySectionSubtitle') }}</p>
    </header>

    <main class="anatomy-content">
      <div
        v-for="topic in anatomyTopics"
        :key="topic.id"
        class="topic-card"
        :class="{ unavailable: !topic.available }"
        @click="selectTopic(topic)"
      >
        <div class="topic-icon" aria-hidden="true">{{ topic.icon }}</div>
        <h2 class="topic-title">{{ t(topic.titleKey) }}</h2>
        <p class="topic-desc">{{ t(topic.descriptionKey) }}</p>
        <span v-if="!topic.available" class="topic-badge">
          {{ t('biology.comingSoon') }}
        </span>
        <span v-else class="topic-action">{{ t('biology.startExperiment') }}</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.anatomy-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 2rem;
}

.anatomy-header {
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

.anatomy-title {
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.anatomy-subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
}

.anatomy-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.topic-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.75rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.topic-card:hover:not(.unavailable) {
  transform: translateY(-3px);
  border-color: #4ade80;
  background: rgba(30, 41, 59, 0.85);
}

.topic-card.unavailable {
  cursor: default;
  opacity: 0.6;
}

.topic-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.topic-title {
  margin: 0 0 0.5rem;
  color: #4ade80;
  font-size: 1.25rem;
}

.topic-desc {
  color: #94a3b8;
  margin: 0 0 1.25rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.topic-action {
  display: inline-block;
  background: #22c55e;
  color: #0f172a;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.topic-badge {
  display: inline-block;
  background: #334155;
  color: #94a3b8;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
