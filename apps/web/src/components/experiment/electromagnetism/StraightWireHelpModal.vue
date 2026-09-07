<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.swHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.swHelpS1P1') },
      { type: 'p', text: t('experiments.swHelpS1P2') },
      { type: 'p', text: t('experiments.swHelpS1P3') },
    ],
  },
  {
    title: t('experiments.swHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.swHelpS2P1') },
      { type: 'formula', text: t('experiments.swHelpS2F1') },
      { type: 'p', text: t('experiments.swHelpS2P2') },
      { type: 'formula', text: t('experiments.swHelpS2F2') },
      { type: 'p', text: t('experiments.swHelpS2P3') },
    ],
  },
  {
    title: t('experiments.swHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.swHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.swHelpS3L1'),
          t('experiments.swHelpS3L2'),
          t('experiments.swHelpS3L3'),
          t('experiments.swHelpS3L4'),
          t('experiments.swHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.swHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.swHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.swHelpS4L1'),
          t('experiments.swHelpS4L2'),
          t('experiments.swHelpS4L3'),
          t('experiments.swHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.swHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.swHelpS5E1'),
          t('experiments.swHelpS5E2'),
          t('experiments.swHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.swHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.swHelpS6L1'),
          t('experiments.swHelpS6L2'),
          t('experiments.swHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.swHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
