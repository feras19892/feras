<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.lfHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.lfHelpS1P1') },
      { type: 'p', text: t('experiments.lfHelpS1P2') },
      { type: 'p', text: t('experiments.lfHelpS1P3') },
    ],
  },
  {
    title: t('experiments.lfHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.lfHelpS2P1') },
      { type: 'formula', text: t('experiments.lfHelpS2F1') },
      { type: 'p', text: t('experiments.lfHelpS2P2') },
      { type: 'formula', text: t('experiments.lfHelpS2F2') },
      { type: 'p', text: t('experiments.lfHelpS2P3') },
      { type: 'formula', text: t('experiments.lfHelpS2F3') },
      { type: 'p', text: t('experiments.lfHelpS2P4') },
      { type: 'formula', text: t('experiments.lfHelpS2F4') },
    ],
  },
  {
    title: t('experiments.lfHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.lfHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.lfHelpS3L1'),
          t('experiments.lfHelpS3L2'),
          t('experiments.lfHelpS3L3'),
          t('experiments.lfHelpS3L4'),
          t('experiments.lfHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lfHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.lfHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.lfHelpS4L1'),
          t('experiments.lfHelpS4L2'),
          t('experiments.lfHelpS4L3'),
          t('experiments.lfHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lfHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.lfHelpS5E1'),
          t('experiments.lfHelpS5E2'),
          t('experiments.lfHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.lfHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.lfHelpS6L1'),
          t('experiments.lfHelpS6L2'),
          t('experiments.lfHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.lfHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
