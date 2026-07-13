<script setup lang="ts">
import { computed, ref } from 'vue';
import type { HotspotState } from '../../../types/biology.types';
import { useI18n } from '../../../composables/useI18n';

const props = defineProps<{
  hotspot: HotspotState | null;
}>();

const { t } = useI18n();
const expanded = ref(false);
const panelKey = computed(() => (props.hotspot ? props.hotspot.organelleId : 'empty'));
const hasDetails = computed(() =>
  Boolean(props.hotspot?.longDescription || (props.hotspot?.facts && props.hotspot.facts.length > 0))
);
</script>

<template>
  <aside class="info-panel">
    <Transition name="info-fade" mode="out-in">
      <div :key="panelKey" class="info-wrapper">
        <div v-if="!props.hotspot" class="info-empty">
          <slot name="empty" />
        </div>
        <div v-else class="info-content">
          <h3 class="info-title">{{ props.hotspot.label }}</h3>
          <p class="info-description">{{ props.hotspot.description }}</p>

          <div v-if="hasDetails" class="details-section">
            <button class="details-toggle" @click="expanded = !expanded">
              {{ expanded ? t('biology.hideDetails') : t('biology.showDetails') }}
            </button>
            <div v-if="expanded" class="details-content">
              <p v-if="props.hotspot.longDescription" class="info-long-description">
                {{ props.hotspot.longDescription }}
              </p>
              <ul v-if="props.hotspot.facts && props.hotspot.facts.length > 0" class="info-facts">
                <li v-for="(fact, index) in props.hotspot.facts" :key="index">
                  {{ fact }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.info-panel {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.25rem;
  min-width: 260px;
  max-width: 320px;
  color: #e2e8f0;
  font-family: 'Segoe UI', 'Helvetica Neue', Tahoma, Geneva, Verdana, sans-serif;
}

.info-empty {
  color: #64748b;
  font-size: 0.95rem;
}

.info-title {
  margin: 0 0 0.75rem;
  color: #4ade80;
  font-size: 1.25rem;
}

.info-description {
  margin: 0 0 1rem;
  line-height: 1.6;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.details-section {
  margin-top: 0.5rem;
}

.details-toggle {
  background: transparent;
  border: 1px solid #475569;
  color: #4ade80;
  padding: 0.4rem 0.9rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s ease;
}

.details-toggle:hover {
  background: rgba(74, 222, 128, 0.1);
}

.details-content {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #334155;
}

.info-long-description {
  margin: 0 0 0.75rem;
  line-height: 1.7;
  color: #e2e8f0;
  font-size: 0.92rem;
}

.info-facts {
  margin: 0;
  padding-inline-start: 1.25rem;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
}

.info-facts li {
  margin-bottom: 0.4rem;
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
</style>
