<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.flwHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.flwHelpS1P1') },
      { type: 'p', text: t('experiments.flwHelpS1P2') },
      { type: 'p', text: t('experiments.flwHelpS1P3') },
    ],
  },
  {
    title: t('experiments.flwHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.flwHelpS2P1') },
      { type: 'formula', text: t('experiments.flwHelpS2F1') },
      { type: 'p', text: t('experiments.flwHelpS2P2') },
      { type: 'formula', text: t('experiments.flwHelpS2F2') },
      { type: 'p', text: t('experiments.flwHelpS2P3') },
      { type: 'formula', text: t('experiments.flwHelpS2F3') },
      { type: 'p', text: t('experiments.flwHelpS2P4') },
    ],
  },
  {
    title: t('experiments.flwHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.flwHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.flwHelpS3L1'),
          t('experiments.flwHelpS3L2'),
          t('experiments.flwHelpS3L3'),
          t('experiments.flwHelpS3L4'),
          t('experiments.flwHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.flwHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.flwHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.flwHelpS4L1'),
          t('experiments.flwHelpS4L2'),
          t('experiments.flwHelpS4L3'),
          t('experiments.flwHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.flwHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.flwHelpS5E1'),
          t('experiments.flwHelpS5E2'),
          t('experiments.flwHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.flwHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.flwHelpS6L1'),
          t('experiments.flwHelpS6L2'),
          t('experiments.flwHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.flwHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
