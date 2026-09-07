<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.lrHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.lrHelpS1P1') },
      { type: 'p', text: t('experiments.lrHelpS1P2') },
      { type: 'p', text: t('experiments.lrHelpS1P3') },
    ],
  },
  {
    title: t('experiments.lrHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.lrHelpS2P1') },
      { type: 'formula', text: 'θ_i = θ_r' },
      { type: 'p', text: t('experiments.lrHelpS2P2') },
      { type: 'formula', text: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)' },
      { type: 'p', text: t('experiments.lrHelpS2P3') },
      { type: 'formula', text: ['n = c / v', 'sin(θ_c) = n₂ / n₁   (n₁ > n₂)'] },
    ],
  },
  {
    title: t('experiments.lrHelpS3Title'),
    blocks: [
      {
        type: 'ordered',
        items: [
          t('experiments.lrHelpS3L1'),
          t('experiments.lrHelpS3L2'),
          t('experiments.lrHelpS3L3'),
          t('experiments.lrHelpS3L4'),
          t('experiments.lrHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lrHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.lrHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.lrHelpS4L1'),
          t('experiments.lrHelpS4L2'),
          t('experiments.lrHelpS4L3'),
        ],
      },
      { type: 'formula', text: 'Slope = n₁ / n₂  →  n₂ = n₁ / Slope' },
    ],
  },
  {
    title: t('experiments.lrHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.lrHelpS5E1'),
          t('experiments.lrHelpS5E2'),
          t('experiments.lrHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lrHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.lrHelpS6L1'),
          t('experiments.lrHelpS6L2'),
          t('experiments.lrHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.lrHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
