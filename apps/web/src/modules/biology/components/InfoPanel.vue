<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { HotspotState } from '../../../types/biology.types';
import { useI18n } from '../../../composables/useI18n';

const props = defineProps<{
  hotspot: HotspotState | null;
}>();

const { t } = useI18n();
const expanded = ref(false);
const panelKey = computed(() => (props.hotspot ? props.hotspot.partId : 'empty'));
const hasDetails = computed(() =>
  Boolean(props.hotspot?.longDescription || (props.hotspot?.facts && props.hotspot.facts.length > 0))
);

watch(panelKey, () => {
  expanded.value = false;
});
</script>

<template>
  <aside class="info-panel">
    <Transition name="info-fade" mode="out-in">
      <div :key="panelKey" class="info-wrapper">
        <div v-if="!props.hotspot" class="info-empty">
          <slot name="empty" />
        </div>
        <div v-else class="info-content">
          <div class="info-header">
            <div class="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <h3 class="info-title">{{ props.hotspot.label }}</h3>
          </div>

          <p class="info-description">{{ props.hotspot.description }}</p>

          <div v-if="hasDetails" class="details-section">
            <button class="details-toggle" @click="expanded = !expanded">
              <svg v-if="!expanded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              {{ expanded ? t('biology.hideDetails') : t('biology.showDetails') }}
            </button>

            <Transition name="details-expand">
              <div v-if="expanded" class="details-content">
                <div v-if="props.hotspot.longDescription" class="detail-block">
                  <div class="detail-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>{{ t('biology.detailedExplanation') }}</span>
                  </div>
                  <p class="info-long-description">{{ props.hotspot.longDescription }}</p>
                </div>

                <div v-if="props.hotspot.facts && props.hotspot.facts.length > 0" class="detail-block">
                  <div class="detail-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>{{ t('biology.keyFacts') }}</span>
                  </div>
                  <ul class="info-facts">
                    <li v-for="(fact, index) in props.hotspot.facts" :key="index" class="fact-item">
                      <span class="fact-bullet" />
                      {{ fact }}
                    </li>
                  </ul>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.info-panel {
  width: 100%;
  color: #e2e8f0;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.6);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  flex-shrink: 0;
}

.info-title {
  margin: 0;
  color: #4ade80;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
}

.info-description {
  margin: 0;
  line-height: 1.65;
  color: #cbd5e1;
  font-size: 0.92rem;
}

.details-section {
  margin-top: 0.25rem;
}

.details-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid #334155;
  color: #4ade80;
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.15s ease;
  width: 100%;
  justify-content: center;
}

.details-toggle:hover {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.4);
}

.details-content {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.info-long-description {
  margin: 0;
  line-height: 1.7;
  color: #e2e8f0;
  font-size: 0.88rem;
  padding: 0.65rem 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgba(51, 65, 85, 0.4);
}

.info-facts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.fact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #b8c5d6;
  font-size: 0.85rem;
  line-height: 1.55;
  padding: 0.5rem 0.65rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 0.4rem;
  border: 1px solid rgba(51, 65, 85, 0.3);
}

.fact-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
  margin-top: 0.4rem;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.4);
}

.info-empty {
  color: #64748b;
  font-size: 0.95rem;
}

.info-fade-enter-active,
.info-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.info-fade-enter-from,
.info-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.details-expand-enter-active,
.details-expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.3s ease;
  overflow: hidden;
}

.details-expand-enter-from,
.details-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.details-expand-enter-to,
.details-expand-leave-from {
  max-height: 500px;
}
</style>
