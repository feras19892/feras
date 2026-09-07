<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.grHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.grHelpS1P1') },
      { type: 'p', text: t('experiments.grHelpS1P2') },
      { type: 'p', text: t('experiments.grHelpS1P3') },
    ],
  },
  {
    title: t('experiments.grHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.grHelpS2P1') },
      { type: 'formula', text: 'd = 1 / N' },
      { type: 'p', text: t('experiments.grHelpS2P2') },
      { type: 'formula', text: 'd · sin(θ) = m · λ' },
      { type: 'p', text: t('experiments.grHelpS2P3') },
      { type: 'formula', text: ['y_m ≈ m · λ · D / d', 'm_max = d / λ'] },
    ],
  },
  {
    title: t('experiments.grHelpS3Title'),
    blocks: [
      {
        type: 'ordered',
        items: [
          t('experiments.grHelpS3L1'),
          t('experiments.grHelpS3L2'),
          t('experiments.grHelpS3L3'),
          t('experiments.grHelpS3L4'),
          t('experiments.grHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.grHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.grHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.grHelpS4L1'),
          t('experiments.grHelpS4L2'),
          t('experiments.grHelpS4L3'),
        ],
      },
      { type: 'formula', text: 'Slope = λ · D  →  λ = Slope / D' },
    ],
  },
  {
    title: t('experiments.grHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.grHelpS5E1'),
          t('experiments.grHelpS5E2'),
          t('experiments.grHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.grHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.grHelpS6L1'),
          t('experiments.grHelpS6L2'),
          t('experiments.grHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.grHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
