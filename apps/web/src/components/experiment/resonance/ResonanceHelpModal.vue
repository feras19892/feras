<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.reHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.reHelpS1P1') },
      { type: 'p', text: t('experiments.reHelpS1P2') },
      { type: 'p', text: t('experiments.reHelpS1P3') },
    ],
  },
  {
    title: t('experiments.reHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.reHelpS2P1') },
      { type: 'formula', text: t('experiments.reHelpS2F1') },
      { type: 'p', text: t('experiments.reHelpS2P2') },
      { type: 'formula', text: t('experiments.reHelpS2F2') },
      { type: 'p', text: t('experiments.reHelpS2P3') },
      { type: 'formula', text: t('experiments.reHelpS2F3') },
      { type: 'p', text: t('experiments.reHelpS2P4') },
      { type: 'formula', text: t('experiments.reHelpS2F4') },
    ],
  },
  {
    title: t('experiments.reHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.reHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.reHelpS3L1'),
          t('experiments.reHelpS3L2'),
          t('experiments.reHelpS3L3'),
          t('experiments.reHelpS3L4'),
          t('experiments.reHelpS3L5'),
          t('experiments.reHelpS3L6'),
        ],
      },
    ],
  },
  {
    title: t('experiments.reHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.reHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.reHelpS4L1'),
          t('experiments.reHelpS4L2'),
          t('experiments.reHelpS4L3'),
          t('experiments.reHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.reHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.reHelpS5E1'),
          t('experiments.reHelpS5E2'),
          t('experiments.reHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.reHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.reHelpS6L1'),
          t('experiments.reHelpS6L2'),
          t('experiments.reHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.reHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
