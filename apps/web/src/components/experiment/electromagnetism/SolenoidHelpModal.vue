<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
import ExperimentHelpModal from '../shared/ExperimentHelpModal.vue';
import type { HelpSection } from '../shared/experiment-help-types';
const { t } = useI18n();

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const sections: HelpSection[] = [
  {
    title: t('experiments.solHelpS1Title'),
    blocks: [
      { type: 'p', text: t('experiments.solHelpS1P1') },
      { type: 'p', text: t('experiments.solHelpS1P2') },
      { type: 'p', text: t('experiments.solHelpS1P3') },
    ],
  },
  {
    title: t('experiments.solHelpS2Title'),
    blocks: [
      { type: 'p', text: t('experiments.solHelpS2P1') },
      { type: 'formula', text: t('experiments.solHelpS2F1') },
      { type: 'p', text: t('experiments.solHelpS2P2') },
      { type: 'formula', text: t('experiments.solHelpS2F2') },
      { type: 'p', text: t('experiments.solHelpS2P3') },
      { type: 'formula', text: t('experiments.solHelpS2F3') },
      { type: 'p', text: t('experiments.solHelpS2P4') },
    ],
  },
  {
    title: t('experiments.solHelpS3Title'),
    blocks: [
      { type: 'p', text: t('experiments.solHelpS3P1') },
      {
        type: 'ordered',
        items: [
          t('experiments.solHelpS3L1'),
          t('experiments.solHelpS3L2'),
          t('experiments.solHelpS3L3'),
          t('experiments.solHelpS3L4'),
          t('experiments.solHelpS3L5'),
        ],
      },
    ],
  },
  {
    title: t('experiments.solHelpS4Title'),
    blocks: [
      { type: 'p', text: t('experiments.solHelpS4P1') },
      {
        type: 'list',
        items: [
          t('experiments.solHelpS4L1'),
          t('experiments.solHelpS4L2'),
          t('experiments.solHelpS4L3'),
          t('experiments.solHelpS4L4'),
        ],
      },
    ],
  },
  {
    title: t('experiments.solHelpS5Title'),
    blocks: [
      {
        type: 'cards',
        items: [
          t('experiments.solHelpS5E1'),
          t('experiments.solHelpS5E2'),
          t('experiments.solHelpS5E3'),
        ],
      },
    ],
  },
  {
    title: t('experiments.solHelpS6Title'),
    blocks: [
      {
        type: 'list',
        items: [
          t('experiments.solHelpS6L1'),
          t('experiments.solHelpS6L2'),
          t('experiments.solHelpS6L3'),
        ],
      },
    ],
  },
];
</script>

<template>
  <ExperimentHelpModal
    :open="open"
    :title="t('experiments.solHelpTitle')"
    :sections="sections"
    @close="emit('close')"
  />
</template>
