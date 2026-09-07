<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.blHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.blHelpS1P1') },
      { type: 'p', text: t('experiments.blHelpS1P2') },
      { type: 'p', text: t('experiments.blHelpS1P3') },
    ],
  },
  {
    title: t('experiments.blHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.blHelpS2P1') },
      { type: 'formula', text: t('experiments.blHelpS2F1') },
      { type: 'p', text: t('experiments.blHelpS2P2') },
      { type: 'formula', text: t('experiments.blHelpS2F2') },
      { type: 'p', text: t('experiments.blHelpS2P3') },
      { type: 'formula', text: t('experiments.blHelpS2F3') },
      { type: 'p', text: t('experiments.blHelpS2P4') },
    ],
  },
  {
    title: t('experiments.blHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.blHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.blHelpS3L1'),
          t('experiments.blHelpS3L2'),
          t('experiments.blHelpS3L3'),
          t('experiments.blHelpS3L4'),
          t('experiments.blHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.blHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.blHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.blHelpS4L1'),
          t('experiments.blHelpS4L2'),
          t('experiments.blHelpS4L3'),
          t('experiments.blHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.blHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.blHelpS5E1'),
          t('experiments.blHelpS5E2'),
          t('experiments.blHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.blHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.blHelpS6L1'),
          t('experiments.blHelpS6L2'),
          t('experiments.blHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.blHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
