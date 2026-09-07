<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.farHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.farHelpS1P1') },
      { type: 'p', text: t('experiments.farHelpS1P2') },
      { type: 'p', text: t('experiments.farHelpS1P3') },
    ],
  },
  {
    title: t('experiments.farHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.farHelpS2P1') },
      { type: 'formula', text: t('experiments.farHelpS2F1') },
      { type: 'p', text: t('experiments.farHelpS2P2') },
      { type: 'formula', text: t('experiments.farHelpS2F2') },
      { type: 'p', text: t('experiments.farHelpS2P3') },
      { type: 'formula', text: t('experiments.farHelpS2F3') },
    ],
  },
  {
    title: t('experiments.farHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.farHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.farHelpS3L1'),
          t('experiments.farHelpS3L2'),
          t('experiments.farHelpS3L3'),
          t('experiments.farHelpS3L4'),
          t('experiments.farHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.farHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.farHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.farHelpS4L1'),
          t('experiments.farHelpS4L2'),
          t('experiments.farHelpS4L3'),
          t('experiments.farHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.farHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.farHelpS5E1'),
          t('experiments.farHelpS5E2'),
          t('experiments.farHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.farHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.farHelpS6L1'),
          t('experiments.farHelpS6L2'),
          t('experiments.farHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.farHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
