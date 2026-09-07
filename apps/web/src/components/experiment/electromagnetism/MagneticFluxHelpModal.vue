<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.mfHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.mfHelpS1P1') },
      { type: 'p', text: t('experiments.mfHelpS1P2') },
      { type: 'p', text: t('experiments.mfHelpS1P3') },
    ],
  },
  {
    title: t('experiments.mfHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.mfHelpS2P1') },
      { type: 'formula', text: t('experiments.mfHelpS2F1') },
      { type: 'p', text: t('experiments.mfHelpS2P2') },
      { type: 'formula', text: t('experiments.mfHelpS2F2') },
      { type: 'p', text: t('experiments.mfHelpS2P3') },
    ],
  },
  {
    title: t('experiments.mfHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.mfHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.mfHelpS3L1'),
          t('experiments.mfHelpS3L2'),
          t('experiments.mfHelpS3L3'),
          t('experiments.mfHelpS3L4'),
          t('experiments.mfHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.mfHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.mfHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.mfHelpS4L1'),
          t('experiments.mfHelpS4L2'),
          t('experiments.mfHelpS4L3'),
          t('experiments.mfHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.mfHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.mfHelpS5E1'),
          t('experiments.mfHelpS5E2'),
          t('experiments.mfHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.mfHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.mfHelpS6L1'),
          t('experiments.mfHelpS6L2'),
          t('experiments.mfHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.mfHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
