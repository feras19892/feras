<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.calHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.calHelpS1P1') },
      { type: 'p', text: t('experiments.calHelpS1P2') },
      { type: 'p', text: t('experiments.calHelpS1P3') },
    ],
  },
  {
    title: t('experiments.calHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.calHelpS2P1') },
      { type: 'formula', text: t('experiments.calHelpS2F1') },
      { type: 'p', text: t('experiments.calHelpS2P2') },
      { type: 'formula', text: t('experiments.calHelpS2F2') },
      { type: 'p', text: t('experiments.calHelpS2P3') },
    ],
  },
  {
    title: t('experiments.calHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.calHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.calHelpS3L1'),
          t('experiments.calHelpS3L2'),
          t('experiments.calHelpS3L3'),
          t('experiments.calHelpS3L4'),
          t('experiments.calHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.calHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.calHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.calHelpS4L1'),
          t('experiments.calHelpS4L2'),
          t('experiments.calHelpS4L3'),
          t('experiments.calHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.calHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.calHelpS5E1'),
          t('experiments.calHelpS5E2'),
          t('experiments.calHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.calHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.calHelpS6L1'),
          t('experiments.calHelpS6L2'),
          t('experiments.calHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.calHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
