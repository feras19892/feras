<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import BiologyHelpModal from '../../../components/experiment/biology/BiologyHelpModal.vue';
import type { BiologyTopic } from '../../../types/biology.types';

/**
 * صفحة فهرس فرع الأحياء الموحّدة — تخدم كل الفروع (خلية، تشريح، دقيقة، نبات،
 * وراثة، بيئة، تقنية حيوية، تطور) والفهرس الرئيسي بنفس التصميم والسلوك.
 * كانت هذه الصفحات 9 نسخ مكررة؛ الآن مصدر واحد للحقيقة.
 */
const props = withDefaults(
  defineProps<{
    /** بطاقات التجارب (BiologyTopic أو BiologySection — بنية متطابقة) */
    topics: BiologyTopic[];
    titleKey: string;
    subtitleKey: string;
    /** مسار زر العودة */
    backRoute?: string;
    /** مفتاح نص زر العودة */
    backLabelKey?: string;
  }>(),
  {
    backRoute: '/biology',
    backLabelKey: 'biology.backToExperiments',
  },
);

const router = useRouter();
const helpOpen = ref(false);

const availableCount = computed(() => props.topics.filter((topic) => topic.available).length);

const goBack = (): void => {
  void router.push(props.backRoute);
};

const selectTopic = (topic: BiologyTopic): void => {
  if (topic.available && topic.route) {
    void router.push(topic.route);
  }
};
</script>

<template>
  <div class="branch-page">
    <header class="branch-header">
      <button class="back-button" @click="goBack">
        {{ t(backLabelKey) }}
      </button>
      <h1 class="branch-title">{{ t(titleKey) }}</h1>
      <p class="branch-subtitle">{{ t(subtitleKey) }}</p>
      <span class="count-chip" :aria-label="t('biology.experimentsCountAriaLabel')">
        🧪 {{ availableCount }} {{ t('biology.experimentsCount') }}
      </span>
    </header>

    <main class="branch-content">
      <div
        v-for="topic in topics"
        :key="topic.id"
        class="topic-card"
        :class="{ unavailable: !topic.available }"
        role="button"
        tabindex="0"
        :aria-label="t(topic.titleKey)"
        @click="selectTopic(topic)"
        @keydown.enter="selectTopic(topic)"
        @keydown.space.prevent="selectTopic(topic)"
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
    <button
      class="bio-help-fab"
      :title="t('biology.bioHelpTitle')"
      :aria-label="t('biology.bioHelpTitle')"
      @click="helpOpen = true"
    >
      ?
    </button>
    <BiologyHelpModal :open="helpOpen" @close="helpOpen = false" />
  </div>
</template>

<style scoped>
.branch-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 2rem;
}

.branch-header {
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

.branch-title {
  font-size: 2.5rem;
  margin: 0 0 0.5rem;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.branch-subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0 0 0.9rem;
}

.count-chip {
  display: inline-block;
  background: rgba(74, 222, 128, 0.12);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.branch-content {
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

.bio-help-fab {
  position: fixed;
  top: 2rem;
  inset-inline-end: 2rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1px solid rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.bio-help-fab:hover {
  background: rgba(74, 222, 128, 0.25);
  border-color: #4ade80;
}
</style>